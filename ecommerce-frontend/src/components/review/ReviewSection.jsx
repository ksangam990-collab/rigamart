import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  Loader2,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Trash2,
  Filter,
  Sparkles,
  Maximize2
} from 'lucide-react';
import api from '../../utils/api.js';
import RatingStars from '../common/RatingStars.jsx';
import { modalBackdropVariants, modalContentVariants } from '../../utils/animations.js';

export default function ReviewSection({ productId, initialRating = 0, initialNumReviews = 0 }) {
  const [reviews, setReviews] = useState([]);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [avgRating, setAvgRating] = useState(initialRating);
  const [numReviews, setNumReviews] = useState(initialNumReviews);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [selectedSort, setSelectedSort] = useState('recent'); // 'recent' | 'helpful' | 'highest' | 'lowest'
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null); // null | 5 | 4 | 3 | 2 | 1
  const [hasImagesFilter, setHasImagesFilter] = useState(false);
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);

  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reviewImages, setReviewImages] = useState([]); // [{ public_id, url }]
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Lightbox modal state
  const [lightboxData, setLightboxData] = useState(null);
  // { images: [], currentIndex: 0, reviewerName: '', rating: 5, title: '' }

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxData) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxData(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxData((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
              }
            : null
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxData((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.images.length
              }
            : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxData]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedSort !== 'recent') queryParams.append('sort', selectedSort);
      if (selectedRatingFilter) queryParams.append('rating', selectedRatingFilter);
      if (hasImagesFilter) queryParams.append('hasImages', 'true');
      if (verifiedOnlyFilter) queryParams.append('verifiedOnly', 'true');

      const res = await api.get(`/reviews/products/${productId}?${queryParams.toString()}`);
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
  }, [productId, selectedSort, selectedRatingFilter, hasImagesFilter, verifiedOnlyFilter]);

  // Image Upload Handler for Write Review Form
  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (reviewImages.length + files.length > 4) {
      setFormError('You can upload a maximum of 4 photos per review');
      return;
    }

    // Check size limit: max 5MB per file
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setFormError('Each image must be under 5MB');
      return;
    }

    setIsUploadingImages(true);
    setFormError(null);

    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));

    try {
      const res = await api.post('/upload/review-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploaded = res.data.data?.images || [];
      setReviewImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to upload review photos');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Helpful Vote Toggle with Optimistic UI Update
  const handleHelpfulVote = async (review) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const reviewAuthorId = (review.user?._id || review.user)?.toString();
    const currentUserId = user?._id?.toString();

    if (currentUserId && reviewAuthorId === currentUserId) {
      alert('You cannot vote on your own review');
      return;
    }

    const reviewId = review._id;
    const currentVotedUsers = review.votedUsers || [];
    const hasAlreadyVoted = currentVotedUsers.some(
      (id) => (typeof id === 'object' ? id._id || id : id).toString() === currentUserId
    );

    // Instant optimistic update
    setReviews((prev) =>
      prev.map((r) => {
        if (r._id !== reviewId) return r;
        const newHelpfulVotes = hasAlreadyVoted
          ? Math.max(0, (r.helpfulVotes || 1) - 1)
          : (r.helpfulVotes || 0) + 1;
        const newVotedUsers = hasAlreadyVoted
          ? (r.votedUsers || []).filter(
              (id) => (typeof id === 'object' ? id._id || id : id).toString() !== currentUserId
            )
          : [...(r.votedUsers || []), currentUserId];

        return {
          ...r,
          helpfulVotes: newHelpfulVotes,
          votedUsers: newVotedUsers
        };
      })
    );

    try {
      const res = await api.put(`/reviews/${reviewId}/vote`);
      const { helpfulVotes, hasVoted } = res.data.data || {};
      if (helpfulVotes !== undefined) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r._id !== reviewId) return r;
            return {
              ...r,
              helpfulVotes,
              votedUsers: hasVoted
                ? [
                    ...(r.votedUsers || []).filter(
                      (id) =>
                        (typeof id === 'object' ? id._id || id : id).toString() !== currentUserId
                    ),
                    currentUserId
                  ]
                : (r.votedUsers || []).filter(
                    (id) =>
                      (typeof id === 'object' ? id._id || id : id).toString() !== currentUserId
                  )
            };
          })
        );
      }
    } catch (e) {
      // Revert optimistic update on failure
      fetchReviews();
      alert(e.response?.data?.message || 'Vote failed');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (isUploadingImages) {
      setFormError('Please wait for photos to finish uploading');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post(`/reviews/products/${productId}`, {
        rating,
        title,
        body,
        images: reviewImages
      });

      setFormSuccess('Thank you! Your verified review and photos have been published.');
      setTitle('');
      setBody('');
      setRating(5);
      setReviewImages([]);
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

  const openLightbox = (review, imageIndex) => {
    setLightboxData({
      images: review.images,
      currentIndex: imageIndex,
      reviewerName: review.user?.name || 'Customer',
      rating: review.rating,
      title: review.title
    });
  };

  return (
    <div className="space-y-8 pt-8 border-t border-gray-200">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-600" />
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs text-gray-500 mt-1">Verified feedback & photos from real Rigamart buyers</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (!isAuthenticated) {
              window.location.href = '/login';
              return;
            }
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start md:self-auto flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Write a Customer Review
        </motion.button>
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
            const isSelected = selectedRatingFilter === starLevel;

            return (
              <div
                key={starLevel}
                onClick={() => setSelectedRatingFilter(isSelected ? null : starLevel)}
                className={`flex items-center gap-3 text-xs cursor-pointer p-1 rounded-lg transition-colors ${
                  isSelected ? 'bg-amber-50 font-bold' : 'hover:bg-gray-100/60'
                }`}
                title={`Filter by ${starLevel} stars`}
              >
                <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                  {starLevel} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
                <span className="w-12 text-right text-gray-500 font-mono text-[11px]">
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* With Photos filter pill */}
          <button
            type="button"
            onClick={() => setHasImagesFilter(!hasImagesFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              hasImagesFilter
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>With Photos</span>
          </button>

          {/* Verified Only filter pill */}
          <button
            type="button"
            onClick={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              verifiedOnlyFilter
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Purchase</span>
          </button>

          {/* Star Filter Pill if selected */}
          {selectedRatingFilter && (
            <button
              type="button"
              onClick={() => setSelectedRatingFilter(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1 hover:bg-amber-200 transition-colors"
            >
              <span>{selectedRatingFilter} Stars</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Reset all filters */}
          {(hasImagesFilter || verifiedOnlyFilter || selectedRatingFilter) && (
            <button
              type="button"
              onClick={() => {
                setHasImagesFilter(false);
                setVerifiedOnlyFilter(false);
                setSelectedRatingFilter(null);
              }}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold px-2 py-1 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="review-sort" className="font-semibold text-gray-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="review-sort"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-brand-500 focus:bg-white transition-colors"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
            <p className="text-gray-500 text-sm font-medium">No reviews match the selected filters.</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your filters or be the first to submit a review with photos!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const currentUserId = user?._id?.toString();
            const reviewAuthorId = (rev.user?._id || rev.user)?.toString();
            const isAuthor = Boolean(currentUserId && reviewAuthorId === currentUserId);
            const isHelpfulActive = Boolean(
              currentUserId &&
                rev.votedUsers?.some(
                  (id) => (typeof id === 'object' ? id._id || id : id).toString() === currentUserId
                )
            );

            return (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3"
              >
                {/* Header: User, verified badge, date */}
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

                {/* Rating & Title */}
                <div className="flex items-center gap-2">
                  <RatingStars rating={rev.rating} size="w-3.5 h-3.5" />
                  {rev.title && <h5 className="text-sm font-bold text-gray-800">{rev.title}</h5>}
                </div>

                {/* Body Text */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{rev.body}</p>

                {/* Customer Uploaded Photos Row */}
                {rev.images && rev.images.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-brand-500" />
                      Customer Photos ({rev.images.length})
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {rev.images.map((img, idx) => (
                        <div
                          key={img.public_id || idx}
                          onClick={() => openLightbox(rev, idx)}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group shadow-2xs hover:shadow-md transition-all"
                          title="Click to view full photo"
                        >
                          <img
                            src={img.url}
                            alt={`Customer review photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-200"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpful Voting Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleHelpfulVote(rev)}
                    disabled={isAuthor}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                      isHelpfulActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold shadow-xs'
                        : 'text-gray-600 hover:text-brand-600 hover:bg-gray-100/70 border border-gray-200'
                    } ${isAuthor ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={isAuthor ? 'You cannot vote on your own review' : isHelpfulActive ? 'Remove helpful vote' : 'Mark as helpful'}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 transition-transform ${
                        isHelpfulActive ? 'fill-brand-600 text-brand-600 scale-110' : ''
                      }`}
                    />
                    <span>
                      Helpful ({typeof rev.helpfulVotes === 'number' ? rev.helpfulVotes : 0})
                    </span>
                  </motion.button>

                  <span className="text-[11px] text-gray-400">
                    {rev.helpfulVotes > 0
                      ? `${rev.helpfulVotes} person${rev.helpfulVotes === 1 ? '' : 's'} found this helpful`
                      : 'Was this review helpful?'}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Review Submission Modal Dialog with Image Upload */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative z-10 max-h-[92vh] overflow-y-auto my-auto"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Write a Review</h3>
                <p className="text-xs text-gray-500 mt-1">Share your feedback & photos to help other buyers</p>
              </div>

              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </motion.div>
              )}

              {formSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Overall Rating */}
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

                {/* Review Headline */}
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Review Description */}
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Review Photos Upload Dropzone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Attach Photos (Optional)
                    </label>
                    <span className="text-[11px] text-gray-400">
                      {reviewImages.length}/4 uploaded
                    </span>
                  </div>

                  {/* Thumbnail Previews */}
                  {reviewImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {reviewImages.map((img, idx) => (
                        <div
                          key={img.public_id || idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-2xs"
                        >
                          <img
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button / dropzone */}
                  {reviewImages.length < 4 && (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImages}
                        className="w-full py-3 px-4 border-2 border-dashed border-gray-200 hover:border-brand-500 rounded-xl bg-gray-50 hover:bg-brand-50/30 flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-brand-600 transition-all disabled:opacity-50"
                      >
                        {isUploadingImages ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                            <span>Uploading photos...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 text-brand-500" />
                            <span>Add product photos (JPG, PNG up to 5MB)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isSubmitting || isUploadingImages}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Review
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Review Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxData && lightboxData.images.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxData(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 max-w-4xl w-full flex flex-col items-center"
            >
              {/* Top controls: counter and close button */}
              <div className="w-full flex items-center justify-between text-white pb-3 px-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="bg-white/20 px-2.5 py-1 rounded-full">
                    {lightboxData.currentIndex + 1} / {lightboxData.images.length}
                  </span>
                  <span>Photo by {lightboxData.reviewerName}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxData(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                  aria-label="Close photo viewer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Photo with navigation arrows */}
              <div className="relative w-full flex items-center justify-center group">
                {lightboxData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxData((prev) => ({
                        ...prev,
                        currentIndex:
                          (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                      }));
                    }}
                    className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all z-20 shadow-lg"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}

                <img
                  src={lightboxData.images[lightboxData.currentIndex]?.url}
                  alt={`Enlarged review photo ${lightboxData.currentIndex + 1}`}
                  className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl select-none"
                />

                {lightboxData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxData((prev) => ({
                        ...prev,
                        currentIndex: (prev.currentIndex + 1) % prev.images.length
                      }));
                    }}
                    className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all z-20 shadow-lg"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>

              {/* Bottom caption / star rating */}
              <div className="w-full mt-3 p-3 bg-white/10 backdrop-blur-md rounded-xl text-white flex items-center justify-between text-xs px-4">
                <div className="flex items-center gap-2">
                  <RatingStars rating={lightboxData.rating} size="w-3.5 h-3.5" />
                  {lightboxData.title && (
                    <span className="font-semibold truncate max-w-[280px] sm:max-w-md">
                      "{lightboxData.title}"
                    </span>
                  )}
                </div>

                {lightboxData.images.length > 1 && (
                  <div className="flex gap-1.5">
                    {lightboxData.images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setLightboxData((prev) => ({ ...prev, currentIndex: i }))
                        }
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === lightboxData.currentIndex
                            ? 'bg-brand-500 scale-125'
                            : 'bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Jump to photo ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
