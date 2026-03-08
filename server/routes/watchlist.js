const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController')

router.use(auth)
router.get('/', getWatchlist)
router.post('/', addToWatchlist)
router.delete('/:movieId', removeFromWatchlist)

module.exports = router
