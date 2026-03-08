import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function ProgressBar() {
    const location = useLocation()
    const [width, setWidth] = useState(0)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible(true)
        setWidth(15)

        const t1 = setTimeout(() => setWidth(60), 150)
        const t2 = setTimeout(() => setWidth(85), 500)
        const t3 = setTimeout(() => setWidth(100), 800)
        const t4 = setTimeout(() => {
            setVisible(false)
            setWidth(0)
        }, 1100)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
            clearTimeout(t4)
        }
    }, [location.pathname + location.search])

    if (!visible && width === 0) return null

    return (
        <div
            className="fixed top-0 left-0 z-[200] h-[3px] bg-accent transition-all ease-out pointer-events-none"
            style={{
                width: `${width}%`,
                transitionDuration: width === 100 ? '200ms' : '400ms',
                opacity: visible ? 1 : 0,
            }}
        />
    )
}
