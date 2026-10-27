import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "library"
  | "heart"
  | "heart-filled"
  | "settings"
  | "play"
  | "close"
  | "plus"
  | "search"
  | "monitor"
  | "gamepad"
  | "check"
  | "chevron-right"
  | "chevron-left"
  | "clock"
  | "sparkles"
  | "info"
  | "refresh"
  | "external"
  | "stop"
  | "tv"
  | "battery"
  | "grid"
  | "wifi"
  | "arrow-right";
import type { JSX } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, JSX.Element> = {
  home: <path d="M3 10.8 12 3l9 7.8V21h-6.2v-6.3H9.2V21H3z" />,
  library: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </>
  ),
  heart: <path d="M12 20.3 4.6 13a4.9 4.9 0 0 1 7-6.9l.4.4.4-.4a4.9 4.9 0 0 1 7 6.9Z" />,
  "heart-filled": (
    <path
      d="M12 20.6 4.4 13a5.1 5.1 0 0 1 7.2-7.2l.4.4.4-.4A5.1 5.1 0 0 1 19.6 13Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.9 4.6h.09A1.7 1.7 0 0 0 10 3.04V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  play: <path d="M8.5 5.4v13.2L19 12Z" fill="currentColor" stroke="none" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="m20 20-3.9-3.9" />
    </>
  ),
  monitor: (
    <>
      <rect x="2.6" y="4" width="18.8" height="12.4" rx="2.2" />
      <path d="M9 20.4h6M12 16.4v4" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.2 8.2h9.6a5 5 0 0 1 4.9 4l.6 3.5a2.6 2.6 0 0 1-4.5 2.2l-1.3-1.5H7.5l-1.3 1.5a2.6 2.6 0 0 1-4.5-2.2l.6-3.5a5 5 0 0 1 4.9-4Z" />
      <path d="M8 11v3M6.5 12.5h3" />
      <circle cx="15.4" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.6" cy="13.4" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="m5 12.5 4.4 4.4L19 7" />,
  "chevron-right": <path d="m9 5 7 7-7 7" />,
  "chevron-left": <path d="m15 5-7 7 7 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.4 2.1" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.4 13.6 9l5.6 1.6-5.6 1.6L12 17.8l-1.6-5.6L4.8 10.6 10.4 9Z" />
      <path d="M18.4 16.2 19.2 19l2.8.8-2.8.8-.8 2.8-.8-2.8-2.8-.8 2.8-.8Z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.2M12 7.9v.1" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4.5V9h-4.5" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M19 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5h4.5" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2.5" />,
  tv: (
    <>
      <rect x="2.6" y="4.4" width="18.8" height="12.8" rx="2.4" />
      <path d="M8 21h8M12 17.2V21" />
    </>
  ),
  battery: (
    <>
      <rect x="2.4" y="8" width="16" height="8" rx="2.2" />
      <path d="M21 10.6v2.8" />
      <rect x="4.8" y="10.3" width="7.5" height="3.4" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  grid: (
    <>
      <path d="M4 9h16M4 15h16M9 4v16M15 4v16" />
    </>
  ),
  wifi: (
    <>
      <path d="M3.5 9.6a13 13 0 0 1 17 0M6.6 13a8.6 8.6 0 0 1 10.8 0M9.6 16.3a4.3 4.3 0 0 1 4.8 0" />
      <circle cx="12" cy="19.4" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  "arrow-right": <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />,
};

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
