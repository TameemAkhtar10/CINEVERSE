import React, { useEffect, useState } from 'react'
import { getTrending } from '../api/tmdb'
import ScrollRow from '../components/ScrollRow'
import Footer from '../components/Footer'

export default function Trending() {
    const [timeWindow, setTimeWindow] = useState('day')
    const [movies, setMovies] = useState([])
    const [tv, setTv] = useState([])
    const [all, setAll] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        Promise.all([
            getTrending('all', timeWindow),
            getTrending('movie', timeWindow),
            getTrending('tv', timeWindow),
        ])
            .then(([aRes, mRes, tvRes]) => {
                setAll(aRes.data.results || [])
                setMovies(mRes.data.results || [])
                setTv(tvRes.data.results || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [timeWindow])

    return (
        <div className="min-h-screen bg-bg animate-fade-in">
            <div className="pt-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-extrabold text-white">Trending</h1>
                        <div className="flex bg-card border border-white/10 rounded-full p-1 gap-1">
                            {[
                                { value: 'day', label: 'Today' },
                                { value: 'week', label: 'This Week' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setTimeWindow(value)}
                                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${timeWindow === value ? 'bg-accent text-white shadow-red-sm' : 'text-text-secondary hover:text-white'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <ScrollRow title="🔥 Trending Now" items={all} loading={loading} />
            <ScrollRow title="Trending Movies" items={movies} loading={loading} mediaType="movie" />
            <ScrollRow title="Trending TV Shows" items={tv} loading={loading} mediaType="tv" />
            <Footer />
        </div>
    )
}
