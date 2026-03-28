import Link from 'next/link';
import { ChefHat, Twitter, Instagram, Github } from 'lucide-react';

const FOOTER_LINKS = {
  'Discover': [
    { href: '/recipes', label: 'All Recipes' },
    { href: '/recipes?dietType=veg', label: 'Vegetarian' },
    { href: '/recipes?cuisine=Indian', label: 'Indian Recipes' },
    { href: '/recipes?difficulty=Easy', label: 'Easy Recipes' },
    { href: '/recipes?maxTime=30', label: '30-Minute Meals' },
  ],
  'Features': [
    { href: '/ai-suggest', label: 'AI Suggestions' },
    { href: '/meal-planner', label: 'Meal Planner' },
    { href: '/search', label: 'Search Recipes' },
    { href: '/upload-recipe', label: 'Upload Recipe' },
  ],
  'Account': [
    { href: '/auth/register', label: 'Create Account' },
    { href: '/auth/login', label: 'Sign In' },
    { href: '/saved', label: 'Saved Recipes' },
    { href: '/profile', label: 'Profile' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-900 dark:bg-surface-950 text-surface-400 mt-auto" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="Quick Make home">
              <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Quick<span className="text-brand-400">Make</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Cook something amazing every day. AI-powered recipe discovery for everyone.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com/quickmakeapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/quickmakeapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://github.com/quickmakeapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Quick Make. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
