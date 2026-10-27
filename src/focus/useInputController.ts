import { useCallback, useEffect, useRef } from "react";
import { useFocus } from "./FocusProvider";
import { api, isTauri } from "../lib/bridge";
import { useAppStore } from "../store";
import type { Action } from "../types";

const DIRECTIONS: Action[] = ["up", "down", "left", "right"];
const TABS: Action[] = ["tabPrev", "tabNext"];

const CONTROL_ACTIONS: Record<string, Action> = {
  south: "confirm",
  east: "back",
  west: "favorite",
  north: "details",
  left_bumper: "tabPrev",
  right_bumper: "tabNext",
  start: "menu",
  select: "help",
  dpad_up: "up",
  dpad_down: "down",
  dpad_left: "left",
  dpad_right: "right",
};

const KEY_ACTIONS: Record<string, Action> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
  Enter: "confirm",
  " ": "confirm",
  Escape: "back",
  Backspace: "back",
  f: "favorite",
  F: "favorite",
  x: "favorite",
  X: "favorite",
  i: "details",
  I: "details",
  q: "tabPrev",
  Q: "tabPrev",
  "[": "tabPrev",
  e: "tabNext",
  E: "tabNext",
  "]": "tabNext",
  Tab: "tabNext",
  m: "menu",
  M: "menu",
  h: "help",
  H: "help",
  "?": "help",
  "/": "search",
};

