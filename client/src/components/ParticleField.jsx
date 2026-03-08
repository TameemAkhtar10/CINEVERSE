import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ParticleField() {
    const mountRef = useRef(null)

    useEffect(() => {
        const el = mountRef.current
        if (!el) return

        const w = el.offsetWidth || window.innerWidth
        const h = el.offsetHeight || 560

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
        camera.position.z = 5

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        el.appendChild(renderer.domElement)

        const COUNT = 200
        const positions = new Float32Array(COUNT * 3)
        const colors = new Float32Array(COUNT * 3)

        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 24
            positions[i * 3 + 1] = (Math.random() - 0.5) * 14
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6
            const isRed = Math.random() > 0.82
            colors[i * 3] = isRed ? 0.9 : 0.85
            colors[i * 3 + 1] = isRed ? 0.04 : 0.85
            colors[i * 3 + 2] = isRed ? 0.08 : 0.85
        }

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const mat = new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.5 })
        const points = new THREE.Points(geo, mat)
        scene.add(points)

        let rafId
        const posArr = geo.attributes.position.array

        const animate = () => {
            rafId = requestAnimationFrame(animate)
            points.rotation.y += 0.0003
            for (let i = 0; i < COUNT; i++) {
                posArr[i * 3 + 1] += 0.0018
                if (posArr[i * 3 + 1] > 7) posArr[i * 3 + 1] = -7
            }
            geo.attributes.position.needsUpdate = true
            renderer.render(scene, camera)
        }
        animate()

        const onResize = () => {
            const nw = el.offsetWidth
            const nh = el.offsetHeight
            camera.aspect = nw / nh
            camera.updateProjectionMatrix()
            renderer.setSize(nw, nh)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('resize', onResize)
            geo.dispose()
            mat.dispose()
            renderer.dispose()
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
        }
    }, [])

    return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />
}
