const mongoose = require('mongoose');
const slugify = require('slugify');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: String, required: true },
  unit: { type: String, default: '' },
  optional: { type: Boolean, default: false },
}, { _id: false });

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  duration: { type: Number, default: 0 }, // minutes
  tip: { type: String, default: '' },
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  fiber: Number,
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ingredients: {
    type: [ingredientSchema],
    required: [true, 'At least one ingredient is required'],
    validate: [(arr) => arr.length > 0, 'At least one ingredient is required'],
  },
  steps: {
    type: [stepSchema],
    required: true,
    validate: [(arr) => arr.length > 0, 'At least one step is required'],
  },
  nutrition: nutritionSchema,
  cookingTime: {
    prep: { type: Number, default: 0 }, // minutes
    cook: { type: Number, default: 0 }, // minutes
    total: { type: Number, default: 0 }, // minutes
  },
  servings: {
    type: Number,
    default: 4,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    index: true,
  },
  cuisine: {
    type: String,
    required: true,
    index: true,
  },
  dietType: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan'],
    required: true,
    index: true,
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  categories: [String],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  saves: {
    type: Number,
    default: 0,
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  seoTitle: String,
  seoDescription: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto-generate slug
recipeSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  this.cookingTime.total = (this.cookingTime.prep || 0) + (this.cookingTime.cook || 0);
  next();
});

// Indexes for search performance
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ cuisine: 1, dietType: 1, difficulty: 1 });
recipeSchema.index({ 'cookingTime.total': 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ tags: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
