'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, ChefHat, Image as ImageIcon } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Thai', 'Japanese', 'Mediterranean', 'American', 'French', 'Other'];

type IngredientField = { name: string; amount: string; unit: string; optional: boolean };
type StepField = { instruction: string; duration: number; tip: string };

type FormData = {
  title: string;
  description: string;
  cuisine: string;
  dietType: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string;
  ingredients: IngredientField[];
  steps: StepField[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function UploadRecipeClient() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      ingredients: [{ name: '', amount: '', unit: '', optional: false }],
      steps: [{ instruction: '', duration: 0, tip: '' }],
      servings: 4,
      dietType: 'veg',
      difficulty: 'Easy',
      cuisine: 'Indian',
    },
  });

  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: 'ingredients' });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'steps' });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    if (!token) { toast.error('Please log in to upload recipes'); return; }
    try {
      const formData = new FormData();
      const recipeData = {
        title: data.title,
        description: data.description,
        cuisine: data.cuisine,
        dietType: data.dietType,
        difficulty: data.difficulty,
        cookingTime: { prep: Number(data.prepTime), cook: Number(data.cookTime) },
        servings: Number(data.servings),
        tags: data.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        ingredients: data.ingredients.filter(i => i.name),
        steps: data.steps.filter(s => s.instruction).map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
        nutrition: { calories: Number(data.calories), protein: Number(data.protein), carbs: Number(data.carbs), fat: Number(data.fat) },
      };
      formData.append('data', JSON.stringify(recipeData));
      if (imageFile) formData.append('image', imageFile);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Recipe uploaded successfully! 🎉');
      router.push(`/recipes/${res.data.recipe.slug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-16 w-16 mx-auto mb-4 text-surface-300" />
          <h2 className="text-xl font-semibold mb-4">Login to upload recipes</h2>
          <Link href="/auth/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Share Your Recipe</h1>
          <p className="text-surface-500 mb-8">Share your culinary creations with the Quick Make community</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            {/* Basic info */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white mb-5">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Recipe Title *</label>
                  <input className="input" placeholder="e.g. Grandma's Butter Chicken" {...register('title', { required: 'Title required', maxLength: { value: 100, message: 'Max 100 chars' } })} />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Description *</label>
                  <textarea className="input resize-none" rows={3} placeholder="Describe your recipe..." {...register('description', { required: 'Description required', maxLength: { value: 500, message: 'Max 500 chars' } })} />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Cuisine *</label>
                    <select className="input text-sm" {...register('cuisine', { required: true })}>
                      {CUISINES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Diet Type *</label>
                    <select className="input text-sm" {...register('dietType', { required: true })}>
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Difficulty *</label>
                    <select className="input text-sm" {...register('difficulty', { required: true })}>
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Prep Time (min)</label>
                    <input type="number" className="input text-sm" min="0" {...register('prepTime', { min: 0 })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Cook Time (min)</label>
                    <input type="number" className="input text-sm" min="0" {...register('cookTime', { min: 0 })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Servings</label>
                    <input type="number" className="input text-sm" min="1" {...register('servings', { min: 1 })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Tags <span className="text-surface-400 font-normal">(comma-separated)</span></label>
                  <input className="input" placeholder="quick, healthy, spicy, comfort-food" {...register('tags')} />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white mb-5">Recipe Image</h2>
              <label className={cn(
                'flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                imagePreview
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-surface-300 dark:border-surface-600 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10'
              )}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-surface-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Click to upload image</p>
                      <p className="text-xs text-surface-400">JPG, PNG, WebP up to 5MB</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
            </div>

            {/* Ingredients */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white mb-5">Ingredients</h2>
              <div className="space-y-3">
                {ingFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input className="input flex-1 text-sm" placeholder="Ingredient name" {...register(`ingredients.${idx}.name`, { required: idx === 0 })} />
                    <input className="input w-20 text-sm" placeholder="Amount" {...register(`ingredients.${idx}.amount`)} />
                    <input className="input w-20 text-sm" placeholder="Unit" {...register(`ingredients.${idx}.unit`)} />
                    <label className="flex items-center gap-1 text-xs text-surface-500 whitespace-nowrap">
                      <input type="checkbox" {...register(`ingredients.${idx}.optional`)} className="rounded" />
                      Opt.
                    </label>
                    <button type="button" onClick={() => removeIng(idx)} disabled={ingFields.length === 1} className="btn-ghost h-8 w-8 p-0 text-red-400 disabled:opacity-30" aria-label="Remove ingredient">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => appendIng({ name: '', amount: '', unit: '', optional: false })} className="btn-secondary text-sm w-full">
                  <Plus className="h-4 w-4" /> Add Ingredient
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white mb-5">Instructions</h2>
              <div className="space-y-4">
                {stepFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-bold flex items-center justify-center mt-3">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <textarea
                        className="input resize-none text-sm"
                        rows={2}
                        placeholder={`Step ${idx + 1} instructions...`}
                        {...register(`steps.${idx}.instruction`, { required: idx === 0 })}
                      />
                      <div className="flex gap-2">
                        <input className="input text-sm w-28" type="number" min="0" placeholder="Duration (min)" {...register(`steps.${idx}.duration`, { min: 0 })} />
                        <input className="input text-sm flex-1" placeholder="Optional tip for this step" {...register(`steps.${idx}.tip`)} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeStep(idx)} disabled={stepFields.length === 1} className="btn-ghost h-8 w-8 p-0 text-red-400 disabled:opacity-30 mt-3 flex-shrink-0" aria-label="Remove step">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => appendStep({ instruction: '', duration: 0, tip: '' })} className="btn-secondary text-sm w-full">
                  <Plus className="h-4 w-4" /> Add Step
                </button>
              </div>
            </div>

            {/* Nutrition (optional) */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white mb-2">Nutrition <span className="text-sm font-normal text-surface-400">(optional, per serving)</span></h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['calories', 'protein', 'carbs', 'fat'].map(n => (
                  <div key={n}>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5 capitalize">{n} {n === 'calories' ? '(kcal)' : '(g)'}</label>
                    <input type="number" min="0" className="input text-sm" placeholder="0" {...register(n as any, { min: 0 })} />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-base">
              {isSubmitting ? (
                <><span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Uploading...</>
              ) : (
                <><Upload className="h-5 w-5" />Upload Recipe</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
