export const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).getFullYear()
}

export const formatRating = (n) => {
    if (n == null) return 'N/A'
    return Number(n).toFixed(1)
}

export const getTrailerKey = (videos) => {
    if (!videos?.results?.length) return null
    const official = videos.results.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    )
    const fallback = videos.results.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
    )
    const any = videos.results.find((v) => v.site === 'YouTube')
    return (official || fallback || any)?.key || null
}

export const getGenreNames = (genres) => {
    if (!genres?.length) return ''
    return genres
        .slice(0, 3)
        .map((g) => g.name)
        .join(' · ')
}

export const truncate = (str, len = 160) => {
    if (!str) return ''
    return str.length > len ? str.slice(0, len).trimEnd() + '…' : str
}
