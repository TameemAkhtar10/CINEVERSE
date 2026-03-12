const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const historyRoutes = require('./routes/history')
const adminRoutes = require('./routes/admin')
const ratingsRoutes = require('./routes/ratings')
const watchlistRoutes = require('./routes/watchlist')
const notificationsRoutes = require('./routes/notifications')
const profileRoutes = require('./routes/profile')
const commentsRoutes = require('./routes/comments')
const pollsRoutes = require('./routes/polls')
const leaderboardRoutes = require('./routes/leaderboard')
const shareRoutes = require('./routes/share')
const customListsRoutes = require('./routes/customLists')
const tmdbRoutes = require('./routes/tmdb')

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ratings', ratingsRoutes)
app.use('/api/watchlist', watchlistRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/polls', pollsRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/share', shareRoutes)
app.use('/api/lists', customListsRoutes)
app.use('/api/tmdb', tmdbRoutes)

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use((err, req, res, next) => {
    const status = err.status || 500
    res.status(status).json({ message: err.message || 'Internal Server Error' })
})

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        const PORT = process.env.PORT || 5000
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message)
        process.exit(1)
    })