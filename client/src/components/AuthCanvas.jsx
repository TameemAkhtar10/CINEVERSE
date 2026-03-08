import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function AuthCanvas() {
    const mountRef = useRef(null)

    useEffect(() => {
        const el = mountRef.current
        if (!el) return

        const w = el.offsetWidth || window.innerWidth
        const h = el.offsetHeight || window.innerHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
        camera.position.z = 3

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        el.appendChild(renderer.domElement)

        const geo = new THREE.PlaneGeometry(10, 10, 44, 44)
        const mat = new THREE.MeshBasicMaterial({
            color: 0xe50914,
            wireframe: true,
            transparent: true,
            opacity: 0.1,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.rotation.x = -Math.PI / 3.5
        scene.add(mesh)

        let rafId
        let t = 0
        const posArr = geo.attributes.position.array

        const animate = () => {
            rafId = requestAnimationFrame(animate)
            t += 0.012
            for (let i = 0; i < posArr.length; i += 3) {
                const x = posArr[i]
                const y = posArr[i + 1]
                posArr[i + 2] = Math.sin(x * 0.7 + t) * 0.35 + Math.cos(y * 0.7 + t) * 0.35
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

    return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
}
