import React, { useEffect, useState, useCallback } from 'react'
import axiosInstance from '../api/axiosInstance'

const SECTIONS = ['Movies', 'Users']

const SECTION_ICONS = {
    Movies: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
    ),
    Users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
}

export default function Admin() {
    const [section, setSection] = useState('Movies')
    const [movies, setMovies] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [form, setForm] = useState({ title: '', genre: '', year: '', rating: '', poster: '' })
    const [editId, setEditId] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (section === 'Movies') loadMovies()
        else loadUsers()
    }, [section])

    const loadMovies = async () => {
        setLoading(true); setError(null)
        try { const { data } = await axiosInstance.get('/admin/movies'); setMovies(data) }
        catch { setError('Failed to load movies.') }
        finally { setLoading(false) }
    }

    const loadUsers = async () => {
        setLoading(true); setError(null)
        try { const { data } = await axiosInstance.get('/admin/users'); setUsers(data) }
        catch { setError('Failed to load users.') }
        finally { setLoading(false) }
    }

    const handleSave = useCallback(async (e) => {
        e.preventDefault()
        setError(null)
        try {
            if (editId) {
                const { data } = await axiosInstance.put(`/admin/movies/${editId}`, form)
                setMovies((prev) => prev.map((m) => m._id === editId ? data : m))
            } else {
                const { data } = await axiosInstance.post('/admin/movies', form)
                setMovies((prev) => [...prev, data])
            }
            setForm({ title: '', genre: '', year: '', rating: '', poster: '' }); setEditId(null)
        } catch { setError('Save failed.') }
    }, [editId, form])

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Delete this movie?')) return
        try {
            await axiosInstance.delete(`/admin/movies/${id}`)
            setMovies((prev) => prev.filter((m) => m._id !== id))
        } catch { setError('Delete failed.') }
    }, [])

    const handleBanUser = useCallback(async (id, banned) => {
        try {
            await axiosInstance.put(`/admin/users/${id}`, { banned: !banned })
            setUsers((prev) => prev.map((u) => u._id === id ? { ...u, banned: !banned } : u))
        } catch { setError('Action failed.') }
    }, [])

    const handleDeleteUser = useCallback(async (id) => {
        if (!window.confirm('Delete this user?')) return
        try {
            await axiosInstance.delete(`/admin/users/${id}`)
            setUsers((prev) => prev.filter((u) => u._id !== id))
        } catch { setError('Delete failed.') }
    }, [])

    const handleSectionChange = useCallback((s) => {
        setSection(s)
        setSidebarOpen(false)
    }, [])

    return (
        <div className="min-h-screen bg-bg pt-16 pb-16 md:pb-0 animate-fade-in">

            {/* ── Mobile top bar ──────────────────────────────────── */}
            <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-white/[0.06] sticky top-16 z-40">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors"
                    aria-label="Open menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="text-white font-bold text-base">{section}</span>
            </div>

            {/* ── Mobile sidebar drawer ───────────────────────────── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-card border-r border-white/[0.06] pt-14 px-4 space-y-1 shadow-2xl">
                        <div className="flex items-center justify-between mb-5 px-2">
                            <p className="text-text-secondary text-xs font-semibold uppercase tracking-widest">Admin Panel</p>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-text-secondary hover:text-white transition-colors"
                                aria-label="Close menu"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {SECTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleSectionChange(s)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${section === s ? 'bg-accent text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                            >
                                {SECTION_ICONS[s]}
                                {s}
                            </button>
                        ))}
                    </aside>
                </div>
            )}

            <div className="flex">
                {/* ── Desktop sidebar ─────────────────────────────── */}
                <aside className="hidden md:block w-56 flex-shrink-0 bg-card border-r border-white/[0.06] min-h-screen pt-8 px-4 space-y-1">
                    <p className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-4 px-2">Admin Panel</p>
                    {SECTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSection(s)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${section === s ? 'bg-accent text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            {SECTION_ICONS[s]}
                            {s}
                        </button>
                    ))}
                </aside>

                {/* ── Main content ─────────────────────────────────── */}
                <main className="flex-1 p-4 md:p-8 min-w-0">
                    <h1 className="hidden md:block text-2xl font-extrabold text-white mb-6">{section}</h1>
                    {error && <p className="text-accent text-sm mb-4">{error}</p>}

                    {section === 'Movies' && (
                        <>
                            {/* ── Movie form ── */}
                            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 bg-card border border-white/[0.06] rounded-xl p-4 md:p-5">
                                {['title', 'genre', 'year', 'rating', 'poster'].map((f) => (
                                    <input
                                        key={f}
                                        placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                                        value={form[f]}
                                        onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
                                        className="bg-bg border border-white/10 focus:border-accent text-white placeholder:text-text-secondary/50 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors w-full"
                                        required={f === 'title'}
                                    />
                                ))}
                                <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
                                    <button type="submit" className="flex-1 sm:flex-none bg-accent hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
                                        {editId ? 'Update Movie' : 'Add Movie'}
                                    </button>
                                    {editId && (
                                        <button
                                            type="button"
                                            onClick={() => { setEditId(null); setForm({ title: '', genre: '', year: '', rating: '', poster: '' }) }}
                                            className="flex-1 sm:flex-none border border-white/20 text-text-secondary hover:text-white px-4 py-2.5 rounded-lg text-sm transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>

                            {loading ? (
                                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-card rounded-lg animate-pulse" />)}</div>
                            ) : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden md:block bg-card border border-white/[0.06] rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-white/[0.06]">
                                                {['Title', 'Genre', 'Year', 'Rating', 'Actions'].map((h) => (
                                                    <th key={h} className="text-left text-text-secondary font-semibold px-5 py-3">{h}</th>
                                                ))}
                                            </tr></thead>
                                            <tbody>
                                                {movies.map((m) => (
                                                    <tr key={m._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-5 py-3 text-white font-medium">{m.title}</td>
                                                        <td className="px-5 py-3 text-text-secondary">{m.genre || '—'}</td>
                                                        <td className="px-5 py-3 text-text-secondary">{m.year || '—'}</td>
                                                        <td className="px-5 py-3 text-text-secondary">{m.rating || '—'}</td>
                                                        <td className="px-5 py-3 flex gap-2">
                                                            <button onClick={() => { setEditId(m._id); setForm({ title: m.title, genre: m.genre || '', year: m.year || '', rating: m.rating || '', poster: m.poster || '' }) }} className="text-xs border border-white/20 text-text-secondary hover:text-white px-3 py-1 rounded-lg transition-all">Edit</button>
                                                            <button onClick={() => handleDelete(m._id)} className="text-xs border border-accent/40 text-accent hover:bg-accent hover:text-white px-3 py-1 rounded-lg transition-all">Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {movies.length === 0 && <tr><td colSpan={5} className="text-center text-text-secondary py-8">No movies found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile card list */}
                                    <div className="md:hidden space-y-3">
                                        {movies.length === 0 && <p className="text-center text-text-secondary py-8">No movies found.</p>}
                                        {movies.map((m) => (
                                            <div key={m._id} className="bg-card border border-white/[0.06] rounded-xl p-4 flex gap-3">
                                                {m.poster ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w92${m.poster}`}
                                                        alt={m.title}
                                                        width={48}
                                                        height={72}
                                                        className="w-12 rounded-lg flex-shrink-0 object-cover"
                                                        style={{ height: '72px' }}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <div className="w-12 flex-shrink-0 bg-bg rounded-lg flex items-center justify-center" style={{ height: '72px' }}>
                                                        <svg className="w-5 h-5 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z" /></svg>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{m.title}</p>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-text-secondary">
                                                        {m.genre && <span>{m.genre}</span>}
                                                        {m.year && <span>{m.year}</span>}
                                                        {m.rating && <span>⭐ {m.rating}</span>}
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() => { setEditId(m._id); setForm({ title: m.title, genre: m.genre || '', year: m.year || '', rating: m.rating || '', poster: m.poster || '' }) }}
                                                            className="flex-1 text-xs border border-white/20 text-text-secondary hover:text-white py-1.5 rounded-lg transition-all"
                                                        >Edit</button>
                                                        <button
                                                            onClick={() => handleDelete(m._id)}
                                                            className="flex-1 text-xs border border-accent/40 text-accent hover:bg-accent hover:text-white py-1.5 rounded-lg transition-all"
                                                        >Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {section === 'Users' && (
                        loading ? (
                            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-card rounded-lg animate-pulse" />)}</div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block bg-card border border-white/[0.06] rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-white/[0.06]">
                                            {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                                                <th key={h} className="text-left text-text-secondary font-semibold px-5 py-3">{h}</th>
                                            ))}
                                        </tr></thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-5 py-3 text-white font-medium">{u.name}</td>
                                                    <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isAdmin ? 'bg-accent/20 text-accent' : 'bg-white/10 text-text-secondary'}`}>
                                                            {u.isAdmin ? 'Admin' : 'User'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.banned ? 'bg-red-900/40 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                                                            {u.banned ? 'Banned' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 flex gap-2">
                                                        <button onClick={() => handleBanUser(u._id, u.banned)} className={`text-xs border px-3 py-1 rounded-lg transition-all ${u.banned ? 'border-green-500/40 text-green-400 hover:bg-green-500 hover:text-white' : 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500 hover:text-white'}`}>
                                                            {u.banned ? 'Unban' : 'Ban'}
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(u._id)} className="text-xs border border-accent/40 text-accent hover:bg-accent hover:text-white px-3 py-1 rounded-lg transition-all">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && <tr><td colSpan={5} className="text-center text-text-secondary py-8">No users found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile card list */}
                                <div className="md:hidden space-y-3">
                                    {users.length === 0 && <p className="text-center text-text-secondary py-8">No users found.</p>}
                                    {users.map((u) => (
                                        <div key={u._id} className="bg-card border border-white/[0.06] rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-indigo-300 font-bold text-sm">{(u.name || '?')[0].toUpperCase()}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-white font-semibold text-sm">{u.name}</p>
                                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${u.isAdmin ? 'bg-accent/20 text-accent' : 'bg-white/10 text-text-secondary'}`}>
                                                            {u.isAdmin ? 'Admin' : 'User'}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${u.banned ? 'bg-red-900/40 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                                                            {u.banned ? 'Banned' : 'Active'}
                                                        </span>
                                                    </div>
                                                    <p className="text-text-secondary text-xs mt-0.5 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleBanUser(u._id, u.banned)}
                                                    className={`flex-1 text-xs border py-1.5 rounded-lg transition-all ${u.banned ? 'border-green-500/40 text-green-400 hover:bg-green-500 hover:text-white' : 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500 hover:text-white'}`}
                                                >
                                                    {u.banned ? 'Unban' : 'Ban'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="flex-1 text-xs border border-accent/40 text-accent hover:bg-accent hover:text-white py-1.5 rounded-lg transition-all"
                                                >Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )
                    )}
                </main>
            </div>

            {/* ── Mobile bottom tab bar ────────────────────────── */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card border-t border-white/[0.06] flex">
                {SECTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSection(s)}
                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-all ${section === s ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
                    >
                        {SECTION_ICONS[s]}
                        {s}
                    </button>
                ))}
            </nav>
        </div>
    )
}
