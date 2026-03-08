import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { submitRating, deleteRating } from '../redux/slices/ratingsSlice'

export default function StarRating({ movieId, title, poster, mediaType, size = 'md' }) {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const ratings = useSelector((s) => s.ratings.items)
    const existing = ratings.find((r) => r.movieId === movieId)
    const [hover, setHover] = useState(0)

    if (!isAuthenticated) return null

    const current = existing?.rating || 0
    const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

    const handleRate = (val) => {
        if (current === val) {
            dispatch(deleteRating(movieId))
        } else {
            dispatch(submitRating({ movieId, rating: val, title, poster, mediaType }))
        }
    }

    return (
        <div className="flex items-center gap-0.5" onClick={(e) => e.preventDefault()}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRate(star) }}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                >
                    <svg
                        className={`${starSize} transition-colors ${(hover || current) >= star ? 'text-yellow-400' : 'text-white/20'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            {current > 0 && (
                <span className="text-xs text-yellow-400 ml-1 font-semibold">{current}/5</span>
            )}
        </div>
    )
}
