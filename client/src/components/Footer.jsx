import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-card border-t border-white/[0.08] mt-16 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Branding */}
                <div className="flex items-center gap-2 mb-8">
                    <span className="text-accent text-2xl">●</span>
                    <span className="text-white font-extrabold text-2xl tracking-tight">CINEVERSE</span>
                </div>

                {/* Links grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Browse</h4>
                        <div className="space-y-2.5">
                            <Link to="/" className="block text-text-secondary hover:text-accent text-sm transition-colors">Home</Link>
                            <Link to="/movies" className="block text-text-secondary hover:text-accent text-sm transition-colors">Movies</Link>
                            <Link to="/tv" className="block text-text-secondary hover:text-accent text-sm transition-colors">TV Shows</Link>
                            <Link to="/people" className="block text-text-secondary hover:text-accent text-sm transition-colors">People</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Discover</h4>
                        <div className="space-y-2.5">
                            <Link to="/trending" className="block text-text-secondary hover:text-accent text-sm transition-colors">Trending</Link>
                            <Link to="/charts" className="block text-text-secondary hover:text-accent text-sm transition-colors">Top Charts</Link>
                            <Link to="/search" className="block text-text-secondary hover:text-accent text-sm transition-colors">Search</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">My Library</h4>
                        <div className="space-y-2.5">
                            <Link to="/favorites" className="block text-text-secondary hover:text-accent text-sm transition-colors">Favorites</Link>
                            <Link to="/watchlist" className="block text-text-secondary hover:text-accent text-sm transition-colors">Watchlist</Link>
                            <Link to="/history" className="block text-text-secondary hover:text-accent text-sm transition-colors">History</Link>
                            <Link to="/profile" className="block text-text-secondary hover:text-accent text-sm transition-colors">Profile</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Follow Us</h4>
                        <div className="flex gap-3 mt-1">
                            <a href="#" aria-label="Twitter" className="w-9 h-9 bg-white/5 hover:bg-accent border border-white/10 hover:border-accent rounded-full flex items-center justify-center text-text-secondary hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a href="#" aria-label="Facebook" className="w-9 h-9 bg-white/5 hover:bg-accent border border-white/10 hover:border-accent rounded-full flex items-center justify-center text-text-secondary hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="#" aria-label="Instagram" className="w-9 h-9 bg-white/5 hover:bg-accent border border-white/10 hover:border-accent rounded-full flex items-center justify-center text-text-secondary hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/[0.08] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-text-secondary text-sm">© {new Date().getFullYear()} CINEVERSE. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link to="/terms" className="text-text-secondary hover:text-accent text-sm transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="text-text-secondary hover:text-accent text-sm transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
