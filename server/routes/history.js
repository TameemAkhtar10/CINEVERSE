const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getHistory, addHistory, clearHistory } = require('../controllers/historyController')

router.use(auth)
router.get('/', getHistory)
router.post('/', addHistory)
router.delete('/', clearHistory)

module.exports = router
