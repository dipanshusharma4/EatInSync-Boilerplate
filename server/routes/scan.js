const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { analyzeDish } = require('../services/compatibilityEngine');
const { getIngredientFlavor, getCanonicalIngredient } = require('../services/foodoscope');

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

        // 3. Configure Gemini with JSON Mode
        const generationConfig = {
            responseMimeType: "application/json",
            temperature: 0.4
        };

        let text = '';
        try {
            // Attempt with Gemini 2.0 Flash
            console.log("Sending to Gemini (JSON Mode)...");
            // using gemini-2.0-flash as it is available
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            text = response.text();
        } catch (err) {
            console.warn("Primary model failed, trying fallback...", err.message);
            // Fallback to gemini-flash-latest
            const modelFallback = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await modelFallback.generateContent([prompt, imagePart]);
            text = (await result.response).text();

            // Clean markdown code blocks if present (Pro Vision often adds them)
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
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
        // We need to fetch/guess ingredients for these dishes to run analysis
        // Since we don't have ingredients, we'll try to get them via a quick heuristic or search
        // For now, let's assume the molecular analysis tries to guess ingredients or relies on flavorDB lookup by dish name

        const analyzedDishesData = [];

        // Limit parallel processing
        for (const name of dishNames) {
            try {
                // Mocking ingredient lookup or using name for basic analysis
                // In a real scenario, we might call Spoonacular or Gemini again to get ingredients for each dish
                // For speed, let's treat the dish name as a potential flavor source + do a dummy analysis

                // We will construct a minimal dishDetails object
                const dishDetails = {
                    dishName: name,
                    ingredients: [{ ingredient: name }] // Treat the whole dish as an ingredient for initial flavor lookup
                };

                // Get flavor data
                const flavorData = await getIngredientFlavor(name);

                // Analyze
                const analysis = analyzeDish(dishDetails, profile, [flavorData]);

                analyzedDishesData.push({
                    name,
                    description: "Detected from menu",
                    score: Math.round((analysis.bioScore + analysis.tasteScore) / 2),
                    bioScore: analysis.bioScore,
                    tasteScore: analysis.tasteScore,
                    reasons: analysis.warnings.length > 0 ? analysis.warnings : analysis.breakdown,
                    tags: analysis.block ? ['Blocked'] : analysis.bioScore > 80 ? ['Bio-Compatible'] : []
                });
            } catch (innerErr) {
                console.error(`Failed to analyze dish ${name}`, innerErr);
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
