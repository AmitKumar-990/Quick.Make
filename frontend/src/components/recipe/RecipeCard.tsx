'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChefHat, Heart, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: { url: string; alt: string };
  cookingTime: { total: number };
  difficulty: string;
  cuisine: string;
  dietType: string;
  averageRating: number;
  totalRatings: number;
  servings: number;
  author: { name: string; avatar?: string };
  nutrition?: { calories: number };
  matchScore?: number;
  missingIngredients?: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
  showMissing?: boolean;
}

const DIET_BADGE: Record<string, { label: string; className: string; dot: string }> = {
  veg: { label: 'Veg', className: 'badge-veg', dot: 'bg-green-500' },
  'non-veg': { label: 'Non-Veg', className: 'badge-non-veg', dot: 'bg-red-500' },
  vegan: { label: 'Vegan', className: 'badge-vegan', dot: 'bg-emerald-500' },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'text-green-600 dark:text-green-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  Hard: 'text-red-600 dark:text-red-400',
};

export default function RecipeCard({ recipe, index = 0, showMissing = false }: RecipeCardProps) {
  const { user, token } = useAuthStore();
  const [isSaved, setIsSaved] = useState(
    user?.savedRecipes?.includes(recipe._id) ?? false
  );
  const [saving, setSaving] = useState(false);

  const diet = DIET_BADGE[recipe.dietType] || DIET_BADGE.veg;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) { toast.error('Please log in to save recipes'); return; }
    setSaving(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes/${recipe._id}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(res.data.saved);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="card group overflow-hidden"
      itemScope
      itemType="https://schema.org/Recipe"
    >
      <Link href={`/recipes/${recipe.slug}`} className="block">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-surface-100 dark:bg-surface-700">
          {recipe.image?.url ? (
            <Image
              src={recipe.image.url}
              alt={recipe.image.alt || recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              itemProp="image"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-5xl">🍽️</div>
          )}

          {/* Diet badge */}
          <div className="absolute top-3 left-3">
            <span className={cn(diet.className, 'text-xs font-bold px-2 py-1')}>
              <span className={cn('inline-block w-2 h-2 rounded-full mr-1', diet.dot)} />
              {diet.label}
            </span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-surface-800/90 flex items-center justify-center shadow transition-all hover:scale-110 active:scale-95"
            aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
          >
            <Heart
              className={cn('h-4 w-4 transition-colors', isSaved ? 'fill-red-500 text-red-500' : 'text-surface-400')}
            />
          </button>

          {/* Match score badge */}
          {recipe.matchScore !== undefined && (
            <div className="absolute bottom-3 left-3 bg-brand-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
              {recipe.matchScore} match
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="font-semibold text-base text-surface-900 dark:text-surface-100 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
              itemProp="name"
            >
              {recipe.title}
            </h3>
          </div>

          <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-3" itemProp="description">
            {recipe.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400 mb-3">
            <span className="flex items-center gap-1" itemProp="totalTime" content={`PT${recipe.cookingTime?.total}M`}>
              <Clock className="h-3.5 w-3.5" />
              {recipe.cookingTime?.total} min
            </span>
            <span className={cn('flex items-center gap-1 font-medium', DIFFICULTY_COLOR[recipe.difficulty])}>
              <ChefHat className="h-3.5 w-3.5" />
              {recipe.difficulty}
            </span>
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {recipe.servings}
              </span>
            )}
            {recipe.nutrition?.calories && (
              <span className="ml-auto font-medium text-brand-600 dark:text-brand-400">
                {recipe.nutrition.calories} kcal
              </span>
            )}
          </div>

          {/* Rating & cuisine */}
          <div className="flex items-center justify-between">
            {recipe.averageRating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                  {recipe.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-surface-400">({recipe.totalRatings})</span>
              </div>
            ) : (
              <span className="text-xs text-surface-400">No reviews yet</span>
            )}
            <span className="tag">{recipe.cuisine}</span>
          </div>

          {/* Missing ingredients */}
          {showMissing && recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                Missing: {recipe.missingIngredients.slice(0, 3).join(', ')}
                {recipe.missingIngredients.length > 3 && ` +${recipe.missingIngredients.length - 3} more`}
              </p>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
