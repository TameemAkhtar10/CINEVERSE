import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { openTrailer } from '../redux/slices/uiSlice'
import { addFavorite, removeFavorite } from '../redux/slices/favoritesSlice'
import { getMovieTrailer, IMG } from '../api/tmdb'
import { getTrailerKey, getGenreNames, truncate, formatRating } from '../utils/helpers'
import TrailerModal from './TrailerModal'
import ParticleField from './ParticleField'
import HeroModel from './HeroModel'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection({ movie }) {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const favorites = useSelector((s) => s.favorites.items)
    const trailerOpen = useSelector((s) => s.ui.trailerOpen)
    const [trailerKey, setTrailerKey] = useState(null)

    const heroRef = useRef(null)
    const backdropRef = useRef(null)
    const metaRef = useRef(null)
    const titleRef = useRef(null)
    const descRef = useRef(null)
    const btnRef = useRef(null)

    // quickTo for mouse parallax
    const quickTiltX = useRef(null)
    const quickTiltY = useRef(null)

    useEffect(() => {
        if (!movie?.id) return
        getMovieTrailer(movie.id)
            .then((res) => setTrailerKey(getTrailerKey(res.data)))
            .catch(() => setTrailerKey(null))
    }, [movie?.id])

    useEffect(() => {
        if (!movie || !heroRef.current) return
        const ctx = gsap.context(() => {
            const words = titleRef.current?.querySelectorAll('.hero-word') || []
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            tl.from(metaRef.current, { y: 24, opacity: 0, duration: 0.6 })
              .from(words, { y: 50, opacity: 0, duration: 0.65, stagger: 0.07 }, '-=0.3')
              .from(descRef.current, { y: 20, opacity: 0, duration: 0.55 }, '-=0.4')
              .from(btnRef.current ? Array.from(btnRef.current.children) : [], { y: 20, opacity: 0, duration: 0.45, stagger: 0.1 }, '-=0.3')
        }, heroRef)
        return () => ctx.revert()
    }, [movie])

    // Scroll parallax zoom on backdrop
    useEffect(() => {
        if (!backdropRef.current || !heroRef.current) return
        const st = ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
                const progress = self.progress
                gsap.set(backdropRef.current, { scale: 1 + progress * 0.12 })
            },
        })
        return () => st.kill()
    }, [movie])

    // Mouse parallax tilt setup
    useEffect(() => {
        if (!backdropRef.current) return
        quickTiltX.current = gsap.quickTo(backdropRef.current, 'x', { duration: 0.6, ease: 'power2.out' })
        quickTiltY.current = gsap.quickTo(backdropRef.current, 'y', { duration: 0.6, ease: 'power2.out' })
        return () => {
            quickTiltX.current = null
            quickTiltY.current = null
        }
    }, [movie])

    if (!movie) return null

    const backdrop = IMG(movie.backdrop_path, 'original')
    const title = movie.title || movie.name || 'Untitled'
    const year = (movie.release_date || movie.first_air_date || '').slice(0, 4)
    const rating = formatRating(movie.vote_average)
    const genres = getGenreNames(movie.genres || [])
    const desc = truncate(movie.overview, 200)
    const isFav = favorites.some((f) => f.movieId === movie.id)

    const handleFav = () => {
        if (!isAuthenticated) return
        if (isFav) {
            dispatch(removeFavorite(movie.id))
        } else {
            dispatch(addFavorite({
                movieId: movie.id,
                title,
                poster: movie.poster_path || '',
                mediaType: 'movie',
                rating: movie.vote_average,
                year,
            }))
        }
    }

    const handleHeroMouseMove = (e) => {
        if (!heroRef.current || !quickTiltX.current) return
        const rect = heroRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        quickTiltX.current(x * 0.02)
        quickTiltY.current(y * 0.02)
    }

    const handleHeroMouseLeave = () => {
        if (!backdropRef.current) return
        gsap.to(backdropRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' })
    }

    return (
        <>
            <div
                ref={heroRef}
                className="relative w-full h-[560px] overflow-hidden"
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
            >
                {/* Backdrop image — will receive parallax transforms */}
                {backdrop && (
                    <img
                        ref={backdropRef}
                        src={backdrop}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ willChange: 'transform', transformOrigin: 'center center' }}
                        draggable={false}
                    />
                )}
                <ParticleField />
                <HeroModel />
                <div className="absolute inset-0 bg-hero-gradient" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />

                <div className="relative z-10 h-full flex items-end pb-16 px-6 md:px-16 max-w-3xl">
                    <div className="space-y-4">
                        <div ref={metaRef} className="flex items-center gap-3 text-sm text-text-secondary font-medium">
                            <span className="bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-full text-xs font-semibold">Trending</span>
                            {year && <span>{year}</span>}
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                                </svg>
                                {rating}
                            </span>
                            {genres && <span className="text-accent font-semibold">{genres}</span>}
                        </div>

                        <h1 ref={titleRef} className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                            {title.split(' ').map((word, i) => (
                                <span key={i} className="hero-word inline-block mr-[0.25em]">{word}</span>
                            ))}
                        </h1>
                        <p ref={descRef} className="text-text-secondary text-sm md:text-base leading-relaxed max-w-xl">{desc}</p>

                        <div ref={btnRef} className="flex items-center gap-4 pt-2">
                            <button
                                onClick={(e) => {
                                    dispatch(openTrailer(trailerKey))
                                    // Ripple effect
                                    const btn = e.currentTarget
                                    const rect = btn.getBoundingClientRect()
                                    const ripple = document.createElement('span')
                                    const size = Math.max(rect.width, rect.height)
                                    ripple.style.cssText = `
                                        position:absolute;
                                        border-radius:50%;
                                        transform:scale(0);
                                        pointer-events:none;
                                        background:rgba(255,255,255,0.35);
                                        width:${size}px;height:${size}px;
                                        left:${e.clientX - rect.left - size / 2}px;
                                        top:${e.clientY - rect.top - size / 2}px;
                                        animation:ripple-expand 0.55s ease-out forwards;
                                    `
                                    btn.appendChild(ripple)
                                    setTimeout(() => ripple.remove(), 600)
                                }}
                                className="relative overflow-hidden flex items-center gap-2 bg-accent hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-red-sm hover:shadow-red-glow"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Play Trailer
                            </button>
                            {isAuthenticated && (
                                <button
                                    onClick={handleFav}
                                    className={`flex items-center gap-2 border font-semibold px-6 py-3 rounded-full transition-all duration-200 ${isFav
                                            ? 'border-accent text-accent bg-accent/10'
                                            : 'border-white/40 text-white hover:border-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                                    </svg>
                                    {isFav ? 'Saved' : 'Add to Favorites'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {trailerOpen && <TrailerModal trailerKey={trailerKey} />}
        </>
    )
}
