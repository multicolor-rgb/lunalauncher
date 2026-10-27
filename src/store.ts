import { create } from "zustand";
import { translate } from "./i18n";
import { api } from "./lib/bridge";
import { defaultSettings, emptyLibrary } from "./lib/defaults";
import { accentFor, isHttpsUrl } from "./lib/utils";
import type {
  Game,
  Language,
  LibraryData,
  PadInfo,
  PlayerSession,
  Screen,
  Settings,
  SystemInfo,
  ToastItem,
  ToastKind,
} from "./types";

export type ModalState =
  | { type: "addGame" }
  | { type: "url" }
  | { type: "path" }
  | { type: "onboarding" }
  | { type: "help" }
  | null;

interface AppStore {
  ready: boolean;
  settings: Settings;
  library: LibraryData;
  system: SystemInfo | null;
  playing: PlayerSession | null;
  pads: PadInfo[];
  screen: Screen;
  detailsId: string | null;
  toasts: ToastItem[];
  showOnboarding: boolean;
  modal: ModalState;

  boot: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  redetectBrowsers: (selectBest?: boolean) => Promise<void>;
  patchSettings: (patch: Partial<Settings>) => void;
  setLanguage: (language: Language) => void;
  setScreen: (screen: Screen) => void;
  openDetails: (id: string) => void;
  closeDetails: () => void;
  toggleFavorite: (id: string) => void;
  addCustomGame: (title: string, url: string) => Game | null;
  removeCustomGame: (id: string) => void;
  launchGame: (game: Game) => Promise<void>;
  stopPlayer: () => Promise<void>;
  setPads: (pads: PadInfo[]) => void;
  setPlaying: (playing: PlayerSession | null) => void;
  setShowOnboarding: (show: boolean) => void;
  finishOnboarding: () => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  toast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 0;

function normalizeLibrary(library: Partial<LibraryData> | null | undefined): LibraryData {
  return {
    favorites: Array.isArray(library?.favorites) ? library!.favorites : [],
    recents: Array.isArray(library?.recents) ? library!.recents : [],
    custom: Array.isArray(library?.custom) ? library!.custom : [],
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  ready: false,
  settings: { ...defaultSettings },
  library: { ...emptyLibrary },
  system: null,
  playing: null,
  pads: [],
  screen: "home",
  detailsId: null,
  toasts: [],
  showOnboarding: false,
  modal: null,

  boot: async () => {
    try {
      const data = await api.bootstrap();
      const settings = { ...defaultSettings, ...data.settings };
      const library = normalizeLibrary(data.library);
      const system = data.system;
      set({
        settings,
        library,
        system,
        playing: data.playing,
        ready: true,
        showOnboarding: !settings.onboardingDone,
      });

      if (!settings.browserPath) {
        const recommended = system?.browsers.find((browser) => browser.recommended) ?? system?.browsers[0];
        if (recommended) {
          get().patchSettings({ browserPath: recommended.path });
        }
      }

      if (data.playing) {
        get().toast(translate(settings.language, "top.live"), "info");
      }
    } catch (error) {
      console.error("bootstrap failed", error);
      set({ ready: true, showOnboarding: true });
      get().toast(translate(defaultSettings.language, "toast.error"), "error");
    }
  },

  refreshLibrary: async () => {
    try {
      const library = await api.getLibrary();
      set({ library: normalizeLibrary(library) });
    } catch (error) {
      console.error("could not refresh library", error);
    }
  },

  redetectBrowsers: async (selectBest = false) => {
    try {
      const browsers = await api.detectBrowsers();
      const system = get().system;
      if (system) set({ system: { ...system, browsers } });
      const current = get().settings.browserPath;
      const stillThere = current && browsers.some((browser) => browser.path === current);
      if (selectBest || !stillThere) {
        const next = browsers.find((browser) => browser.recommended) ?? browsers[0];
        get().patchSettings({ browserPath: next ? next.path : null });
      }
      if (browsers.length === 0) {
        get().toast(translate(get().settings.language, "settings.browserNone"), "error");
      }
    } catch (error) {
      console.error("browser detection failed", error);
      get().toast(translate(get().settings.language, "toast.error"), "error");
    }
  },

  patchSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    void api.saveSettings(settings).catch((error) => {
      console.error("could not save settings", error);
      get().toast(translate(settings.language, "toast.error"), "error");
    });
  },

  setLanguage: (language) => {
    get().patchSettings({ language });
  },

  setScreen: (screen) => set({ screen, detailsId: null }),

  openDetails: (id) => set({ detailsId: id }),

  closeDetails: () => set({ detailsId: null }),

  toggleFavorite: (id) => {
    const { library, settings } = get();
    const isFavorite = library.favorites.includes(id);
    const next: LibraryData = {
      ...library,
      favorites: isFavorite
        ? library.favorites.filter((favorite) => favorite !== id)
        : [id, ...library.favorites],
    };
    set({ library: next });
    void api.saveLibrary(next).catch(() => get().toast(translate(settings.language, "toast.error"), "error"));
    get().toast(
      translate(settings.language, isFavorite ? "toast.favoriteRemoved" : "toast.favoriteAdded"),
      "success",
    );
  },

  addCustomGame: (title, url) => {
    const { library, settings } = get();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !isHttpsUrl(url)) {
      get().toast(translate(settings.language, "toast.invalidUrl"), "error");
      return null;
    }
    const game: Game = {
      id: `custom-${Date.now().toString(36)}`,
      title: trimmedTitle,
      genres: [],
      players: "—",
      accent: accentFor(trimmedTitle),
      motif: "grid",
      custom: true,
      url: url.trim(),
      blurb: {
        pl: "Własna gra dodana przez użytkownika.",
        en: "A custom game added by the user.",
      },
      description: {
        pl: "Ten wpis otworzy podany adres w oknie przeglądarki gry.",
        en: "This entry opens the given URL in the game browser window.",
      },
    };
    const next: LibraryData = { ...library, custom: [game, ...library.custom] };
    set({ library: next });
    void api.saveLibrary(next).catch(() => get().toast(translate(settings.language, "toast.error"), "error"));
    get().toast(translate(settings.language, "toast.customAdded"), "success");
    return game;
  },

