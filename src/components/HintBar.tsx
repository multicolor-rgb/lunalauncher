import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import { cx } from "../lib/utils";

interface Hint {
  glyph: string;
  label: string;
  pad?: boolean;
}

export function HintBar() {
  const screen = useAppStore((state) => state.screen);
  const modal = useAppStore((state) => state.modal);
  const showOnboarding = useAppStore((state) => state.showOnboarding);
  const detailsId = useAppStore((state) => state.detailsId);
  const pads = useAppStore((state) => state.pads);
  const t = useT();

  const hints: Hint[] = [
    { glyph: "A", label: t("hints.select"), pad: true },
    { glyph: "B", label: t("hints.back"), pad: true },
  ];
  if (!showOnboarding && !modal) {
    hints.push({ glyph: "X", label: t("hints.favorite"), pad: true });
    if (!detailsId) {
      hints.push({ glyph: "Y", label: t("hints.details"), pad: true });
      hints.push({ glyph: "LB", label: t("hints.tabs"), pad: true });
      hints.push({ glyph: "≡", label: t("hints.menu"), pad: true });
    }
  }

  return (
    <footer className="hintbar">
      <div className="flex h-full items-center justify-between gap-6 px-8 lg:px-10">
        <div className="no-scrollbar flex items-center gap-5 overflow-x-auto">
          {hints.map((hint) => (
            <div key={`${hint.glyph}-${hint.label}`} className="flex shrink-0 items-center gap-2">
              <span className={cx("hint-glyph", hint.pad && "hint-glyph--pad")}>{hint.glyph}</span>
              <span className="text-[11.5px] font-medium text-white/45">{hint.label}</span>
            </div>
          ))}
          {!showOnboarding && (screen === "library" || screen === "favorites") && (
            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              <span className="hint-glyph">/</span>
              <span className="text-[11.5px] font-medium text-white/45">{t("hints.search")}</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 text-[10.5px] font-medium text-white/30">
          {pads.length > 0 ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_#34d399]" />
              <span className="max-w-[190px] truncate">{pads[0].name}</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span>{t("hints.keyboard")}</span>
            </>
          )}
          <span className="hidden h-3 w-px bg-white/10 md:block" />
          <span className="hidden md:inline">v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
