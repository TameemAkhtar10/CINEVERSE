import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchLists, createList, deleteList } from '../redux/slices/customListsSlice'
import Footer from '../components/Footer'

const EMOJIS = ['🎬', '❤️', '👨‍👩‍👧', '🌙', '💀', '🚀', '😂', '🎭', '🔥', '💎', '🍿', '🎞️', '👑', '⚡', '🌟']

export default function CustomLists() {
    const dispatch = useDispatch()
    const { items: lists, loading } = useSelector((s) => s.customLists)
    const { isAuthenticated } = useSelector((s) => s.auth)

    const [showCreate, setShowCreate] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [emoji, setEmoji] = useState('🎬')
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isAuthenticated) dispatch(fetchLists())
    }, [isAuthenticated, dispatch])

    const handleCreate = useCallback(async (e) => {
        e.preventDefault()
        if (!name.trim()) return
        setCreating(true)
        setError(null)
        try {
            await dispatch(createList({ name: name.trim(), description: description.trim(), emoji })).unwrap()
            setName(''); setDescription(''); setEmoji('🎬'); setShowCreate(false)
        } catch (err) {
            setError(err || 'Failed to create list')
        } finally {
            setCreating(false)
        }
    }, [dispatch, name, description, emoji])

    const handleDelete = useCallback(async (id, listName) => {
        if (!window.confirm(`Delete "${listName}"?`)) return
        dispatch(deleteList(id))
    }, [dispatch])

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="text-5xl">📋</div>
                <h2 className="text-xl font-bold text-white">Sign in to manage your lists</h2>
                <Link to="/login" className="inline-block bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-600 transition-colors">Sign In</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-bg pt-20 pb-16 px-4 md:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">📋 My Lists</h1>
                        <p className="text-text-secondary text-sm mt-1">Create curated collections of movies.</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-[0_0_14px_rgba(99,102,241,0.4)]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New List
                    </button>
                </div>

                {/* Create modal */}
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="bg-card border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-5">Create New List</h2>
                            {error && <p className="text-accent text-sm mb-3">{error}</p>}
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1.5">List Name</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Watch with Family"
                                        maxLength={80}
                                        required
                                        className="w-full bg-bg border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-text-secondary/50 rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-1.5">Description (optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What's this list for?"
                                        maxLength={300}
                                        rows={2}
                                        className="w-full bg-bg border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-text-secondary/50 rounded-xl px-4 py-3 outline-none transition-colors text-sm resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-2">Icon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EMOJIS.map((e) => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => setEmoji(e)}
                                                className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-indigo-500/30 ring-2 ring-indigo-500 scale-110' : 'bg-white/5 hover:bg-white/10'}`}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="flex-1 border border-white/20 text-text-secondary hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || !name.trim()}
                                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        {creating ? 'Creating…' : 'Create List'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-36 bg-card rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && lists.length === 0 && (
                    <div className="text-center py-20 space-y-4">
                        <div className="text-6xl">📋</div>
                        <p className="text-white font-bold text-xl">No lists yet</p>
                        <p className="text-text-secondary text-sm">Create your first list to organise your movies.</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="inline-block bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-600 transition-colors"
                        >
                            Create a List
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {lists.map((list) => (
                        <div key={list._id} className="relative group bg-card border border-white/[0.06] hover:border-indigo-500/40 rounded-2xl p-5 transition-all">
                            <button
                                onClick={() => handleDelete(list._id, list.name)}
                                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-500/0 hover:bg-red-500/20 text-text-secondary/0 group-hover:text-text-secondary/50 hover:!text-red-400 flex items-center justify-center transition-all text-xs"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <Link to={`/lists/${list._id}`} className="block">
                                <div className="text-4xl mb-3">{list.emoji}</div>
                                <h3 className="text-white font-bold text-lg leading-tight">{list.name}</h3>
                                {list.description && (
                                    <p className="text-text-secondary text-xs mt-1.5 line-clamp-2">{list.description}</p>
                                )}
                                <p className="text-indigo-400 text-xs font-semibold mt-3">{list.movies?.length || 0} movie{list.movies?.length !== 1 ? 's' : ''}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    )
}
