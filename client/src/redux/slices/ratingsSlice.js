import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance'

export const fetchRatings = createAsyncThunk('ratings/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.get('/ratings')
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch ratings')
    }
})

export const submitRating = createAsyncThunk('ratings/submit', async ({ movieId, mediaType, rating, title, poster }, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post('/ratings', { movieId, mediaType, rating, title, poster })
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to submit rating')
    }
})

export const deleteRating = createAsyncThunk('ratings/delete', async (movieId, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/ratings/${movieId}`)
        return movieId
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete rating')
    }
})

const ratingsSlice = createSlice({
    name: 'ratings',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRatings.fulfilled, (s, a) => { s.items = a.payload })
            .addCase(submitRating.fulfilled, (s, a) => {
                const idx = s.items.findIndex((r) => r.movieId === a.payload.movieId)
                if (idx >= 0) s.items[idx] = a.payload
                else s.items.push(a.payload)
            })
            .addCase(deleteRating.fulfilled, (s, a) => { s.items = s.items.filter((r) => r.movieId !== a.payload) })
    },
})

export default ratingsSlice.reducer
