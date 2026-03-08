const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        genre: { type: String, trim: true },
        year: { type: String, trim: true },
        rating: { type: String, trim: true },
        poster: { type: String, trim: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Movie', movieSchema)
