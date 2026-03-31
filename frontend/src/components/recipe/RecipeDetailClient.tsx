'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChefHat, Users, Star, Heart, ShoppingCart, AlertCircle, CheckCircle2, Printer, Share2, Flame, Leaf } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import ReviewSection from './ReviewSection';
import GroceryList from './GroceryList';
import MissingIngredients from './MissingIngredients';

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  Medium: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  Hard: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
};

export default function RecipeDetailClient({ recipe }: { recipe: any }) {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps' | 'grocery' | 'missing'>('ingredients');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [servings, setServings] = useState(recipe.servings || 4);
  const [isSaved, setIsSaved] = useState(user?.savedRecipes?.includes(recipe._id) ?? false);

  const multiplier = servings / (recipe.servings || 4);

  const handleSave = async () => {
    if (!token) { toast.error('Please log in to save recipes'); return; }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes/${recipe._id}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(res.data.saved);
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: recipe.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const toggleStep = (n: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  const TABS = [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'steps', label: 'Steps' },
    { id: 'grocery', label: '🛒 Grocery List' },
    { id: 'missing', label: '🔍 Missing Check' },
  ];

  return (
    <article className="min-h-screen" itemScope itemType="https://schema.org/Recipe">
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 lg:h-[480px] bg-surface-100 dark:bg-surface-800">
        {recipe.image?.url ? (
          <Image
            src={recipe.image.url}
            alt={recipe.image.alt || recipe.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            itemProp="image"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-8xl">🍽️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={handleSave} className="h-10 w-10 rounded-full glass flex items-center justify-center shadow" aria-label="Save recipe">
            <Heart className={cn('h-5 w-5 transition-colors', isSaved ? 'fill-red-500 text-red-500' : 'text-white')} />
          </button>
          <button onClick={handleShare} className="h-10 w-10 rounded-full glass flex items-center justify-center shadow" aria-label="Share recipe">
            <Share2 className="h-5 w-5 text-white" />
          </button>
          <button onClick={() => window.print()} className="h-10 w-10 rounded-full glass flex items-center justify-center shadow" aria-label="Print recipe">
            <Printer className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-16 relative">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 sm:p-8 mb-8"
        >
          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={cn('px-3 py-1 rounded-full text-xs font-bold', DIFFICULTY_COLOR[recipe.difficulty])}>
              {recipe.difficulty}
            </span>
            <span className="tag">{recipe.cuisine}</span>
            <span className={cn('tag', recipe.dietType === 'veg' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
              {recipe.dietType === 'veg' ? <Leaf className="h-3 w-3 inline mr-1" /> : null}
              {recipe.dietType}
            </span>
            {recipe.tags?.slice(0, 4).map((tag: string) => (
              <Link key={tag} href={`/recipes?tags=${tag}`} className="tag hover:bg-brand-100 dark:hover:bg-brand-900/30 capitalize transition-colors">
                #{tag}
              </Link>
            ))}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-3" itemProp="name">
            {recipe.title}
          </h1>

          <p className="text-surface-500 dark:text-surface-400 mb-6 leading-relaxed" itemProp="description">
            {recipe.description}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-50 dark:bg-surface-900 rounded-xl mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-surface-900 dark:text-white" itemProp="totalTime" content={`PT${recipe.cookingTime.total}M`}>
                {recipe.cookingTime.total} min
              </div>
              <div className="text-xs text-surface-500">Total Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
                <ChefHat className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-surface-900 dark:text-white">{recipe.difficulty}</div>
              <div className="text-xs text-surface-500">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
                <Users className="h-4 w-4" />
              </div>
              {/* Servings adjuster */}
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setServings((s: number) => Math.max(1, s - 1))} className="h-6 w-6 rounded-full bg-surface-200 dark:bg-surface-700 text-sm font-bold hover:bg-brand-100 transition-colors">-</button>
                <span className="text-lg font-bold text-surface-900 dark:text-white" itemProp="recipeYield">{servings}</span>
                <button onClick={() => setServings((s: number) => s + 1)} className="h-6 w-6 rounded-full bg-surface-200 dark:bg-surface-700 text-sm font-bold hover:bg-brand-100 transition-colors">+</button>
              </div>
              <div className="text-xs text-surface-500">Servings</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
                <Flame className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-surface-900 dark:text-white">
                {recipe.nutrition?.calories ? Math.round(recipe.nutrition.calories * multiplier / servings) : '—'}
              </div>
              <div className="text-xs text-surface-500">Calories/serving</div>
            </div>
          </div>

          {/* Rating */}
          {recipe.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={cn('h-4 w-4', n <= Math.round(recipe.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-surface-300')} />
                ))}
              </div>
              <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{recipe.averageRating.toFixed(1)}</span>
              <span className="text-sm text-surface-500">({recipe.totalRatings} reviews)</span>
              <meta itemProp="ratingValue" content={recipe.averageRating.toString()} />
              <meta itemProp="reviewCount" content={recipe.totalRatings.toString()} />
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex-1 min-w-max rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mb-12">
          {activeTab === 'ingredients' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Ingredients <span className="text-sm font-normal text-surface-500">for {servings} servings</span>
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing: any, i: number) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                    <div className={cn('h-2 w-2 rounded-full flex-shrink-0', ing.optional ? 'bg-surface-300' : 'bg-brand-500')} />
                    <span className="font-medium text-surface-900 dark:text-surface-100 flex-1">
                      {ing.name}
                    </span>
                    <span className="text-sm text-surface-500 dark:text-surface-400">
                      {ing.amount ? `${parseFloat(ing.amount) * multiplier || ing.amount} ${ing.unit}`.trim() : ing.unit}
                      {ing.optional && <span className="ml-1 text-xs text-surface-400">(optional)</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                <button
                  onClick={() => setActiveTab('grocery')}
                  className="btn-secondary w-full sm:w-auto"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Generate Grocery List
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'steps' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Step-by-Step Instructions
              </h2>
              {recipe.steps.map((step: any) => (
                <div
                  key={step.stepNumber}
                  onClick={() => toggleStep(step.stepNumber)}
                  className={cn(
                    'card p-5 cursor-pointer transition-all',
                    completedSteps.has(step.stepNumber) && 'opacity-60 bg-surface-50 dark:bg-surface-900'
                  )}
                  itemProp="recipeInstructions"
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                      completedSteps.has(step.stepNumber)
                        ? 'bg-green-500 text-white'
                        : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    )}>
                      {completedSteps.has(step.stepNumber) ? <CheckCircle2 className="h-4 w-4" /> : step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        'text-surface-700 dark:text-surface-300 leading-relaxed',
                        completedSteps.has(step.stepNumber) && 'line-through text-surface-400'
                      )}>
                        {step.instruction}
                      </p>
                      {step.duration > 0 && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-brand-600 dark:text-brand-400 font-medium">
                          <Clock className="h-3 w-3" /> {step.duration} min
                        </span>
                      )}
                      {step.tip && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                          💡 Tip: {step.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'grocery' && (
            <GroceryList slug={recipe.slug} servings={servings} recipeName={recipe.title} />
          )}

          {activeTab === 'missing' && (
            <MissingIngredients recipeId={recipe._id} ingredients={recipe.ingredients} />
          )}
        </div>

        {/* Nutrition */}
        {recipe.nutrition && (
          <div className="card p-6 mb-8" itemProp="nutrition" itemScope itemType="https://schema.org/NutritionInformation">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">Nutrition Info</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Calories', value: recipe.nutrition.calories, unit: 'kcal', prop: 'calories' },
                { label: 'Protein', value: recipe.nutrition.protein, unit: 'g', prop: 'proteinContent' },
                { label: 'Carbs', value: recipe.nutrition.carbs, unit: 'g', prop: 'carbohydrateContent' },
                { label: 'Fat', value: recipe.nutrition.fat, unit: 'g', prop: 'fatContent' },
                { label: 'Fiber', value: recipe.nutrition.fiber, unit: 'g', prop: 'fiberContent' },
              ].map(n => (
                <div key={n.label} className="text-center p-3 bg-surface-50 dark:bg-surface-900 rounded-xl">
                  <div className="text-xl font-bold text-surface-900 dark:text-white" itemProp={n.prop}>
                    {n.value || '—'}{n.value ? n.unit : ''}
                  </div>
                  <div className="text-xs text-surface-500">{n.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection recipeId={recipe._id} />
      </div>
    </article>
  );
}
