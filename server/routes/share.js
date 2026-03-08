const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { generateToken, getShared } = require('../controllers/shareController')

router.post('/generate', auth, generateToken)
router.get('/:token', getShared)

module.exports = router
