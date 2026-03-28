'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Save, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { startOfWeek, addDays, format, addWeeks, subWeeks } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MealPlannerClient() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [plan, setPlan] = useState<Record<string, Record<string, string>>>({});
  const [aiLoading, setAiLoading] = useState(false);

  const weekStartStr = weekStart.toISOString();

  const { data: savedPlan, isLoading } = useQuery({
    queryKey: ['meal-plan', weekStartStr],
    queryFn: async () => {
      if (!token) return null;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/meal-plan?weekStart=${weekStartStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.plan;
    },
    enabled: !!token,
    onSuccess: (data: any) => {
      if (data) {
        const flatPlan: Record<string, Record<string, string>> = {};
        DAYS.forEach(day => {
          flatPlan[day] = {};
          MEALS.forEach(meal => {
            flatPlan[day][meal] = data.days?.[day]?.[meal]?.title || '';
          });
        });
        setPlan(flatPlan);
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meal-plan`,
        { weekStart: weekStartStr, days: plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success('Meal plan saved!');
      qc.invalidateQueries({ queryKey: ['meal-plan'] });
    },
    onError: () => toast.error('Failed to save meal plan'),
  });

  const handleAiGenerate = async () => {
    if (!token) { toast.error('Please log in first'); return; }
    setAiLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/meal-plan`,
        { preferences: { vegetarian: false, quickMeals: true } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const aiPlan = res.data.plan;
      const newPlan: Record<string, Record<string, string>> = {};
      DAYS.forEach(day => {
        newPlan[day] = {
          breakfast: aiPlan[day]?.breakfast || '',
          lunch: aiPlan[day]?.lunch || '',
          dinner: aiPlan[day]?.dinner || '',
        };
      });
      setPlan(newPlan);
      toast.success('AI meal plan generated! Save it when you\'re happy.');
    } catch {
      toast.error('AI service unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const updateCell = (day: string, meal: string, value: string) => {
    setPlan(p => ({ ...p, [day]: { ...p[day], [meal]: value } }));
  };

  const clearDay = (day: string) => {
    setPlan(p => ({ ...p, [day]: { breakfast: '', lunch: '', dinner: '' } }));
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-surface-300" />
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">Login to use Meal Planner</h2>
          <p className="text-surface-500 mb-6">Plan your weekly meals and stay organised.</p>
          <Link href="/auth/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
              <Calendar className="h-8 w-8 text-brand-500" />
              Meal Planner
            </h1>
            <p className="text-surface-500 mt-1">Plan your week, eat better every day</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="btn-secondary text-sm"
            >
              {aiLoading ? <span className="h-4 w-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI Generate
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="btn-primary text-sm"
            >
              <Save className="h-4 w-4" />
              Save Plan
            </button>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setWeekStart(d => subWeeks(d, 1))} className="btn-ghost h-9 w-9 p-0 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-surface-900 dark:text-surface-100">
              {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </p>
          </div>
          <button onClick={() => setWeekStart(d => addWeeks(d, 1))} className="btn-ghost h-9 w-9 p-0 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="tag text-xs ml-2 hover:bg-brand-100 cursor-pointer">
            This Week
          </button>
        </div>

        {/* Planner grid */}
        <div className="card overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-8 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
            <div className="p-3 text-xs font-bold text-surface-500 uppercase tracking-wider" />
            {DAYS.map((day, i) => (
              <div key={day} className="p-3 text-center">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">{DAY_LABELS[i]}</p>
                <p className="text-xs text-surface-400 mt-0.5">{format(addDays(weekStart, i), 'MMM d')}</p>
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEALS.map((meal, mi) => (
            <div
              key={meal}
              className={cn(
                'grid grid-cols-8',
                mi < MEALS.length - 1 && 'border-b border-surface-100 dark:border-surface-800'
              )}
            >
              {/* Meal label */}
              <div className="p-3 bg-surface-50 dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 flex items-center justify-center">
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider rotate-0 whitespace-nowrap">
                  {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </span>
              </div>

              {/* Day cells */}
              {DAYS.map(day => (
                <div key={`${day}-${meal}`} className="p-2 border-r border-surface-100 dark:border-surface-800 last:border-r-0 min-h-[80px]">
                  {isLoading ? (
                    <div className="skeleton h-12 rounded-lg" />
                  ) : plan[day]?.[meal] ? (
                    <div className="group relative bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-2 h-full">
                      <p className="text-xs font-medium text-brand-700 dark:text-brand-300 line-clamp-3">
                        {plan[day][meal]}
                      </p>
                      <button
                        onClick={() => updateCell(day, meal, '')}
                        className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 items-center justify-center hidden group-hover:flex"
                        aria-label="Remove meal"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <input
                        type="text"
                        value={plan[day]?.[meal] || ''}
                        onChange={e => updateCell(day, meal, e.target.value)}
                        placeholder="Add meal..."
                        className="w-full text-xs bg-transparent text-surface-500 dark:text-surface-400 placeholder:text-surface-300 dark:placeholder:text-surface-600 focus:outline-none text-center"
                        aria-label={`${meal} on ${day}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            💡 <strong>Tip:</strong> Click any cell to type a meal, or use "AI Generate" to auto-fill the whole week. Explore recipes on the{' '}
            <Link href="/recipes" className="underline">Recipes page</Link> to get ideas.
          </p>
        </div>
      </div>
    </div>
  );
}
