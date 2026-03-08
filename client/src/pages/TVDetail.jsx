import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getTVDetails, getTVTrailer, getTVCredits, getSimilarTV, IMG } from '../api/tmdb'
import { addHistory } from '../redux/slices/historySlice'
import { addFavorite, removeFavorite } from '../redux/slices/favoritesSlice'
import { openTrailer } from '../redux/slices/uiSlice'
import TrailerModal from '../components/TrailerModal'
import ScrollRow from '../components/ScrollRow'
import { getTrailerKey, getGenreNames, formatRating, formatDate } from '../utils/helpers'

export default function TVDetail() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const favorites = useSelector((s) => s.favorites.items)
    const trailerOpen = useSelector((s) => s.ui.trailerOpen)
    const trailerKey = useSelector((s) => s.ui.trailerKey)

    const [show, setShow] = useState(null)
    const [cast, setCast] = useState([])
    const [similar, setSimilar] = useState([])
    const [key, setKey] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        window.scrollTo(0, 0)
        setLoading(true)
        Promise.all([
            getTVDetails(id),
            getTVTrailer(id),
            getTVCredits(id),
            getSimilarTV(id),
        ])
            .then(([sRes, vRes, cRes, simRes]) => {
                setShow(sRes.data)
                setKey(getTrailerKey(vRes.data))
                setCast(cRes.data.cast?.slice(0, 12) || [])
                setSimilar(simRes.data.results || [])
                if (isAuthenticated) {
                    dispatch(addHistory({
                        movieId: sRes.data.id,
                        title: sRes.data.name,
                        poster: sRes.data.poster_path || '',
                        mediaType: 'tv',
                        rating: sRes.data.vote_average,
                        year: formatDate(sRes.data.first_air_date),
                    }))
                }
            })
            .catch(() => setError('Failed to load TV show details.'))
            .finally(() => setLoading(false))
    }, [id])

    const isFav = favorites.some((f) => f.movieId === Number(id))

    const toggleFav = () => {
        if (!isAuthenticated || !show) return
        if (isFav) {
            dispatch(removeFavorite(show.id))
        } else {
            dispatch(addFavorite({ movieId: show.id, title: show.name, poster: show.poster_path || '', mediaType: 'tv', rating: show.vote_average, year: formatDate(show.first_air_date) }))
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
    if (!show) return null

    const backdrop = IMG(show.backdrop_path, 'original')
    const poster = IMG(show.poster_path, 'w342')
    const seasons = show.number_of_seasons ? `${show.number_of_seasons} Season${show.number_of_seasons > 1 ? 's' : ''}` : null

    return (
        <div className="min-h-screen bg-bg animate-fade-in">
            <div className="relative w-full h-[400px] bg-cover bg-center" style={{ backgroundImage: backdrop ? `url(${backdrop})` : undefined }}>
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-32 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0 w-48 hidden md:block">
                        {poster ? (
                            <img src={poster} alt={show.name} className="w-full rounded-xl shadow-red-sm" />
                        ) : (
                            <div className="w-full h-72 bg-card rounded-xl flex items-center justify-center">
                                <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /></svg>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-4 pt-4">
                        <h1 className="text-4xl font-extrabold text-white">{show.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                            {formatDate(show.first_air_date) && <span>{formatDate(show.first_air_date)}</span>}
                            {seasons && <span>{seasons}</span>}
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" /></svg>
                                {formatRating(show.vote_average)}
                            </span>
                            <span className="text-accent font-semibold">{getGenreNames(show.genres)}</span>
                        </div>

                        <p className="text-text-secondary leading-relaxed">{show.overview || 'Description not available.'}</p>

                        <div className="flex gap-4 pt-2">
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
                                    <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" /></svg>
                                    {isFav ? 'Saved' : 'Add to Favorites'}
                                </button>
                            )}
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
                                            {photo ? <img src={photo} alt={c.name} className="w-full h-full object-cover" loading="lazy" /> : (
                                                <div className="w-full h-full flex items-center justify-center"><svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg></div>
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
                    <div className="mt-8 mb-10">
                        <ScrollRow title="Similar TV Shows" items={similar} loading={false} mediaType="tv" />
                    </div>
                )}
            </div>

            {trailerOpen && <TrailerModal trailerKey={trailerKey} />}
        </div>
    )
}
