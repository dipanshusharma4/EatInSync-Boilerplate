const mongoose = require('mongoose');

const DishLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dishName: { type: String, required: true },
  ingredients: [String],
  flavorProfile: Object, // Stores data from FlavorDB/RecipeDB
  scores: {
    tasteMatch: Number,
    bioCompatibility: Number
  },
  warnings: [String],
  userFeedback: {
    discomfort: { type: Boolean, default: false },
    rating: Number // 1-5 stars
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DishLog', DishLogSchema);
