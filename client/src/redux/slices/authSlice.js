import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axiosInstance'

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post('/auth/login', creds)
        localStorage.setItem('cv_token', data.token)
        localStorage.setItem('cv_user', JSON.stringify(data.user))
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
})

export const signup = createAsyncThunk('auth/signup', async (creds, { rejectWithValue }) => {
    try {
        const { data } = await axiosInstance.post('/auth/signup', creds)
        localStorage.setItem('cv_token', data.token)
        localStorage.setItem('cv_user', JSON.stringify(data.user))
        return data
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Signup failed')
    }
})

export const autoLogin = createAsyncThunk('auth/autoLogin', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('cv_token')
        const user = localStorage.getItem('cv_user')
        if (!token || !user) return rejectWithValue('No session')
        return { token, user: JSON.parse(user) }
    } catch {
        return rejectWithValue('Invalid session')
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        isAuthenticated: false,
        authInitialized: false,
        loading: false,
        error: null,
    },
    reducers: {
        logout(state) {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('cv_token')
            localStorage.removeItem('cv_user')
        },
        clearError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (s) => { s.loading = true; s.error = null })
            .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true })
            .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(signup.pending, (s) => { s.loading = true; s.error = null })
            .addCase(signup.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true })
            .addCase(signup.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(autoLogin.fulfilled, (s, a) => { s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true; s.authInitialized = true })
            .addCase(autoLogin.rejected, (s) => { s.isAuthenticated = false; s.authInitialized = true })
    },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
