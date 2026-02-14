const recipeDB = require('../services/recipeDB');
const flavorDB = require('../services/flavorDB');

// @desc    Analyze a dish
// @route   POST /api/v1/analyze_dish
// @access  Public
const analyzeDish = async (req, res) => {
    try {
        const { dish_name, user_profile } = req.body;

        // STEP 1: Get Ingredient Data
        const recipeData = await recipeDB.getRecipeInfo(1, 1);

        if (!recipeData) {
            console.warn("Using Mock Recipe Data due to API Failure");
        }

        // Logic to mock ingredients based on input name 
        const dishNameLower = dish_name.toLowerCase();
        let dishIngredients = [];

        if (dishNameLower.includes("cheese") || dishNameLower.includes("wine") || dishNameLower.includes("pizza")) {
            dishIngredients = ["Aged Cheese", "Red Wine", "Tomato"];
        } else {
            // Default to a safe meal for demo purposes
            console.log(`Simulating Safe Meal for: ${dish_name}`);
            dishIngredients = ["Chicken Breast", "Brown Rice", "Steamed Broccoli", "Olive Oil"];
        }

        // STEP 2: Calculate BCS Score
        let bcsScore = 100;
        let detectedTriggers = [];

        if (user_profile && user_profile.sensitivities) {
            for (const sensitivity of user_profile.sensitivities) {
                if (sensitivity === "Tyramine") {
                    if (dishIngredients.includes("Aged Cheese")) {
                        // Call FlavorDB to check potency (Example)
                        // const thresholdData = await flavorDB.getAromaThreshold(1.0);

                        bcsScore -= 40;
                        detectedTriggers.push("Tyramine (in Cheese)");
                    }
                }
            }
        }

        // STEP 3: Smart Swaps
        let swaps = [];
        if (bcsScore < 70) {
            if (detectedTriggers.includes("Tyramine (in Cheese)")) {
                // Check pairing using flavordb module
                // const pairingData = await flavorDB.checkFlavorPairing("Cheese_Mozzarella");

                swaps.push({
                    original_ingredient: "Aged Cheese",
                    suggested_replacement: "Fresh Mozzarella",
                    pairing_score: 95.5,
                    reason: "Safe & Creamy Match"
                });
            }
        }

        const response = {
            dish_name,
            bcs_score: Math.max(bcsScore, 0),
            suggestion_score: Math.floor(bcsScore * 0.8),
            triggers_found: detectedTriggers,
            smart_swaps: swaps
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
};

module.exports = { analyzeDish };
