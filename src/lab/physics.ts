/** Spherical capacitor: C = 4πε₀ · a·b / (b − a). Units: SI, 1 world unit = 1 m. */

export const EPS0 = 8.854187817e-12;

export const INNER_R = 0.3;
export const SHELL_INNER = 0.58;
export const SHELL_OUTER = 0.7;
export const BALL_Y = 1.18;
export const V_MAX = 400_000;
export const CHARGE_RATE = 58_000;
export const LEAK = 0.012;

export const PHI_START = 0.52;
export const PHI_LENGTH = Math.PI * 1.68;
export const THETA_START = 0.0;
export const THETA_LENGTH = Math.PI * 0.78;

export const C =
  (4 * Math.PI * EPS0 * INNER_R * SHELL_INNER) / (SHELL_INNER - INNER_R);

export function chargeOf(voltage: number) {
  return C * voltage;
}

export function energyOf(voltage: number) {
  return 0.5 * C * voltage * voltage;
}

export function formatVoltage(v: number) {
  if (v >= 1000) {
    const kv = v / 1000;
    return `${kv >= 100 ? kv.toFixed(0) : kv.toFixed(1)} kV`;
  }
  return `${Math.round(v)} V`;
}

export function formatCharge(q: number) {
  const uC = q * 1e6;
  if (Math.abs(uC) >= 1) return `${uC.toFixed(2)} µC`;
  return `${(q * 1e9).toFixed(1)} nC`;
}

export function formatEnergy(j: number) {
  if (j >= 1) return `${j.toFixed(2)} J`;
  if (j >= 0.001) return `${(j * 1000).toFixed(1)} mJ`;
  return `${(j * 1e6).toFixed(0)} µJ`;
}

export function formatCapacitance(c = C) {
  return `${(c * 1e12).toFixed(1)} pF`;
}

export function shockGrade(energy: number) {
  if (energy < 0.008) return "tingle" as const;
  if (energy < 0.4) return "sharp" as const;
  return "heavy" as const;
}
