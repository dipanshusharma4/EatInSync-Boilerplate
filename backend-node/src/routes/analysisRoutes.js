const express = require('express');
const router = express.Router();
const { analyzeDish } = require('../controllers/analysisController');
const { scanMenu, upload } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');

router.post('/analyze_dish', protect, analyzeDish);

router.post('/scan-menu', protect, (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ detail: `File upload error: ${err.message}. Limit is 10MB.` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ detail: `Upload error: ${err.message}` });
        }
        // Everything went fine.
        next();
    });
}, scanMenu);

module.exports = router;
