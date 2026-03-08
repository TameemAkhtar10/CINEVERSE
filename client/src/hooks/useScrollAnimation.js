import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Animate a single element when it scrolls into view using GSAP + ScrollTrigger.
 * Returns a ref to attach to the element.
 */
export function useScrollReveal(options = {}) {
    const ref = useRef(null)
    const {
        from = { opacity: 0, y: 40 },
        to = { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        start = 'top 88%',
        once = true,
    } = options

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ctx = gsap.context(() => {
            gsap.fromTo(el, from, {
                ...to,
                scrollTrigger: {
                    trigger: el,
                    start,
                    toggleActions: once ? 'play none none none' : 'play reverse play reverse',
                },
            })
        })
        return () => ctx.revert()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return ref
}

/**
 * Stagger-animate direct children of the container when it scrolls into view.
 * Returns a ref to attach to the container element.
 */
export function useStaggerReveal(options = {}) {
    const ref = useRef(null)
    const {
        selector = ':scope > *',
        from = { opacity: 0, y: 28, scale: 0.95 },
        to = {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.07,
        },
        start = 'top 90%',
        once = true,
    } = options

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ctx = gsap.context(() => {
            const targets = el.querySelectorAll(selector)
            if (!targets.length) return
            gsap.fromTo(targets, from, {
                ...to,
                scrollTrigger: {
                    trigger: el,
                    start,
                    toggleActions: once ? 'play none none none' : 'play reverse play reverse',
                },
            })
        })
        return () => ctx.revert()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return ref
}

/**
 * Use native IntersectionObserver to toggle a CSS class on scroll into view.
 * Useful for pure CSS-driven animations.
 */
export function useInViewClass(visibleClass = 'is-visible', options = {}) {
    const ref = useRef(null)
    const { threshold = 0.15, rootMargin = '0px', once = true } = options

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add(visibleClass)
                    if (once) observer.unobserve(el)
                } else if (!once) {
                    el.classList.remove(visibleClass)
                }
            },
            { threshold, rootMargin }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [visibleClass, threshold, rootMargin, once])

    return ref
}
