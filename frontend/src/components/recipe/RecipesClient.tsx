'use client';
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import RecipeCard from './RecipeCard';
import { cn } from '@/lib/utils';

const CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Thai', 'Japanese', 'Mediterranean', 'American', 'French'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: '-views', label: 'Most Viewed' },
  { value: 'cookingTime.total', label: 'Quickest' },
];

interface Props {
  initialRecipes: any[];
  initialTotal: number;
  searchParams: Record<string, string>;
}

export default function RecipesClient({ initialRecipes, initialTotal, searchParams: sp }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(sp.q || '');
  const [dietType, setDietType] = useState(sp.dietType || '');
  const [cuisine, setCuisine] = useState(sp.cuisine || '');
  const [difficulty, setDifficulty] = useState(sp.difficulty || '');
  const [maxTime, setMaxTime] = useState(sp.maxTime || '');
  const [sort, setSort] = useState(sp.sort || '-createdAt');
  const ingredients = sp.ingredients?.split(',').filter(Boolean) || [];

  const updateURL = useCallback((params: Record<string, string>) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    router.push(`${pathname}?${qs.toString()}`, { scroll: false });
  }, [pathname, router]);

  const fetchRecipes = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recipes`, {
      params: {
        q: search || undefined,
        dietType: dietType || undefined,
        cuisine: cuisine || undefined,
        difficulty: difficulty || undefined,
        maxTime: maxTime || undefined,
        sort,
        page: pageParam,
        limit: 12,
        tags: sp.tags || undefined,
        ingredients: ingredients.length ? ingredients.join(',') : undefined,
      },
    });
    return res.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['recipes', search, dietType, cuisine, difficulty, maxTime, sort, sp.ingredients],
    queryFn: fetchRecipes,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialData: initialRecipes.length ? {
      pages: [{ recipes: initialRecipes, pagination: { total: initialTotal, page: 1, pages: Math.ceil(initialTotal / 12), limit: 12 } }],
      pageParams: [1],
    } : undefined,
  });

  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => { if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
  });

  const allRecipes = data?.pages.flatMap(p => p.recipes) || [];
  const total = data?.pages[0]?.pagination?.total || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ q: search, dietType, cuisine, difficulty, maxTime, sort });
    refetch();
  };

  const clearFilter = (key: string) => {
    const setters: Record<string, any> = { dietType: setDietType, cuisine: setCuisine, difficulty: setDifficulty, maxTime: setMaxTime };
    setters[key]?.('');
    refetch();
  };

  const activeFilters = [
    dietType && { key: 'dietType', label: dietType },
    cuisine && { key: 'cuisine', label: cuisine },
    difficulty && { key: 'difficulty', label: difficulty },
    maxTime && { key: 'maxTime', label: `≤${maxTime}min` },
    ...ingredients.map(ing => ({ key: 'ingredient', label: ing })),
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">
            {sp.q ? `Recipes for "${sp.q}"` : ingredients.length ? 'Matching Recipes' : 'All Recipes'}
          </h1>
          <p className="text-surface-500">
            {total > 0 ? `${total} recipes found` : 'Browse our collection'}
          </p>
        </div>

        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search recipes..."
                className="input pl-9"
                aria-label="Search recipes"
              />
            </div>
            <button type="submit" className="btn-primary px-4">Search</button>
          </form>

          <div className="flex gap-2">
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); refetch(); }}
              className="input w-40 text-sm"
              aria-label="Sort recipes"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn('btn-secondary gap-2', showFilters && 'border-brand-400 text-brand-600 dark:text-brand-400')}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="h-5 w-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Diet Type</label>
              <select value={dietType} onChange={e => setDietType(e.target.value)} className="input py-2 text-sm">
                <option value="">All</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Cuisine</label>
              <select value={cuisine} onChange={e => setCuisine(e.target.value)} className="input py-2 text-sm">
                <option value="">All Cuisines</option>
                {CUISINES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input py-2 text-sm">
                <option value="">Any</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
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
            <div className="col-span-2 sm:col-span-4 flex gap-2">
              <button onClick={() => { refetch(); setShowFilters(false); }} className="btn-primary text-sm">Apply</button>
              <button onClick={() => { setDietType(''); setCuisine(''); setDifficulty(''); setMaxTime(''); refetch(); }} className="btn-ghost text-sm">Reset</button>
            </div>
          </motion.div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map(f => (
              <span key={`${f.key}-${f.label}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-400">
                {f.label}
                {f.key !== 'ingredient' && (
                  <button onClick={() => clearFilter(f.key)} aria-label={`Remove ${f.label} filter`}>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Recipe grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-48" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : allRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allRecipes.map((recipe, i) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                index={i % 12}
                showMissing={ingredients.length > 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">No recipes found</h3>
            <p className="text-surface-500 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={() => { setSearch(''); setDietType(''); setCuisine(''); setDifficulty(''); setMaxTime(''); refetch(); }} className="btn-primary">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-surface-500">
              <span className="h-5 w-5 rounded-full border-2 border-surface-300 border-t-brand-500 animate-spin" />
              Loading more...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
