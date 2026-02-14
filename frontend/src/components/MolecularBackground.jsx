import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import { useTheme } from '../context/ThemeContext'
import * as THREE from 'three'

// Helper to generate random points in a sphere w/o external lib
const generateSpherePoints = (count, radius) => {
    const points = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
        // Uniform distribution in sphere
        const u = Math.random()
        const v = Math.random()
        const theta = 2 * Math.PI * u
        const phi = Math.acos(2 * v - 1)
        const r = Math.cbrt(Math.random()) * radius // cbrt for uniform density
        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.sin(phi) * Math.sin(theta)
        const z = r * Math.cos(phi)
        points[i * 3] = x
        points[i * 3 + 1] = y
        points[i * 3 + 2] = z
    }
    return points
}

const ParticleField = (props) => {
    const ref = useRef()
    const { theme } = useTheme()

    // Generate 3000 random points in a sphere of radius 1.5
    const sphere = useMemo(() => generateSpherePoints(3000, 1.8), [])

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 15
        ref.current.rotation.y -= delta / 20
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color={theme === 'dark' ? '#34d399' : '#059669'} // Emerald-400/600
                    size={0.003}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    )
}

const FloatingMolecules = () => {
    const { theme } = useTheme()
    // Use contrasting but harmonious colors
    const color1 = theme === 'dark' ? '#34d399' : '#10b981' // Emerald
    const color2 = theme === 'dark' ? '#60a5fa' : '#3b82f6' // Blue
    const color3 = theme === 'dark' ? '#a78bfa' : '#8b5cf6' // Purple

    return (
        <group>
            {/* Main Emerald Molecule */}
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <mesh position={[2, 0.5, 0]} scale={0.4}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial
                        color={color1}
                        wireframe
                        transparent
                        opacity={0.2}
                    />
                </mesh>
            </Float>

            {/* Smaller Blue Molecule */}
            <Float speed={2} rotationIntensity={2} floatIntensity={1}>
                <mesh position={[-2, -1, -1]} scale={0.3}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial
                        color={color2}
                        wireframe
                        transparent
                        opacity={0.2}
                    />
                </mesh>
            </Float>

            {/* Tiny Purple Molecule */}
            <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
                <mesh position={[-1, 1.5, -0.5]} scale={0.25}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial
                        color={color3}
                        wireframe
                        transparent
                        opacity={0.2}
                    />
                </mesh>
            </Float>
        </group>
    )
}

const MolecularBackground = () => {
    return (
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1.2] }} gl={{ alpha: true }} dpr={[1, 2]}> {/* alpha: true for transparent bg */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <ParticleField />
                <FloatingMolecules />
            </Canvas>
        </div>
    )
}

export default MolecularBackground
