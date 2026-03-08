const Favorite = require('../models/Favorite')

const getFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.json(favorites)
    } catch (err) { next(err) }
}

const addFavorite = async (req, res, next) => {
    try {
        const { movieId, title, poster, mediaType, rating, year } = req.body
        if (!movieId || !title) return res.status(400).json({ message: 'movieId and title are required.' })
        const existing = await Favorite.findOne({ user: req.user._id, movieId })
        if (existing) return res.status(409).json({ message: 'Already in favorites.' })
        const fav = await Favorite.create({ user: req.user._id, movieId, title, poster, mediaType, rating, year })
        res.status(201).json(fav)
    } catch (err) { next(err) }
}

const removeFavorite = async (req, res, next) => {
    try {
        const { movieId } = req.params
        await Favorite.findOneAndDelete({ user: req.user._id, movieId: Number(movieId) })
        res.json({ message: 'Removed from favorites.' })
    } catch (err) { next(err) }
}

module.exports = { getFavorites, addFavorite, removeFavorite }
