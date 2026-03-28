const express = require('express');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id/recipes - User's uploaded recipes
router.get('/:id/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.params.id, isPublished: true })
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar');
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me/saved - Saved recipes
router.get('/me/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedRecipes',
        populate: { path: 'author', select: 'name avatar' },
      });
    res.json({ recipes: user.savedRecipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me/history - Viewing history
router.get('/me/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'history.recipe',
        select: 'title slug image cookingTime difficulty averageRating',
        populate: { path: 'author', select: 'name avatar' },
      });

    const history = user.history
      .filter(h => h.recipe)
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
      .slice(0, 50);

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
