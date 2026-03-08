import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroModel() {
    const mountRef = useRef(null)

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return

        const W = 400
        const H = 500

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 0)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
        camera.position.set(0, 0.2, 6.5)

        const group = new THREE.Group()
        scene.add(group)

        const boardCanvas = document.createElement('canvas')
        boardCanvas.width = 512
        boardCanvas.height = 512
        const bctx = boardCanvas.getContext('2d')
        bctx.fillStyle = '#111111'
        bctx.fillRect(0, 0, 512, 512)
        bctx.strokeStyle = '#333333'
        bctx.lineWidth = 8
        bctx.strokeRect(20, 20, 472, 472)
        bctx.fillStyle = '#e50914'
        bctx.fillRect(40, 50, 432, 4)
        bctx.fillRect(40, 460, 432, 4)
        bctx.fillStyle = '#ffffff'
        bctx.font = 'bold 64px Arial, sans-serif'
        bctx.textAlign = 'center'
        bctx.fillText('CINEVERSE', 256, 160)
        bctx.fillStyle = '#888888'
        bctx.font = '28px Arial, sans-serif'
        bctx.fillText('PRODUCTION', 256, 230)
        bctx.fillStyle = '#555555'
        bctx.font = '22px Arial, sans-serif'
        bctx.fillText('SCENE  01', 130, 310)
        bctx.fillText('TAKE  1', 130, 350)
        bctx.fillText('DIR: AUTEUR', 370, 310)
        bctx.fillText('CAM: A', 370, 350)
        bctx.fillStyle = '#e50914'
        bctx.font = 'bold 20px Arial, sans-serif'
        bctx.fillText('ACTION', 256, 430)
        const boardTex = new THREE.CanvasTexture(boardCanvas)

        const makeStripeTexture = (cw, ch, shift) => {
            const cvs = document.createElement('canvas')
            cvs.width = cw
            cvs.height = ch
            const ctx = cvs.getContext('2d')
            const sw = 36
            for (let i = -4; i < Math.ceil(cw / sw) + 4; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#000000' : '#ffffff'
                ctx.beginPath()
                ctx.moveTo(i * sw, 0)
                ctx.lineTo((i + 1) * sw, 0)
                ctx.lineTo((i + 1) * sw - shift, ch)
                ctx.lineTo(i * sw - shift, ch)
                ctx.closePath()
                ctx.fill()
            }
            return new THREE.CanvasTexture(cvs)
        }

        const stripeTex = makeStripeTexture(512, 128, 48)
        const armStripeTex = makeStripeTexture(512, 64, 32)

        const boardW = 2.2
        const boardH = 2.4
        const boardD = 0.1
        const stripeH = 0.52

        const boardGeo = new THREE.BoxGeometry(boardW, boardH, boardD)
        const boardMats = [
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.45 }),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.45 }),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.45 }),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.45 }),
            new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.45, metalness: 0.1 }),
            new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.65, metalness: 0.3 }),
        ]
        const board = new THREE.Mesh(boardGeo, boardMats)
        board.castShadow = true
        board.receiveShadow = true
        group.add(board)

        const borderGeo = new THREE.BoxGeometry(boardW + 0.06, boardH + 0.06, boardD * 0.5)
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.4, metalness: 0.7 })
        const border = new THREE.Mesh(borderGeo, borderMat)
        border.position.z = -boardD * 0.6
        group.add(border)

        const stripeGeo = new THREE.BoxGeometry(boardW, stripeH, boardD + 0.015)
        const stripeMats = [
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.35, metalness: 0.3 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.4 }),
        ]
        const stripeSection = new THREE.Mesh(stripeGeo, stripeMats)
        stripeSection.position.y = boardH / 2 - stripeH / 2
        group.add(stripeSection)

        const armPivot = new THREE.Group()
        armPivot.position.y = boardH / 2
        group.add(armPivot)

        const armH = 0.28
        const armGeo = new THREE.BoxGeometry(boardW, armH, boardD + 0.015)
        const armMats = [
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ map: armStripeTex, roughness: 0.35, metalness: 0.3 }),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.4 }),
        ]
        const arm = new THREE.Mesh(armGeo, armMats)
        arm.position.y = armH / 2
        armPivot.add(arm)

        const hingeGeo = new THREE.CylinderGeometry(0.055, 0.055, boardW + 0.04, 16)
        const hingeMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3, metalness: 0.9 })
        const hinge = new THREE.Mesh(hingeGeo, hingeMat)
        hinge.rotation.z = Math.PI / 2
        armPivot.add(hinge)

        const ambient = new THREE.AmbientLight(0xffffff, 0.55)
        scene.add(ambient)

        const spotLight = new THREE.SpotLight(0xe50914, 5, 18, Math.PI / 5.5, 0.35, 1.2)
        spotLight.position.set(3, 6, 4)
        spotLight.castShadow = true
        spotLight.shadow.mapSize.width = 1024
        spotLight.shadow.mapSize.height = 1024
        scene.add(spotLight)
        scene.add(spotLight.target)

        const frontLight = new THREE.PointLight(0xffffff, 2.2, 12)
        frontLight.position.set(0, 0.5, 5)
        scene.add(frontLight)

        const fillLight = new THREE.PointLight(0xe50914, 1.2, 8)
        fillLight.position.set(-3, -1, 3)
        scene.add(fillLight)

        const pCount = 80
        const pPos = new Float32Array(pCount * 3)
        const pVel = new Float32Array(pCount * 3)
        for (let i = 0; i < pCount; i++) {
            pPos[i * 3] = (Math.random() - 0.5) * 7
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 8
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 4
            pVel[i * 3] = (Math.random() - 0.5) * 0.004
            pVel[i * 3 + 1] = (Math.random() - 0.5) * 0.004
            pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.003
        }
        const pGeo = new THREE.BufferGeometry()
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
        const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.038, transparent: true, opacity: 0.65, sizeAttenuation: true })
        const stars = new THREE.Points(pGeo, pMat)
        scene.add(stars)

        let targetRotX = 0
        let targetRotY = 0
        let currentRotX = 0
        let currentRotY = 0
        let lastMoveTime = 0
        let isClapping = false

        const onMouseMove = (e) => {
            const rect = mount.getBoundingClientRect()
            const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
            const ny = -((e.clientY - rect.top) / rect.height - 0.5) * 2
            targetRotY = nx * (Math.PI / 7.2)
            targetRotX = ny * (Math.PI / 7.2)
            lastMoveTime = performance.now()
        }

        const onMouseClick = () => {
            if (isClapping) return
            isClapping = true
            const snapAngle = -Math.PI * 0.52
            const snapDur = 110
            const returnDur = 200
            const s0 = performance.now()
            const snapDown = (now) => {
                const t = Math.min((now - s0) / snapDur, 1)
                armPivot.rotation.x = snapAngle * t
                if (t < 1) { requestAnimationFrame(snapDown) }
                else {
                    armPivot.rotation.x = snapAngle
                    setTimeout(() => {
                        const s1 = performance.now()
                        const snapUp = (n2) => {
                            const t2 = Math.min((n2 - s1) / returnDur, 1)
                            const ease = 1 - Math.pow(1 - t2, 3)
                            armPivot.rotation.x = snapAngle * (1 - ease)
                            if (t2 < 1) { requestAnimationFrame(snapUp) }
                            else { armPivot.rotation.x = 0; isClapping = false }
                        }
                        requestAnimationFrame(snapUp)
                    }, 140)
                }
            }
            requestAnimationFrame(snapDown)
        }

        mount.addEventListener('mousemove', onMouseMove)
        mount.addEventListener('click', onMouseClick)

        const clock = new THREE.Clock()
        let rafId

        const animate = () => {
            rafId = requestAnimationFrame(animate)
            const elapsed = clock.getElapsedTime()

            if (performance.now() - lastMoveTime > 1500) {
                targetRotY += 0.006
            }

            currentRotX += (targetRotX - currentRotX) * 0.055
            currentRotY += (targetRotY - currentRotY) * 0.055
            group.rotation.x = currentRotX
            group.rotation.y = currentRotY
            group.position.y = Math.sin(elapsed * 0.88) * 0.16

            const pos = pGeo.attributes.position.array
            for (let i = 0; i < pCount; i++) {
                pos[i * 3] += pVel[i * 3]
                pos[i * 3 + 1] += pVel[i * 3 + 1]
                pos[i * 3 + 2] += pVel[i * 3 + 2]
                if (Math.abs(pos[i * 3]) > 3.5) pVel[i * 3] *= -1
                if (Math.abs(pos[i * 3 + 1]) > 4) pVel[i * 3 + 1] *= -1
                if (Math.abs(pos[i * 3 + 2]) > 2) pVel[i * 3 + 2] *= -1
            }
            pGeo.attributes.position.needsUpdate = true

            renderer.render(scene, camera)
        }

        animate()

        window.addEventListener('resize', () => {
            camera.updateProjectionMatrix()
            renderer.setSize(W, H)
        })

        return () => {
            cancelAnimationFrame(rafId)
            mount.removeEventListener('mousemove', onMouseMove)
            mount.removeEventListener('click', onMouseClick)
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
            renderer.dispose()
            boardGeo.dispose()
            borderGeo.dispose()
            stripeGeo.dispose()
            armGeo.dispose()
            hingeGeo.dispose()
            pGeo.dispose()
            boardTex.dispose()
            stripeTex.dispose()
            armStripeTex.dispose()
            boardMats.forEach(m => m.dispose())
            stripeMats.forEach(m => m.dispose())
            armMats.forEach(m => m.dispose())
            borderMat.dispose()
            hingeMat.dispose()
            pMat.dispose()
        }
    }, [])

    return (
        <div
            ref={mountRef}
            className="hidden md:block"
            style={{
                position: 'absolute',
                top: '50%',
                right: '3%',
                transform: 'translateY(-50%)',
                width: 400,
                height: 500,
                pointerEvents: 'auto',
                zIndex: 5,
                opacity: 0.88,
            }}
        />
    )
}


    