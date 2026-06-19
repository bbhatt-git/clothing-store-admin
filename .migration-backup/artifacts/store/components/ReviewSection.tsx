'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Check, User } from 'lucide-react';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  created_at: string;
}

interface ReviewSectionProps {
  productId: string;
  initialReviews: Review[];
  onReviewSubmitted?: () => void;
}

export default function ReviewSection({ productId, initialReviews, onReviewSubmitted }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  
  // Submit Form States
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Breakdown calculations
  const totalReviews = reviews.length;
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    const key = r.rating as 1|2|3|4|5;
    if (ratingCounts[key] !== undefined) ratingCounts[key]++;
  });

  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : '0.0';

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setError('Please fill in your name and review details.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          reviewerName: name,
          rating,
          title,
          body
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setSuccess(true);
        setName('');
        setTitle('');
        setBody('');
        setRating(5);
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        setError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setError('Server error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="border-t border-zinc-200 pt-8">
        <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
          <span>Customer Reviews</span>
          <span className="text-zinc-400 font-normal">({reviews.length})</span>
        </h3>
      </div>

      {/* RATING BREAKDOWN AND SUMS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Core Rating Sum Card */}
        <div className="md:col-span-4 bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-center space-y-2">
          <p className="text-3xl md:text-4xl font-extrabold text-zinc-900">{avgRating}</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${star <= Math.round(parseFloat(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`} 
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 font-medium font-mono">Based on {totalReviews} reviews</p>
        </div>

        {/* Rating Breakdown Stack Bars */}
        <div className="md:col-span-8 space-y-2">
          {([5, 4, 3, 2, 1] as const).map((starNum) => {
            const count = ratingCounts[starNum];
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={starNum} className="flex items-center gap-3 text-xs text-zinc-600">
                <span className="w-10 font-bold flex items-center gap-1 flex-none">
                  {starNum} <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 inline-block" />
                </span>
                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand rounded-full transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right text-zinc-400 font-medium font-mono">{count}</span>
              </div>
            );
          })}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* REVIEWS LOGS LIST */}
        <div className="lg:col-span-7 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Verified Feedbacks</h4>
          
          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 border border-zinc-150 rounded-2xl">
              <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-medium">Be the first to leave a feedback for this item!</p>
            </div>
          ) : (
            <div className="space-y-4 division-y divide-zinc-100">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white border border-zinc-100 rounded-2xl flex gap-3.5 items-start shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-none">
                    <User className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-zinc-950 truncate max-w-[150px]">{r.reviewer_name}</h5>
                      <span className="text-[10px] text-zinc-500 font-mono">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((str) => (
                        <Star 
                          key={str} 
                          className={`w-3 h-3 ${str <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`} 
                        />
                      ))}
                    </div>
                    {r.title && <p className="text-xs font-bold text-zinc-900 pt-0.5">{r.title}</p>}
                    <p className="text-xs text-zinc-650 leading-relaxed">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT REVIEW CONTAINER */}
        <div className="lg:col-span-5 bg-zinc-50 border border-zinc-100 p-6 rounded-2xl h-fit space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Write a Review</h4>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center space-y-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-green-800">Review posted successfully!</p>
              <p className="text-[11px] text-green-500 leading-relaxed">Thank you for rating your purchase. Your feedback has been published.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-xs font-bold text-brand hover:underline pt-1 block mx-auto"
                aria-label="Submit another review"
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3.5">
              
              {/* Star Rating Selector */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.3">Rating Star</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setRating(st)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`Rate ${st} stars`}
                    >
                      <Star className={`w-6 h-6 ${st <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bhupesh Bhatt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 bg-white border border-zinc-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Summary (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Highly recommend this!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 bg-white border border-zinc-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                />
              </div>

              {/* Detailed review body */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Review Comments</label>
                <textarea
                  placeholder="Tell us what you liked or disliked about the fabric quality, stitching, and fit..."
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                  required
                />
              </div>

              {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-medium rounded-lg h-10 text-xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Posting feedback...' : 'Submit Evaluation'}
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
