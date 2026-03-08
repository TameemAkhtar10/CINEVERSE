import React, { useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { addFavorite, removeFavorite } from '../redux/slices/favoritesSlice'
import { addToWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice'
import { IMG } from '../api/tmdb'
import { formatRating } from '../utils/helpers'
import StarRating from './StarRating'

const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adv.',
    10765: 'Sci-Fi & Fantasy', 10768: 'War & Politics',
}

const MovieCard = React.memo(function MovieCard({ item, mediaType, progress, isTrending, isHiddenGem, staggerIndex = 0 }) {
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

    // Stable match % seeded from movie id — shows only when authenticated
    const matchPct = useMemo(() => {
        if (!isAuthenticated || !item?.vote_average) return null
        const seed = (id || 0) % 28
        return Math.min(98, Math.round(item.vote_average * 9.1 + seed / 10))
    }, [isAuthenticated, id, item?.vote_average])

    const firstGenre = item?.genre_ids?.[0] ? GENRE_MAP[item.genre_ids[0]] : null

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
            data-cursor="play"
            className="relative flex-shrink-0 w-[175px] rounded-2xl overflow-hidden bg-card border border-white/[0.06] hover:border-indigo-500/40 group transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_0_28px_rgba(99,102,241,0.35)]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ willChange: 'transform', transformStyle: 'preserve-3d', animationDelay: `${staggerIndex * 75}ms` }}
        >
            {/* Popularity pulse ring for trending */}
            {isTrending && (
                <span className="absolute inset-0 rounded-2xl pointer-events-none z-30 pulse-ring" />
            )}
            {/* Hidden Gem badge */}
            {isHiddenGem && (
                <div className="absolute top-2 left-2 z-20 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    💎 Hidden Gem
                </div>
            )}
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
            <div className="w-full bg-card overflow-hidden relative" style={{ aspectRatio: '2/3', height: '262px' }}>
                {/* Grain texture overlay */}
                <div className="grain-overlay absolute inset-0 pointer-events-none z-[5] opacity-[0.04] mix-blend-overlay" />
                {poster ? (
                    <img
                        src={poster}
                        alt={title}
                        width={175}
                        height={262}
                        className="w-full h-full object-cover transition-[filter,transform] duration-500 blur-sm group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
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
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-indigo-glow">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Rating badge — amber/gold */}
                <div className="absolute top-2 right-2 z-10 bg-amber-500 text-[#030712] text-[11px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                    <svg className="w-3 h-3 fill-[#030712]" viewBox="0 0 20 20">
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
                                className={`w-4 h-4 ${isFav ? 'text-indigo-400 fill-indigo-400' : 'text-white'}`}
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

                {/* Genre pill */}
                {firstGenre && (
                    <div className="absolute bottom-2 left-2 z-10">
                        <span className="bg-indigo-500/75 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-[2px] rounded-full">
                            {firstGenre}
                        </span>
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
                    {matchPct && (
                        <span className="text-[10px] font-bold text-emerald-400">⭗ {matchPct}%</span>
                    )}
                </div>
                <div className="mt-1.5">
                    <StarRating movieId={id} title={title} poster={item?.poster_path || ''} mediaType={type} size="sm" />
                </div>
            </div>
        </Link>
    )
})

export default MovieCard
