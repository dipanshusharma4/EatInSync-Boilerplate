const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taste: {
    sweet: { type: Number, default: 5 },
    spicy: { type: Number, default: 5 },
    bitter: { type: Number, default: 5 },
    sour: { type: Number, default: 5 },
    umami: { type: Number, default: 5 },
    creamy: { type: Number, default: 5 }
  },
  sensitivity: {
    allergies: [String], // e.g., ['Peanuts', 'Shellfish']
    intolerances: [String], // e.g., ['Lactose', 'Gluten']
    dislikes: [String],
    spiceTolerance: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    fermentedSensitivity: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
