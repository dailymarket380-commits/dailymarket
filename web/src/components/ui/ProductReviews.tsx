'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string };
}

interface Props {
  productId: string;
}

export function ProductReviews({ productId }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('product_reviews')
        .select('id, rating, comment, created_at, user_id')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (data) {
        setReviews(data);
        if (user) {
          setAlreadyReviewed(data.some(r => r.user_id === user.id));
        }
      }
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
    } finally {
      setLoading(false);
    }
  }, [productId, user]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userRating === 0) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('product_reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating: userRating,
        comment: comment.trim() || null,
      });
      if (!error) {
        setSubmitted(true);
        setComment('');
        setUserRating(0);
        fetchReviews();
      }
    } catch (e) {
      console.error('Submit review failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <section style={{ marginTop: 48, borderTop: '1px solid #e2e8f0', paddingTop: 40 }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 24 }}>
        Customer Reviews ({reviews.length})
      </h2>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', gap: 40, marginBottom: 32, padding: 24, background: '#f8fafc', borderRadius: 16, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: '#0f172a' }}>
              {avgRating.toFixed(1)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, margin: '8px 0 4px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <svg key={s} width="16" height="16" viewBox="0 0 20 20" fill={s <= Math.round(avgRating) ? '#fbbf24' : '#e5e7eb'}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>out of 5</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 8, color: '#475569' }}>{star}</span>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="#fbbf24"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#fbbf24', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 12, color: '#64748b', minWidth: 20 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review */}
      {user && !alreadyReviewed && !submitted && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: '1rem' }}>Write a Review</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569' }}>Your Rating *</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s} type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <svg width="32" height="32" viewBox="0 0 20 20" fill={s <= (hoverRating || userRating) ? '#fbbf24' : '#e5e7eb'} style={{ transition: 'fill 0.1s' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {userRating > 0 && (
                <span style={{ alignSelf: 'center', fontSize: 13, fontWeight: 700, color: '#92400e', marginLeft: 8 }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][userRating]}
                </span>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569' }}>Your Comment (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              spellCheck
              rows={3}
              placeholder="What did you think of this product?"
              style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: 8, resize: 'none', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || userRating === 0}
            style={{
              background: userRating === 0 ? '#e2e8f0' : '#0f172a',
              color: userRating === 0 ? '#94a3b8' : '#fff',
              border: 'none', borderRadius: 10, padding: '12px 28px',
              fontWeight: 800, fontSize: 14, cursor: userRating === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {submitted && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20, marginBottom: 24, color: '#166534', fontWeight: 700 }}>
          ✅ Thank you for your review!
        </div>
      )}

      {alreadyReviewed && !submitted && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16, marginBottom: 24, color: '#1d4ed8', fontWeight: 600, fontSize: 14 }}>
          ✓ You have already reviewed this product.
        </div>
      )}

      {!user && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 14, color: '#475569' }}>
          <Link href="/login" style={{ fontWeight: 700, color: '#0f172a' }}>Sign in</Link> to leave a review.
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <p style={{ fontWeight: 600 }}>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ padding: '20px 24px', border: '1px solid #e2e8f0', borderRadius: 14, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 20 20" fill={s <= r.rating ? '#fbbf24' : '#e5e7eb'}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(r.created_at).toLocaleDateString('en-ZA')}
                </span>
              </div>
              {r.comment && <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, margin: 0 }}>{r.comment}</p>}
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, fontWeight: 600 }}>
                Verified Buyer · {r.user_id.substring(0, 8).toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
