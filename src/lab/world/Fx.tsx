import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  BALL_Y,
  CAPACITOR_GAP,
  INNER_R,
  SHELL_INNER,
  V_MAX,
} from "@/lab/physics";
import { COL } from "@/lab/theme";
import { useLab } from "@/lab/store";
import { handWorldPosition } from "@/lab/pose";

function hash(i: number, seed: number) {
  const n = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function boltPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  segs: number,
  jitter: number,
  seed: number,
) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    const z = from.z + (to.z - from.z) * t;
    const j = i === 0 || i === segs ? 0 : jitter * (1 - Math.abs(2 * t - 1));
    pts.push([
      x + (hash(i, seed) - 0.5) * 2 * j,
      y + (hash(i + 19, seed) - 0.5) * 1.4 * j,
      z + (hash(i + 41, seed) - 0.5) * 2 * j,
    ]);
  }
  return pts;
}

function FieldLines() {
  const visible = useLab((s) => s.fieldLines);
  const charge = useLab((s) => s.voltage) / V_MAX;
  const lines = useMemo(() => {
    const out: [number, number, number][][] = [];
    const nPhi = 18;
    const nTh = 7;
    for (let i = 0; i < nPhi; i++) {
      for (let k = 0; k < nTh; k++) {
        const phi = (i / nPhi) * Math.PI * 2;
        const th = 0.35 + (k / (nTh - 1)) * 1.9;
        const dx = Math.sin(th) * Math.cos(phi);
        const dy = Math.cos(th);
        const dz = Math.sin(th) * Math.sin(phi);
        const radii = [INNER_R, INNER_R + CAPACITOR_GAP * 0.34, INNER_R + CAPACITOR_GAP * 0.68, SHELL_INNER];
        out.push(radii.map((radius) => [
          radius * dx,
          radius * dy + BALL_Y,
          radius * dz,
        ]));
      }
    }
    return out;
  }, []);

  if (!visible || charge < 0.02) return null;

  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={COL.accent}
          lineWidth={1.1}
          transparent
          opacity={0.12 + charge * 0.5}
          dashed
          dashSize={0.06}
          gapSize={0.04}
        />
      ))}
    </group>
  );
}

function Lightning() {
  const phase = useLab((s) => s.phase);
  const reduced = useLab((s) => s.reducedMotion);
  const energy = useLab((s) => s.lastEnergy);
  const seed = useRef(1);
  const acc = useRef(0);
  const hand = useMemo(() => new THREE.Vector3(), []);
  const ball = useMemo(() => new THREE.Vector3(INNER_R * 0.92, BALL_Y, 0.06), []);
  const chest = useMemo(() => new THREE.Vector3(1.48, 1.22, 0.58), []);
  const hip = useMemo(() => new THREE.Vector3(1.48, 0.92, 0.58), []);
  const foot = useMemo(() => new THREE.Vector3(1.4, 0.04, 0.58), []);
  const ground = useMemo(() => new THREE.Vector3(1.4, 0.0, 0.58), []);

  const bundle = useRef({
    a: boltPoints(ball, hand, 10, 0.08, 1),
    b: boltPoints(hand, chest, 8, 0.07, 2),
    c: boltPoints(chest, hip, 6, 0.06, 3),
    d: boltPoints(hip, foot, 8, 0.07, 4),
    e: boltPoints(foot, ground, 4, 0.03, 5),
  });

  useFrame((_, delta) => {
    if (phase !== "shock") return;
    acc.current += delta;
    const step = reduced ? 0.2 : 0.04;
    if (acc.current < step) return;
    acc.current = 0;
    seed.current += 1;
    handWorldPosition(hand);
    const s = seed.current;
    const j = energy > 0.4 ? 0.1 : 0.06;
    bundle.current = {
      a: boltPoints(ball, hand, 10, j, s),
      b: boltPoints(hand, chest, 8, j * 0.9, s + 3),
      c: boltPoints(chest, hip, 6, j * 0.8, s + 5),
      d: boltPoints(hip, foot, 8, j * 0.85, s + 8),
      e: boltPoints(foot, ground, 4, 0.03, s + 9),
    };
  });

  if (phase !== "shock" || energy < 0.004) return null;

  const { a, b, c, d, e } = bundle.current;
  const w = energy > 0.4 ? 2.4 : 1.6;

  return (
    <group>
      <Line points={a} color="#e7fffb" lineWidth={w} toneMapped={false} />
      <Line points={b} color={COL.accent} lineWidth={w * 0.85} toneMapped={false} />
      <Line points={c} color={COL.accent} lineWidth={w * 0.7} toneMapped={false} />
      <Line points={d} color="#bffff6" lineWidth={w * 0.7} toneMapped={false} />
      <Line points={e} color="#ffffff" lineWidth={w} toneMapped={false} />
      <pointLight
        position={hand.toArray()}
        color={COL.accent}
        intensity={energy > 0.4 ? 18 : 8}
        distance={3.5}
      />
    </group>
  );
}

function ChargeMotes() {
  const charge = useLab((s) => s.voltage) / V_MAX;
  if (charge < 0.08) return null;
  return (
    <Sparkles
      position={[0, BALL_Y, 0]}
      count={Math.floor(18 + charge * 40)}
      scale={INNER_R * 2.4}
      size={2.4}
      speed={0.35 + charge * 0.5}
      opacity={0.35 + charge * 0.5}
      color={COL.accent}
    />
  );
}

function FlashLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const flash = useLab.getState().flash;
    if (light.current) light.current.intensity = flash * 28;
  });
  return (
    <pointLight
      ref={light}
      position={[0.4, BALL_Y, 0.3]}
      color="#f4fffc"
      intensity={0}
      distance={10}
    />
  );
}

export function Fx() {
  return (
    <>
      <FieldLines />
      <Lightning />
      <ChargeMotes />
      <FlashLight />
    </>
  );
}
