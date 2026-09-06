import { i as __toESM } from "../_runtime.mjs";
import { $ as require_jsx_runtime, et as require_react } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-_X5hxvww.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LabSplash() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh flex-col items-center justify-center bg-bg px-6 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-[0.2em] text-muted",
				children: "High-voltage laboratory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl tracking-wide",
				children: "Prototype C-1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Loading 3D prototype…"
			})
		]
	});
}
function Home() {
	const [Lab, setLab] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		import("./CapacitorLab-CMp_6k-b.mjs").then((m) => setLab(() => m.CapacitorLab));
	}, []);
	if (!Lab) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabSplash, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lab, {});
}
//#endregion
export { Home as component };
