import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPersonDetails, IMG } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import { truncate } from '../utils/helpers'

export default function PersonDetail() {
    const { id } = useParams()
    const [person, setPerson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        setLoading(true)
        getPersonDetails(id)
            .then((res) => setPerson(res.data))
            .catch(() => setError('Failed to load person details.'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="min-h-screen bg-bg pt-20 px-6 animate-pulse max-w-4xl mx-auto">
            <div className="flex gap-8 mt-8">
                <div className="w-48 h-72 bg-card rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-4">
                    <div className="h-8 bg-card rounded w-1/3" />
                    <div className="h-4 bg-card rounded w-1/4" />
                    <div className="h-24 bg-card rounded" />
                </div>
            </div>
        </div>
    )

    if (error) return <div className="min-h-screen bg-bg flex items-center justify-center text-accent">{error}</div>
    if (!person) return null

    const photo = IMG(person.profile_path, 'w342')
    const bio = person.biography || 'Biography not available.'
    const credits = person.combined_credits?.cast
        ?.filter((c) => c.poster_path)
        ?.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        ?.slice(0, 12) || []

    return (
        <div className="min-h-screen bg-bg pt-20 animate-fade-in">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <div className="flex-shrink-0">
                        <div className="w-40 h-56 md:w-48 md:h-72 rounded-xl overflow-hidden bg-card">
                            {photo ? (
                                <img src={photo} alt={person.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <h1 className="text-4xl font-extrabold text-white">{person.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            {person.known_for_department && (
                                <span className="bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {person.known_for_department}
                                </span>
                            )}
                            {person.birthday && <span>Born: {person.birthday}</span>}
                            {person.place_of_birth && <span>{person.place_of_birth}</span>}
                            {person.deathday && <span>Died: {person.deathday}</span>}
                        </div>
                        <div>
                            <p className="text-text-secondary leading-relaxed text-sm">
                                {expanded ? bio : truncate(bio, 300)}
                            </p>
                            {bio.length > 300 && (
                                <button
                                    onClick={() => setExpanded((v) => !v)}
                                    className="text-accent text-sm font-semibold mt-2 hover:underline"
                                >
                                    {expanded ? 'Show less' : 'Read more'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {credits.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-5">Known For</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {credits.map((c) => (
                                <MovieCard key={`${c.id}-${c.credit_id}`} item={c} mediaType={c.media_type || 'movie'} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
