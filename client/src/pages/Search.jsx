import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchMulti, IMG } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import useDebounce from '../hooks/useDebounce'
import { formatRating } from '../utils/helpers'

const TABS = ['All', 'Movies', 'TV', 'People']

export default function Search() {
    const [params, setParams] = useSearchParams()
    const [input, setInput] = useState(params.get('q') || '')
    const [tab, setTab] = useState('All')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const debounced = useDebounce(input, 500)

    useEffect(() => {
        if (!debounced.trim()) { setResults([]); return }
        setParams({ q: debounced })
        setLoading(true)
        setError(null)
        searchMulti(debounced)
            .then((res) => setResults(res.data.results || []))
            .catch(() => setError('Search failed. Please try again.'))
            .finally(() => setLoading(false))
    }, [debounced])

    const filtered = results.filter((r) => {
        if (tab === 'Movies') return r.media_type === 'movie'
        if (tab === 'TV') return r.media_type === 'tv'
        if (tab === 'People') return r.media_type === 'person'
        return true
    })

    return (
        <div className="min-h-screen bg-bg pt-24 px-4 md:px-10 animate-fade-in">
            <div className="max-w-2xl mx-auto mb-10">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Search for movies, TV shows, people..."
                        autoFocus
                        className="w-full bg-card border border-white/10 focus:border-accent text-white placeholder:text-text-secondary rounded-full px-12 py-4 text-base outline-none transition-colors"
                    />
                    {input && (
                        <button onClick={() => { setInput(''); setResults([]) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {input.trim() && (
                <div className="flex gap-2 mb-8 justify-center flex-wrap">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-1.5 rounded-full text-sm font-semibold border transition-all ${tab === t ? 'bg-accent border-accent text-white' : 'border-white/20 text-text-secondary hover:border-accent hover:text-accent'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="text-accent text-center text-sm mb-6">{error}</p>}

            {!input.trim() && !loading && (
                <div className="text-center text-text-secondary mt-20">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <p className="text-lg">Start typing to search</p>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                {!loading && filtered.map((item) => {
                    if (item.media_type === 'person') {
                        const photo = IMG(item.profile_path, 'w185')
                        return (
                            <Link key={item.id} to={`/person/${item.id}`} className="flex flex-col items-center bg-card border border-white/[0.06] rounded-xl p-4 hover:border-accent/50 transition-all group">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#252525] mb-3">
                                    {photo ? <img src={photo} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-white text-sm font-semibold text-center">{item.name}</p>
                                <p className="text-text-secondary text-xs mt-1">Person</p>
                            </Link>
                        )
                    }
                    return <MovieCard key={item.id} item={item} mediaType={item.media_type} />
                })}
            </div>

            {!loading && input.trim() && filtered.length === 0 && (
                <div className="text-center text-text-secondary mt-16">
                    <p className="text-lg">No results found for "<span className="text-white">{input}</span>"</p>
                </div>
            )}
        </div>
    )
}
