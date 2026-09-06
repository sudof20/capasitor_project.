import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COL } from "@/lab/theme";
import { useLab } from "@/lab/store";
import { Label } from "@/lab/world/Label";

const PERSON_POS = new THREE.Vector3(1.48, 0, 0.58);

function expLerp(current: number, target: number, k: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-k * dt));
}

export function Person() {
  const group = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const skinMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const labels = useLab((s) => s.labels);

  const skin = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c4a994", roughness: 0.62 }),
    [],
  );
  const cloth = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a3036",
        roughness: 0.78,
        metalness: 0.05,
      }),
    [],
  );
  const dark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#16181c", roughness: 0.7 }),
    [],
  );

  useMemo(() => {
    skinMats.current = [skin];
  }, [skin]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const { phase, phaseElapsed, trauma, reducedMotion } = useLab.getState();
    const t = Math.min(1, phaseElapsed / 0.82);

    let sx = 0.12;
    let sy = 0.05;
    let sz = 0.08;
    let ex = 0.18;

    if (phase === "reaching" || phase === "shock") {
      const ease = t * t * (3 - 2 * t);
      sx = 0.12 + (-1.18 - 0.12) * ease;
      sy = 0.05 + 0.22 * ease;
      sz = 0.08 + 0.18 * ease;
      ex = 0.18 + 0.55 * ease;
    } else if (phase === "recover") {
      const ease = Math.min(1, phaseElapsed / 1.05);
      sx = -1.18 + (0.12 + 1.18) * ease;
      sy = 0.27 * (1 - ease);
      sz = 0.26 * (1 - ease);
      ex = 0.73 * (1 - ease) + 0.18 * ease;
    }

    if (phase === "shock" && !reducedMotion) {
      const j = trauma * 0.18 * Math.sin(state.clock.elapsedTime * 62);
      sx += j;
      sy += j * 0.4;
      if (group.current) {
        group.current.position.x = PERSON_POS.x + Math.sin(state.clock.elapsedTime * 48) * trauma * 0.03;
        group.current.position.z = PERSON_POS.z + Math.cos(state.clock.elapsedTime * 41) * trauma * 0.02;
      }
    } else if (group.current) {
      group.current.position.x = expLerp(group.current.position.x, PERSON_POS.x, 10, dt);
      group.current.position.z = expLerp(group.current.position.z, PERSON_POS.z, 10, dt);
    }

    if (shoulder.current) {
      shoulder.current.rotation.x = expLerp(shoulder.current.rotation.x, sx, 14, dt);
      shoulder.current.rotation.y = expLerp(shoulder.current.rotation.y, sy, 14, dt);
      shoulder.current.rotation.z = expLerp(shoulder.current.rotation.z, sz, 14, dt);
    }
    if (elbow.current) {
      elbow.current.rotation.x = expLerp(elbow.current.rotation.x, ex, 14, dt);
    }

    const emit = phase === "shock" ? 1.8 : 0;
    skin.emissive.set(COL.accent);
    skin.emissiveIntensity = expLerp(skin.emissiveIntensity, emit, 18, dt);
  });

  return (
    <group ref={group} position={PERSON_POS.toArray()} rotation={[0, -Math.PI / 2 + 0.12, 0]}>
      <mesh position={[0, 1.58, 0]} castShadow material={skin}>
        <sphereGeometry args={[0.1, 20, 16]} />
      </mesh>
      <mesh position={[0, 1.48, 0]} material={skin}>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
      </mesh>
      <mesh position={[0, 1.24, 0]} castShadow material={cloth}>
        <capsuleGeometry args={[0.15, 0.32, 6, 12]} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow material={cloth}>
        <boxGeometry args={[0.32, 0.16, 0.18]} />
      </mesh>
      <mesh position={[-0.09, 0.48, 0]} castShadow material={cloth}>
        <capsuleGeometry args={[0.055, 0.52, 4, 10]} />
      </mesh>
      <mesh position={[0.09, 0.48, 0]} castShadow material={cloth}>
        <capsuleGeometry args={[0.055, 0.52, 4, 10]} />
      </mesh>
      <mesh position={[-0.09, 0.08, 0.02]} material={dark}>
        <boxGeometry args={[0.1, 0.08, 0.16]} />
      </mesh>
      <mesh position={[0.09, 0.08, 0.02]} material={dark}>
        <boxGeometry args={[0.1, 0.08, 0.16]} />
      </mesh>

      <group position={[-0.2, 1.36, 0]} rotation={[0.15, 0, 0.35]}>
        <mesh position={[0, -0.16, 0]} material={cloth} castShadow>
          <capsuleGeometry args={[0.045, 0.22, 4, 10]} />
        </mesh>
        <mesh position={[0, -0.34, 0]} material={skin}>
          <sphereGeometry args={[0.038, 10, 8]} />
        </mesh>
      </group>

      <group ref={shoulder} position={[0.2, 1.36, 0]}>
        <mesh position={[0, -0.14, 0]} material={cloth} castShadow>
          <capsuleGeometry args={[0.045, 0.2, 4, 10]} />
        </mesh>
        <group ref={elbow} position={[0, -0.28, 0]}>
          <mesh position={[0, -0.12, 0]} material={cloth} castShadow>
            <capsuleGeometry args={[0.04, 0.18, 4, 10]} />
          </mesh>
          <mesh position={[0, -0.26, 0]} material={skin} castShadow>
            <sphereGeometry args={[0.042, 12, 10]} />
          </mesh>
        </group>
      </group>

      {labels && <Label position={[0, 1.82, 0]}>Grounded body path</Label>}
    </group>
  );
}

