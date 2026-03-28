import type { Metadata } from 'next';
import SavedRecipesClient from '@/components/user/SavedRecipesClient';

export const metadata: Metadata = {
  title: 'Saved Recipes — Quick Make',
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return <SavedRecipesClient />;
}
