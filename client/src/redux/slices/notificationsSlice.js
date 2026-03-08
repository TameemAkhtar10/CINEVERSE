import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.get('/notifications')
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications')
    }
})

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
    try {
        await axiosInstance.patch('/notifications/read-all')
        return true
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to mark as read')
    }
})

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/notifications/${id}`)
        return id
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete notification')
    }
})

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: { items: [], loading: false, error: null },
    reducers: {
        addNotification: (s, a) => { s.items.unshift(a.payload) },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (s, a) => { s.items = a.payload })
            .addCase(markAllRead.fulfilled, (s) => { s.items = s.items.map((n) => ({ ...n, read: true })) })
            .addCase(deleteNotification.fulfilled, (s, a) => { s.items = s.items.filter((n) => n._id !== a.payload) })
    },
})

export const { addNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
