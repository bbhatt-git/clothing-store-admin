'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';

interface Review {
  id: number;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  date_created: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { showModal } = useModal();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let isMounted = true;
    
    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?product_id=${productId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadReviews();
    
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          reviewer: form.name,
          reviewer_email: form.email,
          rating: form.rating,
          review: form.comment
        })
      });

      const data = await res.json();

      if (data.success) {
        setSubmitMessage({ type: 'success', text: data.status === 'hold' ? 'Your review was submitted and is pending approval.' : 'Your review was posted successfully!' });
        setForm({ name: '', email: '', rating: 5, comment: '' });
        showModal('success', 'Review Submitted', data.status === 'hold' ? 'Your review was submitted and is pending approval.' : 'Your review was posted successfully!');
        if (data.status === 'approved') {
          fetchReviews();
        }
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Failed to submit review.' });
        showModal('error', 'Review Failed', data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: 'Network error. Please try again later.' });
      showModal('error', 'Network Error', 'Failed to submit review due to network error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }, [productId, form, fetchReviews, showModal]);

  return (
    <div className="bg-white p-6 md:p-10 rounded-[4px] border border-stone-200 shadow-sm mt-8">
      <h3 className="text-2xl font-black uppercase tracking-tight text-[#121212] font-display mb-8">
        Customer Reviews
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Reviews List */}
        <div className="space-y-6">
          {loading ? (
            <p className="text-sm text-stone-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-stone-500 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-stone-100 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-bold text-[#121212] uppercase tracking-wide">{rev.reviewer}</h5>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(rev.date_created).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-[#FE5733] mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#FE5733]' : 'text-stone-200'}`} 
                      />
                    ))}
                  </div>
                  <div 
                    className="text-sm text-stone-600 leading-relaxed font-sans prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: rev.review }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a Review Form */}
        <div className="bg-[#F5F5F0] p-6 rounded-[4px] border border-stone-200 h-fit">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#121212] mb-6">Write a Review</h4>
          
          {submitMessage.text && (
            <div className={`mb-6 p-4 text-xs font-bold rounded-[4px] ${submitMessage.type === 'success' ? 'bg-[#121212] text-white' : 'bg-red-100 text-red-700'}`}>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setForm({ ...form, rating: num })}
                    className="p-1"
                    aria-label={`Rate ${num} stars`}
                    aria-pressed={form.rating === num}
                  >
                    <Star className={`w-6 h-6 ${num <= form.rating ? 'fill-[#FE5733] text-[#FE5733]' : 'text-stone-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm h-10 border border-stone-300 bg-white rounded-[4px] px-3 focus:outline-none focus:border-[#121212]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full text-sm h-10 border border-stone-300 bg-white rounded-[4px] px-3 focus:outline-none focus:border-[#121212]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Your Review</label>
              <textarea
                required
                rows={4}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full text-sm border border-stone-300 bg-white rounded-[4px] p-3 focus:outline-none focus:border-[#121212] resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-[#121212] text-white rounded-[4px] font-bold uppercase tracking-widest text-xs hover:bg-[#FE5733] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
