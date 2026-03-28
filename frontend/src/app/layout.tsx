import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/providers/QueryProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://quickmake.app'),
  title: {
    default: 'Quick Make — Smart Recipe Suggestions Based on Your Ingredients',
    template: '%s | Quick Make',
  },
  description: 'Discover recipes based on ingredients you already have. Quick Make suggests personalised recipes, generates grocery lists, and helps you plan meals with AI. Free to use.',
  keywords: [
    'recipe suggestions', 'ingredient-based recipes', 'quick recipes', 'meal planning',
    'grocery list generator', 'AI recipes', 'Indian recipes', 'easy cooking', 'quick meals',
    'leftover recipes', 'what to cook tonight', 'recipe finder', 'cooking app',
  ],
  authors: [{ name: 'Quick Make', url: 'https://quickmake.app' }],
  creator: 'Quick Make',
  publisher: 'Quick Make',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quickmake.app',
    siteName: 'Quick Make',
    title: 'Quick Make — Smart Recipe Suggestions Based on Your Ingredients',
    description: 'Enter ingredients you have and get personalised recipe suggestions instantly. Powered by AI.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Quick Make - Recipe Suggestion App' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@quickmakeapp',
    creator: '@quickmakeapp',
    title: 'Quick Make — Smart Recipe Suggestions',
    description: 'Find recipes based on ingredients you have. Meal planning, grocery lists, and AI cooking ideas.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://quickmake.app',
    languages: { 'en-US': 'https://quickmake.app/en-us' },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body className="bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 antialiased transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { background: 'var(--toast-bg)', color: 'var(--toast-color)', borderRadius: '12px', fontSize: '14px' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
