const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const { searchRecipes, getRecipeDetails, getIngredientFlavor, getCanonicalIngredient } = require('../services/foodoscope');
const { analyzeDish } = require('../services/compatibilityEngine');
const swaps = require('../seed/swaps.json');
const demoRecipes = require('../seed/demo_recipes.json');

const RECIPE_SUGGESTION_LIMIT = 8;
const recipeSuggestionIndex = new Map();

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const upsertRecipeSuggestions = (recipes = [], source = 'search') => {
  recipes.forEach((recipe) => {
    const rawTitle = recipe?.Recipe_title || recipe?.title || recipe?.dishName;
    if (!rawTitle) return;

    const title = String(rawTitle).trim();
    const key = normalizeText(title);
    if (!key) return;

    const existing = recipeSuggestionIndex.get(key);
    recipeSuggestionIndex.set(key, {
      title,
      key,
      source: existing?.source || source,
      type: recipe.type || 'recipe', // Store type
      hits: (existing?.hits || 0) + 1,
      lastSeen: Date.now()
    });
  });
};

const getRecipeSuggestions = (query = '', limit = RECIPE_SUGGESTION_LIMIT) => {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) return [];

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  const scored = [];

  for (const item of recipeSuggestionIndex.values()) {
    let score = 0;

    if (item.key.startsWith(normalizedQuery)) score += 220;
    if (item.key.includes(normalizedQuery)) score += 140;

    tokens.forEach((token) => {
      if (token.length > 1 && item.key.includes(token)) score += 30;
    });

    score += Math.min(item.hits, 25);

    if (score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.item.hits !== a.item.hits) return b.item.hits - a.item.hits;
    return b.item.lastSeen - a.item.lastSeen;
  });

  return scored.slice(0, limit).map(({ item }) => ({
    title: item.title,
    type: item.type, // Return stored type
    source: item.source
  }));
};

// Legacy ingredient suggestion logic preserved for review and optional use.
const getLegacyIngredientSuggestions = (query = '', limit = RECIPE_SUGGESTION_LIMIT) => {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) return [];

  const synonyms = require('../seed/synonyms.json');
  const keywords = require('../seed/keywords.json');

  const allKeys = new Set([...Object.keys(synonyms), ...keywords.map((k) => k.toLowerCase())]);

  return Array.from(allKeys)
    .filter((key) => key.startsWith(normalizedQuery))
    .slice(0, limit)
    .map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      type: 'ingredient',
      source: 'legacy'
    }));
};

upsertRecipeSuggestions(demoRecipes, 'seed');

// Load Popular Recipes into Index (Zero Token Suggestions)
try {
  const popularRecipes = require('../seed/popular_recipes.json');
  const popularObjs = popularRecipes.map(title => ({ title, source: 'popular' }));
  upsertRecipeSuggestions(popularObjs, 'seed-popular');
  console.log(`[Init] Loaded ${popularRecipes.length} popular recipes into suggestion index.`);
  
  // Load Ingredients (Keywords) into Index
  const keywords = require('../seed/keywords.json');
  const keywordObjs = keywords.map(k => ({ title: k, source: 'keyword', type: 'ingredient' }));
  upsertRecipeSuggestions(keywordObjs, 'seed-keyword');
  console.log(`[Init] Loaded ${keywords.length} ingredients into suggestion index.`);

} catch (e) {
  console.error("Failed to load suggestions:", e.message);
}

