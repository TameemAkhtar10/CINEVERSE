import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function PageLoader({ onComplete }) {
    const counterRef = useRef(null)
    const topCurtainRef = useRef(null)
    const bottomCurtainRef = useRef(null)
    const containerRef = useRef(null)
    const [count, setCount] = useState(0)

    useEffect(() => {
        const obj = { val: 0 }
        const tl = gsap.timeline({
            onComplete: () => {
                // Curtain split open
                gsap.to(topCurtainRef.current, {
                    yPercent: -100,
                    duration: 0.65,
                    ease: 'power3.inOut',
                })
                gsap.to(bottomCurtainRef.current, {
                    yPercent: 100,
                    duration: 0.65,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        gsap.to(containerRef.current, {
                            opacity: 0,
                            duration: 0.25,
                            onComplete: () => onComplete && onComplete(),
                        })
                    },
                })
            },
        })

        tl.to(obj, {
            val: 100,
            duration: 1.4,
            ease: 'power2.inOut',
            onUpdate: () => {
                const v = Math.round(obj.val)
                setCount(v)
                if (counterRef.current) {
                    counterRef.current.textContent = v
                }
            },
        })

        return () => tl.kill()
    }, [onComplete])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'all',
                overflow: 'hidden',
            }}
        >
            {/* Top curtain */}
            <div
                ref={topCurtainRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: '#0f0f0f',
                    zIndex: 1,
                }}
            />
            {/* Bottom curtain */}
            <div
                ref={bottomCurtainRef}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: '#0f0f0f',
                    zIndex: 1,
                }}
            />

            {/* Center content (sits above curtains) */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <div
                    style={{
                        fontSize: '7rem',
                        fontWeight: '900',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#ffffff',
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                    }}
                >
                    <span ref={counterRef}>{count}</span>
                    <span style={{ fontSize: '3rem', color: '#e50914' }}>%</span>
                </div>
                <div
                    style={{
                        marginTop: '1rem',
                        width: '180px',
                        height: '2px',
                        background: '#1a1a1a',
                        borderRadius: 9999,
                        overflow: 'hidden',
                        margin: '1rem auto 0',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            background: '#e50914',
                            borderRadius: 9999,
                            width: `${count}%`,
                            transition: 'width 0.1s linear',
                        }}
                    />
                </div>
                <p
                    style={{
                        marginTop: '0.75rem',
                        fontSize: '0.75rem',
                        letterSpacing: '0.25em',
                        color: '#555',
                        textTransform: 'uppercase',
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    CINEVERSE
                </p>
            </div>
        </div>
    )
}
