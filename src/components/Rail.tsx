import { Focusable } from "./Focusable";
import { Icon, type IconName } from "./Icon";
import { LogoWordmark } from "./Logo";
import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import { cx } from "../lib/utils";
import type { Screen } from "../types";

const tabs: Array<{ screen: Screen; icon: IconName; key: "nav.home" | "nav.library" | "nav.favorites" | "nav.settings" }> = [
  { screen: "home", icon: "home", key: "nav.home" },
  { screen: "library", icon: "library", key: "nav.library" },
  { screen: "favorites", icon: "heart", key: "nav.favorites" },
  { screen: "settings", icon: "settings", key: "nav.settings" },
];

export function Rail() {
  const screen = useAppStore((state) => state.screen);
  const setScreen = useAppStore((state) => state.setScreen);
  const pads = useAppStore((state) => state.pads);
  const t = useT();
  const connected = pads.length > 0;

  return (
    <aside className="rail flex flex-col items-center py-5">
      <div className="flex h-[52px] items-center justify-center">
        <LogoWordmark compact />
      </div>

      <nav className="mt-8 flex flex-col items-center gap-2">
        {tabs.map((tab) => {
          const active = screen === tab.screen;
          return (
            <Focusable
              key={tab.screen}
              id={`nav-${tab.screen}`}
              variant="nav"
              className={cx("rail-link", active && "bg-white/[0.055] text-white")}
              onActivate={() => setScreen(tab.screen)}
              ariaLabel={t(tab.key)}
            >
              {active && <span className="rail-active-dot" />}
              <Icon name={tab.icon} size={21} className="rail-ico" />
              <span className="rail-label">{t(tab.key)}</span>
            </Focusable>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]"
          title={connected ? pads[0]?.name : t("nav.noController")}
        >
          <span className="relative flex items-center justify-center">
            <Icon name="gamepad" size={17} className={connected ? "text-emerald-300" : "text-white/25"} />
            <span
              className={cx(
                "absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full",
                connected ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-white/25",
              )}
            />
          </span>
        </div>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-white/20">V0.1</span>
      </div>
    </aside>
  );
}
