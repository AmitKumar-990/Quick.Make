'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ShoppingCart, Check, Printer, Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function GroceryList({ slug, servings, recipeName }: { slug: string; servings: number; recipeName: string }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['grocery', slug, servings],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recipes/${slug}/grocery-list?servings=${servings}`);
      return res.data;
    },
  });

  const toggle = (name: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const copyList = () => {
    if (!data) return;
    const text = `Grocery List for ${recipeName}\n\n` +
      Object.entries(data.grouped as Record<string, any[]>)
        .map(([cat, items]) => `${cat}:\n${items.map((i: any) => `  • ${i.name} — ${i.amount}`).join('\n')}`)
        .join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('Grocery list copied!');
  };

  if (isLoading) {
    return (
      <div className="card p-6 space-y-4">
        <div className="skeleton h-6 w-48 rounded" />
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 rounded" />)}
      </div>
    );
  }

  if (!data) return null;

  const allChecked = data.groceryList?.every((i: any) => checked.has(i.name));

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-500" />
            Grocery List
          </h2>
          <p className="text-sm text-surface-500 mt-0.5">For {servings} servings of {recipeName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyList} className="btn-ghost text-sm">
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button onClick={() => window.print()} className="btn-ghost text-sm">
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-surface-500 mb-1.5">
          <span>{checked.size} of {data.groceryList?.length} items checked</span>
          {allChecked && <span className="text-green-600 dark:text-green-400 font-semibold">✓ All done!</span>}
        </div>
        <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${data.groceryList?.length ? (checked.size / data.groceryList.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Grouped items */}
      <div className="space-y-6">
        {Object.entries(data.grouped as Record<string, any[]>).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
              {category}
            </h3>
            <ul className="space-y-2">
              {items.map((item: any) => (
                <li
                  key={item.name}
                  onClick={() => toggle(item.name)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                    checked.has(item.name)
                      ? 'bg-green-50 dark:bg-green-900/20 opacity-60'
                      : 'hover:bg-surface-50 dark:hover:bg-surface-700'
                  )}
                >
                  <div className={cn(
                    'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    checked.has(item.name)
                      ? 'bg-green-500 border-green-500'
                      : 'border-surface-300 dark:border-surface-600'
                  )}>
                    {checked.has(item.name) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={cn(
                    'flex-1 text-sm font-medium transition-colors',
                    checked.has(item.name)
                      ? 'line-through text-surface-400 dark:text-surface-500'
                      : 'text-surface-800 dark:text-surface-200'
                  )}>
                    {item.name}
                    {item.optional && <span className="ml-1 text-xs text-surface-400">(optional)</span>}
                  </span>
                  <span className="text-sm text-surface-500 dark:text-surface-400 flex-shrink-0">
                    {item.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
