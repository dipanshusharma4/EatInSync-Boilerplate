const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const { textToDishes, calculateBCS } = require('../utils/molecularEngine');
const User = require('../models/User');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @desc    Scan menu image and analyze
// @route   POST /api/v1/analyze/scan-menu
// @access  Private
const scanMenu = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ detail: 'No image file uploaded' });
        }

        console.log(`Received file: ${req.file.originalname}, Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB, Mime: ${req.file.mimetype}`);

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ detail: 'User not found' });
        }

        console.log(`[OCR] Step 1: Sharp Pre-processing...`);
        let processedBuffer;
        try {
            processedBuffer = await sharp(req.file.buffer)
                .resize({ width: 2000, withoutEnlargement: true }) // Good OCR size
                .grayscale()
                .normalize()
                .sharpen()
                .png() // Force PNG format for Tesseract compatibility
                .toBuffer();
            console.log("[OCR] Step 1: Sharp Pre-processing Complete.");
        } catch (sharpError) {
            console.error("[OCR] Sharp Processing Failed:", sharpError);
            // Fallback to original buffer if sharp fails
            processedBuffer = req.file.buffer;
        }

        console.log("[OCR] Step 2: Tesseract Recognition Start...");
        let text = '';
        try {
            const { data } = await Tesseract.recognize(
                processedBuffer,
                'eng'
                // Removed logger to reduce console spam, or keep simple one
            );
            text = data.text;
            console.log(`[OCR] Step 2: Tesseract Complete. Extracted ${text.length} chars.`);
        } catch (tessError) {
            console.error("[OCR] Tesseract Failed:", tessError);
            return res.status(500).json({ detail: 'OCR Engine failed to process image. Try a smaller/clearer image.' });
        }

        console.log("Extracted Text Length:", text.length);
        if (text.length < 10) {
            console.warn("Text extraction returned very little content.");
            // Optional: fallback logic or warning
        }

        // Parse Dishes
        let detectedDishes = textToDishes(text);
        console.log(`[Analysis] Identified ${detectedDishes.length} potential dishes from menu text.`);

        // Calculate Scores
        const analyzedDishes = detectedDishes.map(dish => {
            const { score, reasons, tags } = calculateBCS(user, dish);
            return {
                ...dish,
                score,
                reason: reasons[0], // Primary reason
                all_reasons: reasons,
                tags
            };
        });

        // Sort by Score DESC
        analyzedDishes.sort((a, b) => b.score - a.score);

        res.json({
            raw_text_snippet: text.substring(0, 200),
            dishes: analyzedDishes
        });

    } catch (error) {
        console.error("Menu Scan Error:", error);
        res.status(500).json({ detail: `Error processing menu image: ${error.message}` });
    }
};

module.exports = {
    scanMenu,
    upload
};
