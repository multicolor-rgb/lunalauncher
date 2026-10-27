import { useId } from "react";
import { cx } from "../lib/utils";

export function Logo({ size = 44, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="Luna Client"
      role="img"
    >
      <defs>
        <linearGradient id={`${id}-moon`} x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B8A8FF" />
          <stop offset="0.5" stopColor="#7C5CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id={`${id}-ring`} x1="6" y1="48" x2="58" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#A5F3FC" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7C5CFF" stopOpacity="0.2" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect width="64" height="64" fill="black" />
          <circle cx="30" cy="31" r="18" fill="white" />
          <circle cx="39" cy="25" r="15" fill="black" />
        </mask>
      </defs>
      <circle cx="30" cy="31" r="18" fill={`url(#${id}-moon)`} mask={`url(#${id}-mask)`} />
      <path
        d="M8 44.5c8.5 3.6 20.5 4.7 32.2 1.4 7-2 12.4-5.5 15.8-9.4"
        stroke={`url(#${id}-ring)`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="49.5" cy="32.5" r="2.4" fill="#8FF3FF" />
      <circle cx="9.5" cy="45.5" r="1.7" fill="#A998FF" />
    </svg>
  );
}

export function LogoWordmark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <Logo size={compact ? 34 : 42} />
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-[19px] font-semibold tracking-[-0.02em] text-white">
            Luna<span className="text-violet">.</span>
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/35">
            Client
          </div>
        </div>
      )}
    </div>
  );
}
