const tesseract = require('tesseract.js');
const { createWorker } = tesseract;

// Knowledge Base for Chemical Analysis
// Maps ingredients/keywords to chemical profiles and potential triggers
const CHEMICAL_KNOWLEDGE_BASE = {
    // Proteins
    "chicken": { type: "non-veg", tags: ["Lean Protein"], chemicals: { Purine: "Moderate" } },
    "beef": { type: "non-veg", tags: ["Red Meat"], chemicals: { SaturatedFat: "High", Histamine: "Moderate (if aged)" }, triggers: ["High Cholesterol"] },
    "pork": { type: "non-veg", tags: ["Red Meat"], chemicals: { Histamine: "High (cured)" }, triggers: ["Inflammation"] },
    "fish": { type: "non-veg", tags: ["Seafood"], chemicals: { Omega3: "High", Histamine: "Low (fresh)" }, triggers: ["Fish Allergy"] },
    "salmon": { type: "non-veg", tags: ["Seafood"], chemicals: { Omega3: "Very High" }, benefits: ["Heart Health"] },
    "shrimp": { type: "non-veg", tags: ["Shellfish"], chemicals: { Cholesterol: "High" }, triggers: ["Shellfish Allergy"] },
    "tofu": { type: "vegan", tags: ["Soy"], chemicals: { Isoflavones: "High" }, benefits: ["Plant Protein"] },
    "egg": { type: "non-veg", tags: ["Egg"], triggers: ["Egg Allergy"] },

    // Dairy
    "cheese": { type: "veg", tags: ["Dairy"], chemicals: { Tyramine: "High (aged)", SaturatedFat: "High" }, triggers: ["Lactose", "Migraines"] },
    "parmesan": { type: "veg", tags: ["Dairy", "Aged Cheese"], chemicals: { Tyramine: "Very High", Glutamate: "High" }, triggers: ["Migraines"] },
    "milk": { type: "veg", tags: ["Dairy"], chemicals: { Lactose: "High" }, triggers: ["Lactose"] },
    "cream": { type: "veg", tags: ["Dairy"], chemicals: { SaturatedFat: "High" }, triggers: ["Lactose"] },
    "yogurt": { type: "veg", tags: ["Dairy"], chemicals: { Probiotics: "High" }, benefits: ["Gut Health"] },

    // Grains
    "pasta": { type: "veg", tags: ["Wheat"], chemicals: { Gluten: "High", Carbohydrates: "High" }, triggers: ["Gluten", "Celiac"] },
    "bread": { type: "veg", tags: ["Wheat"], chemicals: { Gluten: "High" }, triggers: ["Gluten"] },
    "rice": { type: "vegan", tags: ["Grains"], chemicals: { Arsenic: "Trace" }, benefits: ["Gluten Free"] },
    "quinoa": { type: "vegan", tags: ["Ancient Grain"], chemicals: { Fiber: "High", Protein: "Moderate" }, benefits: ["Complete Protein"] },

    // Vegetables/Fruits
    "tomato": { type: "vegan", tags: ["Nightshade"], chemicals: { Lycopene: "High", Acid: "High" }, triggers: ["Acid Reflux", "Nightshade Sensitivity"] },
    "potato": { type: "vegan", tags: ["Nightshade"], chemicals: { Solanine: "Trace" }, triggers: ["Nightshade Sensitivity"] },
    "mushroom": { type: "vegan", tags: ["Fungi"], chemicals: { BetaGlucans: "High" }, benefits: ["Immunity"] },
    "spinach": { type: "vegan", tags: ["Leafy Green"], chemicals: { Oxalates: "High", Iron: "Moderate" }, triggers: ["Kidney Stones"] },
    "lemon": { type: "vegan", tags: ["Citrus"], chemicals: { VitaminC: "High", CitricAcid: "High" }, triggers: ["Acid Reflux"] },
    "citrus": { type: "vegan", tags: ["Citrus"], chemicals: { Acid: "High" }, triggers: ["Acid Reflux"] },

    // Spices/Others
    "spicy": { type: "vegan", tags: ["Spicy"], chemicals: { Capsaicin: "High" }, triggers: ["Acid Reflux", "IBS"] },
    "chili": { type: "vegan", tags: ["Spicy"], chemicals: { Capsaicin: "Very High" }, triggers: ["Acid Reflux"] },
    "garlic": { type: "vegan", tags: ["High FODMAP"], chemicals: { Fructans: "High" }, triggers: ["IBS"] },
    "onion": { type: "vegan", tags: ["High FODMAP"], chemicals: { Fructans: "High" }, triggers: ["IBS"] },
    "wine": { type: "vegan", tags: ["Alcohol"], chemicals: { Sulfites: "High", Histamine: "High" }, triggers: ["Migraines", "Histamine Intolerance"] },
    "beer": { type: "vegan", tags: ["Alcohol"], chemicals: { Gluten: "Moderate", Histamine: "Moderate" }, triggers: ["Gluten"] },
    "soy": { type: "vegan", tags: ["Soy"], chemicals: { Phytoestrogens: "High" }, triggers: ["Soy Allergy"] },
    "peanut": { type: "vegan", tags: ["Nut"], chemicals: { Aflatoxin: "Trace" }, triggers: ["Peanut Allergy"] },
    "nut": { type: "vegan", tags: ["Tree Nut"], triggers: ["Tree Nut Allergy"] },
    "steak": { type: "non-veg", tags: ["Red Meat"], chemicals: { SaturatedFat: "High" }, triggers: ["High Cholesterol"] },
    "burger": { type: "non-veg", tags: ["Red Meat"], chemicals: { SaturatedFat: "High" }, triggers: ["High Cholesterol"] },
    "lamb": { type: "non-veg", tags: ["Red Meat"], chemicals: { SaturatedFat: "High" }, triggers: ["High Cholesterol"] },
    "bacon": { type: "non-veg", tags: ["Red Meat", "Processed"], chemicals: { Sodium: "High", Nitrates: "High" }, triggers: ["Hypertension"] },

    // Grains & Pasta Synonyms
    "spaghetti": { type: "veg", tags: ["Wheat"], chemicals: { Gluten: "High" }, triggers: ["Gluten"] },
    "fettuccine": { type: "veg", tags: ["Wheat"], chemicals: { Gluten: "High" }, triggers: ["Gluten"] },
    "penne": { type: "veg", tags: ["Wheat"], chemicals: { Gluten: "High" }, triggers: ["Gluten"] },
    "noodle": { type: "veg", tags: ["Wheat"], chemicals: { Gluten: "High" }, triggers: ["Gluten"] },
    "pizza": { type: "veg", tags: ["Wheat", "Dairy"], chemicals: { Gluten: "High", SaturatedFat: "High" }, triggers: ["Gluten", "Lactose"] },

    // Salads & Veggies
    "salad": { type: "vegan", tags: ["Vegetable"], chemicals: { Fiber: "High" }, benefits: ["Digestion"] },
    "soup": { type: "veg", tags: ["Liquid"], chemicals: { Sodium: "Moderate" }, benefits: ["Hydration"] },
    "avocado": { type: "vegan", tags: ["Healthy Fat"], chemicals: { Potassium: "High" }, benefits: ["Heart Health"] },

    // Sweets
    "cake": { type: "veg", tags: ["Dessert"], chemicals: { Sugar: "Very High" }, triggers: ["Diabetes"] },
    "chocolate": { type: "veg", tags: ["Dessert"], chemicals: { Sugar: "High", Caffeine: "Moderate" }, triggers: ["Migraines"] },
    "ice cream": { type: "veg", tags: ["Dairy", "Dessert"], chemicals: { Sugar: "High", Lactose: "High" }, triggers: ["Lactose"] }
};

