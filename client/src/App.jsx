import React, { Suspense, lazy, useEffect, useRef, useLayoutEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { autoLogin } from './redux/slices/authSlice'
import { fetchWatchlist } from './redux/slices/watchlistSlice'
import { fetchRatings } from './redux/slices/ratingsSlice'
import { fetchNotifications } from './redux/slices/notificationsSlice'
import Navbar from './components/Navbar'
import ProgressBar from './components/ProgressBar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import CursorFollower from './components/CursorFollower'
import PageLoader from './components/PageLoader'
import PageTransition from './components/PageTransition'

const Home = lazy(() => import('./pages/Home'))
const Movies = lazy(() => import('./pages/Movies'))
const TVShows = lazy(() => import('./pages/TVShows'))
const People = lazy(() => import('./pages/People'))
const Search = lazy(() => import('./pages/Search'))
const MovieDetail = lazy(() => import('./pages/MovieDetail'))
const TVDetail = lazy(() => import('./pages/TVDetail'))
const PersonDetail = lazy(() => import('./pages/PersonDetail'))
const Favorites = lazy(() => import('./pages/Favorites'))
const History = lazy(() => import('./pages/History'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Admin = lazy(() => import('./pages/Admin'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const Trending = lazy(() => import('./pages/Trending'))
const Charts = lazy(() => import('./pages/Charts'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

const Spinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
)

// PageTransition is now in ./components/PageTransition

// ── Keyboard shortcuts (S=search, F=favorites, H=home) ────
function KeyboardShortcuts() {
    const navigate = useNavigate()
    useEffect(() => {
        const handler = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase()
            if (tag === 'input' || tag === 'textarea') return
            if (e.key === 's' || e.key === 'S') navigate('/search')
            else if (e.key === 'f' || e.key === 'F') navigate('/favorites')
            else if (e.key === 'h' || e.key === 'H') navigate('/')
            else if (e.key === 't' || e.key === 'T') navigate('/trending')
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [navigate])
    return null
}

// ── Konami Code easter egg (confetti explosion) ───────────
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
function KonamiEasterEgg() {
    useEffect(() => {
        let seq = []
        const handler = (e) => {
            seq.push(e.key)
            if (seq.length > KONAMI.length) seq.shift()
            if (JSON.stringify(seq) === JSON.stringify(KONAMI)) {
                seq = []
                launchConfetti()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])
    return null
}

function launchConfetti() {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:999999'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#6366f1', '#818cf8', '#f59e0b', '#fbbf24', '#a78bfa', '#34d399', '#f472b6']
    const particles = Array.from({ length: 180 }, () => ({
        x: Math.random() * canvas.width,
        y: -20,
        r: Math.random() * 7 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        rot: Math.random() * 360,
        rspeed: (Math.random() - 0.5) * 8,
        alpha: 1,
    }))
    let id
    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let alive = false
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.12
            p.rot += p.rspeed; p.alpha -= 0.006
            if (p.alpha > 0) { alive = true }
            ctx.save()
            ctx.globalAlpha = Math.max(0, p.alpha)
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rot * Math.PI / 180)
            ctx.fillStyle = p.color
            ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
            ctx.restore()
        })
        if (alive) id = requestAnimationFrame(draw)
        else { cancelAnimationFrame(id); canvas.remove() }
    }
    draw()
}

export default function App() {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dispatch(autoLogin())
    }, [dispatch])

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWatchlist())
            dispatch(fetchRatings())
            dispatch(fetchNotifications())
        }
    }, [isAuthenticated, dispatch])

    return (
        <>
            {loading && <PageLoader onComplete={() => setLoading(false)} />}
            <CursorFollower />
            <BrowserRouter>
                <KeyboardShortcuts />
                <KonamiEasterEgg />
                <ProgressBar />
                <Navbar />
                <PageTransition>
                    <Suspense fallback={<Spinner />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/movies" element={<Movies />} />
                            <Route path="/tv" element={<TVShows />} />
                            <Route path="/people" element={<People />} />
                            <Route path="/trending" element={<Trending />} />
                            <Route path="/charts" element={<Charts />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/movie/:id" element={<MovieDetail />} />
                            <Route path="/tv/:id" element={<TVDetail />} />
                            <Route path="/person/:id" element={<PersonDetail />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                            <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </PageTransition>
            </BrowserRouter>
        </>
    )
}
