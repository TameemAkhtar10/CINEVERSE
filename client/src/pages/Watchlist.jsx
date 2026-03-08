import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import Footer from '../components/Footer'

export default function Watchlist() {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const { items, loading } = useSelector((s) => s.watchlist)

    useEffect(() => {
        if (isAuthenticated) dispatch(fetchWatchlist())
    }, [isAuthenticated, dispatch])

    return (
        <div className="min-h-screen bg-bg animate-fade-in">
            <div className="pt-24 px-4 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white">My Watchlist</h1>
                            <p className="text-text-secondary text-sm mt-1">{items.length} {items.length === 1 ? 'title' : 'titles'} saved</p>
                        </div>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div className="text-center text-text-secondary mt-20 space-y-4">
                            <svg className="w-20 h-20 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <p className="text-xl font-semibold text-white">Your watchlist is empty</p>
                            <p className="text-sm">Bookmark movies and shows to watch later</p>
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {items.map((item) => (
                                <div key={item._id} className="relative group">
                                    <MovieCard
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
                                    <button
                                        onClick={() => dispatch(removeFromWatchlist(item.movieId))}
                                        className="absolute top-2 right-2 z-10 bg-black/80 hover:bg-accent text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Remove from watchlist"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}
