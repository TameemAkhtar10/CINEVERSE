const User = require('../models/User')
const Favorite = require('../models/Favorite')
const History = require('../models/History')
const Rating = require('../models/Rating')

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
        const [favCount, histCount, ratingCount] = await Promise.all([
            Favorite.countDocuments({ user: req.user._id }),
            History.countDocuments({ user: req.user._id }),
            Rating.countDocuments({ user: req.user._id }),
        ])
        res.json({
            ...user.toJSON(),
            stats: { favorites: favCount, history: histCount, ratings: ratingCount },
        })
    } catch (err) { next(err) }
}

const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body
        if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required.' })
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim() },
            { new: true }
        ).select('-password')
        res.json(user)
    } catch (err) { next(err) }
}

module.exports = { getProfile, updateProfile }
