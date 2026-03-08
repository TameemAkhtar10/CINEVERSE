import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopRated, getPopularTV, getPopularPeople, IMG } from '../api/tmdb'
import { formatRating } from '../utils/helpers'
import Footer from '../components/Footer'

function RankCard({ item, rank, mediaType }) {
    const title = item.title || item.name || 'Untitled'
    const year = (item.release_date || item.first_air_date || '').slice(0, 4)
    const img = item.poster_path
        ? IMG(item.poster_path, 'w185')
        : item.profile_path
            ? IMG(item.profile_path, 'w185')
            : null
    const to = mediaType === 'person'
        ? `/person/${item.id}`
        : mediaType === 'tv'
            ? `/tv/${item.id}`
            : `/movie/${item.id}`

    return (
        <Link
            to={to}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
        >
            <span className={`text-2xl font-black w-8 flex-shrink-0 text-center tabular-nums ${rank <= 3 ? 'text-accent' : 'text-white/20'}`}>
                {rank}
            </span>
            <div className="w-10 h-14 rounded-lg overflow-hidden bg-card flex-shrink-0">
                {img
                    ? <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full bg-white/5" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm group-hover:text-accent transition-colors truncate">{title}</p>
                {year && <p className="text-text-secondary text-xs mt-0.5">{year}</p>}
                {item.vote_average != null && mediaType !== 'person' && (
                    <span className="inline-flex items-center gap-1 text-yellow-400 text-xs mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                        </svg>
                        {formatRating(item.vote_average)}
                    </span>
                )}
            </div>
        </Link>
    )
}

export default function Charts() {
    const [movies, setMovies] = useState([])
    const [tv, setTv] = useState([])
    const [people, setPeople] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getTopRated(), getPopularTV(), getPopularPeople()])
            .then(([mRes, tvRes, pRes]) => {
                setMovies(mRes.data.results?.slice(0, 10) || [])
                setTv(tvRes.data.results?.slice(0, 10) || [])
                setPeople(pRes.data.results?.slice(0, 10) || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const Section = ({ title, items, mediaType }) => (
        <div className="bg-card border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent rounded-full inline-block" />
                {title}
            </h2>
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="divide-y divide-white/[0.05]">
                    {items.map((item, i) => (
                        <RankCard key={item.id} item={item} rank={i + 1} mediaType={mediaType} />
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-bg animate-fade-in">
            <div className="pt-24 px-4 md:px-10 pb-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-white mb-8">Top Charts</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Section title="Top 10 Movies" items={movies} mediaType="movie" />
                        <Section title="Top 10 TV Shows" items={tv} mediaType="tv" />
                        <Section title="Top 10 People" items={people} mediaType="person" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
