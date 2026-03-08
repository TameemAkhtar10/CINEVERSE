import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance'

export const fetchFavorites = createAsyncThunk('favorites/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.get('/favorites')
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch favorites')
    }
})

export const addFavorite = createAsyncThunk('favorites/add', async (movie, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post('/favorites', movie)
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to add favorite')
    }
})

export const removeFavorite = createAsyncThunk('favorites/remove', async (movieId, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/favorites/${movieId}`)
        return movieId
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to remove favorite')
    }
})

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFavorites.pending, (s) => { s.loading = true })
            .addCase(fetchFavorites.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
            .addCase(fetchFavorites.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(addFavorite.fulfilled, (s, a) => { s.items.push(a.payload) })
            .addCase(removeFavorite.fulfilled, (s, a) => { s.items = s.items.filter((i) => i.movieId !== a.payload) })
    },
})

export default favoritesSlice.reducer
