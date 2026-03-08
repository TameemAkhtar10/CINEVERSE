import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../redux/slices/authSlice'
import AuthCanvas from '../components/AuthCanvas'

export default function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error } = useSelector((s) => s.auth)
    const [form, setForm] = useState({ email: '', password: '' })

    const handleChange = (e) => {
        dispatch(clearError())
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const res = await dispatch(login(form))
        if (res.meta.requestStatus === 'fulfilled') navigate('/')
    }

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4 animate-fade-in relative overflow-hidden">
            <AuthCanvas />
            <div className="w-full max-w-md bg-card border border-white/[0.08] rounded-2xl p-8 space-y-6">
                <div className="text-center space-y-1">
                    <Link to="/" className="flex items-center justify-center gap-1.5 mb-4">
                        <span className="text-accent text-lg">●</span>
                        <span className="text-white font-extrabold text-xl tracking-tight">CINEVERSE</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                    <p className="text-text-secondary text-sm">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wide block mb-1.5">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            className="w-full bg-bg border border-white/10 focus:border-accent text-white placeholder:text-text-secondary/50 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wide block mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full bg-bg border border-white/10 focus:border-accent text-white placeholder:text-text-secondary/50 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all mt-2"
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-text-secondary text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-accent font-semibold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    )
}
