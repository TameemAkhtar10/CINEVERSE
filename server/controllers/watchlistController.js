const Watchlist = require('../models/Watchlist')

const getWatchlist = async (req, res, next) => {
    try {
        const items = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.json(items)
    } catch (err) { next(err) }
}

const addToWatchlist = async (req, res, next) => {
    try {
        const { movieId, title, poster, mediaType, rating, year } = req.body
        if (!movieId || !title) return res.status(400).json({ message: 'movieId and title are required.' })
        const existing = await Watchlist.findOne({ user: req.user._id, movieId: Number(movieId) })
        if (existing) return res.status(409).json({ message: 'Already in watchlist.' })
        const item = await Watchlist.create({ user: req.user._id, movieId: Number(movieId), title, poster, mediaType, rating, year })
        res.status(201).json(item)
    } catch (err) { next(err) }
}

const removeFromWatchlist = async (req, res, next) => {
    try {
        await Watchlist.findOneAndDelete({ user: req.user._id, movieId: Number(req.params.movieId) })
        res.json({ message: 'Removed from watchlist.' })
    } catch (err) { next(err) }
}

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist }
