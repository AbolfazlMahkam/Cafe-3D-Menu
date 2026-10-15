"use client";

import { useEffect, useState } from "react";
import { useExperienceStore } from "@/store/experience";
import { useI18n } from "@/lib/i18n/provider";

/**
 * A polished first-load curtain. It fades once the 3D layer has produced its
 * first frame (or been ruled out), and never blocks the page afterwards.
 */
export function LoadingCurtain() {
  const { messages } = useI18n();
  const ready = useExperienceStore((s) => s.ready);
  const failed = useExperienceStore((s) => s.webglFailed);
  const [hidden, setHidden] = useState(false);
  const setIntroDone = useExperienceStore((s) => s.setIntroDone);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setHidden(true), failed ? 120 : 500);
    const t2 = window.setTimeout(() => setIntroDone(true), failed ? 200 : 900);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [ready, failed, setIntroDone]);

  return (
    <div
      role={hidden ? undefined : "status"}
      aria-live="polite"
      aria-hidden={hidden}
      data-inspect-ignore
      className={`fixed inset-0 z-[95] flex flex-col items-center justify-center bg-noir transition-opacity duration-700 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,#241a13_0%,#0b0b0b_70%)]" />
      <div className="relative flex flex-col items-center">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl tracking-[0.4em] text-cream sm:text-5xl">
            NOIR
          </span>
          <span className="mb-1.5 h-2 w-2 animate-pulse rounded-full bg-accent" />
        </div>
        <p className="mt-4 text-[0.68rem] uppercase tracking-[0.32em] text-cream/40">
          {failed ? messages.loading.servingWithout3d : messages.loading.preparing}
        </p>
        <div className="mt-7 h-px w-44 overflow-hidden bg-cream/12">
          <span className="block h-full w-1/3 animate-[noir-load_1.4s_ease-in-out_infinite] bg-accent" />
        </div>
      </div>
    </div>
  );
}

export default LoadingCurtain;
