const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {
    getLists, getList, createList, updateList, deleteList,
    addMovieToList, removeMovieFromList,
} = require('../controllers/customListController')

router.use(auth)

router.get('/', getLists)
router.post('/', createList)
router.get('/:id', getList)
router.put('/:id', updateList)
router.delete('/:id', deleteList)
router.post('/:id/movies', addMovieToList)
router.delete('/:id/movies/:movieId', removeMovieFromList)

module.exports = router
