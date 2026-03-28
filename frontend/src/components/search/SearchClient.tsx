'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import RecipeCard from '@/components/recipe/RecipeCard';

const TRENDING_SEARCHES = ['Butter Chicken', 'Pasta', 'Biryani', 'Tacos', 'Salad', 'Soup', 'Cake', 'Stir Fry'];

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('quickmake-recent-searches') || '[]');
    }
    return [];
  });

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { recipes: [] };
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recipes?q=${encodeURIComponent(debouncedQuery)}&limit=12`);
      return res.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      // Save to recent
      const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('quickmake-recent-searches', JSON.stringify(updated));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/recipes?q=${encodeURIComponent(query)}`);
  };

  const recipes = data?.recipes || [];
  const showResults = debouncedQuery.length >= 2;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl font-bold text-surface-900 dark:text-white mb-3">
            Find Your Perfect Recipe
          </h1>
          <p className="text-surface-500 mb-8">Search by recipe name, ingredient, or cuisine</p>

          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search recipes... (e.g. chicken curry, pasta, vegan)"
              className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-400/10 text-base transition-all shadow-card"
              aria-label="Search recipes"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center hover:bg-surface-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>
        </motion.div>

        {/* No query state — show trending & recent */}
        {!showResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 mb-3">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="tag hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => { setRecentSearches([]); localStorage.removeItem('quickmake-recent-searches'); }}
                    className="tag text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 mb-3">
                <TrendingUp className="h-4 w-4" />
                Trending Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="tag hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-400 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Search results */}
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="card overflow-hidden">
                      <div className="skeleton h-48" />
                      <div className="p-4 space-y-3">
                        <div className="skeleton h-5 w-3/4 rounded" />
                        <div className="skeleton h-4 w-full rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recipes.length > 0 ? (
                <>
                  <p className="text-sm text-surface-500 mb-4">{data?.pagination?.total || recipes.length} results for "<strong>{debouncedQuery}</strong>"</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe: any, i: number) => (
                      <RecipeCard key={recipe._id} recipe={recipe} index={i} />
                    ))}
                  </div>
                  {recipes.length > 0 && (
                    <div className="mt-8 text-center">
                      <Link href={`/recipes?q=${encodeURIComponent(debouncedQuery)}`} className="btn-secondary">
                        See all results
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-surface-600 dark:text-surface-400 mb-2">No recipes found</h3>
                  <p className="text-surface-400 mb-6">Try different keywords or browse by cuisine</p>
                  <Link href="/ai-suggest" className="btn-primary">Get AI Suggestions Instead</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
