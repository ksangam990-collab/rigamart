import React from 'react';
import { Star } from 'lucide-react';

/**
 * Reusable Star Rating Component
 * @param {number} rating - Current numerical rating (e.g. 4.3)
 * @param {number} maxStars - Total stars to display (default: 5)
 * @param {boolean} interactive - Whether stars can be clicked to set rating
 * @param {function} onRatingChange - Callback when a star is clicked in interactive mode
 * @param {string} size - Size class for stars (e.g. 'w-4 h-4')
 */
export default function RatingStars({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  size = 'w-4 h-4'
}) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= Math.round(rating);

    stars.push(
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        disabled={!interactive}
        onClick={() => interactive && onRatingChange && onRatingChange(i)}
        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5 focus:outline-none`}
        aria-label={`${i} Star`}
      >
        <Star
          className={`${size} ${
            isFilled
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-300'
          } transition-colors`}
        />
      </button>
    );
  }

  return <div className="inline-flex items-center gap-0.5">{stars}</div>;
}
