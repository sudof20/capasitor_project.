import { i as __toESM } from "../_runtime.mjs";
import { $ as require_jsx_runtime, H as SRGBColorSpace, I as MeshStandardMaterial, R as Object3D, X as Vector3, a as Line, b as CatmullRomCurve3, c as Canvas, d as useThree, et as require_react, i as OrbitControls, m as PMREMGenerator, n as ContactShadows, o as Html, r as Grid, t as Sparkles, u as useFrame, x as ClampToEdgeWrapping, y as CanvasTexture } from "../_libs/@react-three/drei+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as EffectComposer, t as Bloom } from "../_libs/@react-three/postprocessing+[...].mjs";
import { t as RoomEnvironment } from "../_libs/three.mjs";
import { a as Layers, i as RotateCcw, o as Hand, r as Spline, s as Eye, t as Zap } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CapacitorLab-CMp_6k-b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Shared 3D palette — keep in lockstep with CSS tokens in styles.css */
var COL = {
	bg: "#0b0d10",
	surface: "#14181e",
	elevated: "#1c222a",
	fg: "#e8eaed",
	muted: "#8b939c",
	border: "#2a313a",
	accent: "#5eead4",
	steel: "#d7dce2",
	copper: "#8d6a4a",
	gunmetal: "#6a717a",
	chrome: "#d8dee6",
	porcelain: "#ddd4c6",
	floor: "#1a1d22",
	pad: "#262b32",
	warn: "#e8b4a2"
};
/** Spherical capacitor: C = 4πε₀ · a·b / (b − a). Units: SI, 1 world unit = 1 m. */
var EPS0 = 8854187817e-21;
var INNER_R = .3;
var SHELL_INNER = .58;
var SHELL_OUTER = .7;
var BALL_Y = 1.18;
var V_MAX = 4e5;
var CHARGE_RATE = 58e3;
var LEAK = .012;
var PHI_START = .52;
var PHI_LENGTH = Math.PI * 1.68;
var THETA_LENGTH = Math.PI * .78;
var C = 4 * Math.PI * EPS0 * INNER_R * SHELL_INNER / .27999999999999997;
function chargeOf(voltage) {
	return C * voltage;
}
function energyOf(voltage) {
	return .5 * C * voltage * voltage;
}
function formatVoltage(v) {
	if (v >= 1e3) {
		const kv = v / 1e3;
		return `${kv >= 100 ? kv.toFixed(0) : kv.toFixed(1)} kV`;
	}
	return `${Math.round(v)} V`;
}
function formatCharge(q) {
	const uC = q * 1e6;
	if (Math.abs(uC) >= 1) return `${uC.toFixed(2)} µC`;
	return `${(q * 1e9).toFixed(1)} nC`;
}
function formatEnergy(j) {
	if (j >= 1) return `${j.toFixed(2)} J`;
	if (j >= .001) return `${(j * 1e3).toFixed(1)} mJ`;
	return `${(j * 1e6).toFixed(0)} µJ`;
}
function formatCapacitance(c = C) {
	return `${(c * 0xe8d4a51000).toFixed(1)} pF`;
}
function shockGrade(energy) {
	if (energy < .008) return "tingle";
	if (energy < .4) return "sharp";
	return "heavy";
}
var REACH_S = .82;
var SHOCK_S = .78;
var RECOVER_S = 1.05;
function readReducedMotion() {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
var useLab = create((set, get) => ({
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
	enter: () => set({
		entered: true,
		autoRotate: true,
		reducedMotion: readReducedMotion()
	}),
	setCharging: (v) => {
		if (get().phase !== "idle") return;
		set({ charging: v });
	},
	setVoltage: (v) => set({
		voltage: Math.min(V_MAX, Math.max(0, v)),
		charging: false
	}),
	toggleCutaway: () => set((s) => ({ cutaway: !s.cutaway })),
	toggleFieldLines: () => set((s) => ({ fieldLines: !s.fieldLines })),
	toggleLabels: () => set((s) => ({ labels: !s.labels })),
	stopAutoRotate: () => set({ autoRotate: false }),
	setHoverBall: (v) => set({ hoverBall: v }),
	beginTouch: () => {
		const s = get();
		if (!s.entered || s.phase !== "idle") return;
		set({
			phase: "reaching",
			phaseElapsed: 0,
			charging: false
		});
	},
	tick: (dt) => set((s) => {
		let voltage = s.voltage;
		let trauma = Math.max(0, s.trauma - dt * 1.85);
		let flash = Math.max(0, s.flash - dt * 4.6);
		let phase = s.phase;
		let phaseElapsed = s.phaseElapsed + dt;
		let lastEnergy = s.lastEnergy;
		let lastCharge = s.lastCharge;
		let charging = s.charging;
		if (phase === "idle") {
			if (charging) voltage = Math.min(V_MAX, voltage + CHARGE_RATE * dt);
			else if (voltage > 0) {
				voltage = Math.max(0, voltage * Math.exp(-LEAK * dt));
				if (voltage < 8) voltage = 0;
			}
		}
		if (phase === "reaching" && phaseElapsed >= REACH_S) {
			lastEnergy = energyOf(voltage);
			lastCharge = chargeOf(voltage);
			if (voltage >= 3500) {
				const reduced = s.reducedMotion;
				trauma = reduced ? 0 : lastEnergy > .5 ? 1 : lastEnergy > .05 ? .58 : .28;
				flash = reduced ? 0 : lastEnergy > .5 ? 1 : .48;
				voltage = 0;
				charging = false;
				phase = "shock";
			} else phase = "recover";
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
			charging
		};
	}),
	reset: () => set({
		voltage: 0,
		charging: false,
		phase: "idle",
		phaseElapsed: 0,
		lastEnergy: 0,
		lastCharge: 0,
		trauma: 0,
		flash: 0
	})
}));
function installLabTest() {
	if (typeof window === "undefined") return;
	window.__labTest = {
		getVoltage: () => useLab.getState().voltage,
		getPhase: () => useLab.getState().phase,
		getEnergy: () => useLab.getState().lastEnergy,
		setVoltage: (v) => useLab.getState().setVoltage(v),
		touch: () => useLab.getState().beginTouch(),
		enter: () => useLab.getState().enter(),
		reset: () => useLab.getState().reset()
	};
}
var SEG_W = 64;
var SEG_H = 48;
function meridianCurve(phi, r) {
	const pts = [];
	const n = 40;
	for (let i = 0; i <= n; i++) {
		const th = 0 + i / n * THETA_LENGTH;
		pts.push(new Vector3(r * Math.sin(th) * Math.cos(phi), r * Math.cos(th), r * Math.sin(th) * Math.sin(phi)));
	}
	return new CatmullRomCurve3(pts);
}
function FlangeBolts({ cutaway, y }) {
	const ref = (0, import_react.useRef)(null);
	const dummy = (0, import_react.useMemo)(() => new Object3D(), []);
	const radial = (0, import_react.useMemo)(() => new Vector3(), []);
	const count = cutaway ? 16 : 22;
	const phi0 = cutaway ? PHI_START : 0;
	const phiL = cutaway ? PHI_LENGTH : Math.PI * 2;
	const radius = SHELL_OUTER + .018;
	(0, import_react.useLayoutEffect)(() => {
		const mesh = ref.current;
		if (!mesh) return;
		for (let i = 0; i < count; i++) {
			const phi = phi0 + (i + .5) / count * phiL;
			const x = radius * Math.cos(phi);
			const z = radius * Math.sin(phi);
			dummy.position.set(x, y, z);
			radial.set(x, 0, z).normalize();
			dummy.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), radial);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	}, [
		count,
		dummy,
		phi0,
		phiL,
		radial,
		radius,
		y
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			count
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.015,
			.015,
			.038,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: COL.steel,
			metalness: .95,
			roughness: .28
		})]
	});
}
function CutRims({ cutaway }) {
	const tube = (0, import_react.useMemo)(() => {
		if (!cutaway) return null;
		return {
			a: meridianCurve(PHI_START, SHELL_OUTER + .002),
			b: meridianCurve(PHI_START + PHI_LENGTH, SHELL_OUTER + .002)
		};
	}, [cutaway]);
	if (!cutaway || !tube) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			0,
			BALL_Y,
			0
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tubeGeometry", { args: [
				tube.a,
				40,
				.012,
				8,
				false
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.copper,
				metalness: .9,
				roughness: .32
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tubeGeometry", { args: [
				tube.b,
				40,
				.012,
				8,
				false
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.copper,
				metalness: .9,
				roughness: .32
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				rotation: [
					0,
					PHI_START,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					SHELL_INNER,
					SHELL_OUTER,
					36
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: COL.copper,
					metalness: .88,
					roughness: .35,
					side: 2
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				rotation: [
					0,
					PHI_START + PHI_LENGTH,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					SHELL_INNER,
					SHELL_OUTER,
					36
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: COL.copper,
					metalness: .88,
					roughness: .35,
					side: 2
				})]
			})
		]
	});
}
function InsulatorStack() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.52,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.052,
				.058,
				.88,
				24
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.porcelain,
				roughness: .48,
				metalness: .06
			})]
		}),
		Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.16 + i * .095,
				0
			],
			rotation: [
				Math.PI / 2,
				0,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
				.092,
				.026,
				10,
				28
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#e6ddd0",
				roughness: .45,
				metalness: .05
			})]
		}, i)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.08,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.07,
				.08,
				.06,
				24
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.gunmetal,
				metalness: .85,
				roughness: .35
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				BALL_Y - INNER_R * .35,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.028,
				.028,
				INNER_R * .9,
				16
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.copper,
				metalness: .95,
				roughness: .22
			})]
		})
	] });
}
function Cradle() {
	const arms = [
		.15,
		Math.PI * 2 / 3 + .15,
		Math.PI * 4 / 3 + .15
	];
	const ringY = BALL_Y - SHELL_OUTER * .62;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			ringY,
			0
		],
		rotation: [
			Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
			SHELL_OUTER * .72,
			.028,
			10,
			48
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: COL.gunmetal,
			metalness: .88,
			roughness: .38
		})]
	}), arms.map((a) => {
		const x = Math.cos(a);
		const z = Math.sin(a);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				x * .55,
				.28,
				z * .55
			],
			rotation: [
				0,
				-a + Math.PI / 2,
				.42
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.028,
				.036,
				.62,
				10
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.gunmetal,
				metalness: .86,
				roughness: .4
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				x * .48,
				ringY + .12,
				z * .48
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				.04,
				16,
				12
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.copper,
				metalness: .9,
				roughness: .3
			})]
		})] }, a);
	})] });
}
function Capacitor() {
	const cutaway = useLab((s) => s.cutaway);
	const labels = useLab((s) => s.labels);
	const voltage = useLab((s) => s.voltage);
	const hoverBall = useLab((s) => s.hoverBall);
	const charge = voltage / V_MAX;
	const ballRef = (0, import_react.useRef)(null);
	const glowRef = (0, import_react.useRef)(null);
	const phiStart = cutaway ? PHI_START : 0;
	const phiLength = cutaway ? PHI_LENGTH : Math.PI * 2;
	const shellKey = cutaway ? "cut" : "full";
	useFrame((state) => {
		const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * .04 * charge;
		if (glowRef.current) {
			glowRef.current.scale.setScalar(pulse);
			const mat = glowRef.current.material;
			mat.opacity = charge * .22;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.04,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.72,
				.8,
				.08,
				48
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#2c323a",
				metalness: .55,
				roughness: .5
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.005,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [.82, 48] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#22262c",
				metalness: .4,
				roughness: .62
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cradle, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsulatorStack, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				BALL_Y,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				SHELL_OUTER,
				SEG_W,
				SEG_H,
				phiStart,
				phiLength,
				0,
				THETA_LENGTH
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				color: COL.gunmetal,
				metalness: .92,
				roughness: .34,
				envMapIntensity: 1.15,
				transparent: !cutaway,
				opacity: cutaway ? 1 : .22,
				side: 2
			})]
		}, `outer-${shellKey}`),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				BALL_Y,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				SHELL_INNER,
				SEG_W,
				SEG_H,
				phiStart,
				phiLength,
				0,
				THETA_LENGTH
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				color: "#4e555e",
				metalness: .9,
				roughness: .28,
				envMapIntensity: 1.05,
				side: 1,
				transparent: !cutaway,
				opacity: cutaway ? 1 : .18
			})]
		}, `inner-${shellKey}`),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				BALL_Y,
				0
			],
			rotation: [
				Math.PI / 2,
				0,
				phiStart
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
				SHELL_OUTER + .006,
				.02,
				10,
				64,
				phiLength
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.copper,
				metalness: .92,
				roughness: .3
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlangeBolts, {
			cutaway,
			y: BALL_Y
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CutRims, { cutaway }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: ballRef,
			position: [
				0,
				BALL_Y,
				0
			],
			castShadow: true,
			onClick: (e) => {
				e.stopPropagation();
				useLab.getState().beginTouch();
			},
			onPointerOver: (e) => {
				e.stopPropagation();
				useLab.getState().setHoverBall(true);
				document.body.style.cursor = "pointer";
			},
			onPointerOut: () => {
				useLab.getState().setHoverBall(false);
				document.body.style.cursor = "auto";
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				INNER_R,
				64,
				48
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				color: hoverBall ? "#eef3f8" : COL.chrome,
				metalness: 1,
				roughness: .06,
				envMapIntensity: 1.55,
				clearcoat: .55,
				clearcoatRoughness: .08,
				emissive: COL.accent,
				emissiveIntensity: charge * .45
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: glowRef,
			position: [
				0,
				BALL_Y,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				INNER_R * 1.06,
				32,
				24
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: COL.accent,
				transparent: true,
				opacity: 0,
				depthWrite: false,
				toneMapped: false
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				0,
				BALL_Y,
				0
			],
			color: COL.accent,
			intensity: charge * 6.5,
			distance: 5.5,
			decay: 2
		}),
		labels && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
				position: [
					.12,
					1.26,
					.32
				],
				center: true,
				distanceFactor: 8,
				occlude: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lab-label",
					children: "Inner conducting ball"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
				position: [
					.385,
					1.565,
					.2
				],
				center: true,
				distanceFactor: 8,
				occlude: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lab-label",
					children: "Heavy outer shell"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
				position: [
					.22,
					1.24,
					0
				],
				center: true,
				distanceFactor: 8,
				occlude: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lab-label",
					children: "Dielectric gap"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
				position: [
					.18,
					.55,
					.18
				],
				center: true,
				distanceFactor: 8,
				occlude: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lab-label",
					children: "Ceramic insulator"
				})
			})
		] })
	] });
}
var PERSON_POS = new Vector3(1.48, 0, .58);
function expLerp(current, target, k, dt) {
	return current + (target - current) * (1 - Math.exp(-k * dt));
}
function Person() {
	const group = (0, import_react.useRef)(null);
	const shoulder = (0, import_react.useRef)(null);
	const elbow = (0, import_react.useRef)(null);
	const skinMats = (0, import_react.useRef)([]);
	const labels = useLab((s) => s.labels);
	const skin = (0, import_react.useMemo)(() => new MeshStandardMaterial({
		color: "#c4a994",
		roughness: .62
	}), []);
	const cloth = (0, import_react.useMemo)(() => new MeshStandardMaterial({
		color: "#2a3036",
		roughness: .78,
		metalness: .05
	}), []);
	const dark = (0, import_react.useMemo)(() => new MeshStandardMaterial({
		color: "#16181c",
		roughness: .7
	}), []);
	(0, import_react.useMemo)(() => {
		skinMats.current = [skin];
	}, [skin]);
	useFrame((state, delta) => {
		const dt = Math.min(delta, .1);
		const { phase, phaseElapsed, trauma, reducedMotion } = useLab.getState();
		const t = Math.min(1, phaseElapsed / .82);
		let sx = .12;
		let sy = .05;
		let sz = .08;
		let ex = .18;
		if (phase === "reaching" || phase === "shock") {
			const ease = t * t * (3 - 2 * t);
			sx = .12 + (-1.18 - .12) * ease;
			sy = .05 + .22 * ease;
			sz = .08 + .18 * ease;
			ex = .18 + .55 * ease;
		} else if (phase === "recover") {
			const ease = Math.min(1, phaseElapsed / 1.05);
			sx = -1.18 + (.12 + 1.18) * ease;
			sy = .27 * (1 - ease);
			sz = .26 * (1 - ease);
			ex = .73 * (1 - ease) + .18 * ease;
		}
		if (phase === "shock" && !reducedMotion) {
			const j = trauma * .18 * Math.sin(state.clock.elapsedTime * 62);
			sx += j;
			sy += j * .4;
			if (group.current) {
				group.current.position.x = PERSON_POS.x + Math.sin(state.clock.elapsedTime * 48) * trauma * .03;
				group.current.position.z = PERSON_POS.z + Math.cos(state.clock.elapsedTime * 41) * trauma * .02;
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
		if (elbow.current) elbow.current.rotation.x = expLerp(elbow.current.rotation.x, ex, 14, dt);
		const emit = phase === "shock" ? 1.8 : 0;
		skin.emissive.set(COL.accent);
		skin.emissiveIntensity = expLerp(skin.emissiveIntensity, emit, 18, dt);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: group,
		position: PERSON_POS.toArray(),
		rotation: [
			0,
			-Math.PI / 2 + .12,
			0
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					0,
					1.58,
					0
				],
				castShadow: true,
				material: skin,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.1,
					20,
					16
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					0,
					1.48,
					0
				],
				material: skin,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.04,
					.05,
					.08,
					12
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					0,
					1.24,
					0
				],
				castShadow: true,
				material: cloth,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
					.15,
					.32,
					6,
					12
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					0,
					.95,
					0
				],
				castShadow: true,
				material: cloth,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.32,
					.16,
					.18
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					-.09,
					.48,
					0
				],
				castShadow: true,
				material: cloth,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
					.055,
					.52,
					4,
					10
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					.09,
					.48,
					0
				],
				castShadow: true,
				material: cloth,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
					.055,
					.52,
					4,
					10
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					-.09,
					.08,
					.02
				],
				material: dark,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.1,
					.08,
					.16
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					.09,
					.08,
					.02
				],
				material: dark,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.1,
					.08,
					.16
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				position: [
					-.2,
					1.36,
					0
				],
				rotation: [
					.15,
					0,
					.35
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
					position: [
						0,
						-.16,
						0
					],
					material: cloth,
					castShadow: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.045,
						.22,
						4,
						10
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
					position: [
						0,
						-.34,
						0
					],
					material: skin,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						.038,
						10,
						8
					] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: shoulder,
				position: [
					.2,
					1.36,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
					position: [
						0,
						-.14,
						0
					],
					material: cloth,
					castShadow: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.045,
						.2,
						4,
						10
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
					ref: elbow,
					position: [
						0,
						-.28,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
						position: [
							0,
							-.12,
							0
						],
						material: cloth,
						castShadow: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
							.04,
							.18,
							4,
							10
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
						position: [
							0,
							-.26,
							0
						],
						material: skin,
						castShadow: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.042,
							12,
							10
						] })
					})]
				})]
			}),
			labels && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
				position: [
					0,
					1.82,
					0
				],
				center: true,
				distanceFactor: 8,
				occlude: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lab-label",
					children: "Grounded body path"
				})
			})
		]
	});
}
function handWorldPosition(target) {
	const s = useLab.getState();
	const reach = s.phase === "reaching" || s.phase === "shock" ? Math.min(1, s.phaseElapsed / .82) : 0;
	const mix = reach * reach * (3 - 2 * reach);
	const idle = new Vector3(1.42, 1.05, .82);
	const contact = new Vector3(INNER_R + .05, BALL_Y - .02, .12);
	return target.copy(idle).lerp(contact, mix);
}
function makeNameplateTexture() {
	const c = document.createElement("canvas");
	c.width = 1024;
	c.height = 512;
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("2d context");
	ctx.fillStyle = "#161a20";
	ctx.fillRect(0, 0, c.width, c.height);
	ctx.strokeStyle = "#8d6a4a";
	ctx.lineWidth = 10;
	ctx.strokeRect(18, 18, c.width - 36, c.height - 36);
	ctx.strokeStyle = "#3a424c";
	ctx.lineWidth = 2;
	ctx.strokeRect(32, 32, c.width - 64, c.height - 64);
	ctx.fillStyle = "#8b939c";
	ctx.font = "500 36px 'IBM Plex Sans', sans-serif";
	ctx.fillText("HIGH-VOLTAGE LABORATORY", 64, 110);
	ctx.fillStyle = "#e8eaed";
	ctx.font = "700 72px 'Barlow Condensed', sans-serif";
	ctx.fillText("SPHERICAL CAPACITOR", 64, 200);
	ctx.fillStyle = "#5eead4";
	ctx.font = "600 56px 'Barlow Condensed', sans-serif";
	ctx.fillText("PROTOTYPE  C-1", 64, 280);
	ctx.fillStyle = "#8b939c";
	ctx.font = "400 32px 'IBM Plex Mono', monospace";
	ctx.fillText("400 kV CLASS   ·   AIR DIELECTRIC   ·   69 pF", 64, 360);
	ctx.fillText("INNER BALL STORES CHARGE   ·   TOUCH DISCHARGE PATH", 64, 412);
	ctx.fillText("SERIAL  PROT-3D-01", 64, 458);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	tex.needsUpdate = true;
	return tex;
}
function makeFloorTexture() {
	const size = 512;
	const c = document.createElement("canvas");
	c.width = size;
	c.height = size;
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("2d context");
	ctx.fillStyle = "#1a1d22";
	ctx.fillRect(0, 0, size, size);
	for (let i = 0; i < 1400; i++) {
		const n = 18 + Math.random() * 22;
		ctx.fillStyle = `rgba(${n},${n + 2},${n + 4},${.15 + Math.random() * .25})`;
		ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
	}
	ctx.strokeStyle = "rgba(80,88,98,0.18)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(size / 2, size / 2, size * .46, 0, Math.PI * 2);
	ctx.stroke();
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
	tex.needsUpdate = true;
	return tex;
}
function PowerSupply() {
	const needle = (0, import_react.useRef)(null);
	const labels = useLab((s) => s.labels);
	useFrame(() => {
		const n = useLab.getState().voltage / V_MAX;
		if (needle.current) needle.current.rotation.z = Math.PI * .75 - n * Math.PI * 1.15;
	});
	const cable = (0, import_react.useMemo)(() => {
		return new CatmullRomCurve3([
			new Vector3(-1.42, .62, .72),
			new Vector3(-1.05, .78, .55),
			new Vector3(-.55, .55, .22),
			new Vector3(-.18, .42, .05),
			new Vector3(0, .34, 0)
		]);
	}, []);
	const ground = (0, import_react.useMemo)(() => {
		return new CatmullRomCurve3([
			new Vector3(.55, .08, -.55),
			new Vector3(.72, .06, -.82),
			new Vector3(.85, .02, -1.05),
			new Vector3(.9, 0, -1.15)
		]);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-1.55,
				.38,
				.72
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.42,
				.7,
				.32
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#2a3038",
				metalness: .35,
				roughness: .55
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-1.34,
				.4,
				.72
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.02,
				.5,
				.26
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#1a1e24",
				roughness: .6
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-1.325,
				.52,
				.72
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [.08, 24] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#0e1114",
				roughness: .4
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: needle,
			position: [
				-1.32,
				.52,
				.72
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.006,
				.07,
				.006
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: COL.accent,
				toneMapped: false
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-1.55,
				.08,
				.72
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.5,
				.08,
				.4
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#3a414a",
				metalness: .4,
				roughness: .5
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tubeGeometry", { args: [
			cable,
			40,
			.016,
			8,
			false
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#1c1c1c",
			roughness: .7
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tubeGeometry", { args: [
			ground,
			20,
			.012,
			6,
			false
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#3d5a48",
			roughness: .65
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.9,
				.12,
				-1.18
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.03,
				.03,
				.24,
				10
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.copper,
				metalness: .9,
				roughness: .3
			})]
		}),
		labels && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
			position: [
				-1.55,
				.86,
				.72
			],
			center: true,
			distanceFactor: 8,
			occlude: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lab-label",
				children: "HV supply"
			})
		})
	] });
}
function Nameplate() {
	const tex = (0, import_react.useMemo)(() => makeNameplateTexture(), []);
	(0, import_react.useLayoutEffect)(() => () => tex.dispose(), [tex]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.095,
			.78
		],
		rotation: [
			-.42,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.72, .36] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			map: tex,
			roughness: .55,
			metalness: .15
		})]
	});
}
function LabSet() {
	const floor = (0, import_react.useMemo)(() => makeFloorTexture(), []);
	(0, import_react.useLayoutEffect)(() => () => floor.dispose(), [floor]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
			position: [
				0,
				.001,
				0
			],
			infiniteGrid: true,
			fadeDistance: 14,
			fadeStrength: 2.4,
			cellSize: .35,
			sectionSize: 1.4,
			cellThickness: .5,
			sectionThickness: 1.1,
			cellColor: "#22262c",
			sectionColor: "#323840"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [2.2, 64] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: floor,
				roughness: .9,
				metalness: .08
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				-.02,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [40, 40] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: COL.bg,
				roughness: 1,
				metalness: 0
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactShadows, {
			position: [
				0,
				.002,
				0
			],
			opacity: .5,
			scale: 12,
			blur: 2.4,
			far: 5
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nameplate, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerSupply, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				4.6,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.04,
				.04,
				1.2,
				8
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#3a4048",
				metalness: .6,
				roughness: .4
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				3.95,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.28,
				.32,
				.08,
				24
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#cfc8ba",
				metalness: .4,
				roughness: .45
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				0,
				3.9,
				0
			],
			angle: .55,
			penumbra: .55,
			intensity: 2.4,
			color: "#f3efe6",
			castShadow: true,
			"shadow-mapSize": 1024
		})
	] });
}
function hash(i, seed) {
	const n = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
	return n - Math.floor(n);
}
function boltPoints(from, to, segs, jitter, seed) {
	const pts = [];
	for (let i = 0; i <= segs; i++) {
		const t = i / segs;
		const x = from.x + (to.x - from.x) * t;
		const y = from.y + (to.y - from.y) * t;
		const z = from.z + (to.z - from.z) * t;
		const j = i === 0 || i === segs ? 0 : jitter * (1 - Math.abs(2 * t - 1));
		pts.push([
			x + (hash(i, seed) - .5) * 2 * j,
			y + (hash(i + 19, seed) - .5) * 1.4 * j,
			z + (hash(i + 41, seed) - .5) * 2 * j
		]);
	}
	return pts;
}
function FieldLines() {
	const visible = useLab((s) => s.fieldLines);
	const charge = useLab((s) => s.voltage) / V_MAX;
	const lines = (0, import_react.useMemo)(() => {
		const out = [];
		const nPhi = 14;
		const nTh = 5;
		for (let i = 0; i < nPhi; i++) for (let k = 0; k < nTh; k++) {
			const phi = i / nPhi * Math.PI * 2;
			const th = .35 + k / 4 * 1.9;
			const sx = INNER_R * Math.sin(th) * Math.cos(phi);
			const sy = INNER_R * Math.cos(th);
			const sz = INNER_R * Math.sin(th) * Math.sin(phi);
			const ex = SHELL_INNER * Math.sin(th) * Math.cos(phi);
			const ey = SHELL_INNER * Math.cos(th);
			const ez = SHELL_INNER * Math.sin(th) * Math.sin(phi);
			out.push([[
				sx,
				sy + BALL_Y,
				sz
			], [
				ex,
				ey + BALL_Y,
				ez
			]]);
		}
		return out;
	}, []);
	if (!visible || charge < .02) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: lines.map((pts, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
		points: pts,
		color: COL.accent,
		lineWidth: 1.1,
		transparent: true,
		opacity: .18 + charge * .45,
		dashed: true,
		dashSize: .06,
		gapSize: .04
	}, i)) });
}
function Lightning() {
	const phase = useLab((s) => s.phase);
	const reduced = useLab((s) => s.reducedMotion);
	const energy = useLab((s) => s.lastEnergy);
	const seed = (0, import_react.useRef)(1);
	const acc = (0, import_react.useRef)(0);
	const hand = (0, import_react.useMemo)(() => new Vector3(), []);
	const ball = (0, import_react.useMemo)(() => new Vector3(INNER_R * .92, BALL_Y, .06), []);
	const chest = (0, import_react.useMemo)(() => new Vector3(1.48, 1.22, .58), []);
	const hip = (0, import_react.useMemo)(() => new Vector3(1.48, .92, .58), []);
	const foot = (0, import_react.useMemo)(() => new Vector3(1.4, .04, .58), []);
	const ground = (0, import_react.useMemo)(() => new Vector3(1.4, 0, .58), []);
	const bundle = (0, import_react.useRef)({
		a: boltPoints(ball, hand, 10, .08, 1),
		b: boltPoints(hand, chest, 8, .07, 2),
		c: boltPoints(chest, hip, 6, .06, 3),
		d: boltPoints(hip, foot, 8, .07, 4),
		e: boltPoints(foot, ground, 4, .03, 5)
	});
	useFrame((_, delta) => {
		if (phase !== "shock") return;
		acc.current += delta;
		const step = reduced ? .2 : .04;
		if (acc.current < step) return;
		acc.current = 0;
		seed.current += 1;
		handWorldPosition(hand);
		const s = seed.current;
		const j = energy > .4 ? .1 : .06;
		bundle.current = {
			a: boltPoints(ball, hand, 10, j, s),
			b: boltPoints(hand, chest, 8, j * .9, s + 3),
			c: boltPoints(chest, hip, 6, j * .8, s + 5),
			d: boltPoints(hip, foot, 8, j * .85, s + 8),
			e: boltPoints(foot, ground, 4, .03, s + 9)
		};
	});
	if (phase !== "shock" || energy < .004) return null;
	const { a, b, c, d, e } = bundle.current;
	const w = energy > .4 ? 2.4 : 1.6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
			points: a,
			color: "#e7fffb",
			lineWidth: w,
			toneMapped: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
			points: b,
			color: COL.accent,
			lineWidth: w * .85,
			toneMapped: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
			points: c,
			color: COL.accent,
			lineWidth: w * .7,
			toneMapped: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
			points: d,
			color: "#bffff6",
			lineWidth: w * .7,
			toneMapped: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
			points: e,
			color: "#ffffff",
			lineWidth: w,
			toneMapped: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: hand.toArray(),
			color: COL.accent,
			intensity: energy > .4 ? 18 : 8,
			distance: 3.5
		})
	] });
}
function ChargeMotes() {
	const charge = useLab((s) => s.voltage) / V_MAX;
	if (charge < .08) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
		position: [
			0,
			BALL_Y,
			0
		],
		count: Math.floor(18 + charge * 40),
		scale: INNER_R * 2.4,
		size: 2.4,
		speed: .35 + charge * .5,
		opacity: .35 + charge * .5,
		color: COL.accent
	});
}
function FlashLight() {
	const light = (0, import_react.useRef)(null);
	useFrame(() => {
		const flash = useLab.getState().flash;
		if (light.current) light.current.intensity = flash * 28;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
		ref: light,
		position: [
			.4,
			BALL_Y,
			.3
		],
		color: "#f4fffc",
		intensity: 0,
		distance: 10
	});
}
function Fx() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldLines, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightning, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChargeMotes, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlashLight, {})
	] });
}
function RoomEnv() {
	const scene = useThree((s) => s.scene);
	const gl = useThree((s) => s.gl);
	(0, import_react.useLayoutEffect)(() => {
		const pmrem = new PMREMGenerator(gl);
		const envScene = new RoomEnvironment();
		const env = pmrem.fromScene(envScene, .04).texture;
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
		tick(Math.min(delta, .1));
	});
	return null;
}
function CameraTrauma() {
	const camera = useThree((s) => s.camera);
	(0, import_react.useMemo)(() => new Vector3(), []);
	useFrame((state) => {
		const { trauma, reducedMotion } = useLab.getState();
		if (reducedMotion || trauma <= .01) return;
		const shake = trauma * trauma;
		const t = state.clock.elapsedTime;
		camera.position.x += Math.sin(t * 67.1) * shake * .07;
		camera.position.y += Math.cos(t * 53.4) * shake * .045;
		camera.rotation.z += Math.sin(t * 40) * shake * .01;
	});
	return null;
}
function Scene() {
	const autoRotate = useLab((s) => s.autoRotate);
	const reduced = useLab((s) => s.reducedMotion);
	const entered = useLab((s) => s.entered);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: [COL.bg]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				COL.bg,
				9,
				22
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomEnv, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			"#c5cdd6",
			"#1c1814",
			.42
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .14 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				4.2,
				7.2,
				3.2
			],
			intensity: 1.15,
			color: "#f4f1ea",
			castShadow: true,
			"shadow-mapSize": 1024,
			"shadow-camera-near": .5,
			"shadow-camera-far": 18,
			"shadow-camera-left": -4,
			"shadow-camera-right": 4,
			"shadow-camera-top": 4,
			"shadow-camera-bottom": -4
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-4,
				2.5,
				-3
			],
			intensity: .28,
			color: "#8fa4b8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabSet, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Capacitor, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Person, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fx, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimTicker, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraTrauma, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
			makeDefault: true,
			enableDamping: true,
			dampingFactor: .06,
			autoRotate: autoRotate && !reduced && entered,
			autoRotateSpeed: .45,
			minPolarAngle: .18,
			maxPolarAngle: Math.PI / 2 - .06,
			minDistance: 2.3,
			maxDistance: 9,
			target: [
				.12,
				1.05,
				.05
			],
			onStart: () => useLab.getState().stopAutoRotate()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectComposer, {
			enableNormalPass: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bloom, {
				luminanceThreshold: 1.05,
				intensity: .55,
				mipmapBlur: true,
				luminanceSmoothing: .2
			})
		})
	] });
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium select-none transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-steel text-bg hover:opacity-90",
			ghost: "bg-elevated text-fg border border-border hover:bg-surface",
			charge: "bg-accent text-accent-fg hover:opacity-90",
			danger: "bg-danger text-bg hover:opacity-90"
		},
		size: {
			sm: "h-9 rounded-sm px-3 text-sm",
			md: "h-11 rounded-md px-4 text-sm",
			lg: "h-12 rounded-md px-5 text-base"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = (0, import_react.forwardRef)(({ className, variant, size, type = "button", ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
});
Button.displayName = "Button";
var ctx = null;
var humOsc = null;
var humGain = null;
var unlocked = false;
function getCtx() {
	if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
	return ctx;
}
async function unlockAudio() {
	const c = getCtx();
	if (c.state === "suspended") try {
		await c.resume();
	} catch {}
	unlocked = true;
	ensureHum();
}
function ensureHum() {
	if (!ctx || humOsc) return;
	humOsc = ctx.createOscillator();
	humOsc.type = "sine";
	humOsc.frequency.value = 92;
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 240;
	humGain = ctx.createGain();
	humGain.gain.value = 0;
	humOsc.connect(filter);
	filter.connect(humGain);
	humGain.connect(ctx.destination);
	humOsc.start();
}
function setHum(amount) {
	if (!unlocked || !humGain || !ctx || !humOsc) return;
	const a = Math.max(0, Math.min(1, amount));
	humGain.gain.setTargetAtTime(a * .045, ctx.currentTime, .08);
	humOsc.frequency.setTargetAtTime(78 + a * 70, ctx.currentTime, .12);
}
function playShock(energyJ) {
	if (!unlocked || !ctx) return;
	const t = ctx.currentTime;
	const dur = .28 + Math.min(.22, energyJ * .04);
	const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) {
		const env = Math.exp(-i / (ctx.sampleRate * .07));
		const crackle = Math.random() * 2 - 1;
		data[i] = crackle * env;
	}
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	const hp = ctx.createBiquadFilter();
	hp.type = "highpass";
	hp.frequency.value = 700;
	const g = ctx.createGain();
	const vol = Math.min(.85, .22 + energyJ * .1);
	g.gain.setValueAtTime(vol, t);
	g.gain.exponentialRampToValueAtTime(.001, t + dur);
	src.connect(hp).connect(g).connect(ctx.destination);
	src.start(t);
	const osc = ctx.createOscillator();
	osc.type = "sine";
	osc.frequency.setValueAtTime(110, t);
	osc.frequency.exponentialRampToValueAtTime(28, t + .2);
	const g2 = ctx.createGain();
	g2.gain.setValueAtTime(Math.min(.55, .18 + energyJ * .06), t);
	g2.gain.exponentialRampToValueAtTime(.001, t + .22);
	osc.connect(g2).connect(ctx.destination);
	osc.start(t);
	osc.stop(t + .24);
}
function playTingle() {
	if (!unlocked || !ctx) return;
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	osc.type = "triangle";
	osc.frequency.value = 1800;
	const g = ctx.createGain();
	g.gain.setValueAtTime(.05, t);
	g.gain.exponentialRampToValueAtTime(.001, t + .08);
	osc.connect(g).connect(ctx.destination);
	osc.start(t);
	osc.stop(t + .09);
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-mono text-[0.625rem] uppercase tracking-[0.14em] text-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-mono text-sm tabular-nums text-fg md:text-base",
		children: value
	})] });
}
function Toggle({ on, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("inline-flex h-11 items-center gap-2 rounded-sm border px-3 text-xs font-medium", on ? "border-accent/40 bg-elevated text-accent" : "border-border bg-surface text-muted"),
		children
	});
}
function ShockBanner() {
	const phase = useLab((s) => s.phase);
	const energy = useLab((s) => s.lastEnergy);
	const charge = useLab((s) => s.lastCharge);
	const flash = useLab((s) => s.flash);
	if (phase !== "shock" && phase !== "recover") {
		if (flash <= 0) return null;
	}
	if (phase === "recover" && energy < .004) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 top-20 z-30 flex justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hud-panel rounded-md px-4 py-2 text-sm text-muted",
			children: "Not enough charge — only a faint tingle."
		})
	});
	if (phase !== "shock" && flash <= .05) return null;
	const grade = shockGrade(energy);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [flash > .05 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shock-flash absolute inset-0 z-20",
		style: { opacity: Math.min(1, flash) }
	}), phase === "shock" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center px-4 md:top-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hud-panel max-w-md rounded-lg px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl tracking-wide text-accent",
				children: grade === "heavy" ? "Heavy shock" : grade === "sharp" ? "Sharp shock" : "Tingle"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					"Discharge path: hand → arm → torso → legs → earth. Energy",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums text-fg",
						children: formatEnergy(energy)
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums text-fg",
						children: formatCharge(charge)
					})
				]
			})]
		})
	})] });
}
function Hud() {
	const entered = useLab((s) => s.entered);
	const voltage = useLab((s) => s.voltage);
	const charging = useLab((s) => s.charging);
	const cutaway = useLab((s) => s.cutaway);
	const fieldLines = useLab((s) => s.fieldLines);
	const labels = useLab((s) => s.labels);
	const phase = useLab((s) => s.phase);
	const hoverBall = useLab((s) => s.hoverBall);
	const fill = voltage / V_MAX;
	(0, import_react.useEffect)(() => {
		if (!entered) return;
		setHum(voltage / V_MAX);
	}, [entered, voltage]);
	(0, import_react.useEffect)(() => {
		if (!entered) return;
		const onKeyDown = (e) => {
			if (e.code === "KeyC") {
				e.preventDefault();
				unlockAudio();
				useLab.getState().setCharging(true);
			}
			if (e.code === "KeyT") {
				e.preventDefault();
				useLab.getState().beginTouch();
			}
			if (e.code === "KeyR") useLab.getState().reset();
		};
		const onKeyUp = (e) => {
			if (e.code === "KeyC") useLab.getState().setCharging(false);
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", () => useLab.getState().setCharging(false));
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
		};
	}, [entered]);
	(0, import_react.useEffect)(() => {
		if (!entered) return;
		let prev = useLab.getState().phase;
		return useLab.subscribe((s) => {
			if (s.phase === "shock" && prev !== "shock") playShock(s.lastEnergy);
			if (s.phase === "recover" && prev === "reaching" && s.lastEnergy < .004) playTingle();
			prev = s.phase;
		});
	}, [entered]);
	if (!entered) return null;
	const busy = phase !== "idle";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShockBanner, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto hud-panel max-w-[16rem] rounded-lg px-3 py-2 md:max-w-sm md:px-4 md:py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted",
					children: "Prototype structure"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl leading-none tracking-wide text-fg md:text-3xl",
					children: "C-1 Capacitor"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto hud-panel rounded-lg px-3 py-2 md:px-4 md:py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle",
					children: "Terminal voltage"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xl tabular-nums text-accent md:text-2xl",
					children: formatVoltage(voltage)
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "pointer-events-none absolute left-0 top-24 z-10 hidden w-64 p-5 md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto hud-panel rounded-lg p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[0.625rem] uppercase tracking-[0.14em] text-subtle",
						children: "Live readout"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Charge",
								value: formatCharge(chargeOf(voltage))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Energy",
								value: formatEnergy(energyOf(voltage))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "C",
								value: formatCapacitance(C)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "V max",
								value: "400 kV"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-1.5 overflow-hidden rounded-full bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-accent transition-[width] duration-150",
							style: { width: `${Math.min(100, fill * 100)}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-relaxed text-muted",
						children: "C = 4πε₀ · a·b / (b − a). Energy stored as ½CV² on the inner ball."
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "pointer-events-none absolute right-0 top-24 z-10 hidden w-56 p-5 lg:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toggle, {
						on: cutaway,
						onClick: () => useLab.getState().toggleCutaway(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
							className: "size-4",
							strokeWidth: 1.75
						}), "Cutaway"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toggle, {
						on: fieldLines,
						onClick: () => useLab.getState().toggleFieldLines(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spline, {
							className: "size-4",
							strokeWidth: 1.75
						}), "Field lines"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toggle, {
						on: labels,
						onClick: () => useLab.getState().toggleLabels(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
							className: "size-4",
							strokeWidth: 1.75
						}), "Structure labels"]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
			className: "absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-3xl flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 lg:hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toggle, {
								on: cutaway,
								onClick: () => useLab.getState().toggleCutaway(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4" }), "Cutaway"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toggle, {
								on: fieldLines,
								onClick: () => useLab.getState().toggleFieldLines(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spline, { className: "size-4" }), "Field"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toggle, {
								on: labels,
								onClick: () => useLab.getState().toggleLabels(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), "Labels"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hud-panel flex flex-col gap-2 rounded-xl p-2 sm:flex-row sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "charge",
								className: "min-h-11 flex-1",
								disabled: busy,
								onPointerDown: () => {
									unlockAudio();
									useLab.getState().setCharging(true);
								},
								onPointerUp: () => useLab.getState().setCharging(false),
								onPointerLeave: () => useLab.getState().setCharging(false),
								onPointerCancel: () => useLab.getState().setCharging(false),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
									className: "size-4",
									strokeWidth: 2
								}), charging ? "Charging" : "Hold to charge"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "danger",
								className: "min-h-11 flex-1",
								disabled: busy,
								onClick: () => useLab.getState().beginTouch(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, {
									className: "size-4",
									strokeWidth: 2
								}), hoverBall ? "Touch the ball" : "Touch the ball"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								className: "min-h-11 sm:w-auto",
								onClick: () => useLab.getState().reset(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									className: "size-4",
									strokeWidth: 2
								}), "Reset"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-1 text-center font-mono text-[0.625rem] uppercase tracking-wider text-subtle md:text-xs",
						children: "Drag to orbit · Hold charge or C · Touch or T · Simulation of a grounded-body discharge"
					})
				]
			})
		})
	] });
}
function Intro() {
	if (useLab((s) => s.entered)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-20 flex items-end md:items-center justify-center p-4 md:p-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hud-panel relative w-full max-w-lg rounded-xl p-5 md:p-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-[0.18em] text-muted uppercase",
					children: "High-voltage laboratory"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl font-semibold leading-tight tracking-tight text-fg md:text-5xl",
					children: "Prototype C-1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-xl tracking-wide text-accent",
					children: "Heavy spherical capacitor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-muted",
					children: "A chrome ball sits inside a thick outer shell and stores charge across the air gap. Charge the inner sphere, then touch it — the stored energy dumps through the body to earth as a heavy shock."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-1.5 font-mono text-xs text-subtle",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Inner ball — charge terminal" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Outer shell — grounded HV housing" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Touch path — hand, arm, torso, legs, earth" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "primary",
						size: "lg",
						className: "min-h-12 w-full sm:w-auto",
						onClick: () => {
							unlockAudio();
							useLab.getState().enter();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
							className: "size-4",
							strokeWidth: 2
						}), "Enter the lab"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "Simulation only. Never touch a live capacitor."
					})]
				})
			]
		})]
	});
}
function CapacitorLab() {
	(0, import_react.useEffect)(() => {
		installLabTest();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 touch-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
					shadows: true,
					dpr: [1, 1.75],
					gl: {
						antialias: true,
						toneMapping: 4,
						toneMappingExposure: 1.05,
						powerPreference: "high-performance"
					},
					camera: {
						position: [
							3.15,
							1.72,
							3.55
						],
						fov: 38,
						near: .08,
						far: 60
					},
					onCreated: ({ gl }) => {
						gl.outputColorSpace = SRGBColorSpace;
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Intro, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {})
		]
	});
}
//#endregion
export { CapacitorLab };
