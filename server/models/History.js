const mongoose = require('mongoose')

const historySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        movieId: { type: Number, required: true },
        title: { type: String, required: true },
        poster: { type: String, default: '' },
        mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
        rating: { type: Number },
        year: { type: String },
        watchedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

historySchema.index({ user: 1, movieId: 1 }, { unique: true })

module.exports = mongoose.model('History', historySchema)
