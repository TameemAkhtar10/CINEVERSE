import { useEffect, useRef, useCallback } from 'react'

export default function useInfiniteScroll(onLoadMore, hasMore, loading) {
    const observer = useRef(null)

    const ref = useCallback(
        (node) => {
            if (loading) return
            if (observer.current) observer.current.disconnect()
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    onLoadMore()
                }
            })
            if (node) observer.current.observe(node)
        },
        [loading, hasMore, onLoadMore]
    )

    return ref
}
