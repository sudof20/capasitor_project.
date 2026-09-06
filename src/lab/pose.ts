import * as THREE from "three";
import { BALL_Y, INNER_R } from "@/lab/physics";
import { useLab } from "@/lab/store";

export function handWorldPosition(target: THREE.Vector3) {
  const s = useLab.getState();
  const reach =
    s.phase === "reaching" || s.phase === "shock"
      ? Math.min(1, s.phaseElapsed / 0.82)
      : 0;
  const mix = reach * reach * (3 - 2 * reach);
  const idle = new THREE.Vector3(1.42, 1.05, 0.82);
  const contact = new THREE.Vector3(INNER_R + 0.05, BALL_Y - 0.02, 0.12);
  return target.copy(idle).lerp(contact, mix);
}
