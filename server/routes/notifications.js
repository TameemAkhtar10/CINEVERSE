const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getNotifications, markAllRead, deleteNotification } = require('../controllers/notificationsController')

router.use(auth)
router.get('/', getNotifications)
router.patch('/read-all', markAllRead)
router.delete('/:id', deleteNotification)

module.exports = router
