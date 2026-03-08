import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const LOGO_TEXT = 'CINEVERSE'

export default function PageLoader({ onComplete }) {
    const topCurtainRef = useRef(null)
    const bottomCurtainRef = useRef(null)
    const containerRef = useRef(null)
    const logoRef = useRef(null)
    const barRef = useRef(null)
    const subtitleRef = useRef(null)
    const lettersRef = useRef([])
    const [count, setCount] = useState(0)

    useEffect(() => {
        const letters = lettersRef.current
        const bar = barRef.current
        const tl = gsap.timeline({
            onComplete: () => {
                const exitTl = gsap.timeline()
                exitTl
                    .to([logoRef.current, bar, subtitleRef.current], { opacity: 0, y: -12, duration: 0.3, stagger: 0.05 })
                    .to(topCurtainRef.current, { scaleY: 0, transformOrigin: 'top', duration: 0.6, ease: 'power3.inOut' }, '-=0.1')
                    .to(bottomCurtainRef.current, { scaleY: 0, transformOrigin: 'bottom', duration: 0.6, ease: 'power3.inOut' }, '<')
                    .to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => onComplete?.() })
            },
        })

        // Letter draw-in stagger
        tl.fromTo(
            letters,
            { opacity: 0, y: 30, rotateX: -80 },
            { opacity: 1, y: 0, rotateX: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.5)' }
        )
        tl.from(bar, { scaleX: 0, transformOrigin: 'left', duration: 1.1, ease: 'power3.inOut' }, '-=0.15')
        tl.from(subtitleRef.current, { opacity: 0, letterSpacing: '0.6em', duration: 0.6, ease: 'power2.out' }, '-=0.7')

        // Count up synced with bar
        const obj = { val: 0 }
        tl.to(obj, {
            val: 100,
            duration: 1.1,
            ease: 'power3.inOut',
            onUpdate: () => setCount(Math.round(obj.val)),
        }, '<')

        return () => tl.kill()
    }, [onComplete])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed', inset: 0, zIndex: 100000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'all', overflow: 'hidden', background: '#030712',
            }}
        >
            {/* Ambient glow behind logo */}
            <div style={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Top curtain */}
            <div ref={topCurtainRef} style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(to bottom, #010409, #030712)', zIndex: 3,
                transformOrigin: 'top',
            }} />
            {/* Bottom curtain */}
            <div ref={bottomCurtainRef} style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(to top, #010409, #030712)', zIndex: 3,
                transformOrigin: 'bottom',
            }} />

            {/* Logo letter draw */}
            <div ref={logoRef} style={{ position: 'relative', zIndex: 2, textAlign: 'center', perspective: 600 }}>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginBottom: 24 }}>
                    {/* Star icon */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#6366f1" style={{ marginRight: 8, alignSelf: 'center' }}>
                        <path d="M12 2l1.8 5.4 5.7.4-4.4 3.3 1.5 5.5L12 13.4l-4.6 3.2 1.5-5.5L4.5 7.8l5.7-.4z" />
                    </svg>
                    {LOGO_TEXT.split('').map((ch, i) => (
                        <span
                            key={i}
                            ref={el => lettersRef.current[i] = el}
                            style={{
                                fontSize: '4.5rem',
                                fontWeight: 900,
                                fontFamily: '"Space Grotesk", sans-serif',
                                background: i < 4
                                    ? 'linear-gradient(135deg, #818cf8, #6366f1)'
                                    : 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                                display: 'inline-block',
                            }}
                        >{ch}</span>
                    ))}
                </div>

                {/* Progress bar */}
                <div style={{
                    width: 220, height: 2, background: 'rgba(255,255,255,0.08)',
                    borderRadius: 9999, overflow: 'hidden', margin: '0 auto',
                }}>
                    <div
                        ref={barRef}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(to right, #6366f1, #818cf8, #a5b4fc)',
                            borderRadius: 9999,
                            boxShadow: '0 0 8px rgba(99,102,241,0.8)',
                            width: `${count}%`,
                            transition: 'width 0.08s linear',
                        }}
                    />
                </div>

                <p
                    ref={subtitleRef}
                    style={{
                        marginTop: '1rem', fontSize: '0.65rem',
                        letterSpacing: '0.35em', color: '#475569',
                        textTransform: 'uppercase',
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 500,
                    }}
                >
                    Discover · Explore · Watch
                </p>
            </div>
        </div>
    )
}
