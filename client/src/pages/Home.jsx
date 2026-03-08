import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFavorites } from '../redux/slices/favoritesSlice'
import { fetchHistory } from '../redux/slices/historySlice'
import { getTrending, getPopularMovies, getPopularTV, getTopRated, getNowPlaying, getMovieGenres, getMoviesByGenre } from '../api/tmdb'
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

    const [activeGenre, setActiveGenre] = useState(null)
    const [genreMovies, setGenreMovies] = useState([])
    const [genreLoading, setGenreLoading] = useState(false)

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
            } catch {
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleGenreClick = async (genre) => {
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
    }

    return (
        <div className="min-h-screen bg-bg">
            {hero && <HeroSection movie={hero} />}
            {!hero && loading && <div className="w-full h-[560px] bg-card animate-pulse" />}

            <div className="pt-4">
                {/* Genre chips */}
                <div className="px-4 md:px-6 py-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <button
                            onClick={() => { setActiveGenre(null); setGenreMovies([]) }}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${!activeGenre ? 'bg-accent border-accent text-white' : 'border-white/20 text-text-secondary hover:border-accent hover:text-accent'}`}
                        >
                            All
                        </button>
                        {QUICK_GENRES.map((g) => (
                            <button
                                key={g.id}
                                onClick={() => handleGenreClick(g)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeGenre?.id === g.id ? 'bg-accent border-accent text-white' : 'border-white/20 text-text-secondary hover:border-accent hover:text-accent'}`}
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

                <ScrollRow title="Trending Now" items={trending} loading={loading} />
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
        </div>
    )
}
