import type { Metadata } from 'next';
import MealPlannerClient from '@/components/meal-plan/MealPlannerClient';

export const metadata: Metadata = {
  title: 'Weekly Meal Planner — Quick Make',
  description: 'Plan your meals for the week with Quick Make. Drag and drop recipes, get AI-generated meal plans, and generate grocery lists for the whole week.',
  robots: { index: true, follow: true },
};

export default function MealPlannerPage() {
  return <MealPlannerClient />;
}
