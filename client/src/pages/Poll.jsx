import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../api/axiosInstance'
import { IMG } from '../api/tmdb'
import Footer from '../components/Footer'

export default function Poll() {
    const [poll, setPoll] = useState(null)
    const [loading, setLoading] = useState(true)
    const [voting, setVoting] = useState(false)
    const [voted, setVoted] = useState(false)
    const { isAuthenticated } = useSelector((s) => s.auth)

    useEffect(() => {
        axiosInstance.get('/polls/active')
            .then((r) => {
                setPoll(r.data)
                if (r.data?.options?.some((o) => o.voted)) setVoted(true)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const castVote = async (optionIndex) => {
        if (!isAuthenticated || voting || voted) return
        setVoting(true)
        try {
            await axiosInstance.post(`/polls/vote/${poll._id}/${optionIndex}`)
            // Refresh poll
            const r = await axiosInstance.get('/polls/active')
            setPoll(r.data)
            setVoted(true)
        } catch { }
        setVoting(false)
    }

    const totalVotes = poll?.options?.reduce((s, o) => s + (o.voteCount || 0), 0) || 0

    if (loading) return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-bg pt-20 pb-10">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">🗳️ Community Poll</h1>
                    <p className="text-slate-400">Vote for the best movie of the week</p>
                </div>

                {!poll ? (
                    <div className="text-center py-20 space-y-3">
                        <div className="text-5xl">📭</div>
                        <p className="text-slate-400">No active poll right now. Check back soon!</p>
                    </div>
                ) : (
                    <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-5">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="text-xl font-bold text-white">{poll.question}</h2>
                            <div className="flex-shrink-0 text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
                                LIVE
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">{totalVotes} total votes · Ends {new Date(poll.endsAt).toLocaleDateString()}</p>

                        <div className="space-y-3">
                            {poll.options.map((opt, i) => {
                                const pct = totalVotes ? Math.round((opt.voteCount / totalVotes) * 100) : 0
                                const isMyVote = opt.voted
                                return (
                                    <button
                                        key={i}
                                        onClick={() => castVote(i)}
                                        disabled={voted || !isAuthenticated || voting}
                                        className={`w-full text-left rounded-xl border overflow-hidden transition-all duration-200 ${isMyVote
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : voted
                                                ? 'border-white/10 bg-white/[0.02] cursor-default'
                                                : 'border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 p-3">
                                            {opt.poster && (
                                                <img src={IMG(opt.poster, 'w92')} alt={opt.movieTitle} className="w-10 h-14 object-cover rounded flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`font-semibold text-sm ${isMyVote ? 'text-indigo-300' : 'text-white'}`}>{opt.text}</span>
                                                    {voted && <span className="text-sm font-bold text-slate-300 flex-shrink-0">{pct}%</span>}
                                                </div>
                                                {voted && (
                                                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${isMyVote ? 'bg-indigo-500' : 'bg-slate-500'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-500 mt-1">{opt.voteCount} vote{opt.voteCount !== 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {!isAuthenticated && (
                            <p className="text-center text-sm text-slate-400">
                                <a href="/login" className="text-indigo-400 hover:underline">Log in</a> to vote
                            </p>
                        )}
                        {voted && (
                            <p className="text-center text-xs text-emerald-400 font-medium">✓ Your vote has been recorded</p>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
