const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoritesController')

router.use(auth)
router.get('/', getFavorites)
router.post('/', addFavorite)
router.delete('/:movieId', removeFavorite)

module.exports = router
