'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Plus, ChefHat, Clock, Leaf, Save, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const CUISINES = ['Any', 'Indian', 'Italian', 'Chinese', 'Mexican', 'Thai', 'Japanese', 'Mediterranean'];
const DIFFICULTIES = ['Any', 'Easy', 'Medium', 'Hard'];
const DIET_TYPES = ['Any', 'veg', 'non-veg', 'vegan'];
const CONTEXT_IDEAS = [
  'Quick dinner with leftovers',
  'Healthy breakfast ideas',
  'Party snacks for 10 people',
  'Romantic dinner for two',
  'Kid-friendly meals',
  'High-protein post-workout meal',
];

export default function AiSuggestClient() {
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const initialIngredients = searchParams.get('ingredients')?.split(',').filter(Boolean) || [];

  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [inputVal, setInputVal] = useState('');
  const [context, setContext] = useState('');
  const [dietType, setDietType] = useState('Any');
  const [cuisine, setCuisine] = useState('Any');
  const [maxTime, setMaxTime] = useState('');
  const [difficulty, setDifficulty] = useState('Any');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  const addIngredient = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(p => [...p, trimmed]);
    }
    setInputVal('');
  };

  const handleSuggest = async () => {
    if (!ingredients.length && !context) {
      toast.error('Add ingredients or describe what you want to cook');
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/suggest`, {
        ingredients,
        context,
        dietType: dietType === 'Any' ? '' : dietType,
        cuisine: cuisine === 'Any' ? '' : cuisine,
        maxTime: maxTime ? parseInt(maxTime) : undefined,
        difficulty: difficulty === 'Any' ? '' : difficulty,
      });
      setSuggestions(res.data.suggestions || []);
      if (!res.data.suggestions?.length) toast('No suggestions found, try different inputs', { icon: '🤔' });
    } catch {
      toast.error('AI service unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: any, idx: number) => {
    if (!token) { toast.error('Please log in to save recipes'); return; }
    setSaving(idx);
    try {
      // Step 1 — Create the recipe in DB
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/generate-full-recipe`,
        { recipeData: recipe },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedRecipe = res.data.recipe;

      // Step 2 — Also add it to user's savedRecipes list
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes/${savedRecipe._id}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`"${recipe.title}" saved to your recipes!`);
    } catch {
      toast.error('Failed to save recipe');
    } finally {
      setSaving(null);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-purple-50/30 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full px-4 py-2 text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            Powered by Google Gemini
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white mb-3">
            AI Recipe Suggestions
          </h1>
          <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto">
            Tell the AI what you have, what you want, and your preferences. It'll generate personalised recipes just for you.
          </p>
        </motion.div>

        {/* Input panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 sm:p-8 mb-8"
        >
          {/* Ingredients */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
              Your Ingredients
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 min-h-[52px]">
              <AnimatePresence>
                {ingredients.map(ing => (
                  <motion.span
                    key={ing}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-900/40 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300"
                  >
                    {ing}
                    <button onClick={() => setIngredients(p => p.filter(i => i !== ing))} aria-label={`Remove ${ing}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addIngredient(inputVal); } }}
                placeholder="Type ingredient + Enter..."
                className="flex-1 min-w-[160px] bg-transparent text-sm focus:outline-none text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
              />
            </div>
          </div>

          {/* Context */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
              What are you looking for? <span className="text-surface-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="E.g. 'Quick dinner for two', 'Using up leftover rice', 'Something spicy for a party'..."
              rows={2}
              className="input resize-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {CONTEXT_IDEAS.map(idea => (
                <button
                  key={idea}
                  onClick={() => setContext(idea)}
                  className="tag hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-400 transition-colors text-xs"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Filters grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Diet Type</label>
              <select value={dietType} onChange={e => setDietType(e.target.value)} className="input py-2 text-sm">
                {DIET_TYPES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Cuisine</label>
              <select value={cuisine} onChange={e => setCuisine(e.target.value)} className="input py-2 text-sm">
                {CUISINES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Max Time (mins)</label>
              <input
                type="number"
                value={maxTime}
                onChange={e => setMaxTime(e.target.value)}
                placeholder="e.g. 30"
                className="input py-2 text-sm"
                min="5"
                max="300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input py-2 text-sm">
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleSuggest}
            disabled={loading}
            className="btn-primary w-full sm:w-auto text-base py-3 px-8"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating recipes...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate AI Recipes
              </>
            )}
          </button>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 space-y-3">
                <div className="skeleton h-6 w-1/2 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="flex gap-3">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {!loading && suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                {suggestions.length} AI-Generated Recipes
              </h2>
              {suggestions.map((recipe, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={cn(
                            'text-xs font-bold px-2.5 py-1 rounded-full',
                            recipe.dietType === 'veg' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              recipe.dietType === 'vegan' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          )}>
                            {recipe.dietType === 'veg' || recipe.dietType === 'vegan' ? <Leaf className="h-3 w-3 inline mr-1" /> : null}
                            {recipe.dietType}
                          </span>
                          <span className="tag">{recipe.cuisine}</span>
                          <span className="tag">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {recipe.cookingTime?.total} min
                          </span>
                          <span className="tag">
                            <ChefHat className="h-3 w-3 inline mr-1" />
                            {recipe.difficulty}
                          </span>
                          {recipe.nutrition?.calories && (
                            <span className="tag text-brand-600 dark:text-brand-400">
                              🔥 {recipe.nutrition.calories} kcal
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400">
                            <Sparkles className="h-3 w-3" /> AI
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-1">{recipe.title}</h3>
                        <p className="text-sm text-surface-500 dark:text-surface-400">{recipe.description}</p>
                      </div>
                      <button className="flex-shrink-0 h-8 w-8 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-500 transition-transform" style={{ transform: expandedIdx === idx ? 'rotate(90deg)' : 'none' }}>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedIdx === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-surface-100 dark:border-surface-700 pt-4">
                          <div className="grid sm:grid-cols-2 gap-6">
                            {/* Ingredients */}
                            <div>
                              <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300 mb-3">Ingredients</h4>
                              <ul className="space-y-2">
                                {recipe.ingredients?.map((ing: any, i: number) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                                    <span className="font-medium text-surface-800 dark:text-surface-200">{ing.name}</span>
                                    <span className="text-surface-400">{ing.amount} {ing.unit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Steps */}
                            <div>
                              <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300 mb-3">Instructions</h4>
                              <ol className="space-y-2">
                                {recipe.steps?.map((step: any) => (
                                  <li key={step.stepNumber} className="flex gap-3 text-sm text-surface-600 dark:text-surface-400">
                                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center">
                                      {step.stepNumber}
                                    </span>
                                    {step.instruction}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-700">
                            <button
                              onClick={() => handleSaveRecipe(recipe, idx)}
                              disabled={saving === idx}
                              className="btn-primary"
                            >
                              {saving === idx ? (
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Save Recipe
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
