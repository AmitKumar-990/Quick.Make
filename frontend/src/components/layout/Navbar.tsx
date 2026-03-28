'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, ChefHat, Sparkles, Search, User, BookOpen, Calendar, Heart, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/ai-suggest', label: 'AI Suggest', icon: Sparkles, highlight: true },
  { href: '/meal-planner', label: 'Meal Planner', icon: Calendar },
  { href: '/search', label: 'Search', icon: Search },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, token, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Quick Make home">
            <div className="h-8 w-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-surface-900 dark:text-white">
              Quick<span className="text-brand-500">Make</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100',
                  link.highlight && 'bg-brand-500 text-white hover:bg-brand-600 hover:text-white dark:bg-brand-500 dark:text-white dark:hover:bg-brand-600'
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-ghost h-9 w-9 p-0"
              aria-label="Toggle dark mode"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {/* Auth */}
            {token && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <div className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-surface-800 shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link href="/saved" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors">
                        <Heart className="h-4 w-4" /> Saved Recipes
                      </Link>
                      <Link href="/meal-planner" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors">
                        <Calendar className="h-4 w-4" /> Meal Planner
                      </Link>
                      <Link href="/upload-recipe" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors">
                        <ChefHat className="h-4 w-4" /> Upload Recipe
                      </Link>
                      <div className="border-t border-surface-100 dark:border-surface-700">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/auth/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn-ghost h-9 w-9 p-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                        : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                {!token && (
                  <div className="pt-2 flex flex-col gap-2">
                    <Link href="/auth/login" className="btn-secondary w-full justify-center">Login</Link>
                    <Link href="/auth/register" className="btn-primary w-full justify-center">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
