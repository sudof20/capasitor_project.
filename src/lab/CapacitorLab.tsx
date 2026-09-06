import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Scene } from "@/lab/world/Scene";
import { Hud } from "@/lab/ui/Hud";
import { Intro } from "@/lab/ui/Intro";
import { installLabTest } from "@/lab/store";

export function CapacitorLab() {
  useEffect(() => {
    installLabTest();
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <div className="absolute inset-0 touch-none">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
            powerPreference: "high-performance",
          }}
          camera={{ position: [2.85, 1.58, 3.85], fov: 36, near: 0.08, far: 60 }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <Scene />
        </Canvas>
      </div>
      <Intro />
      <Hud />
    </main>
  );
}
