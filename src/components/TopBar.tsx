import { useEffect, useState } from "react";
import { Focusable } from "./Focusable";
import { Icon } from "./Icon";
import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import { previewMode } from "../lib/bridge";
import { cx, formatClock } from "../lib/utils";
import type { Screen } from "../types";
import type { TKey } from "../i18n";

const titles: Record<Screen, { title: TKey; subtitle: TKey }> = {
  home: { title: "top.home.title", subtitle: "top.home.subtitle" },
  library: { title: "top.library.title", subtitle: "top.library.subtitle" },
  favorites: { title: "top.favorites.title", subtitle: "top.favorites.subtitle" },
  settings: { title: "top.settings.title", subtitle: "top.settings.subtitle" },
};

function elapsed(startedAt: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function TopBar() {
  const screen = useAppStore((state) => state.screen);
  const playing = useAppStore((state) => state.playing);
  const stopPlayer = useAppStore((state) => state.stopPlayer);
  const settings = useAppStore((state) => state.settings);
  const system = useAppStore((state) => state.system);
  const setScreen = useAppStore((state) => state.setScreen);
  const t = useT();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const browser = system?.browsers.find((item) => item.path === settings.browserPath) ?? null;
  const entry = titles[screen];

  return (
    <header className="flex items-start justify-between gap-6 px-8 pt-7 pb-5 lg:px-10">
      <div className="min-w-0">
        <h1 className="font-display text-[27px] leading-none font-semibold tracking-[-0.03em] text-white">
          {t(entry.title)}
        </h1>
        <p className="mt-2 truncate text-[13px] text-white/40">{t(entry.subtitle)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {previewMode && (
          <span className="preview-chip chip hidden border-amber-300/25 bg-amber-400/10 text-amber-200/90 md:inline-flex">
            {t("common.demoMode")}
          </span>
        )}

        {playing ? (
          <div className="flex items-center gap-3 rounded-full border border-emerald-300/25 bg-emerald-400/[0.08] py-1.5 pr-1.5 pl-3.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="text-[9px] font-bold tracking-[0.14em] text-emerald-200/70 uppercase">
                {t("top.live")}
              </span>
              <span className="mt-1 max-w-[150px] truncate text-[11.5px] font-semibold text-white/85">
                {playing.title}
              </span>
            </div>
            <span className="font-mono text-[12px] tabular-nums text-emerald-100/80">
              {elapsed(playing.startedAt, now)}
            </span>
            <Focusable
              id="top-stop"
              className="btn btn-sm h-8 gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 text-[11px] text-white/70"
              onActivate={() => void stopPlayer()}
              ariaLabel={t("top.stop")}
            >
              <Icon name="stop" size={11} />
              <span className="hidden lg:inline">{t("top.stop")}</span>
            </Focusable>
          </div>
        ) : (
          <Focusable
            id="top-browser"
            className="flex h-9 items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.035] px-3.5 text-[11.5px] font-medium text-white/55"
            onActivate={() => setScreen("settings")}
            ariaLabel={t("settings.browser")}
          >
            <Icon name="monitor" size={14} className={browser?.widevine ? "text-emerald-300/90" : "text-amber-300/80"} />
            <span className="max-w-[130px] truncate">{browser?.name ?? t("settings.browserNone")}</span>
            <span
              className={cx(
                "h-1.5 w-1.5 rounded-full",
                browser?.widevine ? "bg-emerald-400" : "bg-amber-400",
              )}
              title={browser?.widevine ? t("settings.browserWidevine") : t("settings.browserNoWidevine")}
            />
          </Focusable>
        )}

        <div className="ml-1 hidden text-right sm:block">
          <div className="font-display text-[15px] font-semibold tabular-nums text-white/80">
            {formatClock(now, settings.language)}
          </div>
          <div className="text-[9px] font-semibold tracking-[0.16em] text-white/25 uppercase">
            {new Date(now).toLocaleDateString(settings.language === "pl" ? "pl-PL" : "en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
