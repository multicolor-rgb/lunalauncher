import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { defaultSettings, emptyLibrary, APP_VERSION, LUNA_HOME } from "./defaults";
import type {
  BootstrapData,
  BrowserInfo,
  GamepadPayload,
  LibraryData,
  PadInfo,
  PlayerExitPayload,
  PlayerSession,
  Settings,
  SystemInfo,
} from "../types";

export const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const previewMode = !isTauri;

type Unlisten = () => void;

interface MockEvents {
  exit: PlayerExitPayload;
  started: PlayerSession;
  gamepad: GamepadPayload;
  pads: PadInfo[];
  error: string;
}

const mockListeners: { [K in keyof MockEvents]: Set<(payload: MockEvents[K]) => void> } = {
  exit: new Set(),
  started: new Set(),
  gamepad: new Set(),
  pads: new Set(),
  error: new Set(),
};

function mockEmit<K extends keyof MockEvents>(name: K, payload: MockEvents[K]) {
  for (const listener of mockListeners[name]) listener(payload);
}

function subscribeMock<K extends keyof MockEvents>(
  name: K,
  callback: (payload: MockEvents[K]) => void,
): Unlisten {
  mockListeners[name].add(callback as never);
  return () => {
    mockListeners[name].delete(callback as never);
  };
}

/* ------------------------------------------------------------------ */
/* Preview (browser) persistence                                      */
/* ------------------------------------------------------------------ */

const MOCK_KEY = "lunaclient.preview.v1";

interface MockState {
  settings: Settings;
  library: LibraryData;
}

function readMock(): MockState {
  try {
    const raw = window.localStorage.getItem(MOCK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MockState>;
      return {
        settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
        library: { ...emptyLibrary, ...(parsed.library ?? {}) },
      };
    }
  } catch {
    /* ignore corrupted preview state */
  }
  return { settings: { ...defaultSettings }, library: { ...emptyLibrary } };
}

