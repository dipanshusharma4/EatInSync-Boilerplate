const { getCanonicalIngredient } = require('./foodoscope');
const swaps = require('../seed/swaps.json');

const analyzeDish = (dishDetails, userProfile, flavorData = []) => {
    let tasteScore = 0;
    let bioScore = 100;
    let warnings = [];
    let breakdown = [];
    let isBlocked = false;
    let evidence = []; // To store structured evidence for frontend UI
    
    const ingredients = dishDetails.ingredients || [];
    
    // Safety check: if no ingredients, return error state
    if (!ingredients || ingredients.length === 0) {
        return {
            tasteScore: 50,
            bioScore: 50,
            warnings: ["⚠️ Could not analyze ingredients. Please check the recipe source."],
            breakdown: ["No ingredient data available."],
            block: false, 
            evidence: []
        };
    }

    // --- 1. Biological Compatibility Score (BCS) & Safety Block ---

    // --- 0. Global Safety Check (Title Scan) ---
    // Often the title reveals allergens not explicitly listed or obscured (e.g. "Peanut Curry")
    const titleLower = (dishDetails.dishName || dishDetails.Recipe_title || "").toLowerCase();
    
    // Hidden Allergens Map (Common things that imply others)
    const hiddenAllergens = {
        "soy sauce": ["gluten", "soy", "wheat"],
        "bread": ["gluten", "wheat", "yeast"],
        "pasta": ["gluten", "wheat"],
        "yogurt": ["dairy", "lactose", "milk"],
        "cheese": ["dairy", "lactose", "milk"],
        "cream": ["dairy", "lactose", "milk"],
        "butter": ["dairy", "lactose", "milk"],
        "tofu": ["soy"],
        "tempeh": ["soy"],
        "seitan": ["gluten", "wheat"]
    };

    // Pre-process user sensitivities (canonicalize)
    const userAllergies = (userProfile.sensitivity.allergies || []).map(a => getCanonicalIngredient(a));
    const userIntolerances = (userProfile.sensitivity.intolerances || []).map(i => getCanonicalIngredient(i));
    const spiceTolerance = userProfile.sensitivity.spiceTolerance || 'Medium';
    const fermentedSensitive = userProfile.sensitivity.fermentedSensitivity || false;

    // A. Title Check
    userAllergies.forEach(allergy => {
        if (titleLower.includes(allergy)) {
            bioScore = 0;
            isBlocked = true;
            const msg = `⛔ **${allergy}** detected in dish name.`;
            if (!warnings.includes(msg)) warnings.push(msg);
            evidence.push({ ingredient: "Dish Title", match: allergy, reason: 'Allergy (Title Match)', weight: 100, type: 'critical' });
        }
    });

    ingredients.forEach(ing => {
        // Handle ingredient object structure
        const rawName = (ing.ingredient || ing.ingredient_Phrase || "").toLowerCase().trim();
        if (!rawName) return;

        const canonicalName = getCanonicalIngredient(rawName);
        const fData = flavorData.find(f => f && (f.name === rawName || f.canonicalName === canonicalName));
        
        // Expand derived ingredients (e.g. Soy Sauce -> [Soy Sauce, Gluten, Soy, Wheat])
        let derivedIngredients = [canonicalName, rawName];
        for (const [key, hidden] of Object.entries(hiddenAllergens)) {
            if (rawName.includes(key) || canonicalName.includes(key)) {
                derivedIngredients = [...derivedIngredients, ...hidden];
            }
        }
        
        // A. Hard Block: Allergies
        const allergyMatch = userAllergies.find(a => derivedIngredients.some(di => di.includes(a)));
        if (allergyMatch) {
            bioScore = 0;
            isBlocked = true;
            const msg = `Contains **${allergyMatch}** (in ${rawName})`;
            if (!warnings.includes(msg)) warnings.push(msg);
            evidence.push({ ingredient: rawName, match: allergyMatch, reason: 'Allergy', weight: 100, type: 'critical' });
        }

        // B. Intolerances (Soft Deduction)
        const intoleranceMatch = userIntolerances.find(i => derivedIngredients.some(di => di.includes(i)));
        if (intoleranceMatch) {
            bioScore -= 30;
            const msg = `Contains **${intoleranceMatch}** (in ${rawName})`;
            if (!warnings.includes(msg)) warnings.push(msg);
            evidence.push({ ingredient: rawName, match: intoleranceMatch, reason: 'Intolerance', weight: 30, type: 'warning' });
        }

        // C. Functional Group / Compound Sensitivity
        if (fData) {
            const funcGroups = (fData.functionalGroups || "").toLowerCase();
            
            // Fermented / Alcohol
            if (fermentedSensitive) {
                if (funcGroups.includes('alcohol') || funcGroups.includes('fermented') || rawName.includes('wine') || rawName.includes('beer') || rawName.includes('vinegar')) {
                     bioScore -= 15;
                     evidence.push({ ingredient: rawName, reason: 'Fermented/Alcohol Sensitivity', weight: 15, type: 'caution' });
                }
            }
            
            // Spice Tolerance
            const flavorProfile = (fData.flavorProfile || "").toLowerCase();
            const isSpicy = flavorProfile.includes('spicy') || rawName.includes('chili') || rawName.includes('pepper') || rawName.includes('hot sauce') || rawName.includes('curry');
            
            if (isSpicy) {
                if (spiceTolerance === 'Low') {
                    bioScore -= 20;
                    evidence.push({ ingredient: rawName, reason: 'Spice Sensitivity (Low Tolerance)', weight: 20, type: 'caution' });
                } else if (spiceTolerance === 'Medium' && (rawName.includes('ghost') || rawName.includes('habanero'))) {
                     bioScore -= 10;
                     evidence.push({ ingredient: rawName, reason: 'Very Spicy Ingredient', weight: 10, type: 'caution' });
                }
            }
        }
    });
    
    // Clamp BioScore
    bioScore = Math.max(0, bioScore);
    if (isBlocked) bioScore = 0;


    // --- 2. TasteMatch Score (Vector Approach) ---
    
    // User Taste Vector (1-10)
    const userVector = {
        sweet: userProfile.taste.sweet || 5,
        spicy: userProfile.taste.spicy || 5,
        bitter: userProfile.taste.bitter || 5,
        sour: userProfile.taste.sour || 5,
        umami: userProfile.taste.umami || 5,
        creamy: userProfile.taste.creamy || 5 
    };

    // Dish Flavor Vector (Aggregated from ingredients)
    let dishVector = { sweet: 0, spicy: 0, bitter: 0, sour: 0, umami: 0, creamy: 0 };
    let count = 0;

    ingredients.forEach(ing => {
        const rawName = (ing.ingredient || "").toLowerCase();
        const fData = flavorData.find(f => f && (f.name === rawName || f.canonicalName === getCanonicalIngredient(rawName)));
        
        let contribution = { sweet: 0, spicy: 0, bitter: 0, sour: 0, umami: 0, creamy: 0 };
        
        if (fData) {
            // FlavorDB profile string parsing (e.g. "sweet@sour")
            const profile = (fData.flavorProfile || "").toLowerCase();
            
            if (fData.super_sweet || profile.includes('sweet')) contribution.sweet += 8;
            if (profile.includes('bitter') || fData.bitter) contribution.bitter += 8;
            if (profile.includes('sour')) contribution.sour += 8;
            if (profile.includes('spicy')) contribution.spicy += 8;
            if (profile.includes('savory') || profile.includes('meaty')) contribution.umami += 7;
        } 
        
        // Heuristic fallback / enhancement based on name
        if (rawName.includes('sugar') || rawName.includes('honey')) contribution.sweet = 10;
        if (rawName.includes('lemon') || rawName.includes('vinegar')) contribution.sour = 9;
        if (rawName.includes('chili') || rawName.includes('pepper')) contribution.spicy = 9;
        if (rawName.includes('cream') || rawName.includes('milk') || rawName.includes('cheese') || rawName.includes('butter') || rawName.includes('yogurt')) contribution.creamy = 8;
        if (rawName.includes('soy sauce') || rawName.includes('mushroom') || rawName.includes('meat') || rawName.includes('broth')) contribution.umami = 9;

        // Add to main vector
        for (let k in dishVector) dishVector[k] += contribution[k];
        if (Object.values(contribution).some(v => v > 0)) count++;
    });

    // Normalize Dish Vector (Average)
    if (count > 0) {
        for (let k in dishVector) dishVector[k] = Math.min(10, dishVector[k] / (count * 0.3)); // Scaling factor to boost signals
    } else {
        // Default if no flavor data found anywhere
        dishVector = { sweet: 2, spicy: 2, bitter: 2, sour: 2, umami: 5, creamy: 2 }; 
    }

    // Calculate Euclidean Distance (Similarity)
    // Max distance in 6D space (0-10) is roughly sqrt(6 * 100) = 24.5
    let sumSqDiff = 0;
    let diffDetails = [];
    for (let k in userVector) {
        const diff = Math.abs(userVector[k] - dishVector[k]);
        sumSqDiff += diff * diff;
        
        // Generate breakdown text
        if (diff < 3) {
           if (dishVector[k] > 6) breakdown.push(`✅ Matches your love for **${k}** flavors.`);
        } else if (diff > 6) {
           if (dishVector[k] > userVector[k]) breakdown.push(`❌ Might be too **${k}** for you.`);
           else breakdown.push(`❌ Lacks the **${k}** punch you like.`);
        }
    }
    
    // Convert distance to Score (0-100)
    const distance = Math.sqrt(sumSqDiff);
    const maxDist = 20; // Scale factor
    tasteScore = Math.max(0, 100 - (distance / maxDist) * 100);
    
    return {
        tasteScore: Math.round(tasteScore),
        bioScore: Math.round(bioScore),
        warnings,
        breakdown: [...new Set(breakdown)],
        block: isBlocked,
        evidence,
        dishVector: dishVector 
    };
};

module.exports = { analyzeDish };