// Helper to sanitize text
const cleanText = (text) => {
    return text.replace(/[^a-zA-Z\s]/g, ' ').toLowerCase();
};

// Levenshtein Distance for Fuzzy Matching
const levenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const isFuzzyMatch = (word, keyword) => {
    const w = word.toLowerCase();
    const k = keyword.toLowerCase();

    // Exact match shortcut
    if (w === k) return true;

    // Length check optimization
    if (Math.abs(w.length - k.length) > 2) return false;

    // Allow 1 edit for short words (4-6 chars), 2 edits for long words (>6)
    const allowedEdits = k.length > 6 ? 2 : 1;
    if (w.length < 4 && w !== k) return false; // Don't fuzzy match very short words

    return levenshteinDistance(w, k) <= allowedEdits;
};

// Advanced parser to extract dish candidates from raw text
const textToDishes = (text) => {
    const lines = text.split('\n');
    const detectedDishes = [];

    lines.forEach(line => {
        // Skip short lines, prices only, or common headers
        if (line.length < 5) return;
        if (/^\s*\$?[\d,.]+\s*$/.test(line)) return; // Skip price-only lines
        if (/menu|appetizer|entree|main|dessert|drink|beverage/i.test(line)) return;

        // Split line into words for token-based analysis
        const words = cleanText(line).split(/\s+/).filter(w => w.length > 2);

        let ingredientsFound = [];
        let score = 0;

        // Check every keyword against every word in the line
        for (const [key, profile] of Object.entries(CHEMICAL_KNOWLEDGE_BASE)) {
            const keyword = key.toLowerCase();

            // Check if any word in the line fuzzy matches the keyword
            const match = words.some(word => isFuzzyMatch(word, keyword));

            if (match) {
                ingredientsFound.push({ name: key, ...profile });
                score += 1;
            }
        }

        // Only consider it a dish if we found recognizable food words
        // OR if the line looks like a menu title (Capitalized, decent length)
        const isTitleCase = /^[A-Z]/.test(line.trim());
        const isDecentLength = line.trim().length > 6 && line.trim().length < 60;

        if (score > 0) {
            // High confidence dish
            let name = line.trim().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
            name = name.replace(/^[^a-zA-Z]+/, '').replace(/[^a-zA-Z)]+$/, '');

            if (name.length > 3) {
                detectedDishes.push({
                    name: name,
                    original_text: line.trim(),
                    ingredients: ingredientsFound,
                    is_analyzed: true
                });
            }
        } else if (isTitleCase && isDecentLength) {
            // Low confidence / Unknown dish - Fallback
            // Still add it so user sees something!
            let name = line.trim().replace(/^[^a-zA-Z]+/, '').replace(/[^a-zA-Z)]+$/, '');
            if (name.length > 3) {
                detectedDishes.push({
                    name: name,
                    original_text: line.trim(),
                    ingredients: [], // No ingredients found
                    is_analyzed: false // Mark as not fully analyzed
                });
            }
        }
    });

    // Deduplicate by name
    const uniqueDishes = [];
    const names = new Set();
    detectedDishes.forEach(d => {
        if (!names.has(d.name)) {
            names.add(d.name);
            uniqueDishes.push(d);
        }
    });

    return uniqueDishes; // Return all candidates for BCS scoring
};

