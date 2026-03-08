import React from 'react'

export default function SkeletonCard() {
    return (
        <div className="flex-shrink-0 w-[175px] rounded-xl overflow-hidden bg-card border border-white/[0.06] animate-pulse">
            <div className="w-full h-[262px] bg-[#1a1a1a]" />
            <div className="p-2.5 space-y-2">
                <div className="h-3.5 bg-[#252525] rounded w-4/5" />
                <div className="h-3 bg-[#252525] rounded w-2/5" />
            </div>
        </div>
    )
}
