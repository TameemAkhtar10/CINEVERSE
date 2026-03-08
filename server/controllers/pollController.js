const Poll = require('../models/Poll')

// GET /api/polls/active
exports.getActivePoll = async (req, res) => {
    try {
        const poll = await Poll.findOne({ active: true, endsAt: { $gt: new Date() } })
            .sort({ createdAt: -1 })
            .lean()
        if (!poll) return res.json(null)
        // Don't expose who voted for whom, just counts
        const sanitized = {
            ...poll,
            options: poll.options.map((o) => ({
                ...o,
                voteCount: o.votes.length,
                voted: req.user ? o.votes.some((v) => v.toString() === req.user?._id?.toString()) : false,
                votes: undefined,
            })),
        }
        res.json(sanitized)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/polls/vote/:pollId/:optionIndex
exports.vote = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Login required' })
        const { pollId, optionIndex } = req.params
        const poll = await Poll.findById(pollId)
        if (!poll || !poll.active || poll.endsAt < new Date()) {
            return res.status(400).json({ message: 'Poll is not active' })
        }
        const idx = Number(optionIndex)
        if (idx < 0 || idx >= poll.options.length) return res.status(400).json({ message: 'Invalid option' })

        // Remove previous vote from all options
        poll.options.forEach((o) => {
            const i = o.votes.findIndex((v) => v.toString() === req.user._id.toString())
            if (i > -1) o.votes.splice(i, 1)
        })
        poll.options[idx].votes.push(req.user._id)
        await poll.save()
        res.json({ message: 'Voted', optionIndex: idx })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/polls (admin only)
exports.createPoll = async (req, res) => {
    try {
        if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin only' })
        const { question, options, endsAt } = req.body
        if (!question || !options || options.length < 2) {
            return res.status(400).json({ message: 'Question and at least 2 options required' })
        }
        // Deactivate previous polls
        await Poll.updateMany({ active: true }, { active: false })
        const poll = await Poll.create({
            question,
            options: options.map((o) => ({ ...o, votes: [] })),
            createdBy: req.user._id,
            endsAt: endsAt ? new Date(endsAt) : undefined,
            active: true,
        })
        res.status(201).json(poll)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
