import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FocusProvider, useFocus } from "./focus/FocusProvider";
import { useInputController } from "./focus/useInputController";
import { GameDetails } from "./components/GameDetails";
import { HintBar } from "./components/HintBar";
import { ModalHost } from "./components/ModalHost";
import { Rail } from "./components/Rail";
import { Splash } from "./components/Splash";
import { Toasts } from "./components/Toasts";
import { TopBar } from "./components/TopBar";
import { HomeScreen } from "./screens/HomeScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { Onboarding } from "./screens/Onboarding";
import { SettingsScreen } from "./screens/SettingsScreen";
import { api, isTauri } from "./lib/bridge";
import { translate } from "./i18n";
import { cx, formatDuration } from "./lib/utils";
import { useAppStore } from "./store";

function Ambient() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />
      <div className="grid-lines" />
    </div>
  );
}

function Shell() {
  const boot = useAppStore((state) => state.boot);
  const ready = useAppStore((state) => state.ready);
  const screen = useAppStore((state) => state.screen);
  const modal = useAppStore((state) => state.modal);
  const detailsId = useAppStore((state) => state.detailsId);
  const showOnboarding = useAppStore((state) => state.showOnboarding);
  const settings = useAppStore((state) => state.settings);
  const { focus, focusFirst, focusedId } = useFocus();
  const focusedRef = useRef<string | null>(focusedId);
  focusedRef.current = focusedId;
  const restoreRef = useRef<string | null>(null);

  useInputController();

  useEffect(() => {
    void boot();
  }, [boot]);

  useEffect(() => {
    const handler = async (event: KeyboardEvent) => {
      if (event.key !== "F11") return;
      event.preventDefault();
      if (!isTauri) {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await document.documentElement.requestFullscreen();
        } catch {
          /* fullscreen may be blocked in preview */
        }
        return;
      }
      const window = getCurrentWindow();
      const fullscreen = await window.isFullscreen();
      await window.setFullscreen(!fullscreen);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion);
    document.title = "Luna Client";
  }, [settings.language, settings.reduceMotion]);

  useEffect(() => {
    let alive = true;
    const unlisteners: Array<() => void> = [];
    const keep = (promise: Promise<() => void>) => {
      void promise.then((unlisten) => {
        if (alive) unlisteners.push(unlisten);
        else unlisten();
      });
    };

    keep(
      api.subscribePlayerExit((payload) => {
        const state = useAppStore.getState();
        state.setPlaying(null);
        void state.refreshLibrary();
        const language = state.settings.language;
        state.toast(
          translate(language, "toast.sessionEnded", {
            time: formatDuration(payload.seconds, language),
          }),
          "success",
        );
      }),
    );

    keep(
      api.subscribePlayerStarted((session) => {
        useAppStore.getState().setPlaying(session);
      }),
    );

    return () => {
      alive = false;
      for (const unlisten of unlisteners.splice(0)) unlisten();
    };
  }, []);

  useEffect(() => {
    if (!ready || showOnboarding || modal || detailsId) return;
    let cancelled = false;
    let timer: number | undefined;
    const target = screen === "settings" ? "settings-" : screen === "home" ? "home-" : `${screen}-card-`;

    const attempt = (remaining: number) => {
      if (cancelled) return;
      const found = focusFirst(target);
      if (!found && remaining > 0) {
        timer = window.setTimeout(() => attempt(remaining - 1), 90);
      }
    };

    const frame = window.requestAnimationFrame(() => attempt(2));
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  }, [screen, ready, showOnboarding, modal, detailsId, focusFirst]);

  useEffect(() => {
    if (detailsId) {
      restoreRef.current = focusedRef.current;
      const timer = window.setTimeout(() => {
        if (!focus("details-play")) focusFirst("details-");
      }, 40);
      return () => window.clearTimeout(timer);
    }
    const previous = restoreRef.current;
    restoreRef.current = null;
    if (previous) {
      const timer = window.setTimeout(() => {
        if (!focus(previous)) {
          const target =
            screen === "settings" ? "settings-" : screen === "home" ? "home-" : `${screen}-card-`;
          focusFirst(target);
        }
      }, 40);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [detailsId, focus, focusFirst, screen]);

  useEffect(() => {
    if (!modal) return;
    const timer = window.setTimeout(() => {
      if (!focusFirst("modal-submit")) focusFirst("modal-");
    }, 40);
    return () => window.clearTimeout(timer);
  }, [modal, focusFirst]);

  const overlayOpen = Boolean(showOnboarding || modal || detailsId);

  return (
    <div className={cx("relative h-full w-full overflow-hidden", settings.reduceMotion && "reduce-motion")}>
      <Ambient />

      <div
        className="relative z-10 flex h-full"
        inert={overlayOpen}
        aria-hidden={overlayOpen}
      >
        <Rail />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="relative min-h-0 flex-1">
            <main className="no-scrollbar main-scroll relative h-full overflow-y-auto">
              {screen === "home" && <HomeScreen />}
              {screen === "library" && <LibraryScreen mode="library" />}
              {screen === "favorites" && <LibraryScreen mode="favorites" />}
              {screen === "settings" && <SettingsScreen />}
            </main>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-t from-[#05070d] via-[#05070d]/70 to-transparent" />
          </div>
          <HintBar />
        </div>
      </div>

      <GameDetails />
      <ModalHost />
      <Toasts />
      <Onboarding />
      <Splash ready={ready} />
    </div>
  );
}

export default function App() {
  const reduceMotion = useAppStore((state) => state.settings.reduceMotion);
  return (
    <FocusProvider reduceMotion={reduceMotion}>
      <Shell />
    </FocusProvider>
  );
}
