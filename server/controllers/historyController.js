const History = require('../models/History')

const getHistory = async (req, res, next) => {
    try {
        const history = await History.find({ user: req.user._id }).sort({ watchedAt: -1 }).limit(100)
        res.json(history)
    } catch (err) { next(err) }
}

const addHistory = async (req, res, next) => {
    try {
        const { movieId, title, poster, mediaType, rating, year } = req.body
        if (!movieId || !title) return res.status(400).json({ message: 'movieId and title are required.' })
        const entry = await History.findOneAndUpdate(
            { user: req.user._id, movieId },
            { title, poster, mediaType, rating, year, watchedAt: new Date() },
            { upsert: true, new: true }
        )
        res.status(201).json(entry)
    } catch (err) { next(err) }
}

const clearHistory = async (req, res, next) => {
    try {
        await History.deleteMany({ user: req.user._id })
        res.json({ message: 'History cleared.' })
    } catch (err) { next(err) }
}

module.exports = { getHistory, addHistory, clearHistory }
