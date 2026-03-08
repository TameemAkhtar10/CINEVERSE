const Notification = require('../models/Notification')

const getNotifications = async (req, res, next) => {
    try {
        const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30)
        res.json(notes)
    } catch (err) { next(err) }
}

const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
        res.json({ message: 'Marked all as read.' })
    } catch (err) { next(err) }
}

const deleteNotification = async (req, res, next) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id })
        res.json({ message: 'Deleted.' })
    } catch (err) { next(err) }
}

module.exports = { getNotifications, markAllRead, deleteNotification }
