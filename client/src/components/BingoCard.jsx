import React, { useState, useEffect } from 'react'

const SQUARES = [
    'Watch a 90s Classic', 'Watch a Horror Movie', 'Watch an Oscar Winner', 'Watch a Foreign Film', 'Watch a Documentary',
    'Watch an Animated Movie', 'Watch a Sequel / Trilogy', 'Watch a Sci-Fi Film', 'Watch a Romantic Movie', 'Watch a Comedy',
    'Watch an Action Movie', 'Watch a Thriller', '⭐ FREE ⭐', "Watch a Movie from Your Birth Year", 'Watch a Rating 8+ Movie',
    'Watch a Marvel/DC Movie', 'Watch a Based-on-True Story', 'Watch a Single-Word-Title Movie', 'Watch a Black & White Movie', "Watch a Director's Debut",
    'Watch a Movie Set in Space', 'Watch a War Movie', 'Watch a Musical', 'Watch a Franchise Marathon', 'Watch a Movie Tonight',
]

const BINGO_KEY = 'cv_bingo'

export default function BingoCard() {
    const [checked, setChecked] = useState(() => {
        try { return JSON.parse(localStorage.getItem(BINGO_KEY)) || {} } catch { return {} }
    })

    useEffect(() => {
        localStorage.setItem(BINGO_KEY, JSON.stringify(checked))
    }, [checked])

    const toggle = (i) => {
        if (i === 12) return // free space always checked
        setChecked((c) => ({ ...c, [i]: !c[i] }))
    }

    const isChecked = (i) => i === 12 || !!checked[i]

    // Check bingo - rows, cols, diagonals
    const hasBingo = () => {
        for (let r = 0; r < 5; r++) {
            if ([0, 1, 2, 3, 4].every((c) => isChecked(r * 5 + c))) return true
        }
        for (let c = 0; c < 5; c++) {
            if ([0, 1, 2, 3, 4].every((r) => isChecked(r * 5 + c))) return true
        }
        if ([0, 6, 12, 18, 24].every(isChecked)) return true
        if ([4, 8, 12, 16, 20].every(isChecked)) return true
        return false
    }

    const checkedCount = Object.values(checked).filter(Boolean).length + 1 // +1 for free
    const reset = () => setChecked({})
    const bingo = hasBingo()

    return (
        <div className="bg-card border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">🎲 Movie Bingo</h2>
                    <p className="text-xs text-slate-400">{checkedCount}/25 completed</p>
                </div>
                {bingo && (
                    <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-full text-sm font-bold animate-bounce">
                        🏆 BINGO!
                    </div>
                )}
                <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
                {SQUARES.map((sq, i) => (
                    <button
                        key={i}
                        onClick={() => toggle(i)}
                        className={`aspect-square p-1.5 rounded-lg text-[9px] leading-tight font-medium border transition-all duration-200 flex items-center justify-center text-center cursor-pointer select-none ${isChecked(i)
                            ? i === 12
                                ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 cursor-default'
                                : 'bg-indigo-500/30 border-indigo-500/50 text-indigo-200'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-indigo-500/30 hover:text-slate-200 hover:bg-white/[0.06]'
                            }`}
                    >
                        {isChecked(i) && i !== 12 && (
                            <span className="absolute text-indigo-400 text-lg leading-none" style={{ fontSize: '1.4rem' }}>✓</span>
                        )}
                        <span className={isChecked(i) && i !== 12 ? 'opacity-30' : ''}>{sq}</span>
                    </button>
                ))}
            </div>

            <div className="mt-4">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${(checkedCount / 25) * 100}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1">{checkedCount}/25 · {Math.round((checkedCount / 25) * 100)}% complete</p>
            </div>
        </div>
    )
}
