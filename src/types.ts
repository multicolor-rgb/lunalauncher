export type Language = "pl" | "en";
export type Screen = "home" | "library" | "favorites" | "settings";
export type LaunchMode = "window" | "fullscreen" | "kiosk";

export type Genre =
  | "action"
  | "adventure"
  | "racing"
  | "sports"
  | "family"
  | "rpg"
  | "horror"
  | "fighting"
  | "party";

export type Motif = "rings" | "orbit" | "shard" | "grid" | "wave" | "blade";

export interface Localized {
  pl: string;
  en: string;
}

export interface Game {
  id: string;
  title: string;
  year?: number;
  studio?: string;
  genres: Genre[];
  players?: string;
  tags?: string[];
  accent: [string, string];
  motif?: Motif;
  blurb: Localized;
  description?: Localized;
  /** Optional remote cover art. When missing, procedural art is used. */
  art?: string;
  /** Optional direct Luna URL. Falls back to the configured start URL. */
  url?: string;
  featured?: boolean;
  custom?: boolean;
}

export interface RecentEntry {
  id: string;
  lastPlayedAt: number;
  seconds: number;
  plays: number;
}

export interface LibraryData {
  favorites: string[];
  recents: RecentEntry[];
  custom: Game[];
}

export interface Settings {
  language: Language;
  browserPath: string | null;
  launchMode: LaunchMode;
  hideLauncher: boolean;
  startUrl: string;
  reduceMotion: boolean;
  onboardingDone: boolean;
}

export interface BrowserInfo {
  id: string;
  name: string;
  path: string;
  engine: string;
  widevine: boolean;
  recommended: boolean;
}

export interface PadInfo {
  id: string;
  name: string;
  battery: "wired" | "full" | "high" | "medium" | "low" | "empty" | "unknown";
  connected: boolean;
}

export interface SystemInfo {
  platform: string;
  browsers: BrowserInfo[];
  appVersion: string;
  profileDir: string;
  dataDir: string;
  playerSupported: boolean;
}

export interface PlayerSession {
  gameId: string;
  title: string;
  startedAt: number;
  pid: number;
}

export interface BootstrapData {
  settings: Settings;
  library: LibraryData;
  system: SystemInfo;
  playing: PlayerSession | null;
}

export interface PlayerExitPayload {
  gameId: string;
  title: string;
  seconds: number;
  exitCode: number | null;
}

export interface GamepadPayload {
  control?: string;
  pressed?: boolean;
  axis?: "left" | "right";
  x?: number;
  y?: number;
}

export type ToastKind = "info" | "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

export type PadControl =
  | "south"
  | "east"
  | "west"
  | "north"
  | "left_bumper"
  | "right_bumper"
  | "start"
  | "select"
  | "dpad_up"
  | "dpad_down"
  | "dpad_left"
  | "dpad_right";

export type Action =
  | "up"
  | "down"
  | "left"
  | "right"
  | "confirm"
  | "back"
  | "favorite"
  | "details"
  | "tabPrev"
  | "tabNext"
  | "menu"
  | "help"
  | "search";
