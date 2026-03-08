import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { getMovieDetails, getMovieTrailer, getMovieCredits, getSimilarMovies, getMovieRecommendations, IMG } from '../api/tmdb'
import { addHistory } from '../redux/slices/historySlice'
import { addFavorite, removeFavorite } from '../redux/slices/favoritesSlice'
import { openTrailer } from '../redux/slices/uiSlice'
import TrailerModal from '../components/TrailerModal'
import ScrollRow from '../components/ScrollRow'
import CommentSection from '../components/CommentSection'
import { getTrailerKey, formatRating, formatDate } from '../utils/helpers'

// Famous quotes by TMDB movie ID
const QUOTES_DB = {
    550: [ // Fight Club
        { quote: "The first rule of Fight Club is: you do not talk about Fight Club.", speaker: "Tyler Durden" },
        { quote: "It's only after we've lost everything that we're free to do anything.", speaker: "Tyler Durden" },
        { quote: "You are not your job. You're not how much money you have in the bank.", speaker: "Tyler Durden" },
    ],
    278: [ // Shawshank Redemption
        { quote: "Get busy living, or get busy dying.", speaker: "Andy Dufresne" },
        { quote: "Hope is a good thing, maybe the best of things, and no good thing ever dies.", speaker: "Andy Dufresne" },
        { quote: "I have to remind myself that some birds aren't meant to be caged.", speaker: "Red" },
    ],
    238: [ // The Godfather
        { quote: "I'm going to make him an offer he can't refuse.", speaker: "Vito Corleone" },
        { quote: "Leave the gun. Take the cannoli.", speaker: "Peter Clemenza" },
        { quote: "A man who doesn't spend time with his family can never be a real man.", speaker: "Vito Corleone" },
    ],
    680: [ // Pulp Fiction
        { quote: "Say 'what' again. I dare you, I double dare you.", speaker: "Jules Winnfield" },
        { quote: "Personality goes a long way.", speaker: "Jules Winnfield" },
        { quote: "If my answers frighten you then you should cease asking scary questions.", speaker: "Jules Winnfield" },
    ],
    13: [ // Forrest Gump
        { quote: "Life is like a box of chocolates. You never know what you're gonna get.", speaker: "Forrest Gump" },
        { quote: "Stupid is as stupid does.", speaker: "Forrest Gump" },
        { quote: "Run, Forrest! Run!", speaker: "Mrs. Gump" },
    ],
    389: [ // 12 Angry Men
        { quote: "It's not easy to stand alone against the ridicule of others.", speaker: "Juror #8" },
        { quote: "We're talking about somebody's life here.", speaker: "Juror #8" },
    ],
    424: [ // Schindler's List
        { quote: "Whoever saves one life, saves the world entire.", speaker: "Inscription" },
        { quote: "I could have got more... I don't know, if I'd just... I could have got more.", speaker: "Oskar Schindler" },
    ],
    155: [ // The Dark Knight
        { quote: "Why so serious?", speaker: "The Joker" },
        { quote: "Some men just want to watch the world burn.", speaker: "Alfred" },
        { quote: "You either die a hero, or you live long enough to see yourself become the villain.", speaker: "Harvey Dent" },
    ],
    19404: [ // Dilwale Dulhania Le Jayenge
        { quote: "Ja Simran ja, jee le apni zindagi.", speaker: "Baldev Singh" },
    ],
    27205: [ // Inception
        { quote: "You mustn't be afraid to dream a little bigger, darling.", speaker: "Eames" },
        { quote: "An idea is like a virus, resilient, highly contagious.", speaker: "Cobb" },
        { quote: "The dream is real. The non-dream is the reality.", speaker: "Cobb" },
    ],
    769: [ // Goodfellas
        { quote: "As far back as I can remember, I always wanted to be a gangster.", speaker: "Henry Hill" },
        { quote: "Funny how? Like I'm a clown, I amuse you?", speaker: "Tommy DeVito" },
    ],
    11: [ // Star Wars: A New Hope
        { quote: "May the Force be with you.", speaker: "Han Solo" },
        { quote: "I find your lack of faith disturbing.", speaker: "Darth Vader" },
        { quote: "Do or do not. There is no try.", speaker: "Yoda" },
    ],
    200: [ // Batman Begins (filling up)
        { quote: "Why do we fall, sir? So that we can learn to pick ourselves up.", speaker: "Alfred" },
    ],
    597: [ // Titanic
        { quote: "I'm the king of the world!", speaker: "Jack Dawson" },
        { quote: "I'll never let go, Jack. I'll never let go.", speaker: "Rose DeWitt Bukater" },
    ],
    122: [ // The Lord of the Rings: Return of the King
        { quote: "There's some good in this world, Mr. Frodo, and it's worth fighting for.", speaker: "Samwise Gamgee" },
        { quote: "My precious.", speaker: "Gollum" },
    ],
}

