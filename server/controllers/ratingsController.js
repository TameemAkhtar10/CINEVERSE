const Rating = require('../models/Rating')

const getRatings = async (req, res, next) => {
    try {
        const ratings = await Rating.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.json(ratings)
    } catch (err) { next(err) }
}

const upsertRating = async (req, res, next) => {
    try {
        const { movieId, rating, title, poster, mediaType } = req.body
        if (!movieId || !rating) return res.status(400).json({ message: 'movieId and rating are required.' })
        if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5.' })
        const doc = await Rating.findOneAndUpdate(
            { user: req.user._id, movieId: Number(movieId) },
            { rating, title, poster, mediaType },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        res.status(200).json(doc)
    } catch (err) { next(err) }
}

const removeRating = async (req, res, next) => {
    try {
        await Rating.findOneAndDelete({ user: req.user._id, movieId: Number(req.params.movieId) })
        res.json({ message: 'Rating removed.' })
    } catch (err) { next(err) }
}

module.exports = { getRatings, upsertRating, removeRating }
