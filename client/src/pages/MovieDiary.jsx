import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchHistory } from '../redux/slices/historySlice'
import { IMG } from '../api/tmdb'
import Footer from '../components/Footer'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
}

export default function MovieDiary() {
    const dispatch = useDispatch()
    const { items: history, loading } = useSelector((s) => s.history)
    const { isAuthenticated } = useSelector((s) => s.auth)

    const now = new Date()
    const [viewYear, setViewYear] = useState(now.getFullYear())
    const [viewMonth, setViewMonth] = useState(now.getMonth())
    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => {
        if (isAuthenticated) dispatch(fetchHistory())
    }, [isAuthenticated, dispatch])

    // Group history by YYYY-MM-DD using createdAt
    const byDate = useMemo(() => {
        const map = {}
        history.forEach((item) => {
            const d = new Date(item.createdAt || item.addedAt || Date.now())
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            if (!map[key]) map[key] = []
            map[key].push(item)
        })
        return map
    }, [history])

    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
        else setViewMonth((m) => m - 1)
        setSelectedDate(null)
    }
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
        else setViewMonth((m) => m + 1)
        setSelectedDate(null)
    }

    const handleDayClick = (day) => {
        const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        if (byDate[key]) setSelectedDate(selectedDate === key ? null : key)
    }

    const selectedMovies = selectedDate ? (byDate[selectedDate] || []) : []

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="text-5xl">📅</div>
                <h2 className="text-xl font-bold text-white">Sign in to view your Movie Diary</h2>
                <Link to="/login" className="inline-block bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-600 transition-colors">Sign In</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-bg pt-20 pb-16 px-4 md:px-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">📅 Movie Diary</h1>
                <p className="text-text-secondary text-sm mb-8">Your personal watch history calendar.</p>

                {/* Calendar header */}
                <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
                    {/* Month nav */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                        <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-white font-bold text-lg">{MONTHS[viewMonth]} {viewYear}</span>
                        <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 px-4 py-2 border-b border-white/[0.04]">
                        {DAYS.map((d) => (
                            <div key={d} className="text-center text-text-secondary text-xs font-semibold py-1">{d}</div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-px p-4">
                        {/* Empty cells for first week offset */}
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                            const hasMovies = !!byDate[key]
                            const count = byDate[key]?.length || 0
                            const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear()
                            const isSelected = selectedDate === key

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all
                                        ${isSelected ? 'bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                                            : isToday ? 'border border-indigo-500/50 text-indigo-300'
                                                : hasMovies ? 'bg-white/5 text-white hover:bg-white/10 cursor-pointer'
                                                    : 'text-text-secondary/40 cursor-default'
                                        }`}
                                >
                                    {day}
                                    {hasMovies && !isSelected && (
                                        <div className="absolute bottom-1 flex gap-0.5">
                                            {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                                                <div key={j} className="w-1 h-1 rounded-full bg-indigo-400" />
                                            ))}
                                        </div>
                                    )}
                                    {isSelected && count > 0 && (
                                        <div className="absolute bottom-1 text-[9px] text-white/80 font-normal">{count}</div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Selected day movies */}
                {selectedDate && (
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-bold text-white mb-4">
                            Movies watched on {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                        {selectedMovies.length === 0 ? (
                            <p className="text-text-secondary text-sm">No movies found for this date.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {selectedMovies.map((item) => {
                                    const poster = IMG(item.poster, 'w342')
                                    const linkPath = `/${item.mediaType === 'tv' ? 'tv' : 'movie'}/${item.movieId}`
                                    return (
                                        <Link
                                            key={item._id || item.movieId}
                                            to={linkPath}
                                            className="bg-card border border-white/[0.06] rounded-xl overflow-hidden hover:border-indigo-500/40 transition-all group"
                                        >
                                            <div className="w-full bg-bg overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                                {poster
                                                    ? <img src={poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                                                    : <div className="w-full h-full flex items-center justify-center text-white/20 text-3xl">🎬</div>
                                                }
                                            </div>
                                            <div className="p-2.5">
                                                <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                                                {item.year && <p className="text-text-secondary text-[10px] mt-0.5">{item.year}</p>}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Summary footer */}
                {!loading && history.length === 0 && (
                    <div className="text-center py-16 space-y-3">
                        <div className="text-5xl">🎬</div>
                        <p className="text-white font-semibold">Your diary is empty</p>
                        <p className="text-text-secondary text-sm">Start watching movies to fill your diary!</p>
                        <Link to="/" className="inline-block mt-2 bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-600 transition-colors">Browse Movies</Link>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
