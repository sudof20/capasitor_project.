import { useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { COL } from "@/lab/theme";
import { useLab } from "@/lab/store";
import { Capacitor } from "@/lab/world/Capacitor";
import { Person } from "@/lab/world/Person";
import { LabSet } from "@/lab/world/LabSet";
import { Fx } from "@/lab/world/Fx";

function RoomEnv() {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new RoomEnvironment();
    const env = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = env;
    envScene.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

function SimTicker() {
  const tick = useLab((s) => s.tick);
  useFrame((_, delta) => {
    tick(Math.min(delta, 0.1));
  });
  return null;
}

function CameraTrauma() {
  const camera = useThree((s) => s.camera);
  const base = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const { trauma, reducedMotion } = useLab.getState();
    if (reducedMotion || trauma <= 0.01) return;
    const shake = trauma * trauma;
    const t = state.clock.elapsedTime;
    camera.position.x += Math.sin(t * 67.1) * shake * 0.07;
    camera.position.y += Math.cos(t * 53.4) * shake * 0.045;
    camera.rotation.z += Math.sin(t * 40) * shake * 0.01;
    void base;
  });
  return null;
}

export function Scene() {
  const autoRotate = useLab((s) => s.autoRotate);
  const reduced = useLab((s) => s.reducedMotion);
  const entered = useLab((s) => s.entered);

  return (
    <>
      <color attach="background" args={[COL.bg]} />
      <fog attach="fog" args={[COL.bg, 9, 22]} />
      <RoomEnv />
      <hemisphereLight args={["#c5cdd6", "#1c1814", 0.42]} />
      <ambientLight intensity={0.14} />
      <directionalLight
        position={[4.2, 7.2, 3.2]}
        intensity={1.15}
        color="#f4f1ea"
        castShadow
        shadow-mapSize={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-4, 2.5, -3]} intensity={0.28} color="#8fa4b8" />

      <LabSet />
      <Capacitor />
      <Person />
      <Fx />
      <SimTicker />
      <CameraTrauma />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        autoRotate={autoRotate && !reduced && entered}
        autoRotateSpeed={0.45}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2 - 0.06}
        minDistance={2.3}
        maxDistance={9}
        target={[0.12, 1.05, 0.05]}
        onStart={() => useLab.getState().stopAutoRotate()}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={1.2}
          intensity={0.35}
          mipmapBlur
          luminanceSmoothing={0.25}
        />
      </EffectComposer>
    </>
  );
}
