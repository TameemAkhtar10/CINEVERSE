const mongoose = require('mongoose')

const customListSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true, maxlength: 80 },
        description: { type: String, default: '', maxlength: 300 },
        emoji: { type: String, default: '🎬' },
        movies: [
            {
                movieId: { type: Number, required: true },
                title: { type: String, default: '' },
                poster: { type: String, default: '' },
                mediaType: { type: String, default: 'movie' },
                rating: { type: Number },
                year: { type: String },
                addedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
)

customListSchema.index({ user: 1 })

module.exports = mongoose.model('CustomList', customListSchema)
