import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchPeople, getPersonDetails, IMG } from '../api/tmdb'
import Footer from '../components/Footer'

function ActorCard({ person, side }) {
    if (!person) return (
        <div className="flex-1 bg-card border border-dashed border-white/20 rounded-2xl p-8 flex items-center justify-center text-slate-500 min-h-[400px]">
            <div className="text-center space-y-2">
                <div className="text-4xl">{side === 'left' ? '🎭' : '🎬'}</div>
                <p className="text-sm">Search an actor above</p>
            </div>
        </div>
    )

    const credits = person.combined_credits?.cast || []
    const topMovies = [...credits]
        .filter((c) => c.poster_path)
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
        .slice(0, 5)
    const avgRating = credits.filter((c) => c.vote_average > 0).reduce((sum, c, _, a) => sum + c.vote_average / a.length, 0)
    const movieCount = credits.filter((c) => c.media_type === 'movie' || c.release_date).length
    const tvCount = credits.filter((c) => c.media_type === 'tv' || c.first_air_date).length

    return (
        <div className="flex-1 bg-card border border-white/10 rounded-2xl overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
                {person.profile_path
                    ? <img src={IMG(person.profile_path, 'w342')} alt={person.name} className="w-full h-full object-cover object-top opacity-70" />
                    : <div className="w-full h-full flex items-center justify-center text-6xl">🎭</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-3 left-4">
                    <h3 className="text-xl font-bold text-white">{person.name}</h3>
                    <p className="text-xs text-indigo-300">{person.known_for_department}</p>
                </div>
            </div>
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-bg rounded-xl py-2">
                        <div className="text-lg font-bold text-indigo-400">{movieCount}</div>
                        <div className="text-[10px] text-slate-400">Movies</div>
                    </div>
                    <div className="bg-bg rounded-xl py-2">
                        <div className="text-lg font-bold text-amber-400">{tvCount}</div>
                        <div className="text-[10px] text-slate-400">TV Shows</div>
                    </div>
                    <div className="bg-bg rounded-xl py-2">
                        <div className="text-lg font-bold text-emerald-400">{avgRating.toFixed(1)}</div>
                        <div className="text-[10px] text-slate-400">Avg Rating</div>
                    </div>
                </div>

                {person.birthday && (
                    <div className="text-xs text-slate-400 flex gap-2">
                        <span>🎂</span>
                        <span>{person.birthday}{person.place_of_birth ? ` · ${person.place_of_birth.split(',').pop()?.trim()}` : ''}</span>
                    </div>
                )}

                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Credits</p>
                    <div className="space-y-1.5">
                        {topMovies.map((m) => (
                            <Link
                                key={m.id}
                                to={`/${m.media_type === 'tv' ? 'tv' : 'movie'}/${m.id}`}
                                className="flex items-center gap-2 hover:bg-white/5 rounded-lg p-1 transition-colors"
                            >
                                <img src={IMG(m.poster_path, 'w92')} alt={m.title || m.name} className="w-8 h-12 object-cover rounded" />
                                <div>
                                    <div className="text-xs font-medium text-white line-clamp-1">{m.title || m.name}</div>
                                    <div className="text-[10px] text-slate-500">{(m.release_date || m.first_air_date || '').slice(0, 4)}</div>
                                </div>
                                <div className="ml-auto text-[10px] text-amber-400 font-bold">{m.vote_average?.toFixed(1)}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {person.biography && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{person.biography}</p>
                )}
            </div>
        </div>
    )
}

function SharedMovies({ a, b }) {
    if (!a || !b) return null
    const aIds = new Set((a.combined_credits?.cast || []).map((c) => c.id))
    const shared = (b.combined_credits?.cast || []).filter((c) => aIds.has(c.id) && c.poster_path)
    if (!shared.length) return null
    return (
        <div className="mt-8 bg-card border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">🤝 Movies They Both Appeared In ({shared.length})</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {shared.slice(0, 20).map((m) => (
                    <Link key={m.id} to={`/${m.media_type === 'tv' ? 'tv' : 'movie'}/${m.id}`} className="flex-shrink-0 group">
                        <img src={IMG(m.poster_path, 'w154')} alt={m.title || m.name} className="w-20 h-28 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                        <p className="text-[10px] text-slate-400 mt-1 w-20 line-clamp-2 text-center">{m.title || m.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

function SearchBox({ label, onSelect, side }) {
    const [q, setQ] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    const search = async (val) => {
        setQ(val)
        if (!val.trim()) { setResults([]); return }
        setLoading(true)
        try {
            const res = await searchPeople(val)
            setResults(res.data.results?.slice(0, 5) || [])
        } finally { setLoading(false) }
    }

    const select = async (p) => {
        setQ(p.name); setResults([])
        const res = await getPersonDetails(p.id)
        onSelect(res.data)
    }

    return (
        <div className="flex-1 relative">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{label}</label>
            <div className="relative">
                <input
                    value={q}
                    onChange={(e) => search(e.target.value)}
                    placeholder="Search actor name…"
                    className="w-full bg-card border border-white/15 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {loading && <div className="absolute right-3 top-3 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
            </div>
            {results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl z-20">
                    {results.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => select(r)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                        >
                            {r.profile_path
                                ? <img src={IMG(r.profile_path, 'w45')} alt={r.name} className="w-8 h-8 rounded-full object-cover" />
                                : <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm">🎭</div>
                            }
                            <div>
                                <div className="text-sm text-white font-medium">{r.name}</div>
                                <div className="text-xs text-slate-500">{r.known_for_department}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function ActorComparison() {
    const [actorA, setActorA] = useState(null)
    const [actorB, setActorB] = useState(null)

    return (
        <div className="min-h-screen bg-bg pt-20 pb-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">🥊 Actor vs Actor</h1>
                    <p className="text-slate-400">Compare two actors side-by-side</p>
                </div>

                {/* Search row */}
                <div className="flex gap-4 items-end mb-8">
                    <SearchBox label="Actor A" onSelect={setActorA} side="left" />
                    <div className="pb-2 text-2xl font-black text-slate-600">VS</div>
                    <SearchBox label="Actor B" onSelect={setActorB} side="right" />
                </div>

                {/* Comparison cards */}
                <div className="flex gap-4">
                    <ActorCard person={actorA} side="left" />
                    <ActorCard person={actorB} side="right" />
                </div>

                <SharedMovies a={actorA} b={actorB} />
            </div>
            <Footer />
        </div>
    )
}
