import axios from 'axios'

const tmdb = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/tmdb`
        : '/api/tmdb',
})

const p = (extra = {}) => ({ ...extra })

export const getTrending = (mediaType = 'all', timeWindow = 'week') =>
    tmdb.get(`/trending/${mediaType}/${timeWindow}`, { params: p() })

export const getPopularMovies = (page = 1) =>
    tmdb.get('/movie/popular', { params: p({ page }) })

export const getPopularTV = (page = 1) =>
    tmdb.get('/tv/popular', { params: p({ page }) })

export const getTopRated = (page = 1) =>
    tmdb.get('/movie/top_rated', { params: p({ page }) })

export const getNowPlaying = (page = 1) =>
    tmdb.get('/movie/now_playing', { params: p({ page }) })

export const searchMulti = (query, page = 1) =>
    tmdb.get('/search/multi', { params: p({ query, page }) })

export const searchMovies = (query, opts = {}) =>
    tmdb.get('/search/movie', { params: p({ query, page: opts.page || 1, year: opts.year || undefined }) })

export const searchTV = (query, opts = {}) =>
    tmdb.get('/search/tv', { params: p({ query, page: opts.page || 1, first_air_date_year: opts.year || undefined }) })

export const getMovieDetails = (id) =>
    tmdb.get(`/movie/${id}`, { params: p({ append_to_response: 'genres,belongs_to_collection' }) })

export const getTVDetails = (id) =>
    tmdb.get(`/tv/${id}`, { params: p({ append_to_response: 'genres' }) })

export const getPersonDetails = (id) =>
    tmdb.get(`/person/${id}`, { params: p({ append_to_response: 'combined_credits,external_ids' }) })

export const getMovieTrailer = (id) =>
    tmdb.get(`/movie/${id}/videos`, { params: p() })

export const getTVTrailer = (id) =>
    tmdb.get(`/tv/${id}/videos`, { params: p() })

export const getMovieCredits = (id) =>
    tmdb.get(`/movie/${id}/credits`, { params: p() })

export const getTVCredits = (id) =>
    tmdb.get(`/tv/${id}/credits`, { params: p() })

export const getSimilarMovies = (id, page = 1) =>
    tmdb.get(`/movie/${id}/similar`, { params: p({ page }) })

export const getSimilarTV = (id, page = 1) =>
    tmdb.get(`/tv/${id}/similar`, { params: p({ page }) })

export const getMoviesByGenre = (genreId, page = 1) =>
    tmdb.get('/discover/movie', { params: p({ with_genres: genreId, page }) })

export const getTVByGenre = (genreId, page = 1) =>
    tmdb.get('/discover/tv', { params: p({ with_genres: genreId, page }) })

export const getMovieGenres = () =>
    tmdb.get('/genre/movie/list', { params: p() })

export const getTVGenres = () =>
    tmdb.get('/genre/tv/list', { params: p() })

export const getPopularPeople = (page = 1) =>
    tmdb.get('/person/popular', { params: p({ page }) })

export const getCollection = (id) =>
    tmdb.get(`/collection/${id}`, { params: p() })

export const discoverMovies = (opts = {}) =>
    tmdb.get('/discover/movie', {
        params: p({
            with_genres: opts.genreId || undefined,
            primary_release_year: opts.year || undefined,
            'vote_average.gte': opts.minRating || undefined,
            'vote_average.lte': opts.maxRating || undefined,
            sort_by: opts.sortBy || 'popularity.desc',
            page: opts.page || 1,
        }),
    })

export const IMG = (path, size = 'w500') =>
    path ? `${import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p'}/${size}${path}` : null

// ── New helpers ────────────────────────────────────────────
export const searchPeople = (query, page = 1) =>
    tmdb.get('/search/person', { params: p({ query, page }) })

export const getMovieRecommendations = (id, page = 1) =>
    tmdb.get(`/movie/${id}/recommendations`, { params: p({ page }) })

export const getHiddenGems = (page = 1) =>
    tmdb.get('/discover/movie', {
        params: p({
            'vote_average.gte': 7.5,
            'vote_count.gte': 200,
            'popularity.lte': 50,
            sort_by: 'vote_average.desc',
            page,
        }),
    })

export const getTVRecommendations = (id, page = 1) =>
    tmdb.get(`/tv/${id}/recommendations`, { params: p({ page }) })

export const getMoviesByDirector = (personId, page = 1) =>
    tmdb.get('/discover/movie', { params: p({ with_crew: personId, sort_by: 'release_date.asc', page }) })

export const getMoviesByActor = (personId, page = 1) =>
    tmdb.get('/discover/movie', { params: p({ with_cast: personId, sort_by: 'vote_count.desc', page }) })

