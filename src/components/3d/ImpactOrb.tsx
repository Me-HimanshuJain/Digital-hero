"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MathUtils } from "three";

export function ImpactOrb() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle rotation and hovering
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[2, 3]} />
      <meshStandardMaterial
        color="#00C46A" /* Emerald */
        wireframe={true}
        emissive="#00C46A"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}
