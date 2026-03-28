import type { Metadata } from 'next';
import RecipesClient from '@/components/recipe/RecipesClient';
import { getRecipes } from '@/lib/api/recipes';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q as string;
  const cuisine = searchParams.cuisine as string;
  const dietType = searchParams.dietType as string;

  let title = 'All Recipes — Quick Make';
  let description = 'Browse thousands of recipes. Filter by cuisine, diet type, cooking time, and difficulty.';

  if (q) {
    title = `"${q}" Recipes — Quick Make`;
    description = `Find the best ${q} recipes on Quick Make. Step-by-step instructions, ingredient lists, and cooking tips.`;
  } else if (cuisine) {
    title = `${cuisine} Recipes — Quick Make`;
    description = `Explore authentic ${cuisine} recipes on Quick Make. From easy weeknight dinners to weekend feasts.`;
  } else if (dietType === 'veg') {
    title = 'Vegetarian Recipes — Quick Make';
    description = 'Discover delicious vegetarian recipes for every occasion. Easy, quick, and nutritious.';
  }

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: q
        ? `https://quickmake.app/recipes?q=${encodeURIComponent(q)}`
        : `https://quickmake.app/recipes`,
    },
  };
}

export default async function RecipesPage({ searchParams }: Props) {
  let initialRecipes = [];
  let initialTotal = 0;

  try {
    const params: Record<string, any> = { page: 1, limit: 12 };
    if (searchParams.q) params.q = searchParams.q;
    if (searchParams.dietType) params.dietType = searchParams.dietType;
    if (searchParams.cuisine) params.cuisine = searchParams.cuisine;
    if (searchParams.difficulty) params.difficulty = searchParams.difficulty;
    if (searchParams.maxTime) params.maxTime = searchParams.maxTime;
    if (searchParams.sort) params.sort = searchParams.sort;
    if (searchParams.ingredients) params.ingredients = searchParams.ingredients;

    const data = await getRecipes(params);
    initialRecipes = data.recipes;
    initialTotal = data.pagination?.total || 0;
  } catch {
    // graceful fallback
  }

  return (
    <RecipesClient
      initialRecipes={initialRecipes}
      initialTotal={initialTotal}
      searchParams={searchParams as Record<string, string>}
    />
  );
}