function MovieQuotes({ movieId }) {
    const quotes = QUOTES_DB[Number(movieId)]
    if (!quotes || quotes.length === 0) return null
    return (
        <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-5">🎙️ Famous Quotes</h2>
            <div className="space-y-4">
                {quotes.map((q, i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-r from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-2xl px-6 py-5 relative overflow-hidden"
                    >
                        <div className="absolute top-3 left-4 text-4xl text-indigo-500/20 font-serif leading-none select-none">"</div>
                        <p className="text-white text-sm md:text-base leading-relaxed italic relative z-10 pl-3">
                            "{q.quote}"
                        </p>
                        <p className="text-indigo-300 text-xs font-semibold mt-2.5 pl-3 relative z-10">— {q.speaker}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function MovieDetail() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const favorites = useSelector((s) => s.favorites.items)
    const trailerOpen = useSelector((s) => s.ui.trailerOpen)
    const trailerKey = useSelector((s) => s.ui.trailerKey)

    const [movie, setMovie] = useState(null)
    const [cast, setCast] = useState([])
    const [similar, setSimilar] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [key, setKey] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const heroTitleRef = useRef(null)
    const heroMetaRef = useRef(null)
    const contentRef = useRef(null)
    const castRef = useRef(null)

    useEffect(() => {
        window.scrollTo(0, 0)
        setLoading(true)
        Promise.all([
            getMovieDetails(id),
            getMovieTrailer(id),
            getMovieCredits(id),
            getSimilarMovies(id),
            getMovieRecommendations(id),
        ])
            .then(([mRes, vRes, cRes, sRes, recRes]) => {
                setMovie(mRes.data)
                setKey(getTrailerKey(vRes.data))
                setCast(cRes.data.cast?.slice(0, 12) || [])
                setSimilar(sRes.data.results || [])
                setRecommendations(recRes.data.results || [])
                if (isAuthenticated) {
                    dispatch(addHistory({
                        movieId: mRes.data.id,
                        title: mRes.data.title,
                        poster: mRes.data.poster_path || '',
                        mediaType: 'movie',
                        rating: mRes.data.vote_average,
                        year: formatDate(mRes.data.release_date),
                    }))
                }

                requestAnimationFrame(() => {
                    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
                    if (heroTitleRef.current) tl.from(heroTitleRef.current, { x: -60, opacity: 0, duration: 0.7 })
                    if (heroMetaRef.current) tl.from(heroMetaRef.current, { y: 20, opacity: 0, duration: 0.55 }, '-=0.4')
                    if (contentRef.current) tl.from(contentRef.current, { x: 60, opacity: 0, duration: 0.65 }, '-=0.5')
                })
            })
            .catch(() => setError('Failed to load movie details.'))
            .finally(() => setLoading(false))
    }, [id])

    const isFav = favorites.some((f) => f.movieId === Number(id))

    const toggleFav = () => {
        if (!isAuthenticated || !movie) return
        if (isFav) {
            dispatch(removeFavorite(movie.id))
        } else {
            dispatch(addFavorite({ movieId: movie.id, title: movie.title, poster: movie.poster_path || '', mediaType: 'movie', rating: movie.vote_average, year: formatDate(movie.release_date) }))
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-bg pt-16 animate-pulse">
            <div className="w-full h-[400px] bg-card" />
            <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8">
                <div className="w-48 h-72 bg-card rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-4">
                    <div className="h-8 bg-card rounded w-1/2" />
                    <div className="h-4 bg-card rounded w-1/4" />
                    <div className="h-20 bg-card rounded" />
                </div>
            </div>
        </div>
    )

    if (error) return <div className="min-h-screen bg-bg flex items-center justify-center text-accent">{error}</div>
    if (!movie) return null

    const backdrop = IMG(movie.backdrop_path, 'original')
    const poster = IMG(movie.poster_path, 'w342')
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null

    return (
        <div className="min-h-screen bg-bg animate-fade-in">
            {/* ── Hero Backdrop ───────────────────────────────── */}
            <div className="relative w-full h-[500px]">
                <div className="absolute inset-0 overflow-hidden">
                    {backdrop ? (
                        <img src={backdrop} alt={movie.title} className="w-full h-full object-cover object-center" />
                    ) : (
                        <div className="w-full h-full bg-card" />
                    )}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.3) 100%)' }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }}
                    />
                </div>

                {/* Title + meta inside hero */}
                <div className="absolute bottom-10 left-6 right-6 md:right-12 z-10">
                    <h1
                        ref={heroTitleRef}
                        className="text-3xl md:text-4xl font-extrabold text-white leading-tight"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.7)' }}
                    >
                        {movie.title}
                    </h1>
                    <div ref={heroMetaRef} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-sm text-white/80">
                        {formatDate(movie.release_date) && <span>{formatDate(movie.release_date)}</span>}
                        {runtime && (
                            <>
                                <span className="text-white/30">·</span>
                                <span>{runtime}</span>
                            </>
                        )}
                        <span className="flex items-center gap-1 text-yellow-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                            </svg>
                            {formatRating(movie.vote_average)}
                        </span>
                    </div>
                    {movie.genres?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {movie.genres.slice(0, 4).map((g) => (
                                <span
                                    key={g.id}
                                    className="px-2.5 py-0.5 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-white/80 backdrop-blur-sm"
                                >
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content below hero ──────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 md:px-10 pt-8">
                <div ref={contentRef} className="flex flex-col gap-4">
                    <div className="space-y-4">
                        <p className="text-text-secondary leading-relaxed">{movie.overview || 'Description not available.'}</p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={() => dispatch(openTrailer(key))}
                                className="flex items-center gap-2 bg-accent hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-red-sm hover:shadow-red-glow"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                Play Trailer
                            </button>
                            {isAuthenticated && (
                                <button
                                    onClick={toggleFav}
                                    className={`flex items-center gap-2 border font-semibold px-6 py-3 rounded-full transition-all ${isFav ? 'border-accent text-accent bg-accent/10' : 'border-white/40 text-white hover:border-white'}`}
                                >
                                    <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                                    </svg>
                                    {isFav ? 'Saved' : 'Add to Favorites'}
                                </button>
                            )}
                            {/* Wallpaper download */}
                            {movie.poster_path && (
                                <a
                                    href={IMG(movie.poster_path, 'original')}
                                    download={`${movie.title}-wallpaper.jpg`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 border border-white/20 text-white/70 hover:border-indigo-500/50 hover:text-indigo-300 font-semibold px-5 py-3 rounded-full transition-all text-sm"
                                >
                                    📥 Download Poster
                                </a>
                            )}
                            {/* Share */}
                            <button
                                onClick={() => {
                                    const url = window.location.href
                                    if (navigator.share) {
                                        navigator.share({ title: movie.title, text: `Check out ${movie.title} on CineVerse!`, url })
                                    } else {
                                        navigator.clipboard.writeText(url)
                                        alert('Link copied to clipboard!')
                                    }
                                }}
                                className="flex items-center gap-2 border border-white/20 text-white/70 hover:border-white/40 hover:text-white font-semibold px-5 py-3 rounded-full transition-all text-sm"
                            >
                                🔗 Share
                            </button>
                        </div>
                    </div>
                </div>

                {cast.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-white mb-4">Cast</h2>
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                            {cast.map((c) => {
                                const photo = IMG(c.profile_path, 'w185')
                                return (
                                    <div key={c.id} className="flex-shrink-0 w-24 text-center">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-card mx-auto mb-2">
                                            {photo ? (
                                                <img src={photo} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-white text-xs font-semibold leading-tight">{c.name}</p>
                                        <p className="text-text-secondary text-[10px] mt-0.5 leading-tight">{c.character}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {similar.length > 0 && (
                    <div className="mt-8">
                        <ScrollRow title="Similar Movies" items={similar} loading={false} mediaType="movie" />
                    </div>
                )}

                {recommendations.length > 0 && (
                    <div className="mt-2 mb-4">
                        <ScrollRow title="✨ You Might Also Like" items={recommendations} loading={false} mediaType="movie" />
                    </div>
                )}

                <div className="max-w-3xl pb-16">
                    <MovieQuotes movieId={movie.id} />
                    <CommentSection movieId={movie.id} mediaType="movie" />
                </div>
            </div>

            {trailerOpen && <TrailerModal trailerKey={trailerKey} />}
        </div>
    )
}
