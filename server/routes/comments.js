const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getComments, addComment, deleteComment, toggleLike } = require('../controllers/commentsController')

router.get('/:movieId', getComments)
router.post('/:movieId', auth, addComment)
router.delete('/:commentId', auth, deleteComment)
router.post('/:commentId/like', auth, toggleLike)

module.exports = router
