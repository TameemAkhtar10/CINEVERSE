import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance'

export const fetchHistory = createAsyncThunk('history/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.get('/history')
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch history')
    }
})

export const addHistory = createAsyncThunk('history/add', async (movie, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post('/history', movie)
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to add history')
    }
})

export const clearHistory = createAsyncThunk('history/clear', async (_, { rejectWithValue }) => {
    try {
        await axiosInstance.delete('/history')
        return true
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to clear history')
    }
})

const historySlice = createSlice({
    name: 'history',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHistory.pending, (s) => { s.loading = true })
            .addCase(fetchHistory.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
            .addCase(fetchHistory.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(addHistory.fulfilled, (s, a) => {
                s.items = s.items.filter((i) => i.movieId !== a.payload.movieId)
                s.items.unshift(a.payload)
            })
            .addCase(clearHistory.fulfilled, (s) => { s.items = [] })
    },
})

export default historySlice.reducer
