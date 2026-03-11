/**
 * TMDB Proxy Route
 * All requests from the client to /api/tmdb/* are forwarded here.
 * The server makes the actual call to api.themoviedb.org so the
 * browser never connects to TMDB directly (avoids regional blocks).
 * The API key is injected server-side so it is never exposed to the client.
 */

const express = require('express')
const axios = require('axios')

const router = express.Router()

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = process.env.TMDB_API_KEY || 'ed6cfb37b3b961f3a98fb206579f7bfd'

router.get('/*', async (req, res) => {
    try {
        // Remove any api_key the client may have sent; server injects its own
        const { api_key: _dropped, ...clientParams } = req.query

        const url = `${TMDB_BASE}${req.path}`
        const { data } = await axios.get(url, {
            params: { ...clientParams, api_key: TMDB_KEY },
            timeout: 12000,
        })
        res.json(data)
    } catch (err) {
        const status = err.response?.status || 502
        const message = err.response?.data?.status_message || 'TMDB request failed'
        res.status(status).json({ message })
    }
})

module.exports = router
