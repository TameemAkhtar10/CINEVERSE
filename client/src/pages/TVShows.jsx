import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getPopularTV, getTVByGenre, getTVGenres } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import useInfiniteScroll from '../hooks/useInfiniteScroll'

export default function TVShows() {
    const [shows, setShows] = useState([])
    const [genres, setGenres] = useState([])
    const [selectedGenre, setSelectedGenre] = useState(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const currentGenre = useRef(null)
    const currentPage = useRef(1)

    useEffect(() => {
        getTVGenres()
            .then((res) => setGenres(res.data.genres || []))
            .catch(() => { })
    }, [])

    const fetchPage = useCallback(async (genre, pg) => {
        setLoading(true)
        setError(null)
        try {
            const res = genre
                ? await getTVByGenre(genre, pg)
                : await getPopularTV(pg)
            const results = res.data.results || []
            setShows((prev) => pg === 1 ? results : [...prev, ...results])
            setHasMore(pg < (res.data.total_pages || 1))
            currentPage.current = pg + 1
            setPage(pg + 1)
        } catch {
            setError('Failed to load TV shows.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        currentGenre.current = selectedGenre
        currentPage.current = 1
        setShows([])
        setPage(1)
        setHasMore(true)
        fetchPage(selectedGenre, 1)
    }, [selectedGenre, fetchPage])

    const loadMore = useCallback(() => {
        if (!hasMore || loading) return
        fetchPage(currentGenre.current, currentPage.current)
    }, [hasMore, loading, fetchPage])

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading)

    return (
        <div className="min-h-screen bg-bg pt-20 px-4 md:px-10 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white mb-6">TV Shows</h1>

            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setSelectedGenre(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${!selectedGenre ? 'bg-accent border-accent text-white' : 'border-white/20 text-text-secondary hover:border-accent hover:text-accent'
                        }`}
                >
                    All
                </button>
                {genres.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setSelectedGenre(g.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${selectedGenre === g.id ? 'bg-accent border-accent text-white' : 'border-white/20 text-text-secondary hover:border-accent hover:text-accent'
                            }`}
                    >
                        {g.name}
                    </button>
                ))}
            </div>

            {error && <p className="text-accent text-sm mb-4">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {shows.map((s) => <MovieCard key={s.id} item={s} mediaType="tv" />)}
                {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
            </div>

            <div ref={sentinelRef} className="h-8" />
        </div>
    )
}
