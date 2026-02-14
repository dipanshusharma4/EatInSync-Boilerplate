const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { analyzeDish } = require('../services/compatibilityEngine');
const { searchRecipes, getRecipeDetails, getIngredientFlavor, getCanonicalIngredient } = require('../services/foodoscope');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Scan menu image and analyze using Gemini 1.5 Flash (with fallback)
// @route   POST /api/v1/scan-menu
// @access  Private
// This implementation uses logic similar to molecularEngine but adapts it to the existing compatibilityEngine
router.post('/scan-menu', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ detail: 'No image file uploaded' });
        }

        console.log(`Received file: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ detail: 'User not found' });

        // Also fetch profile for analysis
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ detail: 'Profile not found' });

        // 1. Prepare Image (Using Buffer for speed/robustness instead of FS)
        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype,
            },
        };

        // 2. User's Optimized Prompt
        const prompt = `
          Analyze this menu image. Extract all distinct food dishes.
          Ignore prices, descriptions, and headers.
          Return a JSON object with a key "dishes" containing an array of strings.
          Example: { "dishes": ["Grilled Salmon", "Risotto", "Tiramisu"] }
        `;

        let text = '';
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                // Attempt with Gemini 2.0 Flash
                console.log(`Sending to Gemini (Attempt ${retries + 1}/${maxRetries})...`);
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.0-flash",
                    generationConfig: { responseMimeType: "application/json" }
                });

                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                text = response.text();
                break; // Success
            } catch (err) {
                console.warn(`Model failed (Attempt ${retries + 1}/${maxRetries}):`, err.message);

                // If 429 logic (Rate Limit) - could wait, but for now we just fallback or retry
                if (err.message.includes('429') || err.message.includes('Quota') || err.status === 429) {
                    const wait = 2000 * (retries + 1);
                    console.log(`Rate limited. Waiting ${wait}ms...`);
                    await new Promise(r => setTimeout(r, wait));
                }

                retries++;

                if (retries >= maxRetries) {
                    // Fallback to older model on last attempt
                    try {
                        console.log("Trying fallback to gemini-1.5-flash...");
                        const modelFallback = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                        const result = await modelFallback.generateContent([prompt, imagePart]);
                        text = (await result.response).text();
                        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    } catch (finalErr) {
                        console.error("All models failed.");
                        throw finalErr;
                    }
                }
            }
        }

        // 4. Parse Strict JSON
        let dishNames = [];
        try {
            const parsedData = JSON.parse(text);
            dishNames = parsedData.dishes || [];
            console.log(`Extracted ${dishNames.length} dish names.`);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            return res.status(500).json({ detail: "AI failed to return valid JSON." });
        }

        // 5. Send to Ranking Engine
        const analyzedDishesData = [];

        // Sequential processing to avoid slamming FlavorDB/RecipeDB
        for (const name of dishNames) {
            try {
                console.log(`Analyzing dish: ${name}`);

                // A. Search RecipeDB
                // Try to find a recipe matching the dish name
                const recipeResults = await searchRecipes(name);
                let ingredients = [];
                let dishTitle = name;

                if (recipeResults && recipeResults.length > 0) {
                    // Use the best match
                    const bestMatch = recipeResults[0];
                    dishTitle = bestMatch.Recipe_title || name;

                    // Get full details (ingredients)
                    const details = await getRecipeDetails(bestMatch.Recipe_id);
                    if (details) {
                        // Parse ingredients from details
                        // details can be { recipe: {...}, ingredients: [...] } or just { ... }
                        const rawIngs = details.ingredients || (details.recipe && details.recipe.ingredients) || [];

                        if (Array.isArray(rawIngs)) {
                            ingredients = rawIngs.map(ing => ({
                                // Normalize to object with 'ingredient' key for compatibilityEngine
                                ingredient: typeof ing === 'string' ? ing : (ing.ingredient || ing.ingredient_Phrase || ing.name)
                            }));
                        }
                    }
                }

                // Fallback: If no recipe found, we interpret the dish name itself as the primary ingredient
                if (ingredients.length === 0) {
                    ingredients = [{ ingredient: name }];
                }

                // B. Fetch FlavorDB Data for ingredients
                // Limit to top 20 to preserve resources
                const ingredientsToAnalyze = ingredients.slice(0, 20);
                const flavorNameList = ingredientsToAnalyze.map(ing => ing.ingredient || dishTitle);

                const flavorDataPromises = flavorNameList.map(n => getIngredientFlavor(n));
                const flavorData = await Promise.all(flavorDataPromises);

                // C. Analyze using Compatibility Engine (BCS Calculation)
                const dishDetails = {
                    dishName: dishTitle,
                    ingredients: ingredients
                };

                const analysis = analyzeDish(dishDetails, profile, flavorData);

                analyzedDishesData.push({
                    name,
                    description: ingredients.length > 1 ? `Analyzed as "${dishTitle}"` : "Approximated from name",
                    score: Math.round((analysis.bioScore + analysis.tasteScore) / 2),
                    bioScore: analysis.bioScore, // BCS
                    tasteScore: analysis.tasteScore,
                    reasons: analysis.warnings.length > 0 ? analysis.warnings : analysis.breakdown,
                    tags: analysis.block ? ['Blocked'] : analysis.bioScore > 80 ? ['Bio-Compatible'] : []
                });

            } catch (innerErr) {
                console.error(`Failed to analyze dish ${name}`, innerErr);
                analyzedDishesData.push({
                    name,
                    score: 50,
                    bioScore: 50,
                    tasteScore: 50,
                    reasons: ["Analysis failed"],
                    tags: ["Error"]
                });
            }
        }

        // Sort by Score DESC
        analyzedDishesData.sort((a, b) => b.score - a.score);

        res.json({
            raw_text_snippet: "JSON Extraction via Gemini",
            dishes: analyzedDishesData
        });

    } catch (error) {
        console.error("Menu Scan Error:", error);
        res.status(500).json({ detail: `Error analyzing menu: ${error.message}` });
    }
});

module.exports = router;
