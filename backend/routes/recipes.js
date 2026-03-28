const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/recipes - List with filters, search, pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      q, dietType, cuisine, difficulty, maxTime,
      minRating, tags, sort = '-createdAt',
      page = 1, limit = 12
    } = req.query;

    const filter = { isPublished: true };

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Filters
    if (dietType) filter.dietType = dietType;
    if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;
    if (maxTime) filter['cookingTime.total'] = { $lte: parseInt(maxTime) };
    if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      filter.tags = { $in: tagList };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOpts = q ? { score: { $meta: 'textScore' }, ...parseSortString(sort) } : parseSortString(sort);

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortOpts)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name avatar')
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    res.json({
      recipes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseSortString(sort) {
  if (sort.startsWith('-')) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
}

// GET /api/recipes/suggestions - Ingredient-based suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { ingredients } = req.query;
    if (!ingredients) return res.status(400).json({ error: 'Ingredients required' });

    const ingredientList = ingredients.split(',').map(i => i.trim().toLowerCase());

    // Find recipes that match the most ingredients
    const recipes = await Recipe.find({
      isPublished: true,
      'ingredients.name': { $in: ingredientList.map(i => new RegExp(i, 'i')) },
    })
      .sort({ averageRating: -1 })
      .limit(20)
      .populate('author', 'name avatar')
      .lean();

    // Compute match score and missing ingredients
    const scored = recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
      const matched = ingredientList.filter(ing =>
        recipeIngredients.some(ri => ri.includes(ing) || ing.includes(ri))
      );
      const missing = recipeIngredients.filter(ri =>
        !ingredientList.some(ing => ri.includes(ing) || ing.includes(ri))
      ).filter(ri => !recipe.ingredients.find(i => i.name.toLowerCase() === ri)?.optional);

      return { ...recipe, matchScore: matched.length, missingIngredients: missing };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ recipes: scored.slice(0, 12) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/autocomplete - Ingredient autocomplete
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ suggestions: [] });

    const results = await Recipe.aggregate([
      { $unwind: '$ingredients' },
      { $match: { 'ingredients.name': { $regex: q, $options: 'i' } } },
      { $group: { _id: { $toLower: '$ingredients.name' } } },
      { $limit: 10 },
      { $project: { _id: 0, name: '$_id' } },
    ]);

    res.json({ suggestions: results.map(r => r.name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/cuisines - Available cuisines
router.get('/cuisines', async (req, res) => {
  try {
    const cuisines = await Recipe.distinct('cuisine', { isPublished: true });
    res.json({ cuisines: cuisines.sort() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/:slug - Single recipe
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'name avatar bio');

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    // Increment view count
    await Recipe.findByIdAndUpdate(recipe._id, { $inc: { views: 1 } });

    // Track user history
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          history: {
            $each: [{ recipe: recipe._id }],
            $slice: -50, // keep last 50
          },
        },
      });
    }

    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recipes - Create recipe
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    data.author = req.user._id;

    if (req.file) {
      data.image = {
        url: req.file.path,
        publicId: req.file.filename,
        alt: data.title || 'Recipe image',
      };
    }

    const recipe = await Recipe.create(data);
    await recipe.populate('author', 'name avatar');
    res.status(201).json({ recipe });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/recipes/:id - Update recipe
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const data = JSON.parse(req.body.data || '{}');
    if (req.file) {
      data.image = { url: req.file.path, publicId: req.file.filename, alt: data.title };
    }

    const updated = await Recipe.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('author', 'name avatar');
    res.json({ recipe: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recipes/:id/save - Save/unsave recipe
router.post('/:id/save', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.id;
    const isSaved = user.savedRecipes.includes(recipeId);

    if (isSaved) {
      user.savedRecipes.pull(recipeId);
      await Recipe.findByIdAndUpdate(recipeId, { $inc: { saves: -1 } });
    } else {
      user.savedRecipes.push(recipeId);
      await Recipe.findByIdAndUpdate(recipeId, { $inc: { saves: 1 } });
    }
    await user.save();

    res.json({ saved: !isSaved, message: isSaved ? 'Recipe unsaved' : 'Recipe saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/:id/grocery-list - Generate grocery list
router.get('/:slug/grocery-list', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const servings = parseInt(req.query.servings) || recipe.servings;
    const multiplier = servings / recipe.servings;

    const groceryList = recipe.ingredients.map(ing => ({
      name: ing.name,
      amount: ing.amount ? `${parseFloat(ing.amount) * multiplier || ing.amount} ${ing.unit}`.trim() : ing.unit,
      optional: ing.optional,
      category: categorizeIngredient(ing.name),
    }));

    // Group by category
    const grouped = groceryList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ groceryList, grouped, servings, recipeName: recipe.title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function categorizeIngredient(name) {
  const lower = name.toLowerCase();
  if (/chicken|beef|pork|fish|prawn|shrimp|lamb|mutton|egg/.test(lower)) return 'Proteins';
  if (/milk|cream|cheese|butter|yogurt|curd/.test(lower)) return 'Dairy';
  if (/onion|garlic|tomato|potato|carrot|spinach|cabbage|pepper|ginger/.test(lower)) return 'Vegetables';
  if (/apple|banana|lemon|lime|orange|mango/.test(lower)) return 'Fruits';
  if (/rice|flour|pasta|bread|oat|noodle/.test(lower)) return 'Grains & Staples';
  if (/oil|ghee|butter/.test(lower)) return 'Oils & Fats';
  if (/salt|pepper|cumin|turmeric|masala|spice|chili|coriander/.test(lower)) return 'Spices & Herbs';
  if (/sugar|honey|jaggery/.test(lower)) return 'Sweeteners';
  return 'Other';
}

module.exports = router;
