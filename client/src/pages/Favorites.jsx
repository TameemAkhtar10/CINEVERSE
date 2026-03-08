import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFavorites, removeFavorite } from '../redux/slices/favoritesSlice'
import { IMG } from '../api/tmdb'
import SkeletonCard from '../components/SkeletonCard'

export default function Favorites() {
    const dispatch = useDispatch()
    const { items, loading, error } = useSelector((s) => s.favorites)

    useEffect(() => {
        dispatch(fetchFavorites())
    }, [dispatch])

    return (
        <div className="min-h-screen bg-bg pt-20 px-4 md:px-10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-white">My Favorites</h1>
                <span className="text-text-secondary text-sm">{items.length} saved</span>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                    </svg>
                    <p className="text-text-secondary text-lg">No favorites yet.</p>
                    <Link to="/" className="inline-block text-accent font-semibold hover:underline text-sm">Browse movies</Link>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {items.map((item) => {
                        const poster = IMG(item.poster, 'w342')
                        return (
                            <div key={item.movieId} className="relative group">
                                <Link
                                    to={`/${item.mediaType === 'tv' ? 'tv' : 'movie'}/${item.movieId}`}
                                    className="block rounded-xl overflow-hidden bg-card border border-white/[0.06] hover:scale-105 hover:shadow-red-glow transition-all duration-300"
                                >
                                    <div className="w-full h-[262px] bg-card overflow-hidden">
                                        {poster ? (
                                            <img src={poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2.5">
                                        <p className="text-white font-semibold text-sm leading-tight truncate">{item.title}</p>
                                        <p className="text-text-secondary text-xs mt-0.5">{item.year || '—'}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => dispatch(removeFavorite(item.movieId))}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-accent"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
