import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHistory, clearHistory } from '../redux/slices/historySlice'
import { IMG } from '../api/tmdb'
import SkeletonCard from '../components/SkeletonCard'

export default function History() {
    const dispatch = useDispatch()
    const { items, loading, error } = useSelector((s) => s.history)

    useEffect(() => {
        dispatch(fetchHistory())
    }, [dispatch])

    return (
        <div className="min-h-screen bg-bg pt-20 px-4 md:px-10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-white">Watch History</h1>
                {items.length > 0 && (
                    <button
                        onClick={() => dispatch(clearHistory())}
                        className="text-sm text-text-secondary hover:text-accent font-medium transition-colors border border-white/10 hover:border-accent/50 px-4 py-2 rounded-full"
                    >
                        Clear History
                    </button>
                )}
            </div>

            {error && <p className="text-accent text-sm mb-4">{error}</p>}

            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="text-center mt-24 space-y-4">
                    <svg className="w-16 h-16 mx-auto text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    <p className="text-text-secondary text-lg">No watch history yet.</p>
                    <Link to="/" className="inline-block text-accent font-semibold hover:underline text-sm">Start watching</Link>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {items.map((item) => {
                        const poster = IMG(item.poster, 'w342')
                        return (
                            <Link
                                key={item.movieId}
                                to={`/${item.mediaType === 'tv' ? 'tv' : 'movie'}/${item.movieId}`}
                                className="block rounded-xl overflow-hidden bg-card border border-white/[0.06] hover:scale-105 hover:shadow-red-glow transition-all duration-300 group"
                            >
                                <div className="w-full h-[262px] bg-card overflow-hidden relative">
                                    {poster ? (
                                        <img src={poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /></svg>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 text-text-secondary text-[10px] px-1.5 py-0.5 rounded font-medium uppercase">
                                        {item.mediaType === 'tv' ? 'TV' : 'Movie'}
                                    </div>
                                </div>
                                <div className="p-2.5">
                                    <p className="text-white font-semibold text-sm leading-tight truncate">{item.title}</p>
                                    <p className="text-text-secondary text-xs mt-0.5">{item.year || '—'}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
