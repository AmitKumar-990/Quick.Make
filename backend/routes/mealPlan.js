const express = require('express');
const MealPlan = require('../models/MealPlan');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/meal-plan - Get current week's plan
router.get('/', protect, async (req, res) => {
  try {
    const { weekStart } = req.query;
    const filter = { user: req.user._id };
    if (weekStart) filter.weekStart = new Date(weekStart);

    const plan = await MealPlan.findOne(filter)
      .populate('days.monday.breakfast days.monday.lunch days.monday.dinner')
      .populate('days.tuesday.breakfast days.tuesday.lunch days.tuesday.dinner')
      .populate('days.wednesday.breakfast days.wednesday.lunch days.wednesday.dinner')
      .populate('days.thursday.breakfast days.thursday.lunch days.thursday.dinner')
      .populate('days.friday.breakfast days.friday.lunch days.friday.dinner')
      .populate('days.saturday.breakfast days.saturday.lunch days.saturday.dinner')
      .populate('days.sunday.breakfast days.sunday.lunch days.sunday.dinner');

    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meal-plan - Create or update meal plan
router.post('/', protect, async (req, res) => {
  try {
    const { weekStart, days, notes } = req.body;

    const plan = await MealPlan.findOneAndUpdate(
      { user: req.user._id, weekStart: new Date(weekStart) },
      { days, notes, user: req.user._id, weekStart: new Date(weekStart) },
      { upsert: true, new: true }
    );

    res.json({ plan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/meal-plan/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const plan = await MealPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    await plan.deleteOne();
    res.json({ message: 'Meal plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
