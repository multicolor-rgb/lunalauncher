import { useId } from "react";
import { cx } from "../lib/utils";
import type { Game, Motif } from "../types";

function MotifArt({ motif, a, b }: { motif: Motif; a: string; b: string }) {
  switch (motif) {
    case "rings":
      return (
        <>
          {[26, 46, 66, 88, 108].map((radius, index) => (
            <circle
              key={radius}
              cx="128"
              cy="86"
              r={radius}
              stroke={index % 2 === 0 ? a : b}
              strokeOpacity={0.5 - index * 0.06}
              strokeWidth={index === 0 ? 2.2 : 1.1}
            />
          ))}
          <circle cx="128" cy="86" r="6" fill={b} fillOpacity="0.9" />
        </>
      );
    case "orbit":
      return (
        <>
          <ellipse cx="126" cy="92" rx="86" ry="30" stroke={a} strokeOpacity="0.55" strokeWidth="1.4" transform="rotate(-24 126 92)" />
          <ellipse cx="126" cy="92" rx="86" ry="30" stroke={b} strokeOpacity="0.35" strokeWidth="1.2" transform="rotate(26 126 92)" />
          <ellipse cx="126" cy="92" rx="54" ry="18" stroke={a} strokeOpacity="0.25" strokeWidth="1" transform="rotate(-24 126 92)" />
          <circle cx="196" cy="58" r="5" fill={b} fillOpacity="0.95" />
          <circle cx="48" cy="118" r="3.4" fill={a} fillOpacity="0.9" />
          <circle cx="126" cy="92" r="16" fill={a} fillOpacity="0.14" stroke={a} strokeOpacity="0.4" />
        </>
      );
    case "shard":
      return (
        <>
          <polygon points="120,8 194,74 160,188 42,160 22,52" fill={a} fillOpacity="0.12" stroke={a} strokeOpacity="0.5" strokeWidth="1.3" />
          <polygon points="126,44 172,90 150,162 72,144 60,74" fill={b} fillOpacity="0.1" stroke={b} strokeOpacity="0.45" strokeWidth="1" />
          <path d="M60 74 126 44 172 90 150 162 72 144Z" stroke={a} strokeOpacity="0.25" />
          <path d="M60 74 150 162M126 44 72 144M172 90 42 160" stroke={b} strokeOpacity="0.18" />
        </>
      );
    case "grid":
      return (
        <>
          {Array.from({ length: 8 }).map((_, index) => (
            <g key={index}>
              <line x1={30 + index * 24} y1="10" x2={30 + index * 24} y2="195" stroke={a} strokeOpacity="0.12" />
              <line x1="10" y1={30 + index * 24} x2="195" y2={30 + index * 24} stroke={b} strokeOpacity="0.1" />
            </g>
          ))}
          <rect x="78" y="58" width="48" height="48" rx="6" fill={a} fillOpacity="0.18" stroke={a} strokeOpacity="0.55" />
          <rect x="126" y="106" width="24" height="24" rx="4" fill={b} fillOpacity="0.22" />
          <line x1="78" y1="82" x2="198" y2="82" stroke={a} strokeOpacity="0.45" strokeDasharray="3 5" />
        </>
      );
    case "wave":
      return (
        <>
          {[0, 1, 2, 3, 4].map((index) => (
            <path
              key={index}
              d={`M-10 ${64 + index * 22} C 40 ${34 + index * 22}, 78 ${96 + index * 22}, 126 ${64 + index * 22} S 200 ${34 + index * 22}, 220 ${64 + index * 22}`}
              stroke={index % 2 === 0 ? a : b}
              strokeOpacity={0.42 - index * 0.055}
              strokeWidth={index === 0 ? 2 : 1.1}
              fill="none"
            />
          ))}
          <circle cx="126" cy="64" r="5" fill={b} fillOpacity="0.9" />
        </>
      );
    case "blade":
      return (
        <>
          <g transform="rotate(-28 120 100)">
            <rect x="40" y="52" width="18" height="120" rx="9" fill={a} fillOpacity="0.22" stroke={a} strokeOpacity="0.5" />
            <rect x="76" y="24" width="9" height="150" rx="4.5" fill={b} fillOpacity="0.3" />
            <rect x="100" y="40" width="28" height="122" rx="14" fill={a} fillOpacity="0.16" stroke={a} strokeOpacity="0.35" />
            <rect x="148" y="16" width="6" height="168" rx="3" fill={b} fillOpacity="0.22" />
          </g>
          <circle cx="170" cy="70" r="3" fill={a} fillOpacity="0.9" />
        </>
      );
    default:
      return null;
  }
}

export function GameArt({
  game,
  variant = "poster",
  className,
}: {
  game: Game;
  variant?: "poster" | "wide" | "hero";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const [a, b] = game.accent;
  const motif = game.motif ?? "rings";

  return (
    <div className={cx("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 110% at 14% 4%, ${a}cc 0%, transparent 58%), radial-gradient(100% 100% at 94% 16%, ${b}88 0%, transparent 56%), linear-gradient(165deg, #131a2e 0%, #080b14 60%, #05070f 100%)`,
        }}
      />
      {game.art && (
        <img
          src={game.art}
          alt=""
          loading="lazy"
          className="poster-img opacity-90"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        className={cx(
          "pointer-events-none absolute",
          variant === "hero"
            ? "-right-20 -top-24 h-[150%] w-auto opacity-90"
            : "-right-10 -top-12 h-[82%] w-auto opacity-80",
        )}
      >
        <defs>
          <linearGradient id={`${uid}-a`} x1="20" y1="10" x2="180" y2="190" gradientUnits="userSpaceOnUse">
            <stop stopColor={a} stopOpacity="0.95" />
            <stop offset="1" stopColor={b} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`${uid}-b`} x1="0" y1="200" x2="200" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor={b} stopOpacity="0.95" />
            <stop offset="1" stopColor={a} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <MotifArt motif={motif} a={`url(#${uid}-a)`} b={`url(#${uid}-b)`} />
      </svg>
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(90% 90% at 30% 10%, black, transparent 78%)",
        }}
      />
      <div className="poster-sheen" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060c] via-[#04060c]/20 to-transparent" />
    </div>
  );
}
