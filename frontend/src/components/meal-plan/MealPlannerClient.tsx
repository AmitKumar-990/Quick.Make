'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { startOfWeek, addDays, format, addWeeks, subWeeks } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};

type PlanType = Record<string, Record<string, string>>;

const emptyPlan = (): PlanType =>
  Object.fromEntries(DAYS.map(d => [d, { breakfast: '', lunch: '', dinner: '' }]));

export default function MealPlannerClient() {
  const { token } = useAuthStore();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [plan, setPlan] = useState<PlanType>(emptyPlan());
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const weekStartStr = weekStart.toISOString();

  // Load saved plan whenever week changes
  useEffect(() => {
    if (!token) return;
    const fetchPlan = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/meal-plan?weekStart=${weekStartStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.plan?.days) {
          const loaded: PlanType = emptyPlan();
          DAYS.forEach(day => {
            MEALS.forEach(meal => {
              const val = res.data.plan.days[day]?.[meal];
              loaded[day][meal] = typeof val === 'string' ? val : val?.title || '';
            });
          });
          setPlan(loaded);
        } else {
          setPlan(emptyPlan());
        }
      } catch {
        setPlan(emptyPlan());
      }
    };
    fetchPlan();
  }, [weekStartStr, token]);

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
      const newPlan: PlanType = emptyPlan();
      DAYS.forEach(day => {
        newPlan[day] = {
          breakfast: aiPlan[day]?.breakfast || '',
          lunch: aiPlan[day]?.lunch || '',
          dinner: aiPlan[day]?.dinner || '',
        };
      });
      setPlan(newPlan);
      toast.success('AI meal plan generated! Click "Save Plan" to keep it.');
    } catch {
      toast.error('AI service unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) { toast.error('Please log in first'); return; }
    setSaveLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meal-plan`,
        { weekStart: weekStartStr, days: plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Meal plan saved! ✅');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save meal plan');
    } finally {
      setSaveLoading(false);
    }
  };

  // Fix: direct immutable state update — no closure issues
  const updateCell = (day: string, meal: string, value: string) => {
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], [meal]: value },
    }));
  };

  const clearDay = (day: string) => {
    setPlan(prev => ({
      ...prev,
      [day]: { breakfast: '', lunch: '', dinner: '' },
    }));
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-surface-300" />
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Login to use Meal Planner
          </h2>
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
            <button onClick={handleAiGenerate} disabled={aiLoading} className="btn-secondary text-sm">
              {aiLoading
                ? <span className="h-4 w-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                : <Sparkles className="h-4 w-4" />}
              AI Generate
            </button>
            <button onClick={handleSave} disabled={saveLoading} className="btn-primary text-sm">
              {saveLoading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <Save className="h-4 w-4" />}
              Save Plan
            </button>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setWeekStart(d => subWeeks(d, 1))} className="btn-ghost h-9 w-9 p-0 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-semibold text-surface-900 dark:text-surface-100">
            {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
          <button onClick={() => setWeekStart(d => addWeeks(d, 1))} className="btn-ghost h-9 w-9 p-0 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="tag text-xs ml-2 hover:bg-brand-100 cursor-pointer"
          >
            This Week
          </button>
        </div>

        {/* Planner grid */}
        <div className="card overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-8 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
            <div className="p-3" />
            {DAYS.map((day, i) => (
              <div key={day} className="p-3 text-center">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">{DAY_LABELS[i]}</p>
                <p className="text-xs text-surface-400 mt-0.5">{format(addDays(weekStart, i), 'MMM d')}</p>
                <button onClick={() => clearDay(day)} className="mt-1 text-surface-300 hover:text-red-400 transition-colors" title="Clear day">
                  <Trash2 className="h-3 w-3 mx-auto" />
                </button>
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEALS.map((meal, mi) => (
            <div
              key={meal}
              className={cn('grid grid-cols-8', mi < MEALS.length - 1 && 'border-b border-surface-100 dark:border-surface-800')}
            >
              {/* Meal label */}
              <div className="p-3 bg-surface-50 dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 flex flex-col items-center justify-center gap-1">
                <span className="text-lg">{MEAL_ICONS[meal]}</span>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">{meal}</span>
              </div>

              {/* Day cells */}
              {/* Day cells */}
              {DAYS.map(day => (
                <div key={`${day}-${meal}`} className="border-r border-surface-100 dark:border-surface-800 last:border-r-0 min-h-[90px] p-1.5">
                  <div className="relative group h-full">
                    <textarea
                      value={plan[day]?.[meal] ?? ''}
                      onChange={e => updateCell(day, meal, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="Add meal..."
                      rows={3}
                      className={cn(
                        'w-full h-full min-h-[75px] text-xs rounded-lg p-2 transition-colors resize-none focus:outline-none leading-snug',
                        plan[day]?.[meal]
                          ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 font-medium text-brand-700 dark:text-brand-300'
                          : 'bg-transparent border border-transparent text-surface-700 dark:text-surface-300 placeholder:text-surface-300 dark:placeholder:text-surface-600 focus:bg-surface-50 dark:focus:bg-surface-800 focus:border-surface-200 dark:focus:border-surface-700'
                      )}
                      aria-label={`${meal} on ${day}`}
                    />
                    {plan[day]?.[meal] && (
                      <button
                        onClick={() => updateCell(day, meal, '')}
                        className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-400 items-center justify-center hidden group-hover:flex"
                        title="Clear"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            💡 <strong>Tip:</strong> Click any cell to type a meal, or use "AI Generate" to auto-fill the whole week.
            Always click <strong>Save Plan</strong> after making changes!
          </p>
        </div>
      </div>
    </div>
  );
}
