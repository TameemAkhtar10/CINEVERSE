const History = require('../models/History')

// GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const board = await History.aggregate([
            { $group: { _id: '$user', count: { $sum: 1 }, lastWatched: { $max: '$watchedAt' } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    lastWatched: 1,
                    name: '$userInfo.name',
                },
            },
        ])
        res.json(board)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
