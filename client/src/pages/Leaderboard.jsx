import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import Footer from '../components/Footer'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
    const [board, setBoard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axiosInstance.get('/leaderboard')
            .then((r) => setBoard(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-bg pt-20 pb-10">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">🏆 Leaderboard</h1>
                    <p className="text-slate-400">Top movie watchers on CineVerse</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : board.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No data yet — start watching movies!</div>
                ) : (
                    <div className="space-y-2">
                        {board.map((entry, i) => (
                            <div
                                key={entry._id}
                                className={`flex items-center gap-4 rounded-2xl p-4 border transition-all duration-200 ${i === 0
                                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                                    : i === 1
                                        ? 'bg-slate-400/10 border-slate-400/30'
                                        : i === 2
                                            ? 'bg-orange-700/10 border-orange-700/30'
                                            : 'bg-card border-white/[0.06]'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${i < 3 ? 'text-2xl' : 'bg-white/5 text-slate-400 text-sm'}`}>
                                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                                </div>

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                    {entry.name?.[0]?.toUpperCase() || '?'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold truncate ${i === 0 ? 'text-amber-300' : 'text-white'}`}>{entry.name}</p>
                                    <p className="text-xs text-slate-400">Last watched {new Date(entry.lastWatched).toLocaleDateString()}</p>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className={`text-2xl font-black ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-indigo-400'}`}>
                                        {entry.count}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">films</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
