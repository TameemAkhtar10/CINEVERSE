import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, authInitialized } = useSelector((s) => s.auth)
    if (!authInitialized) return (
        <div className="flex items-center justify-center min-h-screen bg-bg">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    )
    return isAuthenticated ? children : <Navigate to="/login" replace />
}
