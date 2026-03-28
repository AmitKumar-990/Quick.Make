import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import FeaturedRecipes from '@/components/home/FeaturedRecipes';
import HowItWorks from '@/components/home/HowItWorks';
import CuisineGrid from '@/components/home/CuisineGrid';
import AiFeatureBanner from '@/components/home/AiFeatureBanner';
import { getRecipes } from '@/lib/api/recipes';
import WebsiteJsonLd from '@/components/seo/WebsiteJsonLd';

export const metadata: Metadata = {
  title: 'Quick Make — Smart Recipe Suggestions Based on Your Ingredients',
  description: 'Enter what you have in your kitchen and instantly get personalised recipe ideas. AI-powered meal planning, grocery lists, and step-by-step cooking instructions.',
  openGraph: {
    title: 'Quick Make — Smart Recipe Suggestions',
    description: 'Tell us what ingredients you have. Get recipes you can make right now.',
  },
};

export default async function HomePage() {
  // SSR featured recipes for SEO
  let featuredRecipes = [];
  try {
    const data = await getRecipes({ sort: '-averageRating', limit: 6 });
    featuredRecipes = data.recipes;
  } catch {
    // Graceful fallback if API is unavailable during build
  }

  return (
    <>
      <WebsiteJsonLd />
      <Hero />
      <FeaturedRecipes initialRecipes={featuredRecipes} />
      <HowItWorks />
      <CuisineGrid />
      <AiFeatureBanner />
    </>
  );
}
