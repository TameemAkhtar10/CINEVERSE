import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'cv_watch_progress'

const loadProgress = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
        return {}
    }
}

const saveProgress = (progress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

const watchProgressSlice = createSlice({
    name: 'watchProgress',
    initialState: { progress: loadProgress() },
    reducers: {
        setProgress(state, action) {
            const { movieId, title, poster, mediaType, year, progress } = action.payload
            state.progress[movieId] = {
                movieId,
                title,
                poster,
                mediaType,
                year,
                progress: progress ?? 50,
                updatedAt: Date.now(),
            }
            saveProgress(state.progress)
        },
        removeProgress(state, action) {
            delete state.progress[action.payload]
            saveProgress(state.progress)
        },
        clearAllProgress(state) {
            state.progress = {}
            saveProgress({})
        },
    },
})

export const { setProgress, removeProgress, clearAllProgress } = watchProgressSlice.actions
export default watchProgressSlice.reducer
