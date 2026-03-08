import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchHistory } from '../redux/slices/historySlice'
import Footer from '../components/Footer'

const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    53: 'Thriller', 10752: 'War', 37: 'Western',
}

const GENRE_COLORS = [
    '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
    '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
]

// SVG Pie Chart (no external dep)
function PieChart({ data }) {
    if (!data.length) return null
    const total = data.reduce((s, d) => s + d.value, 0)
    if (total === 0) return null

    let cumAngle = -Math.PI / 2
    const cx = 80, cy = 80, r = 70

    const slices = data.slice(0, 8).map((d, i) => {
        const angle = (d.value / total) * 2 * Math.PI
        const x1 = cx + r * Math.cos(cumAngle)
        const y1 = cy + r * Math.sin(cumAngle)
        cumAngle += angle
        const x2 = cx + r * Math.cos(cumAngle)
        const y2 = cy + r * Math.sin(cumAngle)
        const largeArc = angle > Math.PI ? 1 : 0
        return {
            path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
            color: GENRE_COLORS[i % GENRE_COLORS.length],
            label: d.label,
            value: d.value,
            pct: Math.round((d.value / total) * 100),
        }
    })

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <svg viewBox="0 0 160 160" className="w-40 h-40 flex-shrink-0">
                {slices.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} stroke="#0f172a" strokeWidth="2" />
                ))}
                <circle cx={cx} cy={cy} r={32} fill="#0f172a" />
            </svg>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-white font-medium">{s.label}</span>
                        <span className="text-text-secondary text-xs">({s.pct}%)</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// SVG Bar Chart
function BarChart({ data }) {
    if (!data.length) return null
    const max = Math.max(...data.map((d) => d.value), 1)
    return (
        <div className="flex items-end gap-2 h-28 w-full">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-[10px] text-text-secondary font-medium">{d.value || ''}</span>
                    <div
                        className="w-full rounded-t-md transition-all duration-700"
                        style={{
                            height: `${Math.max((d.value / max) * 88, d.value > 0 ? 6 : 0)}px`,
                            background: `linear-gradient(180deg, #6366f1, #8b5cf6)`,
                        }}
                    />
                    <span className="text-[9px] text-text-secondary truncate w-full text-center">{d.label}</span>
                </div>
            ))}
        </div>
    )
}

