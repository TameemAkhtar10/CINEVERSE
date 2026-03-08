import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchPeople, getPersonDetails, IMG } from '../api/tmdb'
import Footer from '../components/Footer'

export default function MovieTimeline() {
    const [query, setQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [director, setDirector] = useState(null)
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(false)

    const doSearch = async (val) => {
        setQuery(val)
        if (!val.trim()) { setSearchResults([]); return }
        const res = await searchPeople(val)
        setSearchResults(res.data.results?.filter((p) => p.known_for_department === 'Directing' || p.known_for_department === 'Writing').slice(0, 5) || [])
    }

    const selectDirector = async (person) => {
        setLoading(true)
        setSearchResults([])
        setQuery(person.name)
        try {
            const res = await getPersonDetails(person.id)
            const credits = res.data.combined_credits?.crew || []
            const directed = credits
                .filter((c) => c.job === 'Director' && c.release_date && c.poster_path)
                .reduce((acc, m) => {
                    if (!acc.find((x) => x.id === m.id)) acc.push(m)
                    return acc
                }, [])
                .sort((a, b) => a.release_date.localeCompare(b.release_date))
            setDirector(res.data)
            setMovies(directed)
        } finally {
            setLoading(false)
        }
    }

    // Group movies by decade
    const grouped = movies.reduce((acc, m) => {
        const decade = Math.floor(Number(m.release_date.slice(0, 4)) / 10) * 10
        if (!acc[decade]) acc[decade] = []
        acc[decade].push(m)
        return acc
    }, {})

    return (
        <div className="min-h-screen bg-bg pt-20 pb-10">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">🎞 Director's Timeline</h1>
                    <p className="text-slate-400">Explore a director's complete filmography in chronological order</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md mx-auto mb-10">
                    <input
                        value={query}
                        onChange={(e) => doSearch(e.target.value)}
                        placeholder="Search director (e.g. Christopher Nolan)…"
                        className="w-full bg-card border border-white/15 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl z-20">
                            {searchResults.map((r) => (
                                <button key={r.id} onClick={() => selectDirector(r)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                                    {r.profile_path
                                        ? <img src={IMG(r.profile_path, 'w45')} alt={r.name} className="w-8 h-8 rounded-full object-cover" />
                                        : <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">🎬</div>
                                    }
                                    <span className="text-sm text-white">{r.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {director && !loading && (
                    <>
                        {/* Director header */}
                        <div className="flex items-center gap-4 mb-10 bg-card border border-white/10 rounded-2xl p-4">
                            {director.profile_path
                                ? <img src={IMG(director.profile_path, 'w185')} alt={director.name} className="w-16 h-16 rounded-full object-cover" />
                                : <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl">🎬</div>
                            }
                            <div>
                                <h2 className="text-xl font-bold text-white">{director.name}</h2>
                                <p className="text-sm text-slate-400">{movies.length} directed films</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        {Object.keys(grouped).sort().map((decade) => (
                            <div key={decade} className="mb-10">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{decade}s</h3>
                                    <div className="flex-1 h-px bg-indigo-500/20" />
                                </div>
                                <div className="pl-5 space-y-4 border-l-2 border-indigo-500/20">
                                    {grouped[decade].map((m, i) => (
                                        <div key={m.id} className="relative flex gap-4 group">
                                            <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-indigo-500/50 border-2 border-indigo-500 mt-4 group-hover:bg-indigo-500 transition-colors" />
                                            <Link to={`/movie/${m.id}`} className="flex gap-4 bg-card border border-white/[0.06] hover:border-indigo-500/30 rounded-xl p-3 flex-1 transition-all duration-200 hover:bg-white/[0.03]">
                                                <img src={IMG(m.poster_path, 'w154')} alt={m.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                                                <div className="flex-1 min-w-0 py-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-white text-sm line-clamp-2">{m.title}</h4>
                                                        <span className="text-xs text-amber-400 font-bold flex-shrink-0">★ {m.vote_average?.toFixed(1)}</span>
                                                    </div>
                                                    <p className="text-xs text-indigo-400 mt-1">{m.release_date?.slice(0, 4)}</p>
                                                    {m.overview && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{m.overview}</p>}
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {movies.length === 0 && (
                            <div className="text-center py-16 text-slate-500">No directed movies with available data found.</div>
                        )}
                    </>
                )}

                {!director && !loading && (
                    <div className="text-center py-16 space-y-3">
                        <div className="text-5xl">🎬</div>
                        <p className="text-slate-400">Search for a director to see their complete filmography</p>
                        <div className="flex flex-wrap gap-2 justify-center pt-2">
                            {['Christopher Nolan', 'Quentin Tarantino', 'Martin Scorsese', 'Steven Spielberg'].map((n) => (
                                <button key={n} onClick={() => doSearch(n)} className="text-xs px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full hover:bg-indigo-500/20 transition-colors">
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
