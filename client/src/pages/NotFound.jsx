import React from 'react'
import { Link } from 'react-router-dom'
import NotFoundCanvas from '../components/NotFoundCanvas'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 animate-fade-in relative overflow-hidden">
            <NotFoundCanvas />
            <div className="text-center max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="text-accent text-2xl">●</span>
                    <span className="text-white font-extrabold text-2xl tracking-tight">CINEVERSE</span>
                </div>

                {/* 404 */}
                <div className="relative mb-6">
                    <h1 className="text-[120px] md:text-[150px] font-black text-accent leading-none select-none"
                        style={{ textShadow: '0 0 80px rgba(229,9,20,0.4)' }}>
                        404
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
                <p className="text-text-secondary text-base mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    <br />Let's get you back to the good stuff.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-red-sm hover:shadow-red-glow"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
