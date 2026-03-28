'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import RecipeCard from '@/components/recipe/RecipeCard';
import { motion } from 'framer-motion';

export default function SavedRecipesClient() {
  const { token } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-recipes'],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/saved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    enabled: !!token,
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-surface-300" />
          <h2 className="text-xl font-semibold mb-4 text-surface-700 dark:text-surface-300">Login to see saved recipes</h2>
          <Link href="/auth/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const recipes = data?.recipes || [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Saved Recipes
          </h1>
          <p className="text-surface-500 mt-1">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-48" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Heart className="h-20 w-20 mx-auto mb-6 text-surface-200 dark:text-surface-700" />
            <h3 className="text-xl font-semibold text-surface-600 dark:text-surface-400 mb-3">No saved recipes yet</h3>
            <p className="text-surface-400 mb-6">Browse recipes and tap the heart icon to save them here</p>
            <Link href="/recipes" className="btn-primary">Explore Recipes</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe: any, i: number) => (
              <RecipeCard key={recipe._id} recipe={recipe} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
