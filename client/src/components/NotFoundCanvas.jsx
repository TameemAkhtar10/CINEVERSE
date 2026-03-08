import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function NotFoundCanvas() {
    const mountRef = useRef(null)

    useEffect(() => {
        const el = mountRef.current
        if (!el) return

        const w = el.offsetWidth || window.innerWidth
        const h = el.offsetHeight || window.innerHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
        camera.position.z = 5

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        el.appendChild(renderer.domElement)

        const group = new THREE.Group()

        const torusGeo = new THREE.TorusGeometry(1.4, 0.09, 8, 60)
        const torusMat = new THREE.MeshBasicMaterial({ color: 0xe50914, transparent: true, opacity: 0.75 })
        group.add(new THREE.Mesh(torusGeo, torusMat))

        const innerGeo = new THREE.TorusGeometry(0.8, 0.05, 6, 40)
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.12 })
        group.add(new THREE.Mesh(innerGeo, innerMat))

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 4)
            const spokeMat = new THREE.MeshBasicMaterial({ color: 0xe50914, transparent: true, opacity: 0.5 })
            const spoke = new THREE.Mesh(spokeGeo, spokeMat)
            spoke.position.x = Math.cos(angle) * 0.55
            spoke.position.y = Math.sin(angle) * 0.55
            spoke.rotation.z = angle + Math.PI / 2
            group.add(spoke)
        }

        const pCount = 80
        const pPos = new Float32Array(pCount * 3)
        for (let i = 0; i < pCount; i++) {
            const angle = (i / pCount) * Math.PI * 2
            const r = 2.0 + (Math.random() - 0.5) * 0.5
            pPos[i * 3] = Math.cos(angle) * r
            pPos[i * 3 + 1] = Math.sin(angle) * r
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.5
        }
        const pGeo = new THREE.BufferGeometry()
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
        const pMat = new THREE.PointsMaterial({ color: 0xe50914, size: 0.06, transparent: true, opacity: 0.7 })
        group.add(new THREE.Points(pGeo, pMat))

        scene.add(group)

        let rafId
        const animate = () => {
            rafId = requestAnimationFrame(animate)
            group.rotation.z += 0.007
            group.rotation.y += 0.003
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
            torusGeo.dispose()
            torusMat.dispose()
            innerGeo.dispose()
            innerMat.dispose()
            pGeo.dispose()
            pMat.dispose()
            renderer.dispose()
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
        }
    }, [])

    return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
}
