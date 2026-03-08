const CustomList = require('../models/CustomList')

// GET /api/lists — all lists for auth user
const getLists = async (req, res, next) => {
    try {
        const lists = await CustomList.find({ user: req.user._id }).sort({ updatedAt: -1 })
        res.json(lists)
    } catch (err) { next(err) }
}

// GET /api/lists/:id
const getList = async (req, res, next) => {
    try {
        const list = await CustomList.findOne({ _id: req.params.id, user: req.user._id })
        if (!list) return res.status(404).json({ message: 'List not found.' })
        res.json(list)
    } catch (err) { next(err) }
}

// POST /api/lists
const createList = async (req, res, next) => {
    try {
        const { name, description, emoji } = req.body
        if (!name?.trim()) return res.status(400).json({ message: 'Name is required.' })
        const list = await CustomList.create({
            user: req.user._id,
            name: name.trim(),
            description: description?.trim() || '',
            emoji: emoji || '🎬',
        })
        res.status(201).json(list)
    } catch (err) { next(err) }
}

// PUT /api/lists/:id — rename / update meta
const updateList = async (req, res, next) => {
    try {
        const { name, description, emoji } = req.body
        const list = await CustomList.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { name: name?.trim(), description: description?.trim(), emoji },
            { new: true }
        )
        if (!list) return res.status(404).json({ message: 'List not found.' })
        res.json(list)
    } catch (err) { next(err) }
}

// DELETE /api/lists/:id
const deleteList = async (req, res, next) => {
    try {
        await CustomList.findOneAndDelete({ _id: req.params.id, user: req.user._id })
        res.json({ message: 'List deleted.' })
    } catch (err) { next(err) }
}

// POST /api/lists/:id/movies — add movie to list
const addMovieToList = async (req, res, next) => {
    try {
        const { movieId, title, poster, mediaType, rating, year } = req.body
        if (!movieId || !title) return res.status(400).json({ message: 'movieId and title are required.' })
        const list = await CustomList.findOne({ _id: req.params.id, user: req.user._id })
        if (!list) return res.status(404).json({ message: 'List not found.' })
        const already = list.movies.some((m) => m.movieId === Number(movieId))
        if (already) return res.status(409).json({ message: 'Movie already in list.' })
        list.movies.push({ movieId: Number(movieId), title, poster: poster || '', mediaType: mediaType || 'movie', rating, year })
        await list.save()
        res.json(list)
    } catch (err) { next(err) }
}

// DELETE /api/lists/:id/movies/:movieId — remove movie from list
const removeMovieFromList = async (req, res, next) => {
    try {
        const list = await CustomList.findOne({ _id: req.params.id, user: req.user._id })
        if (!list) return res.status(404).json({ message: 'List not found.' })
        list.movies = list.movies.filter((m) => m.movieId !== Number(req.params.movieId))
        await list.save()
        res.json(list)
    } catch (err) { next(err) }
}

module.exports = { getLists, getList, createList, updateList, deleteList, addMovieToList, removeMovieFromList }
