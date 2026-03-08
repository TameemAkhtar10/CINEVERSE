import { createSlice } from '@reduxjs/toolkit'

const saved = localStorage.getItem('cv_theme') || 'dark'
if (saved === 'light') {
    document.documentElement.classList.remove('dark')
} else {
    document.documentElement.classList.add('dark')
}

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        trailerKey: null,
        trailerOpen: false,
        searchOpen: false,
        theme: saved,
        autoplayTrailer: localStorage.getItem('cv_autoplay') === 'true',
    },
    reducers: {
        openTrailer(state, action) {
            state.trailerKey = action.payload
            state.trailerOpen = true
        },
        closeTrailer(state) {
            state.trailerKey = null
            state.trailerOpen = false
        },
        toggleSearch(state) {
            state.searchOpen = !state.searchOpen
        },
        closeSearch(state) {
            state.searchOpen = false
        },
        toggleTheme(state) {
            state.theme = state.theme === 'dark' ? 'light' : 'dark'
            localStorage.setItem('cv_theme', state.theme)
            if (state.theme === 'light') {
                document.documentElement.classList.remove('dark')
            } else {
                document.documentElement.classList.add('dark')
            }
        },
        toggleAutoplay(state) {
            state.autoplayTrailer = !state.autoplayTrailer
            localStorage.setItem('cv_autoplay', state.autoplayTrailer)
        },
    },
})

export const { openTrailer, closeTrailer, toggleSearch, closeSearch, toggleTheme, toggleAutoplay } = uiSlice.actions
export default uiSlice.reducer
