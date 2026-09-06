import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  BALL_Y,
  INNER_R,
  PHI_LENGTH,
  PHI_START,
  SHELL_INNER,
  SHELL_OUTER,
  THETA_LENGTH,
  THETA_START,
  V_MAX,
} from "@/lab/physics";
import { COL } from "@/lab/theme";
import { useLab } from "@/lab/store";
import { Label } from "@/lab/world/Label";

const SEG_W = 64;
const SEG_H = 48;

function meridianCurve(phi: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const th = THETA_START + (i / n) * THETA_LENGTH;
    pts.push(
      new THREE.Vector3(
        r * Math.sin(th) * Math.cos(phi),
        r * Math.cos(th),
        r * Math.sin(th) * Math.sin(phi),
      ),
    );
  }
  return new THREE.CatmullRomCurve3(pts);
}

function FlangeBolts({
  cutaway,
  y,
}: {
  cutaway: boolean;
  y: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const radial = useMemo(() => new THREE.Vector3(), []);
  const count = cutaway ? 16 : 22;
  const phi0 = cutaway ? PHI_START : 0;
  const phiL = cutaway ? PHI_LENGTH : Math.PI * 2;
  const radius = SHELL_OUTER + 0.018;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      const phi = phi0 + ((i + 0.5) / count) * phiL;
      const x = radius * Math.cos(phi);
      const z = radius * Math.sin(phi);
      dummy.position.set(x, y, z);
      radial.set(x, 0, z).normalize();
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), radial);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, dummy, phi0, phiL, radial, radius, y]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.038, 6]} />
      <meshStandardMaterial color={COL.steel} metalness={0.95} roughness={0.28} />
    </instancedMesh>
  );
}

function CutRims({ cutaway }: { cutaway: boolean }) {
  const tube = useMemo(() => {
    if (!cutaway) return null;
    const a = meridianCurve(PHI_START, SHELL_OUTER + 0.002);
    const b = meridianCurve(PHI_START + PHI_LENGTH, SHELL_OUTER + 0.002);
    return { a, b };
  }, [cutaway]);

  if (!cutaway || !tube) return null;

  return (
    <group position={[0, BALL_Y, 0]}>
      <mesh>
        <tubeGeometry args={[tube.a, 40, 0.012, 8, false]} />
        <meshStandardMaterial color={COL.copper} metalness={0.9} roughness={0.32} />
      </mesh>
      <mesh>
        <tubeGeometry args={[tube.b, 40, 0.012, 8, false]} />
        <meshStandardMaterial color={COL.copper} metalness={0.9} roughness={0.32} />
      </mesh>
      <mesh rotation={[0, PHI_START, 0]}>
        <ringGeometry args={[SHELL_INNER, SHELL_OUTER, 36]} />
        <meshStandardMaterial
          color={COL.copper}
          metalness={0.88}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[0, PHI_START + PHI_LENGTH, 0]}>
        <ringGeometry args={[SHELL_INNER, SHELL_OUTER, 36]} />
        <meshStandardMaterial
          color={COL.copper}
          metalness={0.88}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function InsulatorStack() {
  const sheds = 8;
  return (
    <group>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.058, 0.88, 24]} />
        <meshStandardMaterial
          color={COL.porcelain}
          roughness={0.48}
          metalness={0.06}
        />
      </mesh>
      {Array.from({ length: sheds }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0.16 + i * 0.095, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <torusGeometry args={[0.092, 0.026, 10, 28]} />
          <meshStandardMaterial
            color="#e6ddd0"
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.06, 24]} />
        <meshStandardMaterial color={COL.gunmetal} metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, BALL_Y - INNER_R * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, INNER_R * 0.9, 16]} />
        <meshStandardMaterial color={COL.copper} metalness={0.95} roughness={0.22} />
      </mesh>
    </group>
  );
}

