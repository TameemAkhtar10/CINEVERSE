const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getRatings, upsertRating, removeRating } = require('../controllers/ratingsController')

router.use(auth)
router.get('/', getRatings)
router.post('/', upsertRating)
router.delete('/:movieId', removeRating)

module.exports = router
