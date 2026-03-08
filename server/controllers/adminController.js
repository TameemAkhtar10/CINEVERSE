const Movie = require('../models/Movie')
const User = require('../models/User')

const getMovies = async (req, res, next) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 })
        res.json(movies)
    } catch (err) { next(err) }
}

const createMovie = async (req, res, next) => {
    try {
        const { title, genre, year, rating, poster } = req.body
        if (!title) return res.status(400).json({ message: 'Title is required.' })
        const movie = await Movie.create({ title, genre, year, rating, poster })
        res.status(201).json(movie)
    } catch (err) { next(err) }
}

const updateMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!movie) return res.status(404).json({ message: 'Movie not found.' })
        res.json(movie)
    } catch (err) { next(err) }
}

const deleteMovie = async (req, res, next) => {
    try {
        await Movie.findByIdAndDelete(req.params.id)
        res.json({ message: 'Movie deleted.' })
    } catch (err) { next(err) }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 })
        res.json(users)
    } catch (err) { next(err) }
}

const updateUser = async (req, res, next) => {
    try {
        const allowed = { banned: req.body.banned, isAdmin: req.body.isAdmin }
        const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true }).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found.' })
        res.json(user)
    } catch (err) { next(err) }
}

const deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.json({ message: 'User deleted.' })
    } catch (err) { next(err) }
}

module.exports = { getMovies, createMovie, updateMovie, deleteMovie, getUsers, updateUser, deleteUser }
