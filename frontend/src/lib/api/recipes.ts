const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getRecipes(params: Record<string, any> = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])
  ).toString();

  const res = await fetch(`${API_URL}/recipes${qs ? '?' + qs : ''}`, {
    next: { revalidate: 300 }, // 5 minute ISR
  });
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function getRecipeBySlug(slug: string) {
  const res = await fetch(`${API_URL}/recipes/${slug}`, {
    next: { revalidate: 600 }, // 10 minute ISR
  });
  if (!res.ok) throw new Error('Recipe not found');
  return res.json();
}

export async function getRecipeSuggestions(ingredients: string[]) {
  const res = await fetch(`${API_URL}/recipes/suggestions?ingredients=${ingredients.join(',')}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to get suggestions');
  return res.json();
}
