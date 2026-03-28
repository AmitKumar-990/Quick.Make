import type { Metadata } from 'next';
import RegisterClient from '@/components/auth/RegisterClient';

export const metadata: Metadata = {
  title: 'Create Account — Quick Make',
  description: 'Join Quick Make for free. Save favourite recipes, plan weekly meals, and get AI-powered cooking suggestions.',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
