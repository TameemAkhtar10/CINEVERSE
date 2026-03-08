import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance'

export const fetchLists = createAsyncThunk('customLists/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.get('/lists')
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch lists')
    }
})

export const createList = createAsyncThunk('customLists/create', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post('/lists', payload)
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create list')
    }
})

export const deleteList = createAsyncThunk('customLists/delete', async (id, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/lists/${id}`)
        return id
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete list')
    }
})

export const addMovieToList = createAsyncThunk('customLists/addMovie', async ({ listId, movie }, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post(`/lists/${listId}/movies`, movie)
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to add movie')
    }
})

export const removeMovieFromList = createAsyncThunk('customLists/removeMovie', async ({ listId, movieId }, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.delete(`/lists/${listId}/movies/${movieId}`)
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to remove movie')
    }
})

const customListsSlice = createSlice({
    name: 'customLists',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLists.pending, (s) => { s.loading = true; s.error = null })
            .addCase(fetchLists.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
            .addCase(fetchLists.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(createList.fulfilled, (s, a) => { s.items.unshift(a.payload) })
            .addCase(deleteList.fulfilled, (s, a) => { s.items = s.items.filter((l) => l._id !== a.payload) })
            .addCase(addMovieToList.fulfilled, (s, a) => {
                const idx = s.items.findIndex((l) => l._id === a.payload._id)
                if (idx !== -1) s.items[idx] = a.payload
            })
            .addCase(removeMovieFromList.fulfilled, (s, a) => {
                const idx = s.items.findIndex((l) => l._id === a.payload._id)
                if (idx !== -1) s.items[idx] = a.payload
            })
    },
})

export default customListsSlice.reducer
