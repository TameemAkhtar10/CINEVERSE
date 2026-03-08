import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import favoritesReducer from './slices/favoritesSlice'
import historyReducer from './slices/historySlice'
import uiReducer from './slices/uiSlice'
import ratingsReducer from './slices/ratingsSlice'
import watchlistReducer from './slices/watchlistSlice'
import notificationsReducer from './slices/notificationsSlice'
import watchProgressReducer from './slices/watchProgressSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        favorites: favoritesReducer,
        history: historyReducer,
        ui: uiReducer,
        ratings: ratingsReducer,
        watchlist: watchlistReducer,
        notifications: notificationsReducer,
        watchProgress: watchProgressReducer,
    },
})

export default store