function Cradle() {
  const arms = [0.15, (Math.PI * 2) / 3 + 0.15, (Math.PI * 4) / 3 + 0.15];
  const ringY = BALL_Y - SHELL_OUTER * 0.62;
  return (
    <group>
      <mesh position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[SHELL_OUTER * 0.72, 0.028, 10, 48]} />
        <meshStandardMaterial color={COL.gunmetal} metalness={0.88} roughness={0.38} />
      </mesh>
      {arms.map((a) => {
        const x = Math.cos(a);
        const z = Math.sin(a);
        return (
          <group key={a}>
            <mesh
              position={[x * 0.55, 0.28, z * 0.55]}
              rotation={[0, -a + Math.PI / 2, 0.42]}
              castShadow
            >
              <cylinderGeometry args={[0.028, 0.036, 0.62, 10]} />
              <meshStandardMaterial
                color={COL.gunmetal}
                metalness={0.86}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[x * 0.48, ringY + 0.12, z * 0.48]} castShadow>
              <sphereGeometry args={[0.04, 16, 12]} />
              <meshStandardMaterial
                color={COL.copper}
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Capacitor() {
  const cutaway = useLab((s) => s.cutaway);
  const labels = useLab((s) => s.labels);
  const voltage = useLab((s) => s.voltage);
  const hoverBall = useLab((s) => s.hoverBall);
  const charge = voltage / V_MAX;
  const ballRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const phiStart = cutaway ? PHI_START : 0;
  const phiLength = cutaway ? PHI_LENGTH : Math.PI * 2;
  const shellKey = cutaway ? "cut" : "full";

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.04 * charge;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = charge * 0.22;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.72, 0.8, 0.08, 48]} />
        <meshStandardMaterial color="#2c323a" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.82, 48]} />
        <meshStandardMaterial color="#22262c" metalness={0.4} roughness={0.62} />
      </mesh>

      <Cradle />
      <InsulatorStack />

      <mesh
        key={`outer-${shellKey}`}
        position={[0, BALL_Y, 0]}
        castShadow
      >
        <sphereGeometry
          args={[SHELL_OUTER, SEG_W, SEG_H, phiStart, phiLength, THETA_START, THETA_LENGTH]}
        />
        <meshPhysicalMaterial
          color="#7a818c"
          metalness={0.94}
          roughness={0.28}
          envMapIntensity={1.35}
          transparent={!cutaway}
          opacity={cutaway ? 1 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh key={`inner-${shellKey}`} position={[0, BALL_Y, 0]}>
        <sphereGeometry
          args={[SHELL_INNER, SEG_W, SEG_H, phiStart, phiLength, THETA_START, THETA_LENGTH]}
        />
        <meshPhysicalMaterial
          color="#4e555e"
          metalness={0.9}
          roughness={0.28}
          envMapIntensity={1.05}
          side={THREE.BackSide}
          transparent={!cutaway}
          opacity={cutaway ? 1 : 0.18}
        />
      </mesh>

      <mesh
        position={[0, BALL_Y, 0]}
        rotation={[Math.PI / 2, 0, phiStart]}
      >
        <torusGeometry args={[SHELL_OUTER + 0.006, 0.02, 10, 64, phiLength]} />
        <meshStandardMaterial color={COL.copper} metalness={0.92} roughness={0.3} />
      </mesh>

      <FlangeBolts cutaway={cutaway} y={BALL_Y} />
      <CutRims cutaway={cutaway} />

      <mesh
        ref={ballRef}
        position={[0, BALL_Y, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          useLab.getState().beginTouch();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          useLab.getState().setHoverBall(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          useLab.getState().setHoverBall(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[INNER_R, 64, 48]} />
        <meshPhysicalMaterial
          color={hoverBall ? "#eef3f8" : COL.chrome}
          metalness={1}
          roughness={0.06}
          envMapIntensity={1.55}
          clearcoat={0.55}
          clearcoatRoughness={0.08}
          emissive={COL.accent}
          emissiveIntensity={charge * 0.45}
        />
      </mesh>

      <mesh ref={glowRef} position={[0, BALL_Y, 0]}>
        <sphereGeometry args={[INNER_R * 1.06, 32, 24]} />
        <meshBasicMaterial
          color={COL.accent}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        position={[0, BALL_Y, 0]}
        color={COL.accent}
        intensity={charge * 6.5}
        distance={5.5}
        decay={2}
      />

      {labels && (
        <>
          <Label position={[0.02, BALL_Y + INNER_R + 0.16, 0.02]}>Inner conducting ball</Label>
          <Label position={[SHELL_OUTER * 0.85, BALL_Y + 0.48, 0.18]}>Heavy outer shell</Label>
          <Label position={[0.48, BALL_Y - 0.12, 0.08]}>Air dielectric</Label>
          <Label position={[0.28, 0.42, 0.18]}>Ceramic insulator</Label>
        </>
      )}
    </group>
  );
}
