import { Focusable } from "./Focusable";
import { GameArt } from "./GameArt";
import { Icon } from "./Icon";
import { genreLabel } from "../i18n";
import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import { cx, timeAgo } from "../lib/utils";
import type { Game } from "../types";

interface GameCardProps {
  game: Game;
  focusId: string;
  variant?: "poster" | "wide";
  favorite?: boolean;
  meta?: string;
  fluid?: boolean;
  onPlay: () => void;
  onDetails: () => void;
  onFavorite: () => void;
}

export function GameCard({
  game,
  focusId,
  variant = "poster",
  favorite,
  meta,
  fluid,
  onPlay,
  onDetails,
  onFavorite,
}: GameCardProps) {
  const language = useAppStore((state) => state.settings.language);
  const t = useT();
  const genre = game.genres[0] ? genreLabel(language, game.genres[0]) : t("details.custom");

  return (
    <Focusable
      id={focusId}
      className={cx(
        "game-card group block shrink-0 text-left",
        fluid ? "w-full" : variant === "poster" ? "w-[196px]" : "w-[330px]",
      )}
      onActivate={onPlay}
      onAction={(action) => {
        if (action === "favorite") {
          onFavorite();
          return true;
        }
        if (action === "details") {
          onDetails();
          return true;
        }
        return false;
      }}
      ariaLabel={`${game.title} — ${genre}`}
    >
      <div className={cx("poster", variant === "poster" ? "aspect-[3/4]" : "aspect-video")}>
        <GameArt game={game} variant={variant} />

        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/75 backdrop-blur-sm">
              {genre}
            </span>
            {favorite && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet/25 text-[#c9beff] ring-1 ring-violet/40">
                <Icon name="heart-filled" size={13} />
              </span>
            )}
          </div>

          <div>
            <h3 className={cx("card-title font-semibold leading-[1.15]", variant === "poster" ? "text-[16.5px]" : "text-[19px]")}>
              {game.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-white/55">
              {game.year && <span>{game.year}</span>}
              {game.genres[1] && <span className="text-white/25">•</span>}
              {game.genres[1] && <span>{genreLabel(language, game.genres[1])}</span>}
              {meta && (
                <>
                  <span className="text-white/25">•</span>
                  <span className="text-white/40">{meta}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="play-badge absolute right-3 bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#06070d] opacity-0 shadow-[0_10px_30px_rgba(124,92,255,.55)] transition-all duration-200">
          <Icon name="play" size={16} className="ml-0.5" />
        </div>

        {game.custom && (
          <span className="absolute top-3 right-3 z-20 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60 backdrop-blur">
            własna
          </span>
        )}
      </div>
    </Focusable>
  );
}

export function WideCard({
  game,
  focusId,
  favorite,
  seconds,
  lastPlayedAt,
  onPlay,
  onDetails,
  onFavorite,
}: {
  game: Game;
  focusId: string;
  favorite?: boolean;
  seconds?: number;
  lastPlayedAt?: number;
  onPlay: () => void;
  onDetails: () => void;
  onFavorite: () => void;
}) {
  const language = useAppStore((state) => state.settings.language);
  const t = useT();
  const meta = [
    seconds ? `${Math.max(1, Math.round(seconds / 60))} ${t("common.minShort")}` : null,
    lastPlayedAt ? timeAgo(lastPlayedAt, language) : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <Focusable
      id={focusId}
      className="game-card group block w-[330px] shrink-0 text-left"
      onActivate={onPlay}
      onAction={(action) => {
        if (action === "favorite") {
          onFavorite();
          return true;
        }
        if (action === "details") {
          onDetails();
          return true;
        }
        return false;
      }}
      ariaLabel={game.title}
    >
      <div className="poster aspect-video">
        <GameArt game={game} variant="wide" />
        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
              {genreLabel(language, game.genres[0] ?? "adventure")}
            </span>
            {favorite && <Icon name="heart-filled" size={14} className="text-[#c9beff]" />}
          </div>
          <div>
            <h3 className="card-title text-[18px] font-semibold leading-tight">{game.title}</h3>
            <div className="mt-1 text-[11px] font-medium text-white/45">{meta}</div>
          </div>
        </div>
        <div className="play-badge absolute right-3 bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#06070d] opacity-0 shadow-[0_10px_30px_rgba(124,92,255,.55)] transition-all duration-200">
          <Icon name="play" size={16} className="ml-0.5" />
        </div>
      </div>
    </Focusable>
  );
}