export default function WatchStats() {
    const dispatch = useDispatch()
    const { items: history, loading } = useSelector((s) => s.history)
    const { isAuthenticated } = useSelector((s) => s.auth)

    useEffect(() => {
        if (isAuthenticated) dispatch(fetchHistory())
    }, [isAuthenticated, dispatch])

    const stats = useMemo(() => {
        if (!history.length) return null

        const totalMovies = history.filter((h) => h.mediaType !== 'tv').length
        const totalTV = history.filter((h) => h.mediaType === 'tv').length

        // Approx avg runtime: 110min movies, 45min tv
        const totalMinutes = history.reduce((sum, h) => sum + (h.mediaType === 'tv' ? 45 : 110), 0)
        const totalHours = Math.round(totalMinutes / 60)

        // Genre breakdown (use genre from title keywords as rough estimate — just count by mediaType for now)
        // We rely on what data we have: no genre ids stored in history
        // Build month chart from createdAt
        const now = new Date()
        const monthData = []
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const count = history.filter((h) => {
                const hd = new Date(h.createdAt || Date.now())
                return `${hd.getFullYear()}-${String(hd.getMonth() + 1).padStart(2, '0')}` === monthKey
            }).length
            monthData.push({ label, value: count })
        }

        // Watching streak (consecutive days with at least 1 movie)
        const dateSet = new Set(history.map((h) => {
            const d = new Date(h.createdAt || Date.now())
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        }))
        let streak = 0
        let checkDate = new Date()
        while (true) {
            const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
            if (dateSet.has(key)) {
                streak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else break
        }

        // Media type pie
        const typePie = []
        if (totalMovies > 0) typePie.push({ label: 'Movies', value: totalMovies })
        if (totalTV > 0) typePie.push({ label: 'TV Shows', value: totalTV })

        return { totalMovies, totalTV, totalHours, totalMinutes, monthData, streak, typePie }
    }, [history])

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="text-5xl">📊</div>
                <h2 className="text-xl font-bold text-white">Sign in to see your Watch Stats</h2>
                <Link to="/login" className="inline-block bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-600 transition-colors">Sign In</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-bg pt-20 pb-16 px-4 md:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">📊 Watch Stats</h1>
                <p className="text-text-secondary text-sm mb-8">Your complete viewing history at a glance.</p>

                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && !stats && (
                    <div className="text-center py-20 space-y-4">
                        <div className="text-6xl">🎬</div>
                        <p className="text-white font-bold text-xl">No watch history yet</p>
                        <p className="text-text-secondary text-sm">Start watching movies to see your stats!</p>
                        <Link to="/" className="inline-block bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-600 transition-colors">Browse Movies</Link>
                    </div>
                )}

                {stats && (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { icon: '🎬', label: 'Movies Watched', value: stats.totalMovies, color: 'from-indigo-500/20 to-violet-500/10' },
                                { icon: '📺', label: 'TV Shows', value: stats.totalTV, color: 'from-blue-500/20 to-cyan-500/10' },
                                { icon: '⏱️', label: 'Hours Watched', value: stats.totalHours, color: 'from-amber-500/20 to-orange-500/10' },
                                { icon: '🔥', label: 'Day Streak', value: stats.streak, color: 'from-rose-500/20 to-pink-500/10' },
                            ].map((s) => (
                                <div key={s.label} className={`bg-gradient-to-br ${s.color} border border-white/[0.06] rounded-2xl p-5`}>
                                    <div className="text-2xl mb-2">{s.icon}</div>
                                    <div className="text-3xl font-extrabold text-white">{s.value}</div>
                                    <div className="text-text-secondary text-xs mt-1 font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Movies per Month */}
                        <div className="bg-card border border-white/[0.06] rounded-2xl p-6 mb-6">
                            <h2 className="text-lg font-bold text-white mb-6">Movies per Month</h2>
                            <BarChart data={stats.monthData} />
                        </div>

                        {/* Media type breakdown */}
                        {stats.typePie.length > 1 && (
                            <div className="bg-card border border-white/[0.06] rounded-2xl p-6 mb-6">
                                <h2 className="text-lg font-bold text-white mb-6">Content Breakdown</h2>
                                <PieChart data={stats.typePie} />
                            </div>
                        )}

                        {/* Total watch time */}
                        <div className="bg-card border border-white/[0.06] rounded-2xl p-6 mb-6">
                            <h2 className="text-lg font-bold text-white mb-4">Total Watch Time</h2>
                            <div className="flex flex-wrap gap-6">
                                <div>
                                    <div className="text-4xl font-extrabold text-indigo-400">{stats.totalHours}h</div>
                                    <div className="text-text-secondary text-sm mt-1">≈ {(stats.totalHours / 24).toFixed(1)} days</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-extrabold text-violet-400">{history.length}</div>
                                    <div className="text-text-secondary text-sm mt-1">total titles watched</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent history */}
                        <div className="bg-card border border-white/[0.06] rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">Recently Watched</h2>
                            <div className="space-y-3">
                                {history.slice(0, 8).map((h) => (
                                    <Link
                                        key={h._id || h.movieId}
                                        to={`/${h.mediaType === 'tv' ? 'tv' : 'movie'}/${h.movieId}`}
                                        className="flex items-center gap-3 hover:bg-white/[0.03] rounded-xl p-2 -mx-2 transition-colors"
                                    >
                                        <div className="w-8 h-12 bg-bg rounded-md overflow-hidden flex-shrink-0">
                                            {h.poster
                                                ? <img src={`https://image.tmdb.org/t/p/w92${h.poster}`} alt={h.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                                : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">🎬</div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-semibold truncate">{h.title}</p>
                                            <p className="text-text-secondary text-xs">{h.year || ''} · {h.mediaType === 'tv' ? 'TV' : 'Movie'}</p>
                                        </div>
                                        {h.rating && (
                                            <span className="text-amber-400 text-xs font-bold flex-shrink-0">⭐ {Number(h.rating).toFixed(1)}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    )
}
