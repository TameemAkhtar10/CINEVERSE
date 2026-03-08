import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeTrailer } from '../redux/slices/uiSlice'

export default function TrailerModal({ trailerKey }) {
    const dispatch = useDispatch()
    const { trailerOpen } = useSelector((s) => s.ui)

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') dispatch(closeTrailer()) }
        window.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [dispatch])

    if (!trailerOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => dispatch(closeTrailer())}
        >
            <div
                className="relative w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => dispatch(closeTrailer())}
                    className="absolute -top-10 right-0 text-white/60 hover:text-accent transition-colors flex items-center gap-1.5 text-sm font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                </button>

                {trailerKey ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-red-glow">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                            title="Trailer"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                ) : (
                    <div className="aspect-video w-full rounded-xl bg-card border border-white/10 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <svg className="w-12 h-12 text-white/20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                            </svg>
                            <p className="text-text-secondary text-lg font-medium">Trailer not available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
