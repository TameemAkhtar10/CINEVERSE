const mongoose = require('mongoose')

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    movieId: { type: Number, default: null },
    movieTitle: { type: String, default: '' },
    poster: { type: String, default: '' },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

const pollSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        options: [optionSchema],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        endsAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Poll', pollSchema)
