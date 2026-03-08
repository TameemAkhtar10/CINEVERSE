import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CursorFollower() {
    const dotRef = useRef(null)
    const ringRef = useRef(null)

    useEffect(() => {
        const dot = dotRef.current
        const ring = ringRef.current
        if (!dot || !ring) return

        // quickTo for instant dot and delayed ring
        const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'none' })
        const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'none' })
        const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.25, ease: 'power2.out' })
        const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.25, ease: 'power2.out' })

        const onMove = (e) => {
            moveDotX(e.clientX)
            moveDotY(e.clientY)
            moveRingX(e.clientX)
            moveRingY(e.clientY)
        }

        // Scale ring on clickable hover
        const onEnter = (e) => {
            const tag = e.target.tagName.toLowerCase()
            const isClickable =
                tag === 'a' || tag === 'button' || tag === 'input' ||
                e.target.closest('a') || e.target.closest('button')
            if (isClickable) {
                gsap.to(ring, { scale: 1.8, borderColor: '#e50914', duration: 0.25, ease: 'power2.out' })
                gsap.to(dot, { scale: 0.4, duration: 0.2 })
            }
        }

        const onLeave = (e) => {
            const tag = e.target.tagName.toLowerCase()
            const isClickable =
                tag === 'a' || tag === 'button' || tag === 'input' ||
                e.target.closest('a') || e.target.closest('button')
            if (isClickable) {
                gsap.to(ring, { scale: 1, borderColor: 'rgba(229, 9, 20, 0.7)', duration: 0.25, ease: 'power2.out' })
                gsap.to(dot, { scale: 1, duration: 0.2 })
            }
        }

        const onDown = () => {
            gsap.to(ring, { scale: 0.8, duration: 0.12, ease: 'power2.out' })
        }

        const onUp = () => {
            gsap.to(ring, { scale: 1, duration: 0.25, ease: 'elastic.out(1.2, 0.5)' })
        }

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseover', onEnter)
        window.addEventListener('mouseout', onLeave)
        window.addEventListener('mousedown', onDown)
        window.addEventListener('mouseup', onUp)

        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseover', onEnter)
            window.removeEventListener('mouseout', onLeave)
            window.removeEventListener('mousedown', onDown)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    return (
        <>
            {/* Dot — translates from top-left corner, offset to center */}
            <div
                ref={dotRef}
                className="cursor-dot"
                style={{
                    position: 'fixed',
                    top: -4,
                    left: -4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#e50914',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    willChange: 'transform',
                }}
            />
            {/* Ring */}
            <div
                ref={ringRef}
                className="cursor-ring"
                style={{
                    position: 'fixed',
                    top: -16,
                    left: -16,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(229, 9, 20, 0.7)',
                    pointerEvents: 'none',
                    zIndex: 99998,
                    willChange: 'transform',
                    backdropFilter: 'none',
                }}
            />
        </>
    )
}
