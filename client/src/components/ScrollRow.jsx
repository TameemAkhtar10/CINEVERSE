import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollRow({ title, items, loading, mediaType }) {
  const rowContainerRef = useRef(null)
  const ref = useRef(null)

  useEffect(() => {
    const el = rowContainerRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, [title])

  const scroll = (dir) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir * 600, behavior: 'smooth' })
    }
  }

  return (
    <div ref={rowContainerRef} className="py-6">
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <h2 className="text-text-primary font-bold text-xl">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 bg-card border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-accent transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 bg-card border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-accent transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items?.map((item) => (
            <MovieCard key={item.id} item={item} mediaType={mediaType} />
          ))}
      </div>
    </div>
  )
}
