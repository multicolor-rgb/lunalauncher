import { createRoot } from "react-dom/client";
import App from "./App";
import { defaultSettings, emptyLibrary } from "./lib/defaults";
import { useAppStore } from "./store";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

const params = new URLSearchParams(window.location.search);
const isTauri = "__TAURI_INTERNALS__" in window;

if (!isTauri && params.has("reset")) {
  window.localStorage.removeItem("lunaclient.preview.v1");
}

if (!isTauri && params.has("demo")) {
  const now = Date.now();
  const demo = {
    settings: {
      ...defaultSettings,
      onboardingDone: true,
      browserPath: "/usr/bin/google-chrome-stable",
    },
    library: {
      ...emptyLibrary,
      favorites: ["it-takes-two", "cyberpunk-2077", "rocket-league"],
      recents: [
        { id: "cyberpunk-2077", lastPlayedAt: now - 1000 * 60 * 12, seconds: 6420, plays: 7 },
        { id: "fortnite", lastPlayedAt: now - 1000 * 60 * 60 * 3, seconds: 3120, plays: 4 },
        { id: "rocket-league", lastPlayedAt: now - 1000 * 60 * 60 * 26, seconds: 2280, plays: 3 },
        { id: "it-takes-two", lastPlayedAt: now - 1000 * 60 * 60 * 50, seconds: 5400, plays: 2 },
      ],
    },
  };
  window.localStorage.setItem("lunaclient.preview.v1", JSON.stringify(demo));
}

if (!isTauri) {
  (window as unknown as { __lunaStore: typeof useAppStore }).__lunaStore = useAppStore;
}

createRoot(container).render(<App />);
