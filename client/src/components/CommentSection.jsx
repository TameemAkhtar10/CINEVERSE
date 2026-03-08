import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../api/axiosInstance'

function timeAgo(date) {
    const diff = (Date.now() - new Date(date)) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function CommentSection({ movieId, mediaType = 'movie' }) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const textareaRef = useRef(null)
    const { isAuthenticated, user } = useSelector((s) => s.auth)

    const load = () => {
        axiosInstance.get(`/comments/${movieId}`)
            .then((r) => setComments(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { if (movieId) load() }, [movieId])

    const submit = async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        setSubmitting(true); setError('')
        try {
            const res = await axiosInstance.post(`/comments/${movieId}`, { text, rating: rating || null, mediaType })
            setComments((old) => [res.data, ...old])
            setText(''); setRating(0)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post')
        }
        setSubmitting(false)
    }

    const deleteComment = async (id) => {
        try {
            await axiosInstance.delete(`/comments/${id}`)
            setComments((c) => c.filter((x) => x._id !== id))
        } catch { }
    }

    const toggleLike = async (id) => {
        try {
            const res = await axiosInstance.post(`/comments/${id}/like`)
            setComments((old) => old.map((c) => c._id === id ? { ...c, likes: Array(res.data.likes).fill(null), _liked: res.data.liked } : c))
        } catch { }
    }

    return (
        <section className="mt-8">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span>💬</span> Reviews & Comments
                <span className="text-sm text-slate-400 font-normal ml-1">({comments.length})</span>
            </h3>

            {/* Write comment */}
            {isAuthenticated ? (
                <form onSubmit={submit} className="mb-6 bg-card border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium text-slate-300">{user?.name}</span>
                    </div>

                    {/* Star rating */}
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 mr-1">Rating:</span>
                        {STARS.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setRating(s)}
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-base transition-colors"
                            >
                                <span className={(hoverRating || rating) >= s ? 'text-amber-400' : 'text-white/20'}>★</span>
                            </button>
                        ))}
                        {rating > 0 && <span className="text-xs text-amber-400 ml-1">{rating}/10</span>}
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Share your thoughts about this movie…"
                        rows={3}
                        maxLength={1000}
                        className="w-full bg-bg/50 border border-white/10 text-white text-sm rounded-xl px-4 py-3 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                    />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">{text.length}/1000</span>
                        <button
                            type="submit"
                            disabled={submitting || !text.trim()}
                            className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {submitting ? 'Posting…' : 'Post Review'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-6 bg-card border border-white/10 rounded-2xl p-4 text-center text-sm text-slate-400">
                    <a href="/login" className="text-indigo-400 hover:underline">Log in</a> to leave a review
                </div>
            )}

            {/* Comments list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card border border-white/10 rounded-xl p-4 animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-white/10 rounded w-24" />
                                    <div className="h-3 bg-white/10 rounded w-full" />
                                    <div className="h-3 bg-white/10 rounded w-3/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">No reviews yet. Be the first to review!</div>
            ) : (
                <div className="space-y-3">
                    {comments.map((c) => (
                        <div key={c._id} className="bg-card border border-white/[0.06] rounded-2xl p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/60 to-violet-600/60 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                        {c.userName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-white">{c.userName}</span>
                                        {c.rating && (
                                            <span className="ml-2 text-xs text-amber-400 font-bold">★ {c.rating}/10</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                                    {isAuthenticated && user?.name === c.userName && (
                                        <button onClick={() => deleteComment(c._id)} className="text-slate-600 hover:text-red-400 transition-colors text-xs">
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{c.text}</p>
                            {isAuthenticated && (
                                <button
                                    onClick={() => toggleLike(c._id)}
                                    className={`text-xs flex items-center gap-1 transition-colors ${c._liked ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    👍 {c.likes?.length || 0}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
