'use client';
import { motion } from 'framer-motion';
import { Salad, Sparkles, ShoppingCart, Calendar } from 'lucide-react';

const STEPS = [
  {
    icon: Salad,
    step: '01',
    title: 'Enter your ingredients',
    description: 'Type what you have at home — vegetables, proteins, spices. Quick Make supports multi-ingredient search with auto-suggestions.',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'Get AI-powered suggestions',
    description: 'Our AI analyses thousands of recipes and suggests the best matches based on your ingredients, preferences, and cooking time.',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    icon: ShoppingCart,
    step: '03',
    title: 'Generate grocery list',
    description: 'Missing something? Quick Make auto-generates a grocery list with only the ingredients you need to buy.',
    color: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
  },
  {
    icon: Calendar,
    step: '04',
    title: 'Plan your week',
    description: 'Use the AI meal planner to organise breakfast, lunch, and dinner for the whole week. Healthy eating made effortless.',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-surface-50 dark:bg-surface-950" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="how-it-works-heading" className="section-title">How Quick Make Works</h2>
          <p className="section-subtitle mt-3 max-w-xl mx-auto">
            From pantry to plate in four easy steps. No more staring at your fridge wondering what to cook.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card p-6 text-center group hover:-translate-y-1"
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} mb-4 transition-transform group-hover:scale-110`}>
                <step.icon className="h-7 w-7" />
              </div>
              <div className="text-4xl font-display font-black text-surface-100 dark:text-surface-800 mb-2">{step.step}</div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">{step.title}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
