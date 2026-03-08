const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const admin = require('../middleware/adminMiddleware')
const {
    getMovies, createMovie, updateMovie, deleteMovie,
    getUsers, updateUser, deleteUser,
} = require('../controllers/adminController')

router.use(auth, admin)

router.get('/movies', getMovies)
router.post('/movies', createMovie)
router.put('/movies/:id', updateMovie)
router.delete('/movies/:id', deleteMovie)

router.get('/users', getUsers)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

module.exports = router