// @route   GET api/analyze/search?q=dishName
// @desc    Search for dishes/recipes
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.q;
    console.log(`[API] Search Request: "${query}"`);
    const page = req.query.page;
    const limit = req.query.limit;

    if (!query) return res.status(400).json({ msg: 'Query is required' });

    // New Pagination Flow
    if (page || limit) {
      const p = page ? parseInt(page, 10) : 1;
      const l = limit ? parseInt(limit, 10) : 20;

      const result = await searchRecipes(query, p, l);
      upsertRecipeSuggestions(result.results, 'search');

      console.log(`[API] Search (Page ${p}, Limit ${l}): Found ${result.total} total`);

      return res.json({
        success: true,
        data: result.results,
        pagination: {
          page: p,
          limit: l,
          total: result.total,
          hasMore: (p * l) < result.total
        }
      });
    }

    // Legacy Flow (Arrays)
    const recipes = await searchRecipes(query);
    upsertRecipeSuggestions(recipes, 'search');
    console.log(`[API] Legacy Search: Sending ${recipes.length} recipes`);
    res.json(recipes);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analyze/suggestions/bootstrap
// @desc    Return local recipe title index for client-side autocomplete (NO RecipeDB call)
// @access  Private
router.get('/suggestions/bootstrap', auth, async (req, res) => {
  try {
    const max = Math.min(parseInt(req.query.limit || '400', 10), 1000);

    const payload = Array.from(recipeSuggestionIndex.values())
      .sort((a, b) => {
        if (b.hits !== a.hits) return b.hits - a.hits;
        return b.lastSeen - a.lastSeen;
      })
      .slice(0, max)
      .map((item) => ({
        title: item.title,
        type: 'recipe',
        source: item.source
      }));

    res.json(payload);
  } catch (err) {
    console.error(err.message);
    res.json([]);
  }
});

// @route   GET api/analyze/suggestions?q=partialText
// @desc    Local autocomplete suggestions with recipe-first ranking.
//          Pass ?mode=legacy to get original ingredient-only logic.
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase().trim();
    if (!query || query.length < 2) return res.json([]);

    const limit = Math.min(parseInt(req.query.limit || `${RECIPE_SUGGESTION_LIMIT}`, 10), 20);
    const mode = String(req.query.mode || 'recipe').toLowerCase();

    if (mode === 'legacy') {
      return res.json(getLegacyIngredientSuggestions(query, limit));
    }

    const recipeSuggestions = getRecipeSuggestions(query, limit);

    // Preserve previous logic behind optional merge flag for side-by-side review.
    const includeLegacy = req.query.includeLegacy === '1';
    if (!includeLegacy) {
      return res.json(recipeSuggestions);
    }

    const legacy = getLegacyIngredientSuggestions(query, limit);
    const merged = [...recipeSuggestions];

    for (const item of legacy) {
      if (merged.length >= limit) break;
      merged.push(item);
    }

    return res.json(merged);
  } catch (err) {
    console.error(err.message);
    res.json([]);
  }
});

