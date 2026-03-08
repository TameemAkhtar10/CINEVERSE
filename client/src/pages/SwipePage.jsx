import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { getTrending } from '../api/tmdb'
import { IMG } from '../api/tmdb'
import { addToWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice'
import Footer from '../components/Footer'

const THRESHOLD = 90

export default function SwipePage() {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const watchlist = useSelector((s) => s.watchlist.items)

    const [cards, setCards] = useState([])
    const [current, setCurrent] = useState(0)
    const [loading, setLoading] = useState(true)
    const [action, setAction] = useState(null) // 'add' | 'skip'
    const [stats, setStats] = useState({ added: 0, skipped: 0 })

    const cardRef = useRef(null)
    const dragState = useRef({ active: false, startX: 0, startY: 0, x: 0 })

    useEffect(() => {
        getTrending('movie', 'week').then((res) => {
            setCards(res.data.results || [])
        }).finally(() => setLoading(false))
    }, [])

    const animateOut = (dir) => {
        const el = cardRef.current
        if (!el) return
        gsap.to(el, {
            x: dir * window.innerWidth * 0.8,
            rotation: dir * 25,
            opacity: 0,
            duration: 0.38,
            ease: 'power2.in',
            onComplete: () => {
                setCurrent((c) => c + 1)
                setAction(null)
                gsap.set(el, { x: 0, y: 0, rotation: 0, opacity: 1 })
            },
        })
    }

    const handleAdd = () => {
        const movie = cards[current]
        if (!movie) return
        if (isAuthenticated && !watchlist.some((w) => w.movieId === movie.id)) {
            dispatch(addToWatchlist({ movieId: movie.id, title: movie.title || movie.name, poster: movie.poster_path || '', mediaType: movie.media_type || 'movie', rating: movie.vote_average, year: (movie.release_date || movie.first_air_date || '').slice(0, 4) }))
        }
        setStats((s) => ({ ...s, added: s.added + 1 }))
        animateOut(1)
    }

    const handleSkip = () => {
        setStats((s) => ({ ...s, skipped: s.skipped + 1 }))
        animateOut(-1)
    }

    // Pointer drag
    const onPointerDown = (e) => {
        dragState.current = { active: true, startX: e.clientX, startY: e.clientY, x: 0 }
        cardRef.current?.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e) => {
        if (!dragState.current.active) return
        const dx = e.clientX - dragState.current.startX
        const dy = (e.clientY - dragState.current.startY) * 0.25
        dragState.current.x = dx
        gsap.set(cardRef.current, { x: dx, y: dy, rotation: dx * 0.06, overwrite: true })
        if (dx > THRESHOLD) setAction('add')
        else if (dx < -THRESHOLD) setAction('skip')
        else setAction(null)
    }

    const onPointerUp = () => {
        if (!dragState.current.active) return
        dragState.current.active = false
        const dx = dragState.current.x
        if (dx > THRESHOLD) handleAdd()
        else if (dx < -THRESHOLD) handleSkip()
        else {
            gsap.to(cardRef.current, { x: 0, y: 0, rotation: 0, duration: 0.45, ease: 'elastic.out(1, 0.5)' })
            setAction(null)
        }
    }

    const movie = cards[current]
    const poster = movie ? IMG(movie.poster_path, 'w500') : null
    const nextMovie = cards[current + 1]

    if (loading) return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-bg pt-16 pb-10 flex flex-col">
            <div className="text-center pt-6 pb-4">
                <h1 className="text-3xl font-black text-white mb-1">🃏 Swipe to Discover</h1>
                <p className="text-sm text-slate-400">Swipe right to add to watchlist · Swipe left to skip</p>
                <div className="flex gap-6 justify-center mt-3 text-sm">
                    <span className="text-emerald-400 font-semibold">✓ {stats.added} added</span>
                    <span className="text-slate-500 font-semibold">✗ {stats.skipped} skipped</span>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative select-none">
                {/* Background card (next movie preview) */}
                {nextMovie && (
                    <div className="absolute w-64 md:w-72 rounded-2xl overflow-hidden opacity-30 scale-95 -z-0">
                        <img src={IMG(nextMovie.poster_path, 'w342')} alt="" className="w-full h-[380px] object-cover" draggable={false} />
                    </div>
                )}

                {movie ? (
                    <div
                        ref={cardRef}
                        className="relative w-72 md:w-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing z-10"
                        style={{ touchAction: 'none', willChange: 'transform' }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                    >
                        {/* Action indicators */}
                        {action === 'add' && (
                            <div className="absolute top-4 left-4 z-20 bg-emerald-500 text-white font-black text-lg px-4 py-1.5 rounded-xl border-2 border-emerald-300 rotate-[-8deg] shadow-lg">
                                + WATCHLIST
                            </div>
                        )}
                        {action === 'skip' && (
                            <div className="absolute top-4 right-4 z-20 bg-red-500 text-white font-black text-lg px-4 py-1.5 rounded-xl border-2 border-red-300 rotate-[8deg] shadow-lg">
                                SKIP ✗
                            </div>
                        )}

                        <img src={poster} alt={movie.title || movie.name} className="w-full h-[420px] object-cover" draggable={false} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h3 className="text-xl font-bold text-white">{movie.title || movie.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-amber-400 text-sm font-bold">★ {movie.vote_average?.toFixed(1)}</span>
                                <span className="text-slate-400 text-xs">· {(movie.release_date || movie.first_air_date || '').slice(0, 4)}</span>
                            </div>
                            {movie.overview && <p className="text-xs text-slate-300 mt-2 line-clamp-2">{movie.overview}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4 py-20">
                        <div className="text-5xl">🎉</div>
                        <h3 className="text-xl font-bold text-white">All caught up!</h3>
                        <p className="text-slate-400">You've seen all the trending movies</p>
                        <button onClick={() => { setCurrent(0); setStats({ added: 0, skipped: 0 }) }} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors">
                            Start Over
                        </button>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            {movie && (
                <div className="flex justify-center gap-6 py-4">
                    <button onClick={handleSkip} className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 text-xl flex items-center justify-center hover:bg-red-500/20 transition-colors shadow-lg active:scale-90">
                        ✗
                    </button>
                    <button onClick={handleAdd} className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xl flex items-center justify-center hover:bg-emerald-500/20 transition-colors shadow-lg active:scale-90">
                        ✓
                    </button>
                </div>
            )}

            {!isAuthenticated && (
                <p className="text-center text-xs text-slate-500 pb-3">
                    <a href="/login" className="text-indigo-400 hover:underline">Log in</a> to save to watchlist
                </p>
            )}
            <Footer />
        </div>
    )
}
