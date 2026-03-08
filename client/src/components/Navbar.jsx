import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { gsap } from 'gsap'
import { logout } from '../redux/slices/authSlice'
import { toggleTheme } from '../redux/slices/uiSlice'
import { fetchNotifications, markAllRead, deleteNotification } from '../redux/slices/notificationsSlice'
import { IMG } from '../api/tmdb'

export default function Navbar() {
    const { isAuthenticated, user } = useSelector((s) => s.auth)
    const favCount = useSelector((s) => s.favorites.items.length)
    const watchlistCount = useSelector((s) => s.watchlist.items.length)
    const notifications = useSelector((s) => s.notifications.items)
    const theme = useSelector((s) => s.ui.theme)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [notifOpen, setNotifOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const inputRef = useRef(null)
    const notifRef = useRef(null)
    const menuRef = useRef(null)
    const innerNavRef = useRef(null)

    const unreadCount = notifications.filter((n) => !n.read).length

    useEffect(() => {
        const onScroll = () => {
            const past = window.scrollY > 40
            setScrolled(past)
            if (innerNavRef.current) {
                gsap.to(innerNavRef.current, {
                    height: past ? 52 : 64,
                    duration: 0.35,
                    ease: 'power2.inOut',
                    overwrite: true,
                })
            }
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (searchOpen) inputRef.current?.focus()
    }, [searchOpen])

    useEffect(() => {
        if (isAuthenticated) dispatch(fetchNotifications())
    }, [isAuthenticated, dispatch])

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`)
            setQuery('')
            setSearchOpen(false)
        }
    }

    const logoRef = useRef(null)

    const handleLogoHover = () => {
        gsap.to(logoRef.current, {
            rotation: 8,
            scale: 1.12,
            duration: 0.5,
            ease: 'elastic.out(1.2, 0.4)',
            overwrite: true,
        })
    }

    const handleLogoLeave = () => {
        gsap.to(logoRef.current, {
            rotation: 0,
            scale: 1,
            duration: 0.45,
            ease: 'elastic.out(1, 0.5)',
            overwrite: true,
        })
    }

    const linkClass = ({ isActive }) =>
        `text-sm font-medium transition-colors duration-200 relative pb-1 ${isActive
            ? 'text-indigo-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-indigo-400 after:rounded-full'
            : 'text-slate-400 hover:text-slate-100'
        }`

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 relative ${scrolled
                ? 'bg-[#030712]/90 backdrop-blur-2xl'
                : 'bg-[#030712]/70 backdrop-blur-xl'
                }`}
        >
            {/* Indigo gradient underline */}
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/55 to-transparent" />
            <div ref={innerNavRef} className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link
                    ref={logoRef}
                    to="/"
                    className="flex items-center gap-1.5 flex-shrink-0"
                    onMouseEnter={handleLogoHover}
                    onMouseLeave={handleLogoLeave}
                    style={{ display: 'inline-flex', transformOrigin: 'center center', willChange: 'transform' }}
                >
                    <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l1.8 5.4 5.7.4-4.4 3.3 1.5 5.5L12 13.4l-4.6 3.2 1.5-5.5L4.5 7.8l5.7-.4z" />
                    </svg>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">CINEVERSE</span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-7">
                    <NavLink to="/" className={linkClass} end>Home</NavLink>
                    <NavLink to="/movies" className={linkClass}>Movies</NavLink>
                    <NavLink to="/tv" className={linkClass}>TV Shows</NavLink>
                    <NavLink to="/people" className={linkClass}>People</NavLink>
                    <NavLink to="/trending" className={linkClass}>Trending</NavLink>
                    <NavLink to="/charts" className={linkClass}>Charts</NavLink>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex items-center">
                        {searchOpen && (
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onBlur={() => { if (!query) setSearchOpen(false) }}
                                placeholder="Search movies, shows..."
                                className="bg-white/[0.07] border border-white/15 text-white text-sm rounded-full px-4 py-1.5 w-44 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        )}
                        <button
                            type={searchOpen ? 'submit' : 'button'}
                            onClick={() => !searchOpen && setSearchOpen(true)}
                            className="ml-1.5 text-white/80 hover:text-accent transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                        </button>
                    </form>

                    {/* Dark / Light toggle */}
                    <button
                        onClick={() => dispatch(toggleTheme())}
                        className="text-white/80 hover:text-accent transition-colors"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {isAuthenticated && (
                        <>
                            {/* Watchlist */}
                            <Link to="/watchlist" className="relative text-white/80 hover:text-accent transition-colors" title="Watchlist">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                {watchlistCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {watchlistCount > 9 ? '9+' : watchlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Favorites */}
                            <Link to="/favorites" className="relative text-white/80 hover:text-accent transition-colors" title="Favorites">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                                </svg>
                                {favCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {favCount > 9 ? '9+' : favCount}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setNotifOpen((v) => !v)}
                                    className="relative text-white/80 hover:text-accent transition-colors"
                                    title="Notifications"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 top-9 w-80 bg-[#0f172a] border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                            <h3 className="text-white font-bold text-sm">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={() => dispatch(markAllRead())} className="text-xs text-accent hover:underline font-medium">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-text-secondary text-sm">No notifications yet</div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div key={n._id} className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.06] hover:bg-indigo-500/5 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}>
                                                        {n.poster && <img src={IMG(n.poster, 'w92')} alt="" className="w-8 h-10 rounded object-cover flex-shrink-0" />}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                                                            {n.body && <p className="text-text-secondary text-xs mt-0.5 leading-tight">{n.body}</p>}
                                                            {!n.read && <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mt-1" />}
                                                        </div>
                                                        <button onClick={() => dispatch(deleteNotification(n._id))} className="text-white/30 hover:text-accent transition-colors flex-shrink-0">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* User avatar / auth buttons */}
                    {isAuthenticated ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:from-indigo-400 hover:to-violet-500 transition-all shadow-indigo-sm"
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-10 w-48 bg-[#0f172a] border border-indigo-500/20 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                                        <p className="text-text-secondary text-xs truncate">{user?.email}</p>
                                    </div>
                                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-white/80 hover:text-accent hover:bg-white/5 transition-colors">Profile</Link>
                                    <Link to="/history" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-white/80 hover:text-accent hover:bg-white/5 transition-colors">Watch History</Link>
                                    {user?.isAdmin && (
                                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-accent font-semibold hover:bg-white/5 transition-colors">Admin Panel</Link>
                                    )}
                                    <div className="border-t border-white/10">
                                        <button
                                            onClick={() => { dispatch(logout()); setMenuOpen(false) }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-accent hover:bg-white/5 transition-colors"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">Login</Link>
                            <Link to="/signup" className="text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-full transition-colors shadow-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
