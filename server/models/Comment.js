const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {
        movieId: { type: Number, required: true },
        mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        text: { type: String, required: true, maxlength: 1000, trim: true },
        rating: { type: Number, min: 1, max: 10, default: null },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
)

commentSchema.index({ movieId: 1, createdAt: -1 })

module.exports = mongoose.model('Comment', commentSchema)
