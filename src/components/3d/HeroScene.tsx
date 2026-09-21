"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { ImpactOrb } from "./ImpactOrb";
import { ParticleField } from "./ParticleField";

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00C46A" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#F5F0E8" />
        
        <ImpactOrb />
        <ParticleField count={1500} />
        
        <Environment preset="city" />
        {/* Enable limited controls so it feels somewhat interactive but doesn't break layout */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.2}
        />
      </Canvas>
    </div>
  );
}
