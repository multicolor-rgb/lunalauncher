import { Focusable } from "./Focusable";
import { GameArt } from "./GameArt";
import { Icon } from "./Icon";
import { genreLabel, playersLabel, tagLabel } from "../i18n";
import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import { cx, timeAgo } from "../lib/utils";
import type { Game } from "../types";

export function Hero({
  game,
  favorite,
  playtimeSeconds,
  lastPlayedAt,
  onPlay,
  onDetails,
  onFavorite,
}: {
  game: Game;
  favorite: boolean;
  playtimeSeconds?: number;
  lastPlayedAt?: number;
  onPlay: () => void;
  onDetails: () => void;
  onFavorite: () => void;
}) {
  const language = useAppStore((state) => state.settings.language);
  const t = useT();
  const tags = (game.tags ?? []).slice(0, 3).map((tag) => tagLabel(language, tag));

  return (
    <section className="relative mb-9 overflow-hidden rounded-[30px] border border-white/[0.08] shadow-[0_40px_120px_-60px_rgba(124,92,255,.6)]">
      <GameArt game={game} variant="hero" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/90 via-[#05070d]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent" />

      <div className="relative z-10 grid min-h-[430px] items-end gap-8 p-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:p-11">
        <div className="max-w-[640px]">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="chip chip-accent">
              <Icon name="sparkles" size={12} />
              {t("home.featured")}
            </span>
            {tags.map((tag) => (
              <span key={tag} className="chip hidden sm:inline-flex">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-display text-[clamp(34px,4.6vw,62px)] leading-[0.98] font-semibold tracking-[-0.04em] text-glow text-balance">
            {game.title}
          </h1>

          <p className="mt-4 max-w-[520px] text-[14.5px] leading-relaxed text-white/60">
            {game.description?.[language] ?? game.blurb[language]}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Focusable id="home-hero-play" className="btn btn-primary" onActivate={onPlay} ariaLabel={t("home.play")}>
              <Icon name="play" size={17} />
              {t("home.play")}
            </Focusable>
            <Focusable id="home-hero-details" className="btn btn-ghost" onActivate={onDetails}>
              <Icon name="info" size={17} />
              {t("home.details")}
            </Focusable>
            <Focusable
              id="home-hero-fav"
              className={cx("btn btn-icon h-[50px] w-[50px] rounded-full", favorite ? "btn-soft" : "btn-ghost")}
              onActivate={onFavorite}
              ariaLabel={favorite ? t("details.unfavorite") : t("details.favorite")}
            >
              <Icon name="heart-filled" size={18} className={favorite ? "text-[#d8d0ff]" : "text-white/80"} />
            </Focusable>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] font-medium text-white/40">
            <span className="flex items-center gap-1.5">
              <Icon name="gamepad" size={13} />
              {playersLabel(language, game.players)}
            </span>
            {game.studio && <span>{game.studio}</span>}
            {game.year && <span>{game.year}</span>}
            {playtimeSeconds ? (
              <span className="flex items-center gap-1.5 text-white/55">
                <Icon name="clock" size={13} />
                {Math.max(1, Math.round(playtimeSeconds / 60))} {t("common.minShort")}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={13} />
                {lastPlayedAt ? timeAgo(lastPlayedAt, language) : t("time.never")}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-emerald-300/80">
              <Icon name="wifi" size={13} />
              Cloud
            </span>
          </div>
        </div>

        <div className="hidden justify-end lg:flex">
          <div className="relative w-[228px] rotate-[1.5deg] transition-transform duration-500 hover:rotate-0">
            <div className="absolute -inset-6 rounded-[34px] bg-violet/25 blur-3xl" />
            <div className="poster relative aspect-[3/4] overflow-hidden rounded-[24px] border-white/20 shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)]">
              <GameArt game={game} />
              <div className="relative z-10 flex h-full flex-col justify-between p-5">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/60">
                  {game.genres[0] ? genreLabel(language, game.genres[0]) : t("details.custom")}
                </span>
                <div>
                  <div className="card-title text-[20px] leading-tight font-semibold">{game.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-white/50">
                    <span className="rounded-full border border-white/15 px-2 py-0.5">4K</span>
                    <span className="rounded-full border border-white/15 px-2 py-0.5">HDR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
