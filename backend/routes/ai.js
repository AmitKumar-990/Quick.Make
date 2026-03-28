const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Recipe = require('../models/Recipe');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: get a Gemini model instance
function getModel(modelName = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

// Helper: call Gemini and return raw text
async function callGemini(prompt, modelName = 'gemini-1.5-flash') {
  const model = getModel(modelName);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Helper: strip markdown code fences Gemini sometimes wraps responses in
function cleanJson(text) {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

// POST /api/ai/suggest - AI recipe suggestions from ingredients/context
router.post('/suggest', async (req, res) => {
  try {
    const { ingredients = [], context = '', dietType, cuisine, maxTime, difficulty } = req.body;

    if (!ingredients.length && !context) {
      return res.status(400).json({ error: 'Provide ingredients or context.' });
    }

    const prompt = `You are a professional chef assistant for Quick Make, a recipe app.

User wants recipe suggestions with:
- Available ingredients: ${ingredients.join(', ') || 'not specified'}
- Context/request: ${context || 'general recipe suggestions'}
- Diet preference: ${dietType || 'any'}
- Cuisine preference: ${cuisine || 'any'}
- Max cooking time: ${maxTime ? maxTime + ' minutes' : 'no limit'}
- Difficulty: ${difficulty || 'any'}

Generate 3 creative recipe suggestions. For each recipe provide:
1. A catchy recipe name
2. Brief description (1-2 sentences)
3. Key ingredients needed (including ones they don't have)
4. Estimated total cooking time in minutes
5. Difficulty level (Easy/Medium/Hard)
6. Cuisine type
7. Diet type (veg/non-veg/vegan)
8. Step-by-step cooking instructions (5-8 steps)
9. Approximate nutrition per serving

Respond with ONLY a valid JSON array, no markdown fences, no extra text:
[{
  "title": "...",
  "description": "...",
  "ingredients": [{"name": "...", "amount": "...", "unit": "..."}],
  "steps": [{"stepNumber": 1, "instruction": "..."}],
  "cookingTime": {"prep": 10, "cook": 20, "total": 30},
  "difficulty": "Easy",
  "cuisine": "Indian",
  "dietType": "veg",
  "tags": ["quick", "healthy"],
  "nutrition": {"calories": 350, "protein": 12, "carbs": 45, "fat": 8}
}]`;

    const text = await callGemini(prompt, 'gemini-1.5-pro');
    const jsonMatch = cleanJson(text).match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'AI response parsing failed.' });

    const suggestions = JSON.parse(jsonMatch[0]);
    res.json({ suggestions, isAIGenerated: true });
  } catch (err) {
    console.error('Gemini suggest error:', err);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

// POST /api/ai/context-ideas - Context-based ideas (leftovers, quick meals, etc.)
router.post('/context-ideas', async (req, res) => {
  try {
    const { context, ingredients = [] } = req.body;

    const prompt = `You are Quick Make's AI chef. User says: "${context}"
Available ingredients (optional): ${ingredients.join(', ') || 'not specified'}

Give 5 creative, practical cooking ideas. Each idea should be:
- Actionable and specific
- Include approximate time needed
- Include key ingredients required
- Include a brief tip

Respond with ONLY a JSON array, no markdown, no extra text:
[{
  "idea": "...",
  "time": "20 mins",
  "keyIngredients": ["...", "..."],
  "tip": "...",
  "difficulty": "Easy"
}]`;

    const text = await callGemini(prompt);
    const jsonMatch = cleanJson(text).match(/\[[\s\S]*\]/);
    const ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    res.json({ ideas });
  } catch (err) {
    console.error('Gemini context-ideas error:', err);
    res.status(500).json({ error: 'AI service error.' });
  }
});

// POST /api/ai/missing-ingredients - Check what's missing for a recipe (logic only, no AI call)
router.post('/missing-ingredients', async (req, res) => {
  try {
    const { recipeId, userIngredients } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const userIngredientsList = userIngredients.map(i => i.toLowerCase().trim());
    const recipeIngredients = recipe.ingredients;

    const analysis = recipeIngredients.map(ing => {
      const ingName = ing.name.toLowerCase();
      const hasIt = userIngredientsList.some(ui =>
        ingName.includes(ui) || ui.includes(ingName) || levenshteinSimilar(ingName, ui)
      );
      return {
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        optional: ing.optional,
        have: hasIt,
      };
    });

    const missing = analysis.filter(i => !i.have && !i.optional);
    const optional = analysis.filter(i => !i.have && i.optional);
    const available = analysis.filter(i => i.have);

    res.json({
      analysis,
      missing,
      optional,
      available,
      completeness: Math.round((available.length / analysis.length) * 100),
      canMake: missing.length === 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/generate-full-recipe - Save AI recipe to DB
router.post('/generate-full-recipe', protect, async (req, res) => {
  try {
    const { recipeData } = req.body;
    const recipe = await Recipe.create({
      ...recipeData,
      author: req.user._id,
      isAIGenerated: true,
    });
    await recipe.populate('author', 'name avatar');
    res.status(201).json({ recipe });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/ai/meal-plan - Generate AI weekly meal plan
router.post('/meal-plan', protect, async (req, res) => {
  try {
    const { preferences } = req.body;

    const prompt = `Create a balanced 7-day meal plan for someone with these preferences: ${JSON.stringify(preferences)}

Include breakfast, lunch, and dinner for each day. Make it varied and nutritious.

Respond ONLY with a raw JSON object, no markdown fences, no extra text:
{
  "monday": {"breakfast": "Oats Upma", "lunch": "Dal Rice", "dinner": "Paneer Curry"},
  "tuesday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "wednesday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "thursday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "friday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "saturday": {"breakfast": "...", "lunch": "...", "dinner": "..."},
  "sunday": {"breakfast": "...", "lunch": "...", "dinner": "..."}
}`;

    const text = await callGemini(prompt);
    const jsonMatch = cleanJson(text).match(/\{[\s\S]*\}/);
    const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    res.json({ plan });
  } catch (err) {
    console.error('Gemini meal-plan error:', err);
    res.status(500).json({ error: 'AI service error.' });
  }
});

// POST /api/ai/enhance-recipe - Use Gemini to improve a user-uploaded recipe description
router.post('/enhance-recipe', protect, async (req, res) => {
  try {
    const { title, description, ingredients } = req.body;

    const prompt = `You are a professional food writer. Improve the following recipe description to make it more appealing, vivid, and SEO-friendly (2-3 sentences max). Keep it accurate to the ingredients listed.

Recipe title: ${title}
Current description: ${description}
Key ingredients: ${ingredients?.map(i => i.name).join(', ')}

Respond with ONLY the improved description text, no quotes, no extra commentary.`;

    const text = await callGemini(prompt);
    res.json({ enhancedDescription: text.trim() });
  } catch (err) {
    res.status(500).json({ error: 'AI service error.' });
  }
});

// Utility: fuzzy ingredient matching via Levenshtein distance
function levenshteinSimilar(a, b) {
  if (Math.abs(a.length - b.length) > 3) return false;
  let dp = Array(b.length + 1).fill(null).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? dp[j - 1] : 1 + Math.min(dp[j - 1], dp[j], prev);
      prev = temp;
    }
  }
  return dp[b.length] <= 2;
}

module.exports = router;