  removeCustomGame: (id) => {
    const { library, settings } = get();
    const next: LibraryData = {
      ...library,
      custom: library.custom.filter((game) => game.id !== id),
      favorites: library.favorites.filter((favorite) => favorite !== id),
      recents: library.recents.filter((entry) => entry.id !== id),
    };
    set({ library: next, detailsId: get().detailsId === id ? null : get().detailsId });
    void api.saveLibrary(next).catch(() => get().toast(translate(settings.language, "toast.error"), "error"));
    get().toast(translate(settings.language, "toast.customRemoved"), "success");
  },

  launchGame: async (game) => {
    const { settings, playing } = get();
    if (playing) return;
    const language = settings.language;
    if (!settings.browserPath) {
      get().toast(translate(language, "toast.noBrowser"), "error");
      get().setScreen("settings");
      return;
    }
    try {
      const session = await api.launch(game.id, game.title, game.url || settings.startUrl);
      set({ playing: session });
      get().toast(
        translate(language, api.previewMode ? "toast.demoLaunch" : "toast.launching"),
        api.previewMode ? "info" : "success",
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const suffix = detail && detail !== "BROWSER_MISSING" ? ` (${detail})` : "";
      get().toast(`${translate(language, "toast.launchError")}${suffix}`, "error");
    }
  },

  stopPlayer: async () => {
    try {
      await api.stopPlayer();
      set({ playing: null });
      get().toast(translate(get().settings.language, "toast.stopped"), "info");
    } catch (error) {
      console.error("could not stop player", error);
    }
  },

  setPads: (pads) => set({ pads }),

  setPlaying: (playing) => set({ playing }),

  setShowOnboarding: (show) => set({ showOnboarding: show }),

  finishOnboarding: () => {
    const settings = get().settings;
    if (!settings.browserPath) {
      const recommended = get().system?.browsers.find((browser) => browser.recommended);
      if (recommended) get().patchSettings({ browserPath: recommended.path });
    }
    get().patchSettings({ onboardingDone: true });
    set({ showOnboarding: false, screen: "home" });
  },

  openModal: (modal) => set({ modal }),

  closeModal: () => set({ modal: null }),

  toast: (message, kind = "info") => {
    const id = ++toastSeq;
    set((state) => ({ toasts: [...state.toasts.slice(-3), { id, message, kind }] }));
    window.setTimeout(() => get().dismissToast(id), 4800);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

export function selectGameById(id: string): Game | undefined {
  const { library } = useAppStore.getState();
  return library.custom.find((game) => game.id === id);
}