function isDirection(action: Action): action is "up" | "down" | "left" | "right" {
  return DIRECTIONS.includes(action);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useInputController() {
  const focus = useFocus();
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const holds = useRef(new Map<Action, Set<string>>());
  const repeat = useRef<{ action: Action | null; timeout?: number; interval?: number }>({
    action: null,
  });
  const axisDirs = useRef(new Set<Action>());
  const executeRef = useRef<(action: Action) => void>(() => undefined);

  const stopRepeat = useCallback(() => {
    if (repeat.current.timeout) window.clearTimeout(repeat.current.timeout);
    if (repeat.current.interval) window.clearInterval(repeat.current.interval);
    repeat.current = { action: null };
  }, []);

  const startRepeat = useCallback(
    (action: Action) => {
      stopRepeat();
      repeat.current.action = action;
      repeat.current.timeout = window.setTimeout(() => {
        executeRef.current(action);
        repeat.current.interval = window.setInterval(() => executeRef.current(action), 125);
      }, 420);
    },
    [stopRepeat],
  );

  const press = useCallback(
    (action: Action, source: string) => {
      let sources = holds.current.get(action);
      if (!sources) {
        sources = new Set();
        holds.current.set(action, sources);
      }
      if (sources.has(source)) return;
      sources.add(source);
      executeRef.current(action);
      if (isDirection(action)) startRepeat(action);
    },
    [startRepeat],
  );

  const release = useCallback(
    (action: Action, source: string) => {
      const sources = holds.current.get(action);
      if (!sources) return;
      sources.delete(source);
      if (sources.size === 0) {
        holds.current.delete(action);
        if (repeat.current.action === action) stopRepeat();
      }
    },
    [stopRepeat],
  );

  const releaseAll = useCallback(() => {
    holds.current.clear();
    axisDirs.current.clear();
    stopRepeat();
  }, [stopRepeat]);

  const cycleTab = useCallback((direction: 1 | -1) => {
    const order = ["home", "library", "favorites", "settings"] as const;
    const state = useAppStore.getState();
    const index = order.indexOf(state.screen);
    const next = order[(index + direction + order.length) % order.length];
    state.setScreen(next);
  }, []);

  executeRef.current = (action: Action) => {
    const state = useAppStore.getState();
    const focusApi = focusRef.current;

    if (state.modal) {
      if (action === "back" || action === "menu") {
        state.closeModal();
        return;
      }
      if (action === "confirm") return focusApi.activate();
      if (isDirection(action)) return focusApi.move(action);
      return;
    }

    if (state.showOnboarding) {
      if (action === "back") {
        window.dispatchEvent(new Event("luna:onboarding-back"));
        return;
      }
      if (action === "confirm") return focusApi.activate();
      if (isDirection(action)) return focusApi.move(action);
      return;
    }

    if (action === "confirm") {
      focusApi.activate();
      return;
    }

    if (isDirection(action)) {
      focusApi.move(action);
      return;
    }

    if (action === "favorite" || action === "details") {
      if (focusApi.runAction(action)) return;
      if (action === "favorite" && state.detailsId) {
        state.toggleFavorite(state.detailsId);
      }
      return;
    }

    if (action === "back") {
      if (state.detailsId) {
        state.closeDetails();
        return;
      }
      if (state.screen !== "home") {
        state.setScreen("home");
      }
      return;
    }

    if (TABS.includes(action)) {
      if (state.detailsId) return;
      cycleTab(action === "tabNext" ? 1 : -1);
      return;
    }

    if (action === "menu") {
      if (state.detailsId) state.closeDetails();
      state.setScreen(state.screen === "settings" ? "home" : "settings");
      return;
    }

    if (action === "help") {
      if (state.detailsId) return;
      state.openModal({ type: "help" });
      return;
    }

    if (action === "search") {
      if (state.detailsId) return;
      state.setScreen("library");
      window.setTimeout(() => window.dispatchEvent(new Event("luna:focus-search")), 70);
    }
  };

  /* Keyboard ------------------------------------------------------- */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const typing = isTypingTarget(event.target);

      if (typing) {
        if (event.key === "Escape") {
          event.preventDefault();
          press("back", "keyboard");
        }
        return;
      }

      const action = KEY_ACTIONS[event.key];
      if (!action) return;
      event.preventDefault();
      if (event.repeat) return;
      if (event.key === "Tab" && event.shiftKey) {
        press("tabPrev", "keyboard");
        return;
      }
      press(action, "keyboard");
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const action = KEY_ACTIONS[event.key];
      if (!action) return;
      if (event.key === "Tab" && event.shiftKey) {
        release("tabPrev", "keyboard");
        return;
      }
      release(action, "keyboard");
    };

    const onBlur = () => releaseAll();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      releaseAll();
    };
  }, [press, release, releaseAll]);

  /* Tauri gamepad -------------------------------------------------- */
  useEffect(() => {
    if (!isTauri) return;
    let active = true;
    const unlisteners: Array<() => void> = [];

    const keep = (promise: Promise<() => void>) => {
      void promise.then((unlisten) => {
        if (active) unlisteners.push(unlisten);
        else unlisten();
      });
    };

    keep(api.subscribeGamepad((payload) => {
      if (payload.control) {
        const action = CONTROL_ACTIONS[payload.control];
        if (!action) return;
        if (payload.pressed) press(action, "pad");
        else release(action, "pad");
        return;
      }
      if (payload.axis === "left") {
        const x = payload.x ?? 0;
        const y = payload.y ?? 0;
        const deadzone = 0.55;
        const next = new Set<Action>();
        if (Math.abs(x) >= Math.abs(y)) {
          if (x < -deadzone) next.add("left");
          else if (x > deadzone) next.add("right");
        } else {
          if (y < -deadzone) next.add("up");
          else if (y > deadzone) next.add("down");
        }
        for (const dir of axisDirs.current) {
          if (!next.has(dir)) release(dir, "axis");
        }
        for (const dir of next) {
          if (!axisDirs.current.has(dir)) press(dir, "axis");
        }
        axisDirs.current = next;
      }
    }));

    keep(api.subscribePads((pads) => {
      useAppStore.getState().setPads(pads);
    }));

    keep(api.subscribeGamepadError((message) => {
      console.warn("gamepad backend unavailable", message);
    }));

    const releaseUnlisteners = () => {
      for (const unlisten of unlisteners.splice(0)) unlisten();
      releaseAll();
    };
    window.addEventListener("beforeunload", releaseUnlisteners);

    return () => {
      active = false;
      window.removeEventListener("beforeunload", releaseUnlisteners);
      for (const unlisten of unlisteners.splice(0)) unlisten();
      releaseAll();
    };
  }, [press, release, releaseAll]);

  /* Browser gamepad fallback (preview mode) ------------------------ */
  useEffect(() => {
    if (isTauri) return;
    if (typeof navigator === "undefined" || !("getGamepads" in navigator)) return;

    let frame = 0;
    let lastTick = 0;
    const previousButtons = new Map<number, boolean[]>();
    const previousAxis = new Map<number, Set<Action>>();

    const buttonControl = (index: number): string | null => {
      const map: Record<number, string> = {
        0: "south",
        1: "east",
        2: "west",
        3: "north",
        4: "left_bumper",
        5: "right_bumper",
        8: "select",
        9: "start",
        12: "dpad_up",
        13: "dpad_down",
        14: "dpad_left",
        15: "dpad_right",
      };
      return map[index] ?? null;
    };

    const tick = (now: number) => {
      const pads = Array.from(navigator.getGamepads?.() ?? []).filter(
        (pad): pad is Gamepad => Boolean(pad && pad.connected),
      );

      pads.forEach((pad) => {
        const controlStates = pad.buttons.map((button) => button.pressed);
        const previous = previousButtons.get(pad.index) ?? [];
        controlStates.forEach((pressed, index) => {
          if (previous[index] === pressed) return;
          const control = buttonControl(index);
          if (!control) return;
          const action = CONTROL_ACTIONS[control];
          if (!action) return;
          if (pressed) press(action, `browser-${pad.index}`);
          else release(action, `browser-${pad.index}`);
        });
        previousButtons.set(pad.index, controlStates);

        const x = pad.axes[0] ?? 0;
        const y = pad.axes[1] ?? 0;
        const deadzone = 0.55;
        const next = new Set<Action>();
        if (Math.abs(x) >= Math.abs(y)) {
          if (x < -deadzone) next.add("left");
          else if (x > deadzone) next.add("right");
        } else {
          if (y < -deadzone) next.add("up");
          else if (y > deadzone) next.add("down");
        }
        const previousDirs = previousAxis.get(pad.index) ?? new Set<Action>();
        for (const dir of previousDirs) {
          if (!next.has(dir)) release(dir, `browser-axis-${pad.index}`);
        }
        for (const dir of next) {
          if (!previousDirs.has(dir)) press(dir, `browser-axis-${pad.index}`);
        }
        previousAxis.set(pad.index, next);
      });

      if (now - lastTick > 1200) {
        lastTick = now;
        const store = useAppStore.getState();
        const known = new Set(store.pads.map((pad) => pad.id));
        const nextPads = pads.map((pad) => ({
          id: `browser-${pad.index}`,
          name: pad.id.replace(/\s*\(.*?\)\s*/g, " ").trim().slice(0, 48) || "Gamepad",
          battery: "unknown" as const,
          connected: true,
        }));
        const changed =
          nextPads.length !== store.pads.length ||
          nextPads.some((pad) => !known.has(pad.id));
        if (changed) {
          store.setPads(nextPads);
          if (nextPads.length > 0 && store.pads.length > 0) {
            const newest = nextPads.find((pad) => !known.has(pad.id));
            if (newest) {
              store.toast(`Pad: ${newest.name}`, "success");
            }
          }
        }
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      releaseAll();
    };
  }, [press, release, releaseAll]);
}