const calculateBCS = (user, dish) => {
    let score = 100;
    let reasons = [];
    let tags = [];

    if (!dish.is_analyzed) {
        // Fallback for mock dishes if any left
        return { score: 50, reasons: ["Insufficient data"], tags: [] };
    }

    // 1. Diet Type Check (Aggregated from ingredients)
    const userDiet = user.diet_type?.toLowerCase() || 'non-veg';
    const dishIngredients = dish.ingredients || [];

    const isNonVeg = dishIngredients.some(i => i.type === 'non-veg');
    const hasDairy = dishIngredients.some(i => i.tags.includes('Dairy'));
    const hasEgg = dishIngredients.some(i => i.tags.includes('Egg'));

    if (userDiet === 'vegan' && (isNonVeg || hasDairy || hasEgg)) {
        score = 0;
        reasons.push(`Contains animal products (violates Vegan diet).`);
        tags.push('Critical Mismatch');
        return { score, reasons, tags };
    }
    if (userDiet === 'veg' && isNonVeg) {
        score = 0;
        reasons.push(`Contains meat (violates Vegetarian diet).`);
        tags.push('Critical Mismatch');
        return { score, reasons, tags };
    }

    // 2. Allergies / Avoided Ingredients
    const avoided = (user.avoided_ingredients || []).map(a => a.toLowerCase());

    // Check our detected ingredients
    const allergyMatch = dishIngredients.filter(i =>
        avoided.some(a => i.name.includes(a) || (i.tags && i.tags.some(t => t.toLowerCase().includes(a))))
    );

    if (allergyMatch.length > 0) {
        score = 10;
        const names = allergyMatch.map(i => i.name).join(', ');
        reasons.push(`Contains avoided ingredient(s): ${names}.`);
        tags.push('High Risk');
    }

    // 3. User Sensitivities (Molecular/Condition Mapping)
    const sensitivities = user.sensitivities || [];

    sensitivities.forEach(sensitivity => {
        // Check ingredient tags and chemicals
        dishIngredients.forEach(ing => {
            // Check trigger tags
            if (ing.triggers && ing.triggers.some(t => t.toLowerCase() === sensitivity.toLowerCase())) {
                score -= 25;
                reasons.push(`Contains ${ing.name} which triggers ${sensitivity}.`);
            }
            // Fuzzy reverse trigger check
            if (ing.triggers && ing.triggers.some(t => sensitivity.toLowerCase().includes(t.toLowerCase()))) {
                score -= 25;
                reasons.push(`Contains ${ing.name} which triggers ${sensitivity}.`);
            }

            // Check chemicals
            if (ing.chemicals) {
                for (const [chem, level] of Object.entries(ing.chemicals)) {
                    if (chem.toLowerCase() === sensitivity.toLowerCase()) {
                        score -= 20;
                        reasons.push(`High in ${chem} (${ing.name}).`);
                    }
                }
            }

            // Helper Cases
            if (sensitivity === 'Acidity' && ing.chemicals.Acid) { score -= 15; reasons.push(`High acidity from ${ing.name}.`); }
        });
    });

    // 4. Taste Preferences
    const likes = (user.taste_likes || []).map(l => l.toLowerCase());
    const dislikes = (user.taste_dislikes || []).map(d => d.toLowerCase());
    const dishDescription = dish.original_text.toLowerCase();

    const isLiked = likes.some(l => dishDescription.includes(l));
    if (isLiked) {
        score += 5;
        tags.push('Flavor Match');
    }

    const isDisliked = dislikes.some(d => dishDescription.includes(d));
    if (isDisliked) {
        score -= 10;
        reasons.push(`Contains flavors you dislike.`);
    }

    // Deduplicate reasons
    reasons = [...new Set(reasons)];

    // Cap score
    score = Math.max(0, Math.min(100, score));

    // Final Tags
    if (score >= 80) tags.push('Excellent Choice');
    else if (score >= 50 && score < 80) tags.push('Moderate');
    else if (score < 50 && score > 0) tags.push('Avoid');

    if (reasons.length === 0) reasons.push("Matches your molecular profile.");

    return { score, reasons, tags };
};

module.exports = {
    // recognizeText, // Tesseract worker function
    textToDishes,
    calculateBCS
};
