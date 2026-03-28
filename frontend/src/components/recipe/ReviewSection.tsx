'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, Send, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewSection({ recipeId }: { recipeId: string }) {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', recipeId],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reviews?recipeId=${recipeId}`);
      return res.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Please log in to leave a review'); return; }
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews`,
        { recipe: recipeId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      qc.invalidateQueries({ queryKey: ['reviews', recipeId] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!token) { toast.error('Please log in'); return; }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      qc.invalidateQueries({ queryKey: ['reviews', recipeId] });
    } catch {}
  };

  const reviews = data?.reviews || [];

  return (
    <section className="mb-12" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-6">
        Reviews & Ratings
      </h2>

      {/* Write review */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-4">Leave a Review</h3>
        <form onSubmit={handleSubmit}>
          {/* Star selector */}
          <div className="flex gap-1 mb-4" role="group" aria-label="Rating">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
              >
                <Star className={cn(
                  'h-7 w-7 transition-colors',
                  n <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-surface-300 dark:text-surface-600'
                )} />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-surface-500 self-center">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </span>
            )}
          </div>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your cooking experience, tips, or modifications..."
            rows={3}
            maxLength={500}
            className="input resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">{comment.length}/500</span>
            <button type="submit" disabled={submitting || !rating} className="btn-primary text-sm">
              {submitting ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex gap-3">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              </div>
              <div className="skeleton h-16 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-surface-400">
          <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review: any, i: number) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5"
                itemScope
                itemType="https://schema.org/Review"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-brand-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-surface-800 dark:text-surface-200" itemProp="author">
                        {review.user?.name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-surface-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mt-1" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                      <meta itemProp="ratingValue" content={review.rating} />
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={cn('h-3.5 w-3.5', n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-surface-200 dark:text-surface-600')} />
                      ))}
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-3" itemProp="reviewBody">
                    {review.comment}
                  </p>
                )}

                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Helpful ({review.helpful || 0})
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
