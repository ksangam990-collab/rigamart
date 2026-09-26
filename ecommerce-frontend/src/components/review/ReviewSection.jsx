import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Star, ThumbsUp, CheckCircle, MessageSquare, AlertCircle, Loader2, X } from 'lucide-react';
import api from '../../utils/api.js';
import RatingStars from '../common/RatingStars.jsx';

export default function ReviewSection({ productId, initialRating = 0, initialNumReviews = 0 }) {
  const [reviews, setReviews] = useState([]);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [avgRating, setAvgRating] = useState(initialRating);
  const [numReviews, setNumReviews] = useState(initialNumReviews);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/reviews/products/${productId}`);
      const data = res.data.data;
      const summary = data.summary || {};
      setReviews(data.reviews || []);
      setBreakdown(summary.breakdown || data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      setAvgRating(summary.avgRating ?? data.avgRating ?? 0);
      setNumReviews(summary.totalReviews ?? data.totalReviews ?? data.reviews?.length ?? 0);
    } catch (e) {
      // Gracefully handle empty or error state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleHelpfulVote = async (reviewId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await api.put(`/reviews/${reviewId}/vote`);
      const updatedHelpfulVotes = res.data.data?.helpfulVotes;
      if (updatedHelpfulVotes !== undefined) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, helpfulVotes: updatedHelpfulVotes } : r))
        );
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Vote failed');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post(`/reviews/products/${productId}`, {
        rating,
        title,
        body
      });
      setFormSuccess('Thank you! Your verified review has been published.');
      setTitle('');
      setBody('');
      setRating(5);
      fetchReviews();
      setTimeout(() => {
        setModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pt-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-600" />
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs text-gray-500 mt-1">Verified feedback from real Rigamart buyers</p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              window.location.href = '/login';
              return;
            }
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start md:self-auto"
        >
          Write a Customer Review
        </button>
      </div>

      {/* Ratings Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 items-center">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-gray-900">{(avgRating || 0).toFixed(1)}</span>
          <div className="my-2">
            <RatingStars rating={avgRating} size="w-5 h-5" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Based on {numReviews} ratings</span>
        </div>

        {/* 5-star to 1-star Progress Bars */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((starLevel) => {
            const count = breakdown[starLevel] || 0;
            const percentage = numReviews > 0 ? Math.round((count / numReviews) * 100) : 0;

            return (
              <div key={starLevel} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                  {starLevel} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-gray-500 font-mono">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 p-8">
            <p className="text-gray-500 text-sm">No reviews yet for this product.</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts with the community!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-black text-xs flex items-center justify-center uppercase">
                    {(rev.user?.name || 'Customer').charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{rev.user?.name || 'Customer'}</h4>
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs text-gray-400">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <RatingStars rating={rev.rating} size="w-3.5 h-3.5" />
                {rev.title && <h5 className="text-sm font-bold text-gray-800">{rev.title}</h5>}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{rev.body}</p>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => handleHelpfulVote(rev._id)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors p-1"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({typeof rev.helpfulVotes === 'number' ? rev.helpfulVotes : 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-gray-900">Write a Review</h3>
              <p className="text-xs text-gray-500 mt-1">Rate your experience with this item</p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Overall Rating
                </label>
                <RatingStars
                  rating={rating}
                  interactive={true}
                  onRatingChange={(newVal) => setRating(newVal)}
                  size="w-7 h-7"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Review Headline / Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Excellent fabric quality and perfect fit!"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Review Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Tell others what you liked or disliked about this product..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
