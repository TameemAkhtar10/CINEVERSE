const Comment = require('../models/Comment')

// GET /api/comments/:movieId
exports.getComments = async (req, res) => {
    try {
        const { movieId } = req.params
        const comments = await Comment.find({ movieId: Number(movieId) })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
        res.json(comments)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/comments/:movieId
exports.addComment = async (req, res) => {
    try {
        const { movieId } = req.params
        const { text, rating, mediaType } = req.body
        if (!text || !text.trim()) return res.status(400).json({ message: 'Comment text required' })
        const comment = await Comment.create({
            movieId: Number(movieId),
            mediaType: mediaType || 'movie',
            userId: req.user._id,
            userName: req.user.name,
            text: text.trim().slice(0, 1000),
            rating: rating ? Math.min(10, Math.max(1, Number(rating))) : null,
        })
        res.status(201).json(comment)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE /api/comments/:commentId
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
        if (!comment) return res.status(404).json({ message: 'Comment not found' })
        if (comment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Forbidden' })
        }
        await comment.deleteOne()
        res.json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/comments/:commentId/like
exports.toggleLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
        if (!comment) return res.status(404).json({ message: 'Not found' })
        const uid = req.user._id.toString()
        const idx = comment.likes.findIndex((l) => l.toString() === uid)
        if (idx > -1) {
            comment.likes.splice(idx, 1)
        } else {
            comment.likes.push(req.user._id)
        }
        await comment.save()
        res.json({ likes: comment.likes.length, liked: idx === -1 })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
