import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../api/axiosInstance'
import Footer from '../components/Footer'

export default function Profile() {
    const { user } = useSelector((s) => s.auth)
    const [profile, setProfile] = useState(null)
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')
    const [msgType, setMsgType] = useState('success')

    useEffect(() => {
        axiosInstance.get('/profile')
            .then((res) => { setProfile(res.data); setName(res.data.name || '') })
            .catch(() => { })
    }, [])

    const handleSave = async (e) => {
        e.preventDefault()
        if (!name.trim()) return
        setSaving(true)
        setMsg('')
        try {
            const { data } = await axiosInstance.patch('/profile', { name })
            setProfile((prev) => ({ ...prev, name: data.name }))
            setEditing(false)
            setMsg('Username updated successfully!')
            setMsgType('success')
        } catch (err) {
            setMsg(err.response?.data?.message || 'Failed to update username.')
            setMsgType('error')
        } finally {
            setSaving(false)
        }
    }

    const joined = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—'

    const displayName = profile?.name || user?.name || 'User'
    const initial = displayName.charAt(0).toUpperCase()

    return (
        <div className="min-h-screen bg-bg animate-fade-in">
            <div className="pt-24 px-4 md:px-10 pb-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-white mb-8">Profile</h1>

                    {/* Profile card */}
                    <div className="bg-card border border-white/[0.06] rounded-2xl p-8 mb-6">
                        {/* Avatar row */}
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white font-extrabold text-3xl flex-shrink-0 shadow-red-sm">
                                {initial}
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl">{displayName}</p>
                                <p className="text-text-secondary text-sm mt-0.5">{profile?.email || user?.email}</p>
                                <p className="text-text-secondary text-xs mt-1.5">Member since {joined}</p>
                            </div>
                        </div>

                        {/* Edit username */}
                        {editing ? (
                            <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flex-1 bg-bg border border-white/20 focus:border-accent text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-text-secondary"
                                    placeholder="Enter new username"
                                    maxLength={30}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={saving || !name.trim()}
                                        className="bg-accent hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                                    >
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setEditing(false); setName(profile?.name || '') }}
                                        className="border border-white/20 text-text-secondary hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 border border-white/20 hover:border-accent text-text-secondary hover:text-accent text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 0 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Username
                            </button>
                        )}

                        {msg && (
                            <p className={`text-sm mt-3 font-medium ${msgType === 'success' ? 'text-green-400' : 'text-accent'}`}>
                                {msg}
                            </p>
                        )}
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Favorites', value: profile?.stats?.favorites ?? 0, icon: '❤️' },
                            { label: 'Watched', value: profile?.stats?.history ?? 0, icon: '👁️' },
                            { label: 'Ratings', value: profile?.stats?.ratings ?? 0, icon: '⭐' },
                        ].map(({ label, value, icon }) => (
                            <div key={label} className="bg-card border border-white/[0.06] rounded-2xl p-5 text-center">
                                <div className="text-2xl mb-2">{icon}</div>
                                <p className="text-white text-2xl font-extrabold">{value}</p>
                                <p className="text-text-secondary text-xs mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
