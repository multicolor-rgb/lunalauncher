import { afterEach, beforeEach, expect, test } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "../src/App";
import { useAppStore } from "../src/store";
import { defaultSettings, emptyLibrary } from "../src/lib/defaults";

let root: Root | null = null;

beforeEach(() => {
  window.localStorage.clear();
  useAppStore.setState({
    ready: false,
    settings: { ...defaultSettings },
    library: { ...emptyLibrary, favorites: [], recents: [], custom: [] },
    system: null,
    playing: null,
    pads: [],
    screen: "home",
    detailsId: null,
    toasts: [],
    showOnboarding: false,
    modal: null,
  });
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
    root = null;
  }
  document.body.innerHTML = "";
});

test("renders the onboarding wizard on a fresh profile", async () => {
  const container = document.getElementById("root");
  expect(container).not.toBeNull();

  await act(async () => {
    root = createRoot(container!);
    root.render(<App />);
  });

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
  });

  const text = document.body.textContent ?? "";
  expect(text).toContain("Witaj w Luna Client");
  expect(text).toContain("Zaczynamy");
});

test("navigates the wizard with the keyboard and reaches the launcher", async () => {
  const container = document.getElementById("root");
  await act(async () => {
    root = createRoot(container!);
    root.render(<App />);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
  });

  // Step 1 -> 2
  await act(async () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 80));
  });

  expect(document.body.textContent).toContain("Wybierz przeglądarkę");
});
