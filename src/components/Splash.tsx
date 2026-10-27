import { useEffect, useState } from "react";
import { LogoWordmark } from "./Logo";
import { useAppStore } from "../store";

export function Splash({ ready }: { ready: boolean }) {
  const [elapsed, setElapsed] = useState(false);
  const reduceMotion = useAppStore((state) => state.settings.reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setElapsed(true);
      return;
    }
    const timer = window.setTimeout(() => setElapsed(true), 900);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  const hidden = ready && elapsed;

  return (
    <div className="splash" data-hidden={hidden} aria-hidden={hidden}>
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-24 rounded-full bg-violet/20 blur-[90px]" />
        <div className="splash-mark relative flex flex-col items-center">
          <LogoWordmark />
          <div className="mt-7 h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
            <div className="shimmer h-full w-full" />
          </div>
          <div className="mt-5 text-[9.5px] font-semibold tracking-[0.3em] text-white/30 uppercase">
            Cloud gaming launcher
          </div>
        </div>
      </div>
    </div>
  );
}
