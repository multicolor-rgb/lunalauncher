import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Action } from "../types";

export type Direction = "up" | "down" | "left" | "right";

interface FocusItem {
  el: HTMLElement;
  activate?: () => void;
  onAction?: (action: Action) => boolean | void;
}

interface FocusApi {
  focusedId: string | null;
  register: (id: string, el: HTMLElement, item?: Omit<FocusItem, "el">) => () => void;
  focus: (id: string) => boolean;
  focusFirst: (prefix?: string) => boolean;
  move: (direction: Direction) => void;
  activate: () => void;
  runAction: (action: Action) => boolean;
}

const FocusContext = createContext<FocusApi | null>(null);

function isVisible(el: HTMLElement): boolean {
  if (!el.isConnected) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  if (el.closest("[inert]")) return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return false;
  if (style.opacity && Number(style.opacity) <= 0.04) return false;
  return true;
}

function overlap(startA: number, endA: number, startB: number, endB: number): number {
  return Math.min(endA, endB) - Math.max(startA, startB);
}

export function FocusProvider({
  children,
  reduceMotion,
}: {
  children: ReactNode;
  reduceMotion: boolean;
}) {
  const items = useRef(new Map<string, FocusItem>());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const focusedRef = useRef<string | null>(null);
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;

  const focus = useCallback((id: string): boolean => {
    const item = items.current.get(id);
    if (!item) return false;
    focusedRef.current = id;
    setFocusedId(id);
    try {
      item.el.focus({ preventScroll: true });
    } catch {
      item.el.focus();
    }
    item.el.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "auto",
    });
    return true;
  }, []);

  const focusFirst = useCallback(function focusFirst(prefix?: string): boolean {
    const candidates: Array<{ id: string; rect: DOMRect }> = [];
    for (const [id, item] of items.current) {
      if (prefix && !id.startsWith(prefix)) continue;
      if (!isVisible(item.el)) continue;
      candidates.push({ id, rect: item.el.getBoundingClientRect() });
    }
    if (candidates.length === 0) {
      if (!prefix) {
        focusedRef.current = null;
        setFocusedId(null);
      }
      return false;
    }
    candidates.sort((a, b) => {
      const rowDelta = a.rect.top - b.rect.top;
      if (Math.abs(rowDelta) > 24) return rowDelta;
      return a.rect.left - b.rect.left;
    });
    focus(candidates[0].id);
    return true;
  }, [focus]);

  const move = useCallback(
    (direction: Direction) => {
      const currentId = focusedRef.current;
      const current = currentId ? items.current.get(currentId) : null;
      if (!current || !isVisible(current.el)) {
        focusFirst();
        return;
      }

      const origin = current.el.getBoundingClientRect();
      const originX = origin.left + origin.width / 2;
      const originY = origin.top + origin.height / 2;

      let best: { id: string; score: number } | null = null;

      for (const [id, item] of items.current) {
        if (id === currentId) continue;
        if (!isVisible(item.el)) continue;
        const rect = item.el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = centerX - originX;
        const dy = centerY - originY;

        let primary = 0;
        let cross = 0;
        let overlaps = 0;

        switch (direction) {
          case "left":
            if (dx > -6) continue;
            primary = -dx;
            cross = Math.abs(dy);
            overlaps = overlap(origin.top, origin.bottom, rect.top, rect.bottom);
            break;
          case "right":
            if (dx < 6) continue;
            primary = dx;
            cross = Math.abs(dy);
            overlaps = overlap(origin.top, origin.bottom, rect.top, rect.bottom);
            break;
          case "up":
            if (dy > -6) continue;
            primary = -dy;
            cross = Math.abs(dx);
            overlaps = overlap(origin.left, origin.right, rect.left, rect.right);
            break;
          case "down":
            if (dy < 6) continue;
            primary = dy;
            cross = Math.abs(dx);
            overlaps = overlap(origin.left, origin.right, rect.left, rect.right);
            break;
        }

        const crossWeight = overlaps > 4 ? 0.9 : 3.2;
        const score = primary + cross * crossWeight;
        if (!best || score < best.score) {
          best = { id, score };
        }
      }

      if (best) focus(best.id);
    },
    [focus, focusFirst],
  );

  const activate = useCallback(() => {
    const currentId = focusedRef.current;
    if (!currentId) {
      focusFirst();
      return;
    }
    const item = items.current.get(currentId);
    item?.activate?.();
  }, [focusFirst]);

  const runAction = useCallback((action: Action): boolean => {
    const currentId = focusedRef.current;
    if (!currentId) return false;
    const item = items.current.get(currentId);
    if (!item?.onAction) return false;
    return item.onAction(action) === true;
  }, []);

  const register = useCallback(
    (id: string, el: HTMLElement, item?: Omit<FocusItem, "el">) => {
      items.current.set(id, { el, activate: item?.activate, onAction: item?.onAction });
      if (!focusedRef.current && isVisible(el)) {
        focusedRef.current = id;
        setFocusedId(id);
      }
      return () => {
        items.current.delete(id);
        if (focusedRef.current === id) {
          focusedRef.current = null;
          setFocusedId(null);
        }
      };
    },
    [],
  );

  const value = useMemo<FocusApi>(
    () => ({ focusedId, register, focus, focusFirst, move, activate, runAction }),
    [focusedId, register, focus, focusFirst, move, activate, runAction],
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus(): FocusApi {
  const context = useContext(FocusContext);
  if (!context) throw new Error("useFocus must be used inside FocusProvider");
  return context;
}
