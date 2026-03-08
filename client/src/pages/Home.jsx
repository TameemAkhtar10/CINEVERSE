import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollAnimation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFavorites } from '../redux/slices/favoritesSlice'
import { fetchHistory } from '../redux/slices/historySlice'
import { getTrending, getPopularMovies, getPopularTV, getTopRated, getNowPlaying, getMovieGenres, getMoviesByGenre, getHiddenGems } from '../api/tmdb'
import HeroSection from '../components/HeroSection'
import ScrollRow from '../components/ScrollRow'
import TrailerModal from '../components/TrailerModal'
import MovieCard from '../components/MovieCard'
import Footer from '../components/Footer'

const QUICK_GENRES = [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 27, name: 'Horror' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 18, name: 'Drama' },
    { id: 16, name: 'Animation' },
    { id: 53, name: 'Thriller' },
    { id: 12, name: 'Adventure' },
    { id: 14, name: 'Fantasy' },
]

const MOOD_FILTERS = [
    { key: 'happy', icon: '😊', label: 'Happy', genres: [35, 16, 10751], color: 'from-yellow-500 to-orange-400' },
    { key: 'sad', icon: '😢', label: 'Sad', genres: [18, 10749], color: 'from-blue-600 to-blue-800' },
    { key: 'thriller', icon: '😱', label: 'Thriller', genres: [53, 27, 80], color: 'from-rose-600 to-red-800' },
    { key: 'romantic', icon: '💗', label: 'Romantic', genres: [10749, 18], color: 'from-pink-500 to-rose-600' },
    { key: 'adventure', icon: '🌟', label: 'Adventure', genres: [12, 28, 14], color: 'from-indigo-500 to-violet-600' },
]

