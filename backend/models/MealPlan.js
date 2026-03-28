const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStart: {
    type: Date,
    required: true,
  },
  days: {
    monday: { breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } },
    tuesday: { breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } },
    wednesday: { breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } },
    thursday: { breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } },
    friday: { breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } },
    saturday: { breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } },
    sunday: { breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } },
  },
  notes: { type: String, maxlength: 500 },
}, { timestamps: true });

mealPlanSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
