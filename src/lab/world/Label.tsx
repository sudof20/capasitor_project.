import { Html } from "@react-three/drei";

export function Label({
  position,
  children,
}: {
  position: [number, number, number];
  children: string;
}) {
  return (
    <Html
      position={position}
      center
      occlude={false}
      style={{ pointerEvents: "none", userSelect: "none" }}
      wrapperClass="pointer-events-none"
      zIndexRange={[10, 0]}
    >
      <div className="lab-label">{children}</div>
    </Html>
  );
}
