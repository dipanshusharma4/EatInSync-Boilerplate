const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const synonyms = require('../seed/synonyms.json');

const BASE_URL = 'https://api.foodoscope.com';
const API_KEY = process.env.FOODOSCOPE_API_KEY || 'TNV8H8XyZuGCCcptKVfSDg_l69aLBPsGSEZisWyB6ac-rXFP'; // Fallback for hackathon speed if env missing

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Search for recipes by title using RecipeDB
 * Endpoint: /recipe2-api/recipe-bytitle/recipeByTitle?title={title}
 */
// --- Caching System ---
const SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for search results
const searchCache = new Map(); // Key: query, Value: { data: [], timestamp: Number }

// Persistent Flavor Cache
const FLAVOR_CACHE_FILE = path.join(__dirname, '../cache/flavors.json');
let flavorCache = new Map();
const FLAVOR_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (Ingredients don't change often)

// Load Flavor Cache from Disk
try {
    if (fs.existsSync(FLAVOR_CACHE_FILE)) {
        const raw = fs.readFileSync(FLAVOR_CACHE_FILE, 'utf-8');
        const json = JSON.parse(raw);
        flavorCache = new Map(Object.entries(json));
        console.log(`[Cache] Loaded ${flavorCache.size} flavor entries from disk.`);
    }
} catch (e) {
    console.error(`[Cache] Failed to load flavor cache: ${e.message}`);
}

// Check if we need to save flavor cache
let cacheDirty = false;
setInterval(() => {
    if (cacheDirty) {
        try {
            const data = Object.fromEntries(flavorCache);
            fs.writeFileSync(FLAVOR_CACHE_FILE, JSON.stringify(data));
            console.log(`[Cache] Persisted ${flavorCache.size} flavor entries to disk.`);
            cacheDirty = false;
        } catch (e) {
            console.error(`[Cache] Save failed: ${e.message}`);
        }
    }
}, 5 * 60 * 1000); // Save every 5 minutes if changed

/**
 * Search for recipes by title using RecipeDB
 * Endpoint: /recipe2-api/recipe-bytitle/recipeByTitle?title={title}
 */
const searchRecipes = async (query, page = null, limit = null) => {
  try {
    const cleanQuery = query.toLowerCase().trim();
    
    let allRecipes = [];

    // 1. Check Search Cache
    if (searchCache.has(cleanQuery)) {
        const cached = searchCache.get(cleanQuery);
        if (Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
            console.log(`[Cache] Hit for search: "${cleanQuery}"`);
            allRecipes = cached.data;
        } else {
            searchCache.delete(cleanQuery); // Expired
        }
    }

    // 2. Fetch if not in cache
    if (allRecipes.length === 0) {
        const encodedQuery = encodeURIComponent(query);
        const response = await client.get(`/recipe2-api/recipe-bytitle/recipeByTitle?title=${encodedQuery}`);
        
        if (response.data && response.data.success && response.data.data) {
            allRecipes = response.data.data;
            // Store in cache
            searchCache.set(cleanQuery, { data: allRecipes, timestamp: Date.now() });
            console.log(`[Cache] Miss for search: "${cleanQuery}" (Fetched ${allRecipes.length})`);
        }
    }

    // Pagination Logic (In-Memory)
    if (page && limit) {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        
        const sliced = allRecipes.slice(startIndex, endIndex);
        
        return {
            results: sliced,
            total: allRecipes.length
        };
    }

    // Backward Compatibility: Return full array if no pagination params
    return allRecipes;

  } catch (error) {
    console.error('Error searching recipes:', error.message);
    return page && limit ? { results: [], total: 0 } : [];
  }
};

/**
 * Get recipe details including ingredients
 * Endpoint: /recipe2-api/search-recipe/{id}
 */
const getRecipeDetails = async (recipeId) => {
  try {
    // console.log(`[Foodoscope] Fetching details for Recipe ID: ${recipeId}`); // Reduce noise
    const response = await client.get(`/recipe2-api/search-recipe/${recipeId}`);
    return response.data;
  } catch (error) {
    console.error(`[Foodoscope] Error fetching recipe details for ID ${recipeId}:`, error.message);
    return null;
  }
};

/**
 * Get canonical ingredient name using synonyms map
 * e.g. "groundnut" -> "peanut"
 */
const getCanonicalIngredient = (name) => {
    if (!name) return "";
    let cleanName = name.toLowerCase().trim();
    
    // 1. Check if it's a key
    if (synonyms[cleanName]) return cleanName;

    // 2. Check if it's in values
    for (const [canonical, varieties] of Object.entries(synonyms)) {
        if (varieties.includes(cleanName)) {
            return canonical;
        }
    }
    
    return cleanName;
};

/**
 * Get full flavor and functional group data for an ingredient
 * Uses caching and canonicalization.
 */
const getIngredientFlavor = async (ingredientName) => {
    try {
        if (!ingredientName) return null;
        
        // 1. Canonicalize
        const originalName = ingredientName.split(',')[0].trim(); // Remove quantity/prep first
        const cleanName = getCanonicalIngredient(originalName);
        // console.log(`[Foodoscope] Looking up flavor for: "${cleanName}"`);

        // 2. Check Cache
        if (flavorCache.has(cleanName)) {
            const cached = flavorCache.get(cleanName);
            // No expiration check for persistent items unless we want to refresh weekly
            // console.log(`[Foodoscope] Cache hit for "${cleanName}"`);
            return { ...cached, name: ingredientName }; 
        }

        // 3. API Call
        const response = await client.get(`/flavordb/molecules_data/by-commonName?common_name=${encodeURIComponent(cleanName)}`);
        
        if (response.data && response.data.content && response.data.content.length > 0) {
            // Return the first match
            const data = response.data.content[0];
            const result = {
                // name: ingredientName, // Don't store context-specific name in cache
                canonicalName: cleanName,
                foundName: data.common_name,
                id: data._id,
                flavorProfile: data.flavor_profile || '', 
                functionalGroups: data.functional_groups || '', 
                natural: data.natural,
                bitter: data.bitter,
                super_sweet: data.super_sweet
            };
            
            // 4. Store in Cache
            flavorCache.set(cleanName, result);
            cacheDirty = true; // Mark for save
            
            return { ...result, name: ingredientName };
        } else {
            console.log(`[Foodoscope] No flavor data found for: ${cleanName}`);
            // Cache the miss to avoid repeated 404s? Yes, for 24h.
             const miss = { notFound: true, canonicalName: cleanName };
             flavorCache.set(cleanName, miss);
             cacheDirty = true;
             return { ...miss, name: ingredientName };
        }
    } catch (error) {
        console.error(`[Foodoscope] FlavorDB lookup failed for ${ingredientName}:`, error.message);
        return { name: ingredientName, canonicalName: getCanonicalIngredient(ingredientName), error: true };
    }
};

module.exports = {
  searchRecipes,
  getRecipeDetails,
  getIngredientFlavor,
  getCanonicalIngredient
};
