const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { email, full_name, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ detail: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            full_name,
            hashed_password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                access_token: generateToken(user._id, user.email),
                token_type: 'bearer'
            });
        } else {
            res.status(400).json({ detail: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/token
// @access  Public
const login = async (req, res) => {
    try {
        // Expecting JSON { username, password } to match updated frontend
        // Or handle urlencoded form data if strictly following OAuth2
        const { username, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email: username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                access_token: generateToken(user._id, user.email),
                token_type: 'bearer'
            });
        } else {
            res.status(401).json({ detail: 'Incorrect username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/users/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                id: user._id,
                email: user.email,
                full_name: user.full_name,
                is_active: user.is_active
            });
        } else {
            res.status(404).json({ detail: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google Login
// @route   POST /api/v1/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, name, sub } = ticket.getPayload();

        // 1. Check if user exists by email
        let user = await User.findOne({ email });

        if (user) {
            // If user exists but doesn't have googleId linked, link it?
            // Or just log them in. 
            // For now, let's just update/ensure googleId is there if we want robust linking
            if (!user.googleId) {
                user.googleId = sub;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                email,
                full_name: name,
                googleId: sub,
                // No password for google users
            });
        }

        if (user) {
            res.json({
                access_token: generateToken(user._id, user.email),
                token_type: 'bearer'
            });
        } else {
            res.status(400).json({ detail: 'Invalid user data' });
        }

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(401).json({ detail: 'Google authentication failed' });
    }
}

const CONDITION_MAPPINGS = {
    'Migraines': ['Tyramine', 'Histamine'],
    'Acid Reflux': ['Acidity', 'Caffeine', 'Spices'],
    'GERD': ['Acidity', 'Caffeine', 'Spices'], // Handle variation
    'IBS': ['FODMAPs', 'Gluten'],
    'Gut Health': ['FODMAPs', 'Gluten'],
    'Diabetes': ['Glycemic Index']
};

// @desc    Save Onboarding Profile
// @route   PUT /api/v1/auth/onboarding
// @access  Private
const saveOnboarding = async (req, res) => {
    try {
        const {
            nationality,
            dietary_conditions, // Array of strings
            lactose_intolerant,
            diet_type,
            taste_likes,
            taste_dislikes,
            avoided_ingredients
        } = req.body;

        const user = await User.findById(req.user._id);

        if (user) {
            user.nationality = nationality || user.nationality;
            user.dietary_conditions = dietary_conditions || [];
            user.lactose_intolerant = lactose_intolerant === undefined ? user.lactose_intolerant : lactose_intolerant;
            user.diet_type = diet_type || user.diet_type;
            user.taste_likes = taste_likes || [];
            user.taste_dislikes = taste_dislikes || [];
            user.avoided_ingredients = avoided_ingredients || [];

            // Derive sensitivities
            let sensitivities = new Set();
            if (dietary_conditions) {
                dietary_conditions.forEach(condition => {
                    // Try exact match first
                    let mapped = CONDITION_MAPPINGS[condition];

                    if (!mapped) {
                        // Try partial matches or split
                        for (const key in CONDITION_MAPPINGS) {
                            if (condition.includes(key)) {
                                mapped = CONDITION_MAPPINGS[key];
                                break;
                            }
                        }
                    }

                    if (mapped) {
                        mapped.forEach(m => sensitivities.add(m));
                    }
                });
            }

            if (lactose_intolerant) {
                sensitivities.add('Lactose');
            }

            user.sensitivities = Array.from(sensitivities);
            user.onboarding_completed = true;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                full_name: updatedUser.full_name,
                onboarding_completed: updatedUser.onboarding_completed,
                diet_type: updatedUser.diet_type,
                sensitivities: updatedUser.sensitivities
            });
        } else {
            res.status(404).json({ detail: 'User not found' });
        }
    } catch (error) {
        console.error("Onboarding Error:", error);
        res.status(500).json({ detail: 'Server Error' });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    googleLogin,
    saveOnboarding
};