export default function Home() {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const trailerOpen = useSelector((s) => s.ui.trailerOpen)
    const trailerKey = useSelector((s) => s.ui.trailerKey)
    const historyItems = useSelector((s) => s.history.items)
    const watchProgress = useSelector((s) => s.watchProgress.progress)

    const [hero, setHero] = useState(null)
    const [trending, setTrending] = useState([])
    const [popular, setPopular] = useState([])
    const [tv, setTv] = useState([])
    const [topRated, setTopRated] = useState([])
    const [nowPlaying, setNowPlaying] = useState([])
    const [loading, setLoading] = useState(true)
    const [hiddenGems, setHiddenGems] = useState([])
    const [surpriseSpinning, setSurpriseSpinning] = useState(false)

    const [activeGenre, setActiveGenre] = useState(null)
    const [genreMovies, setGenreMovies] = useState([])
    const [genreLoading, setGenreLoading] = useState(false)

    const [activeMood, setActiveMood] = useState(null)
    const [moodMovies, setMoodMovies] = useState([])
    const [moodLoading, setMoodLoading] = useState(false)

    const [pickerSpinning, setPickerSpinning] = useState(false)
    const navigate = useNavigate()

    // Scroll reveal refs
    const moodTitleRef = useScrollReveal({ from: { opacity: 0, x: -28 }, to: { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' } })
    const moodBtnsRef = useStaggerReveal()
    const genreTitleRef = useScrollReveal({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' } })
    const genreChipsRef = useStaggerReveal({ from: { opacity: 0, scale: 0.85, y: 12 }, to: { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)', stagger: 0.045 } })

    const handleRandomPick = useCallback(() => {
        const pool = [...trending, ...popular].filter(Boolean)
        if (!pool.length) return
        setSurpriseSpinning(true)
        setTimeout(() => {
            const pick = pool[Math.floor(Math.random() * pool.length)]
            setSurpriseSpinning(false)
            navigate(`/${pick.media_type === 'tv' ? 'tv' : 'movie'}/${pick.id}`)
        }, 1200)
    }, [trending, popular, navigate])

    // Continue watching: history items that have watch progress
    const continueWatching = Object.values(watchProgress)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 12)

    // Recently watched: last 12 history items
    const recentlyWatched = historyItems.slice(0, 12)

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchFavorites())
            dispatch(fetchHistory())
        }
    }, [isAuthenticated, dispatch])

    useEffect(() => {
        const load = async () => {
            try {
                const [t, p, tvRes, tr, np] = await Promise.all([
                    getTrending('all', 'week'),
                    getPopularMovies(),
                    getPopularTV(),
                    getTopRated(),
                    getNowPlaying(),
                ])
                const results = t.data.results || []
                setHero(results[Math.floor(Math.random() * Math.min(results.length, 5))] || null)
                setTrending(results)
                setPopular(p.data.results || [])
                setTv(tvRes.data.results || [])
                setTopRated(tr.data.results || [])
                setNowPlaying(np.data.results || [])
                // load hidden gems separately to not block hero
                getHiddenGems().then((r) => setHiddenGems(r.data.results || [])).catch(() => { })
            } catch {
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleGenreClick = useCallback(async (genre) => {
        if (activeGenre?.id === genre.id) {
            setActiveGenre(null)
            setGenreMovies([])
            return
        }
        setActiveGenre(genre)
        setGenreLoading(true)
        try {
            const res = await getMoviesByGenre(genre.id)
            setGenreMovies(res.data.results || [])
        } catch {
        } finally {
            setGenreLoading(false)
        }
    }, [activeGenre])

    const handleMoodClick = useCallback(async (mood) => {
        if (activeMood?.key === mood.key) {
            setActiveMood(null)
            setMoodMovies([])
            return
        }
        setActiveMood(mood)
        setMoodLoading(true)
        try {
            const res = await getMoviesByGenre(mood.genres[0])
            setMoodMovies(res.data.results || [])
        } catch {
        } finally {
            setMoodLoading(false)
        }
    }, [activeMood])

    return (
        <div className="min-h-screen bg-bg">
            {hero && <HeroSection movie={hero} />}
            {!hero && loading && <div className="w-full h-[560px] bg-card animate-pulse" />}

            <div className="pt-4">
                {/* ── Mood Filter ─────────────────────────────── */}
                <div className="px-4 md:px-6 py-6">
                    <h2 ref={moodTitleRef} className="text-text-primary font-bold text-xl mb-4">What's your mood?</h2>
                    <div ref={moodBtnsRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                        {MOOD_FILTERS.map((mood) => (
                            <button
                                key={mood.key}
                                onClick={() => handleMoodClick(mood)}
                                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 border ${activeMood?.key === mood.key
                                    ? `bg-gradient-to-r ${mood.color} border-transparent text-white shadow-lg scale-[1.04]`
                                    : 'bg-card border-white/10 text-text-secondary hover:border-indigo-500/40 hover:text-slate-200'
                                    }`}
                            >
                                <span className="text-lg">{mood.icon}</span>
                                {mood.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mood-filtered results */}
                {activeMood && (
                    <ScrollRow
                        title={`${activeMood.icon} ${activeMood.label} Picks`}
                        items={moodMovies}
                        loading={moodLoading}
                        mediaType="movie"
                    />
                )}

                {/* ── Genre Chips ────────────────────────────── */}
                <div className="px-4 md:px-6 py-4">
                    <div ref={genreChipsRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <button
                            onClick={() => { setActiveGenre(null); setGenreMovies([]) }}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${!activeGenre ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20 text-text-secondary hover:border-indigo-500/50 hover:text-indigo-300'}`}
                        >
                            All
                        </button>
                        {QUICK_GENRES.map((g) => (
                            <button
                                key={g.id}
                                onClick={() => handleGenreClick(g)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeGenre?.id === g.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20 text-text-secondary hover:border-indigo-500/50 hover:text-indigo-300'}`}
                            >
                                {g.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Genre-filtered results */}
                {activeGenre && (
                    <ScrollRow
                        title={`Top ${activeGenre.name} Movies`}
                        items={genreMovies}
                        loading={genreLoading}
                        mediaType="movie"
                    />
                )}

                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                    <div className="py-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4 px-4 md:px-6">
                            <h2 className="text-text-primary font-bold text-xl">Continue Watching</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2">
                            {continueWatching.map((item) => (
                                <MovieCard
                                    key={item.movieId}
                                    item={{
                                        id: item.movieId,
                                        title: item.title,
                                        poster_path: item.poster,
                                        release_date: item.year ? `${item.year}-01-01` : '',
                                        first_air_date: item.year ? `${item.year}-01-01` : '',
                                    }}
                                    mediaType={item.mediaType}
                                    progress={item.progress}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <ScrollRow title="⚡ Trending Now" items={trending} loading={loading} isTrending />
                {hiddenGems.length > 0 && (
                    <ScrollRow title="💎 Hidden Gems" items={hiddenGems} loading={false} mediaType="movie" isHiddenGem />
                )}
                <ScrollRow title="Popular Movies" items={popular} loading={loading} mediaType="movie" />
                <ScrollRow title="Popular TV Shows" items={tv} loading={loading} mediaType="tv" />
                <ScrollRow title="Top Rated Movies" items={topRated} loading={loading} mediaType="movie" />
                <ScrollRow title="Now Playing" items={nowPlaying} loading={loading} mediaType="movie" />

                {/* Recently Watched */}
                {isAuthenticated && recentlyWatched.length > 0 && (
                    <div className="py-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4 px-4 md:px-6">
                            <h2 className="text-text-primary font-bold text-xl">Recently Watched</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2">
                            {recentlyWatched.map((item) => (
                                <MovieCard
                                    key={item._id}
                                    item={{
                                        id: item.movieId,
                                        title: item.title,
                                        poster_path: item.poster,
                                        vote_average: item.rating,
                                        release_date: item.year ? `${item.year}-01-01` : '',
                                        first_air_date: item.year ? `${item.year}-01-01` : '',
                                    }}
                                    mediaType={item.mediaType}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {trailerOpen && <TrailerModal trailerKey={trailerKey} />}
            <Footer />

            {/* ── Surprise Me floating button ───────────────── */}
            <button
                onClick={handleRandomPick}
                disabled={surpriseSpinning || loading}
                title="Surprise Me!"
                className="fixed bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:shadow-[0_0_32px_rgba(99,102,241,0.85)] transition-all disabled:opacity-60 disabled:cursor-not-allowed animate-[pulse_2.5s_ease-in-out_infinite]"
                style={{ boxShadow: '0 0 20px rgba(99,102,241,0.6), 0 4px 16px rgba(0,0,0,0.4)' }}
            >
                {surpriseSpinning ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2zm4-8h2v2H9V5zm0 4h2v2H9V9zm0 4h2v2H9v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z" />
                    </svg>
                )}
            </button>
        </div>
    )
}
