import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quickmake.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/recipes`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/ai-suggest`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/meal-planner`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Dynamic recipe pages
  let recipePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/recipes?limit=1000&fields=slug,updatedAt`, {
      next: { revalidate: 3600 },
    });
    const { recipes } = await res.json();

    recipePages = recipes.map((recipe: any) => ({
      url: `${BASE_URL}/recipes/${recipe.slug}`,
      lastModified: new Date(recipe.updatedAt || recipe.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Build continues even if API is unavailable
  }

  return [...staticPages, ...recipePages];
}
