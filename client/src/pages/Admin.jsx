import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

const SECTIONS = ['Movies', 'Users']

export default function Admin() {
    const [section, setSection] = useState('Movies')
    const [movies, setMovies] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [form, setForm] = useState({ title: '', genre: '', year: '', rating: '', poster: '' })
    const [editId, setEditId] = useState(null)

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

    const handleSave = async (e) => {
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
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this movie?')) return
        try {
            await axiosInstance.delete(`/admin/movies/${id}`)
            setMovies((prev) => prev.filter((m) => m._id !== id))
        } catch { setError('Delete failed.') }
    }

    const handleBanUser = async (id, banned) => {
        try {
            await axiosInstance.put(`/admin/users/${id}`, { banned: !banned })
            setUsers((prev) => prev.map((u) => u._id === id ? { ...u, banned: !banned } : u))
        } catch { setError('Action failed.') }
    }

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return
        try {
            await axiosInstance.delete(`/admin/users/${id}`)
            setUsers((prev) => prev.filter((u) => u._id !== id))
        } catch { setError('Delete failed.') }
    }

    return (
        <div className="min-h-screen bg-bg pt-16 flex animate-fade-in">
            <aside className="w-56 flex-shrink-0 bg-card border-r border-white/[0.06] min-h-screen pt-8 px-4 space-y-1">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-4 px-2">Admin Panel</p>
                {SECTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSection(s)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${section === s ? 'bg-accent text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                    >
                        {s}
                    </button>
                ))}
            </aside>

            <main className="flex-1 p-8">
                <h1 className="text-2xl font-extrabold text-white mb-6">{section}</h1>
                {error && <p className="text-accent text-sm mb-4">{error}</p>}

                {section === 'Movies' && (
                    <>
                        <form onSubmit={handleSave} className="flex flex-wrap gap-3 mb-8 bg-card border border-white/[0.06] rounded-xl p-5">
                            {['title', 'genre', 'year', 'rating', 'poster'].map((f) => (
                                <input
                                    key={f}
                                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                                    value={form[f]}
                                    onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
                                    className="bg-bg border border-white/10 focus:border-accent text-white placeholder:text-text-secondary/50 rounded-lg px-3 py-2 text-sm outline-none transition-colors flex-1 min-w-[140px]"
                                    required={f === 'title'}
                                />
                            ))}
                            <button type="submit" className="bg-accent hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all">
                                {editId ? 'Update' : 'Add Movie'}
                            </button>
                            {editId && (
                                <button type="button" onClick={() => { setEditId(null); setForm({ title: '', genre: '', year: '', rating: '', poster: '' }) }} className="border border-white/20 text-text-secondary hover:text-white px-4 py-2 rounded-lg text-sm transition-all">
                                    Cancel
                                </button>
                            )}
                        </form>

                        {loading ? (
                            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-card rounded-lg animate-pulse" />)}</div>
                        ) : (
                            <div className="bg-card border border-white/[0.06] rounded-xl overflow-hidden">
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
                        )}
                    </>
                )}

                {section === 'Users' && (
                    loading ? (
                        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-card rounded-lg animate-pulse" />)}</div>
                    ) : (
                        <div className="bg-card border border-white/[0.06] rounded-xl overflow-hidden">
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
                    )
                )}
            </main>
        </div>
    )
}
