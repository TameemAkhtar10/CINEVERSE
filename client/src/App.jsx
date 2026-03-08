import React, { Suspense, lazy, useEffect, useRef, useLayoutEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

function PageTransition({ children }) {
    const containerRef = useRef(null)
    const location = useLocation()

    useLayoutEffect(() => {
        const el = containerRef.current
        if (!el) return
        gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: true })
    }, [location.pathname])

    return <div ref={containerRef}>{children}</div>
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
