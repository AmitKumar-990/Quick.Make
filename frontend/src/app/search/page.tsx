import type { Metadata } from 'next';
import SearchClient from '@/components/search/SearchClient';

export const metadata: Metadata = {
  title: 'Search Recipes — Quick Make',
  description: 'Search thousands of recipes by name, ingredient, or cuisine. Find exactly what you want to cook today.',
  robots: { index: true, follow: true },
};

export default function SearchPage() {
  return <SearchClient />;
}
