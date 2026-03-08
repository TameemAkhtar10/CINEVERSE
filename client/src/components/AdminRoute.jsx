import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function AdminRoute({ children }) {
    const { isAuthenticated, user, authInitialized } = useSelector((s) => s.auth)
    if (!authInitialized) return (
        <div className="flex items-center justify-center min-h-screen bg-bg">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    )
    if (!isAuthenticated || !user?.isAdmin) return <Navigate to="/" replace />
    return children
}
