import type { Metadata } from 'next';
import UploadRecipeClient from '@/components/recipe/UploadRecipeClient';

export const metadata: Metadata = {
  title: 'Upload Your Recipe — Quick Make',
  description: 'Share your favourite recipes with the Quick Make community. Add ingredients, steps, images and more.',
  robots: { index: false, follow: false },
};

export default function UploadRecipePage() {
  return <UploadRecipeClient />;
}
