import assert from "node:assert/strict";
import test from "node:test";
import {
  AIR_BREAKDOWN_FIELD,
  C,
  INNER_R,
  SHELL_INNER,
  breakdownMargin,
  chargeOf,
  electricFieldAtRadius,
  energyOf,
  potentialAtRadius,
} from "./physics.ts";

test("spherical capacitor capacitance is positive and in the expected pF range", () => {
  assert.ok(C > 60e-12 && C < 80e-12);
});

test("charge and energy follow Q=CV and U=1/2CV²", () => {
  const voltage = 100_000;
  assert.ok(Math.abs(chargeOf(voltage) - C * voltage) < 1e-18);
  assert.ok(Math.abs(energyOf(voltage) - 0.5 * C * voltage ** 2) < 1e-12);
});

test("electric field is strongest at the inner conductor", () => {
  const voltage = 100_000;
  const inner = electricFieldAtRadius(voltage, INNER_R);
  const middle = electricFieldAtRadius(voltage, (INNER_R + SHELL_INNER) / 2);
  assert.ok(inner > middle);
  assert.ok(inner > 0);
});

test("potential is V at the inner conductor and zero at the shell", () => {
  const voltage = 100_000;
  assert.ok(Math.abs(potentialAtRadius(voltage, INNER_R) - voltage) < 1e-8);
  assert.ok(Math.abs(potentialAtRadius(voltage, SHELL_INNER)) < 1e-8);
});

test("breakdown margin compares peak field to the air approximation", () => {
  const voltage = 400_000;
  const margin = breakdownMargin(voltage);
  assert.ok(margin > 0);
  assert.ok(margin * electricFieldAtRadius(voltage, INNER_R) - AIR_BREAKDOWN_FIELD < 1);
});
