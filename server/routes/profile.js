const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getProfile, updateProfile } = require('../controllers/profileController')

router.use(auth)
router.get('/', getProfile)
router.patch('/', updateProfile)

module.exports = router
