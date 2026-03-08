import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CursorFollower() {
    const dotRef = useRef(null)
    const ringRef = useRef(null)
    const playIconRef = useRef(null)

    useEffect(() => {
        const dot = dotRef.current
        const ring = ringRef.current
        const playIcon = playIconRef.current
        if (!dot || !ring || !playIcon) return

        const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'none' })
        const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'none' })
        const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power2.out' })
        const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power2.out' })
        const movePlayX = gsap.quickTo(playIcon, 'x', { duration: 0.28, ease: 'power2.out' })
        const movePlayY = gsap.quickTo(playIcon, 'y', { duration: 0.28, ease: 'power2.out' })

        let magnetTarget = null
        let rafId = null
        let mouseX = 0, mouseY = 0

        const onMove = (e) => {
            mouseX = e.clientX
            mouseY = e.clientY
            moveDotX(mouseX)
            moveDotY(mouseY)
            moveRingX(mouseX)
            moveRingY(mouseY)
            movePlayX(mouseX)
            movePlayY(mouseY)

            // Magnetic pull on buttons
            if (magnetTarget) {
                const rect = magnetTarget.getBoundingClientRect()
                const cx = rect.left + rect.width / 2
                const cy = rect.top + rect.height / 2
                const dx = mouseX - cx
                const dy = mouseY - cy
                const dist = Math.sqrt(dx * dx + dy * dy)
                const radius = Math.max(rect.width, rect.height) * 0.85
                if (dist < radius) {
                    const pull = 0.35
                    gsap.to(magnetTarget, { x: dx * pull, y: dy * pull, duration: 0.3, ease: 'power2.out', overwrite: true })
                } else {
                    gsap.to(magnetTarget, { x: 0, y: 0, duration: 0.5, ease: 'power3.out', overwrite: true })
                }
            }
        }

        const onEnter = (e) => {
            const card = e.target.closest('[data-cursor="play"]')
            const btn = e.target.closest('button') || (e.target.tagName === 'BUTTON' ? e.target : null)
            const link = e.target.closest('a') || (e.target.tagName === 'A' ? e.target : null)
            const input = e.target.tagName === 'INPUT'
            const textEl = !card && !btn && !link && !input &&
                (e.target.closest('h1,h2,h3,h4,p,label') || /^H[1-6]$|^P$|^LABEL$/.test(e.target.tagName))

            if (card) {
                gsap.to(dot, { scale: 0, duration: 0.2 })
                gsap.to(ring, { scale: 2.4, opacity: 0.25, borderColor: 'rgba(99,102,241,0.6)', duration: 0.3, ease: 'power2.out' })
                gsap.to(playIcon, { scale: 1, opacity: 1, duration: 0.28, ease: 'back.out(1.7)' })
            } else if (btn) {
                magnetTarget = btn
                gsap.to(ring, { scale: 2.0, borderColor: 'rgba(99,102,241,0.95)', duration: 0.25, ease: 'power2.out' })
                gsap.to(dot, { scale: 0.3, duration: 0.2 })
            } else if (link) {
                gsap.to(ring, { scale: 1.65, borderColor: 'rgba(99,102,241,0.85)', duration: 0.25, ease: 'power2.out' })
                gsap.to(dot, { scale: 0.5, duration: 0.2 })
            } else if (textEl) {
                gsap.to(ring, { scale: 3.5, borderColor: 'rgba(99,102,241,0.2)', opacity: 0.6, duration: 0.4, ease: 'power2.out' })
                gsap.to(dot, { scale: 0.15, backgroundColor: '#f59e0b', duration: 0.25 })
            } else if (input) {
                gsap.to(ring, { scale: 0.6, borderColor: 'rgba(245,158,11,0.8)', borderRadius: '4px', duration: 0.2 })
                gsap.to(dot, { scale: 0, duration: 0.15 })
            }
        }

        const onLeave = (e) => {
            const wasCard = e.target.closest('[data-cursor="play"]')
            if (wasCard) {
                gsap.to(dot, { scale: 1, duration: 0.2 })
                gsap.to(ring, { scale: 1, opacity: 1, duration: 0.25 })
                gsap.to(playIcon, { scale: 0, opacity: 0, duration: 0.2 })
            }
            const wasBtn = e.target.closest('button') || e.target.closest('a') || e.target.tagName === 'INPUT'
            if (wasBtn) {
                if (magnetTarget) {
                    gsap.to(magnetTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: true })
                    magnetTarget = null
                }
            }
            // Always reset on any leave
            gsap.to(ring, { scale: 1, borderColor: 'rgba(99,102,241,0.5)', opacity: 1, borderRadius: '50%', duration: 0.3, ease: 'power2.out' })
            gsap.to(dot, { scale: 1, backgroundColor: '#6366f1', duration: 0.25 })
        }

        const onDown = (e) => {
            gsap.to(ring, { scale: 0.7, duration: 0.12, ease: 'power2.out' })
            // Click ripple
            const ripple = document.createElement('div')
            ripple.style.cssText = `
                position:fixed;
                pointer-events:none;
                z-index:99997;
                left:${e.clientX}px;
                top:${e.clientY}px;
                width:0;height:0;
                border-radius:50%;
                background:rgba(99,102,241,0.25);
                transform:translate(-50%,-50%) scale(1);
            `
            document.body.appendChild(ripple)
            gsap.to(ripple, {
                width: 80, height: 80,
                opacity: 0,
                duration: 0.55,
                ease: 'power2.out',
                onComplete: () => ripple.remove(),
            })
        }
        const onUp = () => gsap.to(ring, { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.5)' })

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseover', onEnter)
        window.addEventListener('mouseout', onLeave)
        window.addEventListener('mousedown', onDown)
        window.addEventListener('mouseup', onUp)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseover', onEnter)
            window.removeEventListener('mouseout', onLeave)
            window.removeEventListener('mousedown', onDown)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    return (
        <>
            {/* Play icon cursor (shown on card hover) */}
            <div
                ref={playIconRef}
                style={{
                    position: 'fixed',
                    top: -20,
                    left: -20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.92)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 100001,
                    willChange: 'transform',
                    scale: 0,
                    opacity: 0,
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
                    <path d="M8 5v14l11-7z" />
                </svg>
            </div>
            {/* Dot */}
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
                    backgroundColor: '#6366f1',
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
                    border: '1.5px solid rgba(99, 102, 241, 0.5)',
                    pointerEvents: 'none',
                    zIndex: 99998,
                    willChange: 'transform',
                    backdropFilter: 'none',
                }}
            />
        </>
    )
}
