import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { COL } from "@/lab/theme";
import { V_MAX } from "@/lab/physics";
import { useLab } from "@/lab/store";
import { makeFloorTexture, makeNameplateTexture } from "@/lab/textures";
import { Label } from "@/lab/world/Label";

function PowerSupply() {
  const needle = useRef<THREE.Mesh>(null);
  const labels = useLab((s) => s.labels);

  useFrame(() => {
    const n = useLab.getState().voltage / V_MAX;
    if (needle.current) {
      needle.current.rotation.z = Math.PI * 0.72 - n * Math.PI * 1.1;
    }
  });

  const cable = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.0, 0.52, 1.42),
      new THREE.Vector3(-1.4, 0.7, 0.9),
      new THREE.Vector3(-0.7, 0.48, 0.28),
      new THREE.Vector3(-0.12, 0.32, 0.02),
      new THREE.Vector3(0, 0.28, 0),
    ]);
  }, []);

  const ground = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.48, 0.07, -0.48),
      new THREE.Vector3(0.85, 0.04, -0.95),
      new THREE.Vector3(1.05, 0.01, -1.22),
    ]);
  }, []);

  return (
    <group>
      <group position={[-2.15, 0, 1.48]} rotation={[0, 0.72, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[0.24, 0.42, 0.18]} />
          <meshStandardMaterial color="#2a3038" metalness={0.4} roughness={0.52} />
        </mesh>
        <mesh position={[0, 0.26, 0.1]}>
          <boxGeometry args={[0.2, 0.32, 0.01]} />
          <meshStandardMaterial color="#15191e" roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.3, 0.108]}>
          <circleGeometry args={[0.055, 24]} />
          <meshStandardMaterial color="#0c0f12" roughness={0.35} />
        </mesh>
        <mesh ref={needle} position={[0, 0.3, 0.11]}>
          <boxGeometry args={[0.004, 0.048, 0.004]} />
          <meshStandardMaterial
            color={COL.accent}
            emissive={COL.accent}
            emissiveIntensity={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.3, 0.06, 0.24]} />
          <meshStandardMaterial color="#3a414a" metalness={0.45} roughness={0.48} />
        </mesh>
        {labels && <Label position={[0, 0.56, 0]}>HV supply</Label>}
      </group>
      <mesh>
        <tubeGeometry args={[cable, 40, 0.012, 8, false]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.7} />
      </mesh>
      <mesh>
        <tubeGeometry args={[ground, 20, 0.01, 6, false]} />
        <meshStandardMaterial color="#3d5a48" roughness={0.65} />
      </mesh>
      <mesh position={[1.05, 0.1, -1.22]} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 0.2, 10]} />
        <meshStandardMaterial color={COL.copper} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Nameplate() {
  const tex = useMemo(() => makeNameplateTexture(), []);
  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={[0, 0.095, 0.78]} rotation={[-0.42, 0, 0]}>
      <planeGeometry args={[0.72, 0.36]} />
      <meshStandardMaterial map={tex} roughness={0.55} metalness={0.15} />
    </mesh>
  );
}

export function LabSet() {
  const floor = useMemo(() => makeFloorTexture(), []);
  useLayoutEffect(() => () => floor.dispose(), [floor]);

  return (
    <group>
      <Grid
        position={[0, 0.001, 0]}
        infiniteGrid
        fadeDistance={14}
        fadeStrength={2.4}
        cellSize={0.35}
        sectionSize={1.4}
        cellThickness={0.5}
        sectionThickness={1.1}
        cellColor="#22262c"
        sectionColor="#323840"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial map={floor} roughness={0.9} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={COL.bg} roughness={1} metalness={0} />
      </mesh>
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.5}
        scale={12}
        blur={2.4}
        far={5}
      />
      <Nameplate />
      <PowerSupply />
      <mesh position={[0, 4.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#3a4048" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.95, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.08, 24]} />
        <meshStandardMaterial color="#cfc8ba" metalness={0.4} roughness={0.45} />
      </mesh>
      <spotLight
        position={[0, 3.9, 0]}
        angle={0.55}
        penumbra={0.55}
        intensity={2.4}
        color="#f3efe6"
        castShadow
        shadow-mapSize={1024}
      />
    </group>
  );
}
