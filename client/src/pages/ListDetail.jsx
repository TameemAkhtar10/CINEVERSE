import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { removeMovieFromList, addMovieToList } from '../redux/slices/customListsSlice'
import { searchMovies, IMG } from '../api/tmdb'
import useDebounce from '../hooks/useDebounce'
import Footer from '../components/Footer'

export default function ListDetail() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)

    const [list, setList] = useState(null)
    const [loading, setLoading] = useState(true)

    // Add movie search
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const debouncedQuery = useDebounce(query, 400)

    useEffect(() => {
        if (!isAuthenticated) return
        setLoading(true)
        axiosInstance.get(`/lists/${id}`)
            .then((r) => setList(r.data))
            .catch(() => setList(null))
            .finally(() => setLoading(false))
    }, [id, isAuthenticated])

    useEffect(() => {
        if (!debouncedQuery.trim()) { setResults([]); return }
        setSearching(true)
        searchMovies(debouncedQuery)
            .then((r) => setResults(r.data.results?.slice(0, 6) || []))
            .catch(() => setResults([]))
            .finally(() => setSearching(false))
    }, [debouncedQuery])

    const handleAddMovie = useCallback(async (movie) => {
        const payload = {
            movieId: movie.id,
            title: movie.title,
            poster: movie.poster_path || '',
            mediaType: 'movie',
            rating: movie.vote_average,
            year: (movie.release_date || '').slice(0, 4),
        }
        const result = await dispatch(addMovieToList({ listId: id, movie: payload })).unwrap()
        setList(result)
        setQuery(''); setResults([])
    }, [dispatch, id])

    const handleRemoveMovie = useCallback(async (movieId) => {
        const result = await dispatch(removeMovieFromList({ listId: id, movieId })).unwrap()
        setList(result)
    }, [dispatch, id])

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
            <Link to="/login" className="bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm">Sign In</Link>
        </div>
    )

    if (loading) return (
        <div className="min-h-screen bg-bg pt-20 animate-pulse">
            <div className="max-w-4xl mx-auto px-4 pt-8">
                <div className="h-8 bg-card rounded w-1/3 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 bg-card rounded-xl" />)}
                </div>
            </div>
        </div>
    )

    if (!list) return (
        <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-white font-semibold text-lg">List not found</p>
                <Link to="/lists" className="text-indigo-400 text-sm hover:underline">← Back to Lists</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-bg pt-20 pb-16 px-4 md:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <Link to="/lists" className="text-text-secondary text-xs hover:text-white transition-colors mb-2 block">← My Lists</Link>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                            <span>{list.emoji}</span> {list.name}
                        </h1>
                        {list.description && <p className="text-text-secondary text-sm mt-1">{list.description}</p>}
                        <p className="text-indigo-400 text-xs font-semibold mt-2">{list.movies?.length || 0} movie{list.movies?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={() => setShowSearch((s) => !s)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0 mt-6"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Movie
                    </button>
                </div>

                {/* Add movie search */}
                {showSearch && (
                    <div className="bg-card border border-white/[0.08] rounded-2xl p-5 mb-6 animate-fade-in">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for a movie to add…"
                                className="w-full bg-bg border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-text-secondary/50 rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                                autoFocus
                            />
                            {searching && (
                                <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                        {results.length > 0 && (
                            <div className="mt-3 space-y-1">
                                {results.map((r) => {
                                    const alreadyIn = list.movies?.some((m) => m.movieId === r.id)
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => !alreadyIn && handleAddMovie(r)}
                                            disabled={alreadyIn}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {r.poster_path
                                                ? <img src={IMG(r.poster_path, 'w92')} alt={r.title} width={28} height={42} className="rounded-md flex-shrink-0" style={{ height: '42px', objectFit: 'cover' }} loading="lazy" decoding="async" />
                                                : <div className="w-7 h-10 bg-bg rounded-md flex-shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{r.title}</p>
                                                <p className="text-text-secondary text-xs">{(r.release_date || '').slice(0, 4)}</p>
                                            </div>
                                            {alreadyIn
                                                ? <span className="text-emerald-400 text-xs font-semibold">Added ✓</span>
                                                : <span className="text-indigo-400 text-xs font-semibold">+ Add</span>
                                            }
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Movies grid */}
                {list.movies?.length === 0 ? (
                    <div className="text-center py-20 space-y-3">
                        <div className="text-5xl">{list.emoji}</div>
                        <p className="text-white font-semibold">This list is empty</p>
                        <p className="text-text-secondary text-sm">Search and add movies above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {list.movies?.map((m) => {
                            const poster = m.poster ? `https://image.tmdb.org/t/p/w342${m.poster}` : null
                            return (
                                <div key={m.movieId} className="relative group">
                                    <Link
                                        to={`/${m.mediaType === 'tv' ? 'tv' : 'movie'}/${m.movieId}`}
                                        className="block bg-card border border-white/[0.06] hover:border-indigo-500/40 rounded-xl overflow-hidden transition-all"
                                    >
                                        <div className="w-full bg-bg overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                            {poster
                                                ? <img src={poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                                                : <div className="w-full h-full flex items-center justify-center text-white/20 text-3xl">🎬</div>
                                            }
                                        </div>
                                        <div className="p-2.5">
                                            <p className="text-white text-xs font-semibold truncate">{m.title}</p>
                                            {m.year && <p className="text-text-secondary text-[10px] mt-0.5">{m.year}</p>}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleRemoveMovie(m.movieId)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                                        title="Remove from list"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
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
