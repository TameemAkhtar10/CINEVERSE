const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' })
        }
        const exists = await User.findOne({ email })
        if (exists) return res.status(409).json({ message: 'Email already in use.' })
        const user = await User.create({ name, email, password })
        const token = signToken(user._id)
        res.status(201).json({ token, user })
    } catch (err) {
        next(err)
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' })
        if (user.banned) return res.status(403).json({ message: 'Your account has been banned.' })
        const valid = await user.comparePassword(password)
        if (!valid) return res.status(401).json({ message: 'Invalid credentials.' })
        const token = signToken(user._id)
        res.json({ token, user })
    } catch (err) {
        next(err)
    }
}

module.exports = { signup, login }
