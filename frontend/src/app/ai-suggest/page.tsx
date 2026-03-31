import type { Metadata } from 'next';
import AiSuggestClient from '@/components/ai/AiSuggestClient';

export const metadata: Metadata = {
  title: 'AI Recipe Suggestions — Quick Make',
  description: 'Get personalised AI recipe suggestions based on your ingredients, dietary preferences, and cooking time. Powered by Claude AI.',
  robots: { index: true, follow: true },
};

export const dynamic = 'force-dynamic';
export default function AiSuggestPage() {
  return <AiSuggestClient />;
}
