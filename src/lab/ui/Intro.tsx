import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unlockAudio } from "@/lab/audio";
import { useLab } from "@/lab/store";

export function Intro() {
  const entered = useLab((s) => s.entered);

  if (entered) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-end md:items-center justify-center p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-transparent" />
      <div className="hud-panel relative w-full max-w-lg rounded-xl p-5 md:p-7">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          High-voltage laboratory
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight text-fg md:text-5xl">
          Prototype C-1
        </h1>
        <p className="mt-1 font-display text-xl tracking-wide text-accent">
          Heavy spherical capacitor
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          A chrome ball sits inside a thick outer shell and stores charge across
          the air gap. Charge the inner sphere, then touch it — the stored energy
          dumps through the body to earth as a heavy shock.
        </p>
        <ul className="mt-4 space-y-1.5 font-mono text-xs text-subtle">
          <li>Inner ball — charge terminal</li>
          <li>Outer shell — grounded HV housing</li>
          <li>Touch path — hand, arm, torso, legs, earth</li>
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="primary"
            size="lg"
            className="min-h-12 w-full sm:w-auto"
            onClick={() => {
              void unlockAudio();
              useLab.getState().enter();
            }}
          >
            <Zap className="size-4" strokeWidth={2} />
            Enter the lab
          </Button>
          <p className="text-xs text-subtle">Simulation only. Never touch a live capacitor.</p>
        </div>
      </div>
    </div>
  );
}
