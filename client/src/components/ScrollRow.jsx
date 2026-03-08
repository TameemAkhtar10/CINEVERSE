import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollRow({ title, items, loading, mediaType, isTrending }) {
  const rowContainerRef = useRef(null)
  const titleRef = useRef(null)
  const cardsRef = useRef(null)
  const scrollRef = useRef(null)

  // Section fade-up + title slide from left
  useEffect(() => {
    const el = rowContainerRef.current
    const titleEl = titleRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(titleEl,
        { x: -48, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        }
      )
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        }
      )
    })
    return () => ctx.revert()
  }, [title])

  // Cards stagger animate in (100ms apart)
  useEffect(() => {
    const el = cardsRef.current
    if (!el || loading) return
    const cards = el.querySelectorAll(':scope > a, :scope > div')
    if (!cards.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(cards,
        { opacity: 0, y: 24, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.45, ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
        }
      )
    })
    return () => ctx.revert()
  }, [items, loading])

  // Momentum / inertia scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let isDown = false
    let startX = 0
    let scrollLeft = 0
    let velX = 0
    let lastX = 0
    let rafId = null

    const onDown = (e) => {
      isDown = true
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
      lastX = e.pageX
      cancelAnimationFrame(rafId)
      el.style.cursor = 'grabbing'
    }
    const onUp = () => {
      isDown = false
      el.style.cursor = ''
      // inertia
      const inertia = () => {
        if (Math.abs(velX) < 0.5) return
        el.scrollLeft += velX
        velX *= 0.93
        rafId = requestAnimationFrame(inertia)
      }
      inertia()
    }
    const onMove = (e) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      el.scrollLeft = scrollLeft - (x - startX)
      velX = e.pageX - lastX
      lastX = e.pageX
    }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('mousemove', onMove)
    }
  }, [])

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' })
    }
  }

  return (
    <div ref={rowContainerRef} className="py-6">
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <h2 ref={titleRef} className="text-text-primary font-bold text-xl">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 bg-card border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400/70 hover:text-indigo-300 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 bg-card border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400/70 hover:text-indigo-300 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2 select-none"
        style={{ cursor: 'grab' }}
      >
        <div ref={cardsRef} className="flex gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : items?.map((item, i) => (
              <MovieCard key={item.id} item={item} mediaType={mediaType} isTrending={isTrending} staggerIndex={i} />
            ))}
        </div>
      </div>
    </div>
  )
}
