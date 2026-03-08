const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const optAuth = (req, res, next) => { // optional auth
    const header = req.headers.authorization
    if (!header) return next()
    require('../middleware/authMiddleware')(req, res, next)
}
const { getActivePoll, vote, createPoll } = require('../controllers/pollController')

router.get('/active', optAuth, getActivePoll)
router.post('/vote/:pollId/:optionIndex', auth, vote)
router.post('/', auth, createPoll)

module.exports = router
