import React, { useState, useCallback } from 'react'
import { searchMovies, getMovieDetails, IMG } from '../api/tmdb'
import useDebounce from '../hooks/useDebounce'
import Footer from '../components/Footer'

const FIELDS = [
    { key: 'vote_average', label: 'Rating', format: (v) => v ? `⭐ ${v.toFixed(1)}` : '—', higher: true },
    { key: 'runtime', label: 'Runtime', format: (v) => v ? `${Math.floor(v / 60)}h ${v % 60}m` : '—', higher: true },
    { key: 'budget', label: 'Budget', format: (v) => v ? `$${(v / 1e6).toFixed(1)}M` : '—', higher: true },
    { key: 'revenue', label: 'Revenue', format: (v) => v ? `$${(v / 1e6).toFixed(1)}M` : '—', higher: true },
    { key: 'release_date', label: 'Release Date', format: (v) => v || '—', higher: false },
    { key: 'vote_count', label: 'Vote Count', format: (v) => v ? v.toLocaleString() : '—', higher: true },
    { key: 'popularity', label: 'Popularity', format: (v) => v ? v.toFixed(1) : '—', higher: true },
]

function MovieSearch({ side, onSelect }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const debouncedQuery = useDebounce(query, 400)

    React.useEffect(() => {
        if (!debouncedQuery.trim()) { setResults([]); return }
        setSearching(true)
        searchMovies(debouncedQuery)
            .then((r) => setResults(r.data.results?.slice(0, 6) || []))
            .catch(() => setResults([]))
            .finally(() => setSearching(false))
    }, [debouncedQuery])

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${side === 0 ? 'first' : 'second'} movie…`}
                className="w-full bg-bg border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-text-secondary/50 rounded-xl px-4 py-3 outline-none transition-colors text-sm"
            />
            {searching && (
                <div className="absolute right-3 top-3.5">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {results.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-white/[0.08] rounded-xl overflow-hidden z-30 shadow-2xl">
                    {results.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => { onSelect(r.id); setQuery(''); setResults([]) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left"
                        >
                            {r.poster_path
                                ? <img src={IMG(r.poster_path, 'w92')} alt={r.title} width={28} height={42} className="rounded-md flex-shrink-0" style={{ height: '42px', width: '28px', objectFit: 'cover' }} loading="lazy" decoding="async" />
                                : <div className="w-7 h-10 bg-bg rounded-md flex-shrink-0" />
                            }
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">{r.title}</p>
                                <p className="text-text-secondary text-xs">{(r.release_date || '').slice(0, 4) || '—'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function MoviePanel({ movie, loading }) {
    if (loading) return (
        <div className="flex-1 bg-card border border-white/[0.06] rounded-2xl p-6 animate-pulse min-h-[500px]">
            <div className="w-32 h-48 bg-bg rounded-xl mx-auto mb-4" />
            <div className="h-5 bg-bg rounded w-3/4 mx-auto mb-3" />
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-bg rounded-xl" />)}</div>
        </div>
    )
    if (!movie) return (
        <div className="flex-1 bg-card border border-dashed border-white/20 rounded-2xl p-8 flex items-center justify-center text-slate-500 min-h-[400px]">
            <div className="text-center space-y-2">
                <div className="text-5xl">🎬</div>
                <p className="text-sm">Search a movie above</p>
            </div>
        </div>
    )
    const poster = IMG(movie.poster_path, 'w342')
    return (
        <div className="flex-1 bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="relative h-52 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 overflow-hidden">
                {movie.backdrop_path
                    ? <img src={IMG(movie.backdrop_path, 'w780')} alt={movie.title} className="w-full h-full object-cover opacity-60" loading="lazy" decoding="async" />
                    : null
                }
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4 flex gap-3 items-end">
                    {poster && <img src={poster} alt={movie.title} width={56} height={84} className="rounded-lg shadow-xl flex-shrink-0" style={{ height: '84px', objectFit: 'cover' }} loading="lazy" decoding="async" />}
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{movie.title}</h3>
                        <p className="text-indigo-300 text-xs mt-0.5">{(movie.release_date || '').slice(0, 4)}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-2.5">
                {movie.genres?.slice(0, 3).map((g) => (
                    <span key={g.id} className="inline-block mr-1.5 mb-1 px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-full font-medium">{g.name}</span>
                ))}
                {movie.tagline && <p className="text-text-secondary text-xs italic mt-2 leading-relaxed">"{movie.tagline}"</p>}
            </div>
        </div>
    )
}

export default function MovieComparison() {
    const [movieAId, setMovieAId] = useState(null)
    const [movieBId, setMovieBId] = useState(null)
    const [movieA, setMovieA] = useState(null)
    const [movieB, setMovieB] = useState(null)
    const [loadingA, setLoadingA] = useState(false)
    const [loadingB, setLoadingB] = useState(false)

    const fetchMovie = useCallback((id, setMovie, setLoading) => {
        setLoading(true)
        getMovieDetails(id)
            .then((r) => setMovie(r.data))
            .catch(() => setMovie(null))
            .finally(() => setLoading(false))
    }, [])

    const handleSelectA = useCallback((id) => {
        setMovieAId(id)
        fetchMovie(id, setMovieA, setLoadingA)
    }, [fetchMovie])

    const handleSelectB = useCallback((id) => {
        setMovieBId(id)
        fetchMovie(id, setMovieB, setLoadingB)
    }, [fetchMovie])

    const getWinner = (field) => {
        if (!movieA || !movieB) return null
        const va = movieA[field.key]
        const vb = movieB[field.key]
        if (!va && !vb) return null
        if (!va) return 'B'
        if (!vb) return 'A'
        if (field.key === 'release_date') return null
        return field.higher ? (va > vb ? 'A' : vb > va ? 'B' : 'TIE') : null
    }

    return (
        <div className="min-h-screen bg-bg pt-20 pb-16 px-4 md:px-8 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">⚔️ Movie Comparison</h1>
                <p className="text-text-secondary text-sm mb-8">Search two movies and compare them head-to-head.</p>

                {/* Search row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="relative">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 ml-1">Movie A</p>
                        <MovieSearch side={0} onSelect={handleSelectA} />
                    </div>
                    <div className="relative">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 ml-1">Movie B</p>
                        <MovieSearch side={1} onSelect={handleSelectB} />
                    </div>
                </div>

                {/* Panel row */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <MoviePanel movie={movieA} loading={loadingA} />
                    <div className="hidden md:flex items-center justify-center text-4xl font-black text-indigo-400/60 px-2">VS</div>
                    <MoviePanel movie={movieB} loading={loadingB} />
                </div>

                {/* Comparison table */}
                {(movieA || movieB) && (
                    <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-3 border-b border-white/[0.06] text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            <div className="px-5 py-3 text-indigo-300">{movieA?.title || 'Movie A'}</div>
                            <div className="px-5 py-3 text-center">Category</div>
                            <div className="px-5 py-3 text-right text-violet-300">{movieB?.title || 'Movie B'}</div>
                        </div>
                        {FIELDS.map((field) => {
                            const winner = getWinner(field)
                            const vaF = field.format(movieA?.[field.key])
                            const vbF = field.format(movieB?.[field.key])
                            return (
                                <div
                                    key={field.key}
                                    className="grid grid-cols-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors text-sm"
                                >
                                    <div className={`px-5 py-4 font-semibold flex items-center gap-2 ${winner === 'A' ? 'text-emerald-400' : winner === 'B' ? 'text-red-400/70' : 'text-white/80'}`}>
                                        {winner === 'A' && <span className="text-emerald-400">▲</span>}
                                        {vaF}
                                    </div>
                                    <div className="px-5 py-4 text-text-secondary text-center text-xs font-semibold uppercase tracking-wide">
                                        {field.label}
                                        {winner === 'TIE' && <span className="ml-1 text-amber-400">TIE</span>}
                                    </div>
                                    <div className={`px-5 py-4 font-semibold text-right flex items-center justify-end gap-2 ${winner === 'B' ? 'text-emerald-400' : winner === 'A' ? 'text-red-400/70' : 'text-white/80'}`}>
                                        {vbF}
                                        {winner === 'B' && <span className="text-emerald-400">▲</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
