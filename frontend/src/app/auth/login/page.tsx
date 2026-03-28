import type { Metadata } from 'next';
import LoginClient from '@/components/auth/LoginClient';

export const metadata: Metadata = {
  title: 'Login — Quick Make',
  description: 'Sign in to your Quick Make account to save recipes, plan meals, and get personalised AI suggestions.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
