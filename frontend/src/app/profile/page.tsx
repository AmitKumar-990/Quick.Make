import type { Metadata } from 'next';
import ProfileClient from '@/components/user/ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile — Quick Make',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
