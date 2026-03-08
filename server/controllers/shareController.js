const ShareToken = require('../models/ShareToken')
const Watchlist = require('../models/Watchlist')
const Favorite = require('../models/Favorite')

// POST /api/share/generate  { type: 'watchlist' | 'favorites' }
exports.generateToken = async (req, res) => {
    try {
        const { type = 'watchlist' } = req.body
        // Revoke old tokens of same type
        await ShareToken.deleteMany({ userId: req.user._id, type })
        const share = await ShareToken.create({ userId: req.user._id, type })
        res.json({ token: share.token, type })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/share/:token  (public)
exports.getShared = async (req, res) => {
    try {
        const share = await ShareToken.findOne({
            token: req.params.token,
            expiresAt: { $gt: new Date() },
        }).populate('userId', 'name')
        if (!share) return res.status(404).json({ message: 'Share link expired or invalid' })

        let items = []
        if (share.type === 'watchlist') {
            items = await Watchlist.find({ user: share.userId }).lean()
        } else {
            items = await Favorite.find({ user: share.userId }).lean()
        }
        res.json({ owner: share.userId.name, type: share.type, items })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
