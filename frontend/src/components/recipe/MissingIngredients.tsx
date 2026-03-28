'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, X, Plus } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default function MissingIngredients({ recipeId, ingredients }: { recipeId: string; ingredients: any[] }) {
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addIngredient = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !userIngredients.includes(trimmed)) {
      setUserIngredients(p => [...p, trimmed]);
    }
    setInputVal('');
  };

  const check = async () => {
    if (!userIngredients.length) return;
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/missing-ingredients`, {
        recipeId,
        userIngredients,
      });
      setResult(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        Missing Ingredient Check
      </h2>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-5">
        Enter ingredients you have at home. We'll show what's missing for this recipe.
      </p>

      {/* Input */}
      <div className="flex flex-wrap gap-2 p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 min-h-[52px] mb-4">
        <AnimatePresence>
          {userIngredients.map(ing => (
            <motion.span
              key={ing}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400"
            >
              {ing}
              <button onClick={() => setUserIngredients(p => p.filter(i => i !== ing))} aria-label={`Remove ${ing}`}>
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
          className="flex-1 min-w-[140px] bg-transparent text-sm focus:outline-none text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
        />
      </div>

      {/* Quick fill from recipe */}
      <div className="mb-4">
        <p className="text-xs text-surface-400 mb-2">Quick add from recipe:</p>
        <div className="flex flex-wrap gap-1.5">
          {ingredients.map((ing: any) => (
            <button
              key={ing.name}
              onClick={() => addIngredient(ing.name)}
              disabled={userIngredients.includes(ing.name.toLowerCase())}
              className="tag text-xs hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed capitalize"
            >
              <Plus className="h-3 w-3 inline" />
              {ing.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={check}
        disabled={loading || !userIngredients.length}
        className="btn-primary mb-6"
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        Check Missing Ingredients
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Completeness bar */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Recipe Completeness
                </span>
                <span className={cn(
                  'text-sm font-bold',
                  result.completeness >= 80 ? 'text-green-600 dark:text-green-400' :
                  result.completeness >= 50 ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
                )}>
                  {result.completeness}%
                </span>
              </div>
              <div className="h-3 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.completeness}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    result.completeness >= 80 ? 'bg-green-500' :
                    result.completeness >= 50 ? 'bg-amber-500' :
                    'bg-red-500'
                  )}
                />
              </div>
              <p className="text-xs text-surface-500 mt-1.5">
                {result.canMake
                  ? '✅ You have all required ingredients! You can make this recipe.'
                  : `❌ Missing ${result.missing.length} required ingredient${result.missing.length > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Missing */}
            {result.missing.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  Missing ({result.missing.length})
                </h4>
                <ul className="space-y-1.5">
                  {result.missing.map((ing: any) => (
                    <li key={ing.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium text-surface-800 dark:text-surface-200">{ing.name}</span>
                      <span className="text-surface-500 ml-auto">{ing.amount} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available */}
            {result.available.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Available ({result.available.length})
                </h4>
                <ul className="space-y-1.5">
                  {result.available.map((ing: any) => (
                    <li key={ing.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium text-surface-700 dark:text-surface-300 line-through opacity-70">{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
