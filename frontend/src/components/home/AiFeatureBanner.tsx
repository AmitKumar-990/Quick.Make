'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Brain, ShoppingBag, Calendar } from 'lucide-react';

const AI_FEATURES = [
  { icon: Brain, title: 'Context-aware ideas', desc: 'Tell the AI what you\'re craving or have as leftovers — it adapts.' },
  { icon: Zap, title: 'Instant suggestions', desc: 'Get 3 fully detailed AI recipes in seconds, not minutes.' },
  { icon: ShoppingBag, title: 'Smart grocery lists', desc: 'Auto-generates what to buy based on what you\'re missing.' },
  { icon: Calendar, title: 'Weekly meal plans', desc: 'Let AI plan your entire week with balanced, varied meals.' },
];

export default function AiFeatureBanner() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950" aria-labelledby="ai-banner-heading">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-500/30 px-4 py-2 text-sm font-semibold text-brand-400 mb-6">
              <Sparkles className="h-4 w-4" />
              Powered by Google Gemini
            </div>
            <h2 id="ai-banner-heading" className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Cook smarter with AI-powered recipe intelligence
            </h2>
            <p className="text-surface-400 text-lg leading-relaxed mb-8">
              Quick Make's AI doesn't just search recipes — it understands context, dietary needs, available ingredients, and your cooking skill level to suggest exactly what you need.
            </p>
            <Link href="/ai-suggest" className="btn-primary text-base px-6 py-3">
              <Sparkles className="h-5 w-5" />
              Try AI Suggestions Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          {/* Right — feature grid */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {AI_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-500/30 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-brand-500/20 flex items-center justify-center mb-3 group-hover:bg-brand-500/30 transition-colors">
                  <feature.icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
                <p className="text-surface-400 text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
