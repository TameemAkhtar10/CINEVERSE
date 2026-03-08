const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        movieId: { type: Number, required: true },
        title: { type: String, required: true },
        poster: { type: String, default: '' },
        mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
        rating: { type: Number },
        year: { type: String },
    },
    { timestamps: true }
)

favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true })

module.exports = mongoose.model('Favorite', favoriteSchema)
