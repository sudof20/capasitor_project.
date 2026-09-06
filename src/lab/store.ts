import { create } from "zustand";
import {
  CHARGE_RATE,
  LEAK,
  V_MAX,
  chargeOf,
  energyOf,
} from "@/lab/physics";

export type LabPhase = "idle" | "reaching" | "shock" | "recover";

export type LabState = {
  entered: boolean;
  voltage: number;
  charging: boolean;
  cutaway: boolean;
  fieldLines: boolean;
  labels: boolean;
  autoRotate: boolean;
  hoverBall: boolean;
  phase: LabPhase;
  phaseElapsed: number;
  lastEnergy: number;
  lastCharge: number;
  trauma: number;
  flash: number;
  reducedMotion: boolean;
  enter: () => void;
  setCharging: (v: boolean) => void;
  setVoltage: (v: number) => void;
  toggleCutaway: () => void;
  toggleFieldLines: () => void;
  toggleLabels: () => void;
  stopAutoRotate: () => void;
  setHoverBall: (v: boolean) => void;
  beginTouch: () => void;
  tick: (dt: number) => void;
  reset: () => void;
};

const REACH_S = 0.82;
const SHOCK_S = 0.78;
const RECOVER_S = 1.05;

function readReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useLab = create<LabState>((set, get) => ({
  entered: false,
  voltage: 0,
  charging: false,
  cutaway: true,
  fieldLines: true,
  labels: true,
  autoRotate: true,
  hoverBall: false,
  phase: "idle",
  phaseElapsed: 0,
  lastEnergy: 0,
  lastCharge: 0,
  trauma: 0,
  flash: 0,
  reducedMotion: false,

  enter: () =>
    set({
      entered: true,
      autoRotate: true,
      reducedMotion: readReducedMotion(),
    }),

  setCharging: (v) => {
    if (get().phase !== "idle") return;
    set({ charging: v });
  },

  setVoltage: (v) =>
    set({ voltage: Math.min(V_MAX, Math.max(0, v)), charging: false }),

  toggleCutaway: () => set((s) => ({ cutaway: !s.cutaway })),
  toggleFieldLines: () => set((s) => ({ fieldLines: !s.fieldLines })),
  toggleLabels: () => set((s) => ({ labels: !s.labels })),
  stopAutoRotate: () => set({ autoRotate: false }),
  setHoverBall: (v) => set({ hoverBall: v }),

  beginTouch: () => {
    const s = get();
    if (!s.entered || s.phase !== "idle") return;
    set({ phase: "reaching", phaseElapsed: 0, charging: false });
  },

  tick: (dt) =>
    set((s) => {
      let voltage = s.voltage;
      let trauma = Math.max(0, s.trauma - dt * 1.85);
      let flash = Math.max(0, s.flash - dt * 4.6);
      let phase = s.phase;
      let phaseElapsed = s.phaseElapsed + dt;
      let lastEnergy = s.lastEnergy;
      let lastCharge = s.lastCharge;
      let charging = s.charging;

      if (phase === "idle") {
        if (charging) {
          voltage = Math.min(V_MAX, voltage + CHARGE_RATE * dt);
        } else if (voltage > 0) {
          voltage = Math.max(0, voltage * Math.exp(-LEAK * dt));
          if (voltage < 8) voltage = 0;
        }
      }

      if (phase === "reaching" && phaseElapsed >= REACH_S) {
        lastEnergy = energyOf(voltage);
        lastCharge = chargeOf(voltage);
        if (voltage >= 3500) {
          const reduced = s.reducedMotion;
          trauma = reduced ? 0 : lastEnergy > 0.5 ? 1 : lastEnergy > 0.05 ? 0.58 : 0.28;
          flash = reduced ? 0 : lastEnergy > 0.5 ? 1 : 0.48;
          voltage = 0;
          charging = false;
          phase = "shock";
        } else {
          phase = "recover";
        }
        phaseElapsed = 0;
      } else if (phase === "shock" && phaseElapsed >= SHOCK_S) {
        phase = "recover";
        phaseElapsed = 0;
      } else if (phase === "recover" && phaseElapsed >= RECOVER_S) {
        phase = "idle";
        phaseElapsed = 0;
      }

      return {
        voltage,
        trauma,
        flash,
        phase,
        phaseElapsed,
        lastEnergy,
        lastCharge,
        charging,
      };
    }),

  reset: () =>
    set({
      voltage: 0,
      charging: false,
      phase: "idle",
      phaseElapsed: 0,
      lastEnergy: 0,
      lastCharge: 0,
      trauma: 0,
      flash: 0,
    }),
}));

export function installLabTest() {
  if (typeof window === "undefined") return;
  window.__labTest = {
    getVoltage: () => useLab.getState().voltage,
    getPhase: () => useLab.getState().phase,
    getEnergy: () => useLab.getState().lastEnergy,
    setVoltage: (v: number) => useLab.getState().setVoltage(v),
    touch: () => useLab.getState().beginTouch(),
    enter: () => useLab.getState().enter(),
    reset: () => useLab.getState().reset(),
  };
}

declare global {
  interface Window {
    __labTest?: {
      getVoltage: () => number;
      getPhase: () => LabPhase;
      getEnergy: () => number;
      setVoltage: (v: number) => void;
      touch: () => void;
      enter: () => void;
      reset: () => void;
    };
  }
}
