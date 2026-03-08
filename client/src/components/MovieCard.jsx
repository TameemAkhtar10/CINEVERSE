import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { addFavorite, removeFavorite } from '../redux/slices/favoritesSlice'
import { addToWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice'
import { IMG } from '../api/tmdb'
import { formatRating } from '../utils/helpers'
import StarRating from './StarRating'

export default function MovieCard({ item, mediaType, progress }) {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const cardRef = useRef(null)
    const glareRef = useRef(null)
    const [glareStyle, setGlareStyle] = useState({ opacity: 0, left: '50%', top: '50%' })

    const handleMouseMove = (e) => {
        const card = cardRef.current
        if (!card) return
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const cx = rect.width / 2
        const cy = rect.height / 2
        const rotateY = ((x - cx) / cx) * 12
        const rotateX = -((y - cy) / cy) * 12
        gsap.to(card, {
            rotateX,
            rotateY,
            scale: 1.06,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: true,
            transformPerspective: 800,
        })
        // Move glare
        const glareX = (x / rect.width) * 100
        const glareY = (y / rect.height) * 100
        setGlareStyle({ opacity: 0.18, left: `${glareX}%`, top: `${glareY}%` })
    }

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: true,
        })
        setGlareStyle((s) => ({ ...s, opacity: 0 }))
    }
    const favorites = useSelector((s) => s.favorites.items)
    const watchlist = useSelector((s) => s.watchlist.items)

    const id = item?.id
    const type = mediaType || item?.media_type || 'movie'
    const title = item?.title || item?.name || 'Untitled'
    const year = (item?.release_date || item?.first_air_date || '').slice(0, 4)
    const rating = formatRating(item?.vote_average)
    const poster = IMG(item?.poster_path, 'w342')

    const isFav = favorites.some((f) => f.movieId === id)
    const isBookmarked = watchlist.some((w) => w.movieId === id)

    const toggleFav = (e) => {
        e.preventDefault()
        if (!isAuthenticated) return
        if (isFav) {
            dispatch(removeFavorite(id))
        } else {
            dispatch(addFavorite({ movieId: id, title, poster: item?.poster_path || '', mediaType: type, rating: item?.vote_average, year }))
        }
    }

    const toggleBookmark = (e) => {
        e.preventDefault()
        if (!isAuthenticated) return
        if (isBookmarked) {
            dispatch(removeFromWatchlist(id))
        } else {
            dispatch(addToWatchlist({ movieId: id, title, poster: item?.poster_path || '', mediaType: type, rating: item?.vote_average, year }))
        }
    }

    return (
        <Link
            ref={cardRef}
            to={`/${type === 'tv' ? 'tv' : 'movie'}/${id}`}
            className="relative flex-shrink-0 w-[175px] rounded-xl overflow-hidden bg-card border border-white/[0.06] group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
        >
            {/* Glare overlay */}
            <div
                ref={glareRef}
                style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    zIndex: 20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%)',
                    left: glareStyle.left,
                    top: glareStyle.top,
                    opacity: glareStyle.opacity,
                    transition: 'opacity 0.3s',
                }}
            />
            <div className="w-full h-[262px] bg-card overflow-hidden relative">
                {poster ? (
                    <img
                        src={poster}
                        alt={title}
                        className="w-full h-full object-cover transition-[filter,transform] duration-500 blur-sm group-hover:scale-105"
                        loading="lazy"
                        onLoad={(e) => e.currentTarget.classList.remove('blur-sm')}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-card">
                        <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM8 17l-2-2 2-2 2 2-2 2zm7-1H9v-2h6v2zm1-4H8V8h8v4z" />
                        </svg>
                    </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-red-glow">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Rating badge */}
                <div className="absolute top-2 right-2 bg-accent/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                    </svg>
                    {rating}
                </div>

                {isAuthenticated && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {/* Favorite button */}
                        <button
                            onClick={toggleFav}
                            className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <svg
                                className={`w-4 h-4 ${isFav ? 'text-red-400 fill-red-400' : 'text-white'}`}
                                fill={isFav ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                            </svg>
                        </button>
                        {/* Bookmark / Watchlist button */}
                        <button
                            onClick={toggleBookmark}
                            className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                            title={isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
                        >
                            <svg
                                className={`w-4 h-4 ${isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
                                fill={isBookmarked ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Watch progress bar */}
                {progress != null && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-accent transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                )}
            </div>

            <div className="p-2.5">
                <p className="text-text-primary font-semibold text-sm leading-tight truncate">{title}</p>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-text-secondary text-xs">{year || '—'}</p>
                </div>
                <div className="mt-1.5">
                    <StarRating movieId={id} title={title} poster={item?.poster_path || ''} mediaType={type} size="sm" />
                </div>
            </div>
        </Link>
    )
}
