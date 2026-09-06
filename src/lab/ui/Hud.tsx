import { useEffect, type ReactNode } from "react";
import {
  Eye,
  Hand,
  Layers,
  RotateCcw,
  Spline,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  C,
  formatCapacitance,
  formatCharge,
  formatEnergy,
  formatVoltage,
  shockGrade,
  V_MAX,
  chargeOf,
  energyOf,
} from "@/lab/physics";
import { useLab } from "@/lab/store";
import { unlockAudio, playTingle, playShock, setHum } from "@/lab/audio";
import { cn } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-subtle">
        {label}
      </p>
      <p className="font-mono text-sm tabular-nums text-fg md:text-base">{value}</p>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-sm border px-3 text-xs font-medium",
        on
          ? "border-accent/40 bg-elevated text-accent"
          : "border-border bg-surface text-muted",
      )}
    >
      {children}
    </button>
  );
}

function ShockBanner() {
  const phase = useLab((s) => s.phase);
  const energy = useLab((s) => s.lastEnergy);
  const charge = useLab((s) => s.lastCharge);
  const flash = useLab((s) => s.flash);

  if (phase !== "shock" && phase !== "recover") {
    if (flash <= 0) return null;
  }

  if (phase === "recover" && energy < 0.004) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-20 z-30 flex justify-center px-4">
        <div className="hud-panel rounded-md px-4 py-2 text-sm text-muted">
          Not enough charge — only a faint tingle.
        </div>
      </div>
    );
  }

  if (phase !== "shock" && flash <= 0.05) return null;

  const grade = shockGrade(energy);
  const title =
    grade === "heavy" ? "Heavy shock" : grade === "sharp" ? "Sharp shock" : "Tingle";

  return (
    <>
      {flash > 0.05 && (
        <div
          className="shock-flash absolute inset-0 z-20"
          style={{ opacity: Math.min(1, flash) }}
        />
      )}
      {phase === "shock" && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center px-4 md:top-20">
          <div className="hud-panel max-w-md rounded-lg px-4 py-3">
            <p className="font-display text-2xl tracking-wide text-accent">{title}</p>
            <p className="mt-1 text-sm text-muted">
              Discharge path: hand → arm → torso → legs → earth. Energy{" "}
              <span className="font-mono tabular-nums text-fg">{formatEnergy(energy)}</span>
              {" · "}
              <span className="font-mono tabular-nums text-fg">{formatCharge(charge)}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export function Hud() {
  const entered = useLab((s) => s.entered);
  const voltage = useLab((s) => s.voltage);
  const charging = useLab((s) => s.charging);
  const cutaway = useLab((s) => s.cutaway);
  const fieldLines = useLab((s) => s.fieldLines);
  const labels = useLab((s) => s.labels);
  const phase = useLab((s) => s.phase);
  const hoverBall = useLab((s) => s.hoverBall);
  const fill = voltage / V_MAX;

  useEffect(() => {
    if (!entered) return;
    setHum(voltage / V_MAX);
  }, [entered, voltage]);

  useEffect(() => {
    if (!entered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyC") {
        e.preventDefault();
        void unlockAudio();
        useLab.getState().setCharging(true);
      }
      if (e.code === "KeyT") {
        e.preventDefault();
        useLab.getState().beginTouch();
      }
      if (e.code === "KeyR") useLab.getState().reset();
    };
    const onKeyUp = (e: KeyboardEvent) => {
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

  useEffect(() => {
    if (!entered) return;
    let prev = useLab.getState().phase;
    return useLab.subscribe((s) => {
      if (s.phase === "shock" && prev !== "shock") playShock(s.lastEnergy);
      if (s.phase === "recover" && prev === "reaching" && s.lastEnergy < 0.004) {
        playTingle();
      }
      prev = s.phase;
    });
  }, [entered]);

  if (!entered) return null;

  const busy = phase !== "idle";

  return (
    <>
      <ShockBanner />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-5">
        <div className="pointer-events-auto hud-panel max-w-[16rem] rounded-lg px-3 py-2 md:max-w-sm md:px-4 md:py-3">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
            Prototype structure
          </p>
          <h2 className="font-display text-2xl leading-none tracking-wide text-fg md:text-3xl">
            C-1 Capacitor
          </h2>
        </div>
        <div className="pointer-events-auto hud-panel rounded-lg px-3 py-2 md:px-4 md:py-3">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
            Terminal voltage
          </p>
          <p className="font-mono text-xl tabular-nums text-accent md:text-2xl">
            {formatVoltage(voltage)}
          </p>
        </div>
      </header>

      <aside className="pointer-events-none absolute left-0 top-24 z-10 hidden w-64 p-5 md:block">
        <div className="pointer-events-auto hud-panel rounded-lg p-4">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-subtle">
            Live readout
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Charge" value={formatCharge(chargeOf(voltage))} />
            <Stat label="Energy" value={formatEnergy(energyOf(voltage))} />
            <Stat label="C" value={formatCapacitance(C)} />
            <Stat label="V max" value="400 kV" />
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full bg-accent transition-[width] duration-150"
              style={{ width: `${Math.min(100, fill * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            C = 4πε₀ · a·b / (b − a). Energy stored as ½CV² on the inner ball.
          </p>
        </div>
      </aside>

      <aside className="pointer-events-none absolute right-0 top-24 z-10 hidden w-56 p-5 lg:block">
        <div className="pointer-events-auto flex flex-col gap-2">
          <Toggle on={cutaway} onClick={() => useLab.getState().toggleCutaway()}>
            <Layers className="size-4" strokeWidth={1.75} />
            Cutaway
          </Toggle>
          <Toggle on={fieldLines} onClick={() => useLab.getState().toggleFieldLines()}>
            <Spline className="size-4" strokeWidth={1.75} />
            Field lines
          </Toggle>
          <Toggle on={labels} onClick={() => useLab.getState().toggleLabels()}>
            <Eye className="size-4" strokeWidth={1.75} />
            Structure labels
          </Toggle>
        </div>
      </aside>

      <footer className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="flex flex-wrap gap-2 lg:hidden">
            <Toggle on={cutaway} onClick={() => useLab.getState().toggleCutaway()}>
              <Layers className="size-4" />
              Cutaway
            </Toggle>
            <Toggle on={fieldLines} onClick={() => useLab.getState().toggleFieldLines()}>
              <Spline className="size-4" />
              Field
            </Toggle>
            <Toggle on={labels} onClick={() => useLab.getState().toggleLabels()}>
              <Eye className="size-4" />
              Labels
            </Toggle>
          </div>
          <div className="hud-panel flex flex-col gap-2 rounded-xl p-2 sm:flex-row sm:items-center">
            <Button
              variant="charge"
              className="min-h-11 flex-1"
              disabled={busy}
              onPointerDown={() => {
                void unlockAudio();
                useLab.getState().setCharging(true);
              }}
              onPointerUp={() => useLab.getState().setCharging(false)}
              onPointerLeave={() => useLab.getState().setCharging(false)}
              onPointerCancel={() => useLab.getState().setCharging(false)}
            >
              <Zap className="size-4" strokeWidth={2} />
              {charging ? "Charging" : "Hold to charge"}
            </Button>
            <Button
              variant="danger"
              className="min-h-11 flex-1"
              disabled={busy}
              onClick={() => useLab.getState().beginTouch()}
            >
              <Hand className="size-4" strokeWidth={2} />
              {hoverBall ? "Touch the ball" : "Touch the ball"}
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 sm:w-auto"
              onClick={() => useLab.getState().reset()}
            >
              <RotateCcw className="size-4" strokeWidth={2} />
              Reset
            </Button>
          </div>
          <p className="px-1 text-center font-mono text-[0.625rem] uppercase tracking-wider text-subtle md:text-xs">
            Drag to orbit · Hold charge or C · Touch or T · Simulation of a grounded-body discharge
          </p>
        </div>
      </footer>
    </>
  );
}
