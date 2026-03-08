import React, { useRef, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

const ROUTE_ORDER = {
    '/': 0,
    '/movies': 1,
    '/tv': 2,
    '/people': 3,
    '/trending': 4,
    '/search': 5,
    '/favorites': 6,
    '/history': 7,
    '/watchlist': 8,
    '/profile': 9,
    '/charts': 10,
    '/admin': 11,
}

let prevRouteIndex = 0

/**
 * Wraps children with a direction-aware GSAP slide + blur transition
 * that plays each time the route changes.
 */
export default function PageTransition({ children }) {
    const containerRef = useRef(null)
    const location = useLocation()

    useLayoutEffect(() => {
        const el = containerRef.current
        if (!el) return

        // Determine route direction
        const matchedKey =
            Object.keys(ROUTE_ORDER)
                .filter((k) => k !== '/')
                .find((k) => location.pathname.startsWith(k)) ??
            (location.pathname === '/' ? '/' : null)

        const curIndex = ROUTE_ORDER[matchedKey] ?? 5
        const dir = curIndex >= prevRouteIndex ? 1 : -1
        prevRouteIndex = curIndex

        const tl = gsap.timeline()
        tl.fromTo(
            el,
            { opacity: 0, x: dir * 52, filter: 'blur(5px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.44, ease: 'power3.out', overwrite: true }
        )

        return () => tl.kill()
    }, [location.pathname])

    return (
        <div ref={containerRef} style={{ willChange: 'transform, opacity' }}>
            {children}
        </div>
    )
}
