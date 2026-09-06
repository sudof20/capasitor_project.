export function LabSplash() {
  return (
    <main className="relative flex h-dvh flex-col items-center justify-end bg-bg px-4 pb-8 text-fg md:items-center md:justify-center">
      <div className="hud-panel relative w-full max-w-lg rounded-xl p-5 md:p-7">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          High-voltage laboratory
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Prototype C-1
        </h1>
        <p className="mt-1 font-display text-xl tracking-wide text-accent">
          Heavy spherical capacitor
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          A chrome ball sits inside a thick outer shell and stores charge. Charge
          it, then touch it — energy dumps through the body as a heavy shock.
        </p>
        <p className="mt-6 font-mono text-xs uppercase tracking-wider text-subtle">
          Loading 3D prototype…
        </p>
      </div>
    </main>
  );
}
