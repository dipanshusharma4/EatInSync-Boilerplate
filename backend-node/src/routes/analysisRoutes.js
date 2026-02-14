const express = require('express');
const router = express.Router();
const { analyzeDish } = require('../controllers/analysisController');

router.post('/analyze_dish', analyzeDish);

module.exports = router;
