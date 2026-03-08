import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getPopularPeople, IMG } from '../api/tmdb'
import useInfiniteScroll from '../hooks/useInfiniteScroll'

function PersonCard({ person }) {
    const photo = IMG(person.profile_path, 'w185')
    const knownFor = person.known_for?.map((k) => k.title || k.name).filter(Boolean).slice(0, 2).join(', ')

    return (
        <Link
            to={`/person/${person.id}`}
            className="flex flex-col items-center bg-card border border-white/[0.06] rounded-xl overflow-hidden p-4 hover:border-accent/50 hover:shadow-red-sm transition-all duration-300 group"
        >
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#252525] mb-3 flex-shrink-0">
                {photo ? (
                    <img src={photo} alt={person.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                    </div>
                )}
            </div>
            <p className="text-white font-semibold text-sm text-center leading-snug">{person.name}</p>
            {knownFor && (
                <p className="text-text-secondary text-xs text-center mt-1 leading-snug line-clamp-2">{knownFor}</p>
            )}
            <span className="mt-2 text-accent text-xs font-medium">{person.known_for_department || 'Acting'}</span>
        </Link>
    )
}

export default function People() {
    const [people, setPeople] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const currentPage = useRef(1)

    const fetchPage = useCallback(async (pg) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getPopularPeople(pg)
            const results = res.data.results || []
            setPeople((prev) => pg === 1 ? results : [...prev, ...results])
            setHasMore(pg < (res.data.total_pages || 1))
            currentPage.current = pg + 1
            setPage(pg + 1)
        } catch {
            setError('Failed to load people.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPage(1) }, [fetchPage])

    const loadMore = useCallback(() => {
        if (!hasMore || loading) return
        fetchPage(currentPage.current)
    }, [hasMore, loading, fetchPage])

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading)

    return (
        <div className="min-h-screen bg-bg pt-20 px-4 md:px-10 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white mb-8">Popular People</h1>
            {error && <p className="text-accent text-sm mb-4">{error}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {people.map((p) => <PersonCard key={p.id} person={p} />)}
                {loading && Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center bg-card border border-white/[0.06] rounded-xl p-4 animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-[#252525] mb-3" />
                        <div className="h-3 bg-[#252525] rounded w-2/3 mb-2" />
                        <div className="h-2.5 bg-[#252525] rounded w-1/2" />
                    </div>
                ))}
            </div>
            <div ref={sentinelRef} className="h-8" />
        </div>
    )
}
