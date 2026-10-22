/**
 * Spherical capacitor model.
 *
 * Geometry is expressed in metres (1 world unit = 1 m): a is the inner
 * conductor radius and b is the inner radius of the outer shell.
 */

export const EPS0 = 8.8541878128e-12;
export const AIR_BREAKDOWN_FIELD = 3_000_000; // V/m, dry air at sea level (approx.)

export const INNER_R = 0.3;
export const SHELL_INNER = 0.58;
export const SHELL_OUTER = 0.7;
export const CAPACITOR_GAP = SHELL_INNER - INNER_R;
export const BALL_Y = 1.18;
export const V_MAX = 400_000;
export const CHARGE_RATE = 58_000; // V/s while the charge control is held
export const LEAK = 0.012; // 1/s, equivalent to a ~83 s time constant

export const PHI_START = 0.52;
export const PHI_LENGTH = Math.PI * 1.68;
export const THETA_START = 0.0;
export const THETA_LENGTH = Math.PI * 0.78;

/** C = 4πε₀ab/(b-a). */
export const C = (4 * Math.PI * EPS0 * INNER_R * SHELL_INNER) / CAPACITOR_GAP;

export function clampVoltage(voltage: number) {
  return Math.min(V_MAX, Math.max(0, Number.isFinite(voltage) ? voltage : 0));
}

export function chargeOf(voltage: number) {
  return C * clampVoltage(voltage);
}

export function energyOf(voltage: number) {
  const v = clampVoltage(voltage);
  return 0.5 * C * v * v;
}

/** Electric-field magnitude inside the dielectric at radius r: E(r)=Vab/((b-a)r²). */
export function electricFieldAtRadius(voltage: number, radius: number) {
  const r = Math.max(INNER_R, Math.min(SHELL_INNER, radius));
  return (clampVoltage(voltage) * INNER_R * SHELL_INNER) / (CAPACITOR_GAP * r * r);
}

export function peakFieldOf(voltage: number) {
  return electricFieldAtRadius(voltage, INNER_R);
}

/** Potential relative to the outer shell at a radius within the dielectric. */
export function potentialAtRadius(voltage: number, radius: number) {
  const r = Math.max(INNER_R, Math.min(SHELL_INNER, radius));
  return clampVoltage(voltage) * ((SHELL_INNER / r) - 1) / ((SHELL_INNER / INNER_R) - 1);
}

export function breakdownMargin(voltage: number) {
  return AIR_BREAKDOWN_FIELD / Math.max(1, peakFieldOf(voltage));
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

export function formatElectricField(field: number) {
  if (field >= 1_000_000) return `${(field / 1_000_000).toFixed(2)} MV/m`;
  if (field >= 1000) return `${(field / 1000).toFixed(1)} kV/m`;
  return `${Math.round(field)} V/m`;
}

export function formatCapacitance(c = C) {
  return `${(c * 1e12).toFixed(1)} pF`;
}

export function shockGrade(energy: number) {
  if (energy < 0.008) return "tingle" as const;
  if (energy < 0.4) return "sharp" as const;
  return "heavy" as const;
}
