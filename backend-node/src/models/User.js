const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hashed_password: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    // Onboarding / Profile Fields
    nationality: { type: String },
    dietary_conditions: [{ type: String }], // e.g., ["Migraines", "Diabetes"]
    sensitivities: [{ type: String }],      // Derived: ["Tyramine", "Histamine"]
    taste_likes: [{ type: String }],
    taste_dislikes: [{ type: String }],
    avoided_ingredients: [{ type: String }],
    lactose_intolerant: { type: Boolean, default: false },
    diet_type: { type: String, enum: ['veg', 'non-veg', 'vegan', 'other'], default: 'non-veg' },
    onboarding_completed: { type: Boolean, default: false }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.hashed_password) return false;
    return await bcrypt.compare(enteredPassword, this.hashed_password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
