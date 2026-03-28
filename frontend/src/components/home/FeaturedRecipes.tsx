'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import RecipeCard from '@/components/recipe/RecipeCard';

export default function FeaturedRecipes({ initialRecipes }: { initialRecipes: any[] }) {
  const { data } = useQuery({
    queryKey: ['featured-recipes'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recipes?sort=-averageRating&limit=6`);
      return res.data;
    },
    initialData: initialRecipes.length ? { recipes: initialRecipes } : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const recipes = data?.recipes || initialRecipes;

  return (
    <section className="py-16 bg-white dark:bg-surface-900" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 id="featured-heading" className="section-title">Featured Recipes</h2>
            <p className="section-subtitle mt-2">Highly-rated dishes loved by our community</p>
          </div>
          <Link href="/recipes?sort=-averageRating" className="btn-ghost hidden sm:flex">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.slice(0, 6).map((recipe: any, i: number) => (
            <RecipeCard key={recipe._id} recipe={recipe} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/recipes" className="btn-secondary">View all recipes <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
