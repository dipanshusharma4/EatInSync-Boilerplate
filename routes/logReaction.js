const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Ideally create a Reaction model, but for now just logging or simple store
// For a hackathon/proto, maybe just console log or a simple collection without strict schema?
// Let's assume a simple schema or just inline it if no model exists yet.
// Since User didn't ask for a specific Reaction model file, I'll make a quick schema here or just use a generic collection.
// Better: Create a basic Reaction model in models/Reaction.js first? 
// User request: "Deliverables: Backend: /api/analyze, /api/log-reaction, /api/profile endpoints"
// "Log reaction: Add quick buttons... POST to /api/log-reaction"

// Let's create a model inline or separate? Separate is cleaner.
// But for speed, I'll skip separate file creation unless critical.
// Actually, I'll just use a 'Reaction' collection via mongoose.connection.

const ReactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dishName: String,
  reaction: { type: String, enum: ['No problem', 'Minor discomfort', 'Severe'] },
  timestamp: { type: Date, default: Date.now }
});
const Reaction = mongoose.model('Reaction', ReactionSchema);

// @route   POST api/log-reaction
// @desc    Log a user reaction
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { dishName, reaction } = req.body;
        console.log(`[Reaction] User ${req.user.id} logged "${reaction}" for "${dishName}"`);
        
        const newReaction = new Reaction({
            user: req.user.id,
            dishName,
            reaction
        });
        await newReaction.save();
        
        res.json({ msg: 'Reaction logged', reaction: newReaction });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
