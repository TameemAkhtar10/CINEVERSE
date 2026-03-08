const mongoose = require('mongoose')
const crypto = require('crypto')

const shareTokenSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        token: { type: String, required: true, unique: true, default: () => crypto.randomBytes(16).toString('hex') },
        type: { type: String, enum: ['watchlist', 'favorites'], default: 'watchlist' },
        expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    { timestamps: true }
)

shareTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('ShareToken', shareTokenSchema)
