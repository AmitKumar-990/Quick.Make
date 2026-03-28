const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  photos: [String],
  helpful: {
    type: Number,
    default: 0,
  },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// One review per user per recipe
reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

// Update recipe rating after review save
reviewSchema.post('save', async function () {
  const Recipe = mongoose.model('Recipe');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { recipe: this.recipe } },
    { $group: { _id: '$recipe', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Recipe.findByIdAndUpdate(this.recipe, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].count,
    });
  }
});

// Update recipe rating after review delete
reviewSchema.post('remove', async function () {
  const Recipe = mongoose.model('Recipe');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { recipe: this.recipe } },
    { $group: { _id: '$recipe', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Recipe.findByIdAndUpdate(this.recipe, {
    averageRating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    totalRatings: stats.length > 0 ? stats[0].count : 0,
  });
});

module.exports = mongoose.model('Review', reviewSchema);
