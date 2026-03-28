const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews?recipe=slug
router.get('/', async (req, res) => {
  try {
    const { recipeId, page = 1, limit = 10 } = req.query;
    const filter = recipeId ? { recipe: recipeId } : {};
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('user', 'name avatar'),
      Review.countDocuments(filter),
    ]);
    res.json({ reviews, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews
router.post('/', protect, [
  body('recipe').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const { recipe, rating, comment } = req.body;
    const existing = await Review.findOne({ recipe, user: req.user._id });
    if (existing) return res.status(409).json({ error: 'You already reviewed this recipe.' });

    const review = await Review.create({ recipe, rating, comment, user: req.user._id });
    await review.populate('user', 'name avatar');
    res.status(201).json({ review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/reviews/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();
    res.json({ review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/helpful
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Not found' });
    const alreadyMarked = review.helpfulBy.includes(req.user._id);
    if (alreadyMarked) {
      review.helpfulBy.pull(req.user._id);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpful += 1;
    }
    await review.save();
    res.json({ helpful: review.helpful, marked: !alreadyMarked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
