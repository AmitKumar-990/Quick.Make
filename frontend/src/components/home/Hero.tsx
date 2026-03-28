'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, ChevronRight, Clock, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const POPULAR_INGREDIENTS = [
  'chicken', 'paneer', 'tomato', 'onion', 'garlic', 'potato',
  'rice', 'eggs', 'spinach', 'mushroom', 'pasta', 'lentils',
];

const HERO_STATS = [
  { label: 'Recipes', value: '5,000+' },
  { label: 'Cuisines', value: '20+' },
  { label: 'Users', value: '50K+' },
];

export default function Hero() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autocomplete
  const { data: autocomplete } = useQuery({
    queryKey: ['autocomplete', inputValue],
    queryFn: async () => {
      if (inputValue.length < 2) return { suggestions: [] };
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recipes/autocomplete?q=${inputValue}`);
      return res.data;
    },
    enabled: inputValue.length >= 2,
    staleTime: 60000,
  });

  const suggestions = autocomplete?.suggestions || [];

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeIngredient = (ing: string) => {
    setIngredients(prev => prev.filter(i => i !== ing));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && ingredients.length > 0) {
      setIngredients(prev => prev.slice(0, -1));
    }
  };

  const handleSearch = () => {
    if (inputValue.trim()) addIngredient(inputValue);
    const allIngredients = inputValue.trim()
      ? [...ingredients, inputValue.trim()]
      : ingredients;
    if (allIngredients.length > 0) {
      router.push(`/recipes?ingredients=${allIngredients.join(',')}`);
    } else {
      router.push('/recipes');
    }
  };

  const handleAiSuggest = () => {
    const allIngredients = inputValue.trim()
      ? [...ingredients, inputValue.trim()]
      : ingredients;
    router.push(`/ai-suggest?ingredients=${allIngredients.join(',')}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-200/30 dark:bg-brand-800/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-200/30 dark:bg-amber-800/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-100 dark:bg-brand-900/30 px-4 py-2 text-sm font-semibold text-brand-700 dark:text-brand-400 mb-6"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Recipe Discovery · Gemini
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-surface-900 dark:text-white leading-tight mb-6">
              Cook something{' '}
              <span className="text-brand-500 relative">
                amazing
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8 C75 4, 225 10, 298 5" stroke="#f97316" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>{' '}
              with what you have.
            </h1>

            <p className="text-lg text-surface-500 dark:text-surface-400 mb-8 leading-relaxed max-w-lg">
              Tell us the ingredients in your kitchen. Quick Make suggests personalised recipes, generates grocery lists, and plans your meals — powered by AI.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-10">
              {HERO_STATS.map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-surface-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Ingredient Input */}
            <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 p-3">
              <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
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
                      <button
                        onClick={() => removeIngredient(ing)}
                        className="hover:text-brand-900 dark:hover:text-brand-100 transition-colors"
                        aria-label={`Remove ${ing}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => { setInputValue(e.target.value); setShowSuggestions(true); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder={ingredients.length === 0 ? 'Type ingredients (e.g. chicken, onion, garlic)...' : 'Add more...'}
                    className="w-full min-w-[180px] bg-transparent text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none"
                    aria-label="Enter ingredients"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                  />

                  {/* Autocomplete dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 z-50 mt-2 w-64 rounded-xl bg-white dark:bg-surface-800 shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden"
                        role="listbox"
                      >
                        {suggestions.slice(0, 6).map((s: string) => (
                          <li key={s}>
                            <button
                              onMouseDown={() => addIngredient(s)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 text-surface-700 dark:text-surface-300 capitalize transition-colors"
                              role="option"
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-surface-100 dark:border-surface-700">
                <button
                  onClick={handleSearch}
                  className="btn-primary flex-1"
                  aria-label="Search recipes by ingredients"
                >
                  <Search className="h-4 w-4" />
                  Find Recipes
                </button>
                <button
                  onClick={handleAiSuggest}
                  className="btn-secondary flex-shrink-0"
                  aria-label="Get AI recipe suggestions"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Suggest
                </button>
              </div>
            </div>

            {/* Popular ingredients */}
            <div className="mt-4">
              <p className="text-xs text-surface-400 mb-2">Popular:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_INGREDIENTS.map(ing => (
                  <button
                    key={ing}
                    onClick={() => addIngredient(ing)}
                    disabled={ingredients.includes(ing)}
                    className="tag hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-400 transition-colors capitalize disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right column — floating recipe cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block relative h-[520px]"
            aria-hidden="true"
          >
            {/* Floating card 1 */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-0 w-56 card p-4"
            >
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-800/40 dark:to-red-800/40 mb-3 flex items-center justify-center text-4xl">
                🍛
              </div>
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">Butter Chicken</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-surface-500"><Clock className="h-3 w-3" />45 min</span>
                <span className="badge-non-veg">Non-veg</span>
              </div>
            </motion.div>

            {/* Floating card 2 */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-40 left-0 w-52 card p-4"
            >
              <div className="w-full h-28 rounded-xl bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-800/40 dark:to-emerald-800/40 mb-3 flex items-center justify-center text-4xl">
                🥗
              </div>
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">Paneer Tikka</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-surface-500"><Clock className="h-3 w-3" />30 min</span>
                <span className="badge-veg">Veg</span>
              </div>
            </motion.div>

            {/* AI Suggestion pill */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-20 right-10 flex items-center gap-3 bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-100 dark:border-surface-700 px-4 py-3"
            >
              <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-900 dark:text-surface-100">AI found 12 recipes</p>
                <p className="text-xs text-surface-500">from your ingredients</p>
              </div>
            </motion.div>

            {/* Calories badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute top-10 left-20 flex items-center gap-2 bg-white dark:bg-surface-800 rounded-full shadow-card border border-surface-100 dark:border-surface-700 px-3 py-2"
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-semibold text-surface-900 dark:text-surface-100">350 kcal</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
