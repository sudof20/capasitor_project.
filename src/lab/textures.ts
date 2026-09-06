import * as THREE from "three";

export function makeNameplateTexture() {
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

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function makeFloorTexture() {
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
    ctx.fillStyle = `rgba(${n},${n + 2},${n + 4},${0.15 + Math.random() * 0.25})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  ctx.strokeStyle = "rgba(80,88,98,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}
