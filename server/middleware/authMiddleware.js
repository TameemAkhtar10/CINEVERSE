const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required.' })
    }
    const token = header.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')
        if (!user) return res.status(401).json({ message: 'User not found.' })
        if (user.banned) return res.status(403).json({ message: 'Your account has been banned.' })
        req.user = user
        next()
    } catch {
        res.status(401).json({ message: 'Invalid or expired token.' })
    }
}

module.exports = authMiddleware
