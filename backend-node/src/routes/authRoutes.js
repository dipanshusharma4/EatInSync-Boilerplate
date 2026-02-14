const express = require('express');
const router = express.Router();
const { signup, login, getMe, googleLogin, saveOnboarding } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/token', login);
router.post('/google', googleLogin);
router.get('/users/me', protect, getMe);
router.put('/onboarding', protect, saveOnboarding);

module.exports = router;