function writeMock(state: MockState) {
  try {
    window.localStorage.setItem(MOCK_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors in preview */
  }
}

const mockBrowsers: BrowserInfo[] = [
  {
    id: "preview-chrome",
    name: "Google Chrome",
    path: "/usr/bin/google-chrome-stable",
    engine: "chromium",
    widevine: true,
    recommended: true,
  },
  {
    id: "preview-chromium",
    name: "Chromium",
    path: "/usr/bin/chromium",
    engine: "chromium",
    widevine: false,
    recommended: false,
  },
];

const previewSystem: SystemInfo = {
  platform: "preview",
  browsers: mockBrowsers,
  appVersion: APP_VERSION,
  profileDir: "~/.local/share/lunaclient/player",
  dataDir: "~/.local/share/lunaclient",
  playerSupported: false,
};

let mockPlaying: PlayerSession | null = null;
let mockExitTimer: number | undefined;
let mockStartedAt = 0;

function clearMockSession() {
  if (mockExitTimer) window.clearTimeout(mockExitTimer);
  mockExitTimer = undefined;
  mockPlaying = null;
}

function finishMockSession(gameId: string, title: string) {
  const seconds = Math.max(1, Math.round((Date.now() - mockStartedAt) / 1000));
  const state = readMock();
  const entry = state.library.recents.find((item) => item.id === gameId);
  if (entry) {
    entry.lastPlayedAt = Date.now();
    entry.seconds += seconds;
    entry.plays += 1;
  } else {
    state.library.recents.unshift({ id: gameId, lastPlayedAt: Date.now(), seconds, plays: 1 });
  }
  writeMock(state);
  clearMockSession();
  mockEmit("exit", { gameId, title, seconds, exitCode: 0 });
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

async function bootstrap(): Promise<BootstrapData> {
  if (isTauri) return invoke<BootstrapData>("get_bootstrap");
  const state = readMock();
  return {
    settings: state.settings,
    library: state.library,
    system: previewSystem,
    playing: mockPlaying,
  };
}

async function saveSettings(settings: Settings): Promise<void> {
  if (isTauri) {
    await invoke("save_settings", { settings });
    return;
  }
  const state = readMock();
  writeMock({ ...state, settings });
}

async function saveLibrary(library: LibraryData): Promise<void> {
  if (isTauri) {
    await invoke("save_library", { library });
    return;
  }
  const state = readMock();
  writeMock({ ...state, library });
}

async function getLibrary(): Promise<LibraryData> {
  if (isTauri) return invoke<LibraryData>("get_library");
  return readMock().library;
}

async function detectBrowsers(): Promise<BrowserInfo[]> {
  if (isTauri) return invoke<BrowserInfo[]>("detect_browsers");
  return mockBrowsers;
}

async function checkBrowser(path: string): Promise<BrowserInfo | null> {
  if (isTauri) return invoke<BrowserInfo | null>("check_browser", { path });
  const trimmed = path.trim();
  if (!trimmed) return null;
  const name = trimmed.split("/").pop() || "Browser";
  return {
    id: `manual-${name}`,
    name,
    path: trimmed,
    engine: "chromium",
    widevine: false,
    recommended: false,
  };
}

async function launch(gameId: string, title: string, url: string): Promise<PlayerSession> {
  if (isTauri) return invoke<PlayerSession>("launch_game", { gameId, title, url });
  const state = readMock();
  if (!state.settings.browserPath) {
    throw new Error("BROWSER_MISSING");
  }
  clearMockSession();
  mockStartedAt = Date.now();
  mockPlaying = {
    gameId,
    title,
    startedAt: mockStartedAt,
    pid: 4242,
  };
  mockExitTimer = window.setTimeout(() => finishMockSession(gameId, title), 25000);
  return mockPlaying;
}

async function stopPlayer(): Promise<void> {
  if (isTauri) {
    await invoke("stop_player");
    return;
  }
  if (mockPlaying) finishMockSession(mockPlaying.gameId, mockPlaying.title);
}

async function openExternal(url: string): Promise<void> {
  if (isTauri) {
    await invoke("open_external", { url });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

async function getPads(): Promise<PadInfo[]> {
  if (isTauri) return invoke<PadInfo[]>("get_pads");
  return [];
}

function subscribePlayerExit(callback: (payload: PlayerExitPayload) => void): Promise<Unlisten> {
  if (isTauri) {
    return listen<PlayerExitPayload>("player://exited", (event) => callback(event.payload));
  }
  return Promise.resolve(subscribeMock("exit", callback));
}

function subscribePlayerStarted(callback: (payload: PlayerSession) => void): Promise<Unlisten> {
  if (isTauri) {
    return listen<PlayerSession>("player://started", (event) => callback(event.payload));
  }
  return Promise.resolve(subscribeMock("started", callback));
}

function subscribeGamepad(callback: (payload: GamepadPayload) => void): Promise<Unlisten> {
  if (isTauri) {
    return listen<GamepadPayload>("gamepad://input", (event) => callback(event.payload));
  }
  return Promise.resolve(subscribeMock("gamepad", callback));
}

function subscribePads(callback: (payload: PadInfo[]) => void): Promise<Unlisten> {
  if (isTauri) {
    return listen<PadInfo[]>("gamepad://pads", (event) => callback(event.payload));
  }
  return Promise.resolve(subscribeMock("pads", callback));
}

function subscribeGamepadError(callback: (payload: string) => void): Promise<Unlisten> {
  if (isTauri) {
    return listen<string>("gamepad://error", (event) => callback(event.payload));
  }
  return Promise.resolve(subscribeMock("error", callback));
}

export const api = {
  bootstrap,
  saveSettings,
  saveLibrary,
  getLibrary,
  detectBrowsers,
  checkBrowser,
  launch,
  stopPlayer,
  openExternal,
  getPads,
  subscribePlayerExit,
  subscribePlayerStarted,
  subscribeGamepad,
  subscribePads,
  subscribeGamepadError,
  previewMode,
  lunaHome: LUNA_HOME,
};
