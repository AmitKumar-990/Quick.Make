'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Heart, Clock, Edit2, Save, ChefHat } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import RecipeCard from '@/components/recipe/RecipeCard';
import { formatDistanceToNow } from 'date-fns';

export default function ProfileClient() {
  const router = useRouter();
  const { user, token, updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'history'>('recipes');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  const { data: myRecipes } = useQuery({
    queryKey: ['my-recipes', user?._id],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?._id}/recipes`);
      return res.data;
    },
    enabled: !!user?._id,
  });

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token && activeTab === 'history',
  });

  const onSave = async (data: any) => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-surface-300" />
          <h2 className="text-xl font-semibold mb-4 text-surface-700 dark:text-surface-300">Please log in to view your profile</h2>
          <Link href="/auth/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'recipes', label: 'My Recipes', icon: ChefHat, count: myRecipes?.recipes?.length },
    { id: 'history', label: 'History', icon: Clock, count: history?.history?.length },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <User className="h-10 w-10 text-brand-500" />
              )}
            </div>

            <div className="flex-1">
              {editMode ? (
                <form onSubmit={handleSubmit(onSave)} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Name</label>
                    <input className="input text-sm" {...register('name', { required: true, maxLength: 50 })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Bio</label>
                    <textarea className="input text-sm resize-none" rows={2} placeholder="Tell us about yourself..." {...register('bio', { maxLength: 200 })} />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="btn-ghost text-sm">Cancel</button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">{user.name}</h1>
                    {user.role === 'admin' && (
                      <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-surface-500 mb-2">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                  {user.bio && <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">{user.bio}</p>}
                  <div className="flex gap-6 text-sm text-surface-500">
                    <Link href="/saved" className="flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      <Heart className="h-4 w-4" />
                      {user.savedRecipes?.length || 0} saved
                    </Link>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      {myRecipes?.recipes?.length || 0} recipes
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!editMode && (
              <button onClick={() => setEditMode(true)} className="btn-secondary text-sm">
                <Edit2 className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-xs font-bold text-surface-400">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'recipes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-surface-500 text-sm">{myRecipes?.recipes?.length || 0} recipes uploaded</p>
              <Link href="/upload-recipe" className="btn-primary text-sm">
                <ChefHat className="h-4 w-4" /> Upload New Recipe
              </Link>
            </div>
            {!myRecipes?.recipes?.length ? (
              <div className="text-center py-16 card">
                <ChefHat className="h-12 w-12 mx-auto mb-3 text-surface-300" />
                <h3 className="font-semibold text-surface-600 dark:text-surface-400 mb-2">No recipes yet</h3>
                <p className="text-surface-400 text-sm mb-4">Share your first recipe with the community</p>
                <Link href="/upload-recipe" className="btn-primary text-sm">Upload Recipe</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myRecipes.recipes.map((recipe: any, i: number) => (
                  <RecipeCard key={recipe._id} recipe={recipe} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {!history?.history?.length ? (
              <div className="text-center py-16 card">
                <Clock className="h-12 w-12 mx-auto mb-3 text-surface-300" />
                <h3 className="font-semibold text-surface-600 dark:text-surface-400 mb-2">No browsing history</h3>
                <p className="text-surface-400 text-sm">Recipes you view will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.history.slice(0, 20).map((item: any, i: number) => (
                  item.recipe && (
                    <Link
                      key={i}
                      href={`/recipes/${item.recipe.slug}`}
                      className="card p-4 flex items-center gap-4 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                    >
                      <div className="h-12 w-12 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-2xl flex-shrink-0">
                        🍽️
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-surface-800 dark:text-surface-200 truncate">{item.recipe.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.recipe.cookingTime?.total}min</span>
                          <span>{item.recipe.difficulty}</span>
                        </div>
                      </div>
                      <span className="text-xs text-surface-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(item.viewedAt), { addSuffix: true })}
                      </span>
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