// @route   POST api/analyze
// @desc    Analyze a specific recipe against user profile
// @access  Private
router.post('/', auth, async (req, res) => {
  const { mode, query, recipeId, dishName, ingredients } = req.body;
  console.log(`[Analyze] Request: ${mode || 'direct'} - "${dishName || query}" (ID: ${recipeId})`);

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    let dishDetails = {
      dishName: dishName || query || 'Unknown Dish',
      ingredients: ingredients || []
    };

    // 1. Fetch Data based on Mode / Input
    if (recipeId) {
      // Mode: Recipe ID available
      const apiDetails = await getRecipeDetails(recipeId);
      if (apiDetails) {
        dishDetails = { ...dishDetails, ...apiDetails.recipe };
        if (Array.isArray(apiDetails.ingredients)) dishDetails.ingredients = apiDetails.ingredients;
        // Handle flat structure fallback
        if (!dishDetails.ingredients && Array.isArray(apiDetails)) dishDetails.ingredients = apiDetails;
      }
    } else if (mode === 'search' && query) {
      // Mode: Search first (if just query provided)
      // This is usually done in 2 steps (Search -> Select -> Analyze), but if "Analyze" clicked directly on search:
      // We might need to pick the first result?
      // For now assume frontend sends recipeId if they picked a result.
      // If they assume raw text analysis:
      // dishDetails.ingredients = parseIngredients(query); // TODO: implement if needed
    }

    // Validation
    if (!dishDetails.ingredients || dishDetails.ingredients.length === 0) {
      return res.json({
        dish: dishDetails,
        analysis: calculateHeuristicScore(dishDetails, profile), // Fallback
        alternatives: []
      });
    }

    // 2. Fetch FlavorDB Data
    const ingredientsToAnalyze = dishDetails.ingredients.slice(0, 25);
    const flavorDataPromises = ingredientsToAnalyze.map((ing) => {
      const name = ing.ingredient || ing.ingredient_Phrase || ing.name || ing;
      return typeof name === 'string' ? getIngredientFlavor(name) : null;
    });
    const flavorData = await Promise.all(flavorDataPromises);

    // 3. Analysis
    const analysis = analyzeDish(dishDetails, profile, flavorData);

    // 4. Alternatives & Swaps
    let alternatives = [];
    let modifications = []; // Ingredient swaps

    // Identify swaps for blocked/problematic ingredients
    analysis.evidence.forEach((item) => {
      if (swaps[item.match] || swaps[item.ingredient]) {
        const swapList = swaps[item.match] || swaps[item.ingredient];
        const suggestion = swapList[0]; // Pick first
        modifications.push({
          original: item.ingredient,
          swap: suggestion,
          reason: item.reason
        });
      }
    });

    // Recipe Alternatives
    if (analysis.block || analysis.bioScore < 60 || analysis.tasteScore < 50) {
      // Search for similar but SAFER dishes
      let searchQ = dishDetails.Recipe_title || dishName || query || '';

      // If blocked by allergy, remove the allergen from the search query!
      if (analysis.block && analysis.evidence.some((e) => e.type === 'critical')) {
        const allergens = analysis.evidence.filter((e) => e.type === 'critical').map((e) => e.match);
        allergens.forEach((a) => {
          // Remove allergen name from query (case insensitive)
          const regex = new RegExp(`\\b${a}\\b`, 'gi');
          searchQ = searchQ.replace(regex, '').replace(/\s+/g, ' ').trim();
        });
        console.log(`[Analyze] Adjusted alternatives search query: "${searchQ}" (removed allergens)`);
      }

      if (searchQ.length > 3) {
        // Only search if we have a meaningful query left
        const similarRecipes = await searchRecipes(searchQ);
        upsertRecipeSuggestions(similarRecipes, 'search');

        // Filter logic: Exclude recipes containing the SAME allergen
        for (const r of similarRecipes) {
          if (alternatives.length >= 3) break;
          if (String(r.Recipe_id) === String(recipeId)) continue;

          // Light check on title
          const titleLower = (r.Recipe_title || '').toLowerCase();
          const userAllergies = (profile.sensitivity.allergies || []).map((a) => getCanonicalIngredient(a));

          // 1. Title Safety Check
          const hasObviousAllergy = userAllergies.some((a) => titleLower.includes(a));

          if (!hasObviousAllergy) {
            // Deep check (Expensive but required for "safety first")
            const rDetails = await getRecipeDetails(r.Recipe_id);
            if (rDetails && rDetails.ingredients) {
              // Quick scan of ingredients
              const isSafe = !rDetails.ingredients.some((ri) => {
                const iName = (ri.ingredient || '').toLowerCase();
                // Canonicalize check
                const cName = getCanonicalIngredient(iName);
                return userAllergies.some((a) => iName.includes(a) || cName === a);
              });

              if (isSafe) {
                alternatives.push(r);
              }
            }
          }
        }
      }
    }

    res.json({
      dish: dishDetails,
      analysis: { ...analysis, modifications },
      alternatives
    });

  } catch (err) {
    console.error(`[Analyze] Error: ${err.message}`);
    res.status(500).send('Server Error');
  }
});

// Helper for when ingredients fail
function calculateHeuristicScore(dish, profile) {
  return { bioScore: 50, tasteScore: 50, warnings: ['Analysis failed - missing ingredients'], breakdown: [], evidence: [] };
}

module.exports = router;
