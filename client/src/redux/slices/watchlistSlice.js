import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance'

export const fetchWatchlist = createAsyncThunk('watchlist/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.get('/watchlist')
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch watchlist')
    }
})

export const addToWatchlist = createAsyncThunk('watchlist/add', async (movie, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post('/watchlist', movie)
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to add to watchlist')
    }
})

export const removeFromWatchlist = createAsyncThunk('watchlist/remove', async (movieId, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/watchlist/${movieId}`)
        return movieId
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to remove from watchlist')
    }
})

const watchlistSlice = createSlice({
    name: 'watchlist',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWatchlist.pending, (s) => { s.loading = true })
            .addCase(fetchWatchlist.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
            .addCase(fetchWatchlist.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(addToWatchlist.fulfilled, (s, a) => { s.items.push(a.payload) })
            .addCase(removeFromWatchlist.fulfilled, (s, a) => { s.items = s.items.filter((i) => i.movieId !== a.payload) })
    },
})

export default watchlistSlice.reducer
