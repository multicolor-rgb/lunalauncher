import type { LibraryData, Settings } from "../types";

export const LUNA_HOME = "https://luna.amazon.com/home";

export const defaultSettings: Settings = {
  language: "pl",
  browserPath: null,
  launchMode: "fullscreen",
  hideLauncher: true,
  startUrl: LUNA_HOME,
  reduceMotion: false,
  onboardingDone: false,
};

export const emptyLibrary: LibraryData = {
  favorites: [],
  recents: [],
  custom: [],
};

export const APP_VERSION = "0.1.0";
