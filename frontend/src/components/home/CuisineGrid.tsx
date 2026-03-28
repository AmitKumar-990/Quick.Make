'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CUISINES = [
  { name: 'Indian', emoji: '🍛', color: 'from-orange-400 to-red-500' },
  { name: 'Italian', emoji: '🍝', color: 'from-green-400 to-emerald-600' },
  { name: 'Chinese', emoji: '🥟', color: 'from-red-400 to-red-600' },
  { name: 'Mexican', emoji: '🌮', color: 'from-yellow-400 to-orange-500' },
  { name: 'Japanese', emoji: '🍱', color: 'from-pink-400 to-rose-500' },
  { name: 'Thai', emoji: '🍜', color: 'from-purple-400 to-indigo-500' },
  { name: 'Mediterranean', emoji: '🫒', color: 'from-blue-400 to-cyan-500' },
  { name: 'American', emoji: '🍔', color: 'from-amber-400 to-yellow-500' },
];

export default function CuisineGrid() {
  return (
    <section className="py-16 bg-white dark:bg-surface-900" aria-labelledby="cuisines-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="cuisines-heading" className="section-title">Explore by Cuisine</h2>
          <p className="section-subtitle mt-2">From spicy Indian curries to Italian pasta — we have it all</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CUISINES.map((cuisine, i) => (
            <motion.div
              key={cuisine.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/recipes?cuisine=${cuisine.name}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-100 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all group"
                aria-label={`${cuisine.name} recipes`}
              >
                <div className={`text-3xl transition-transform group-hover:scale-110`}>{cuisine.emoji}</div>
                <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 text-center group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cuisine.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
