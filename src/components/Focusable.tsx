import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "../lib/utils";
import { useFocus } from "../focus/FocusProvider";
import type { Action } from "../types";

interface FocusableProps {
  id: string;
  onActivate?: () => void;
  onAction?: (action: Action) => boolean | void;
  variant?: "default" | "row" | "nav";
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  children: ReactNode;
  tabIndex?: number;
}

export function Focusable({
  id,
  onActivate,
  onAction,
  variant = "default",
  className,
  disabled,
  ariaLabel,
  title,
  children,
}: FocusableProps) {
  const { register, focus, focusedId } = useFocus();
  const ref = useRef<HTMLButtonElement>(null);
  const activateRef = useRef(onActivate);
  const actionRef = useRef(onAction);
  activateRef.current = onActivate;
  actionRef.current = onAction;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return register(id, element, {
      activate: () => activateRef.current?.(),
      onAction: (action) => actionRef.current?.(action),
    });
  }, [id, register]);

  const focused = focusedId === id;

  return (
    <button
      ref={ref}
      id={id}
      data-focus-id={id}
      type="button"
      tabIndex={-1}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      data-focused={focused}
      className={cx(
        "focusable",
        variant !== "default" && `focusable--${variant}`,
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
      onPointerEnter={() => {
        if (!disabled) focus(id);
      }}
      onClick={() => {
        if (disabled) return;
        focus(id);
        activateRef.current?.();
      }}
    >
      {children}
    </button>
  );
}
