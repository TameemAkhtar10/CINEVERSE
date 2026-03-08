import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeTrailer } from '../redux/slices/uiSlice'

export default function TrailerModal({ trailerKey }) {
    const dispatch = useDispatch()
    const { trailerOpen } = useSelector((s) => s.ui)
    const [theaterMode, setTheaterMode] = useState(false)
    const [pip, setPip] = useState(false)
    const [pipPos, setPipPos] = useState({ x: 24, y: 24 })
    const pipDrag = useRef({ active: false, ox: 0, oy: 0 })
    const pipRef = useRef(null)

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') { setPip(false); dispatch(closeTrailer()) }
            if (e.key === 't' || e.key === 'T') setTheaterMode((v) => !v)
        }
        window.addEventListener('keydown', onKey)
        if (!pip) document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [dispatch, pip])

    // PiP drag
    const onPipDown = (e) => {
        pipDrag.current = { active: true, ox: e.clientX - pipPos.x, oy: e.clientY - pipPos.y }
        pipRef.current?.setPointerCapture(e.pointerId)
    }
    const onPipMove = (e) => {
        if (!pipDrag.current.active) return
        setPipPos({ x: e.clientX - pipDrag.current.ox, y: e.clientY - pipDrag.current.oy })
    }
    const onPipUp = () => { pipDrag.current.active = false }

    if (!trailerOpen) return null

    const iframeUrl = trailerKey
        ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`
        : null

    if (pip) {
        return (
            <div
                ref={pipRef}
                style={{ position: 'fixed', left: pipPos.x, top: pipPos.y, zIndex: 99999, width: 320, cursor: 'grab', touchAction: 'none' }}
                onPointerDown={onPipDown}
                onPointerMove={onPipMove}
                onPointerUp={onPipUp}
                className="rounded-xl overflow-hidden shadow-2xl border border-white/20 group"
            >
                {iframeUrl && (
                    <div className="relative aspect-video">
                        <iframe src={iframeUrl} title="Trailer" allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" />
                    </div>
                )}
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setPip(false)} className="w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-indigo-500">⤢</button>
                    <button onClick={() => { setPip(false); dispatch(closeTrailer()) }} className="w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-500">✕</button>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Theater mode extra dark overlay */}
            {theaterMode && <div className="fixed inset-0 z-[99] bg-black/70 pointer-events-none" />}
            <div
                className={`fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in ${theaterMode ? 'bg-black/98' : 'bg-black/90 backdrop-blur-sm'}`}
                onClick={() => dispatch(closeTrailer())}
            >
                <div
                    className={`relative w-full transition-all duration-300 ${theaterMode ? 'max-w-6xl' : 'max-w-4xl'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top bar */}
                    <div className="absolute -top-10 left-0 right-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTheaterMode((v) => !v)}
                                title="Theater Mode (T)"
                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${theaterMode ? 'border-amber-500/60 text-amber-400 bg-amber-500/10' : 'border-white/20 text-white/60 hover:text-white hover:border-white/40'}`}
                            >
                                🎭 Theater
                            </button>
                            <button
                                onClick={() => setPip(true)}
                                title="Mini Player"
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                            >
                                ⛶ Mini Player
                            </button>
                        </div>
                        <button
                            onClick={() => dispatch(closeTrailer())}
                            className="text-white/60 hover:text-accent transition-colors flex items-center gap-1.5 text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close (Esc)
                        </button>
                    </div>

                    {iframeUrl ? (
                        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
                            <iframe
                                src={iframeUrl}
                                title="Trailer"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    ) : (
                        <div className="aspect-video w-full rounded-xl bg-card border border-white/10 flex items-center justify-center">
                            <div className="text-center space-y-3">
                                <p className="text-text-secondary text-lg font-medium">Trailer not available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
