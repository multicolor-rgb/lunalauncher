import { useMemo } from "react";
import { catalog } from "../data/catalog";
import { Focusable } from "../components/Focusable";
import { GameArt } from "../components/GameArt";
import { Icon } from "../components/Icon";
import { genreLabel, playersLabel, tagLabel } from "../i18n";
import { api } from "../lib/bridge";
import { useT } from "../lib/useT";
import { formatDuration, timeAgo } from "../lib/utils";
import { useAppStore } from "../store";

export function GameDetails() {
  const detailsId = useAppStore((state) => state.detailsId);
  const library = useAppStore((state) => state.library);
  const settings = useAppStore((state) => state.settings);
  const closeDetails = useAppStore((state) => state.closeDetails);
  const launchGame = useAppStore((state) => state.launchGame);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const removeCustomGame = useAppStore((state) => state.removeCustomGame);
  const language = useAppStore((state) => state.settings.language);
  const t = useT();

  const game = useMemo(() => {
    if (!detailsId) return null;
    return (
      library.custom.find((item) => item.id === detailsId) ??
      catalog.find((item) => item.id === detailsId) ??
      null
    );
  }, [detailsId, library.custom]);

  const recent = useMemo(
    () => library.recents.find((entry) => entry.id === detailsId),
    [detailsId, library.recents],
  );

  if (!detailsId || !game) return null;

  const favorite = library.favorites.includes(game.id);

  return (
    <div className="fixed inset-0 z-50 fade-in">
      <div
        className="absolute inset-0 bg-[#03050b]/85 backdrop-blur-2xl"
        onClick={closeDetails}
        aria-hidden="true"
      />
      <div className="relative flex h-full items-center justify-center px-6 py-8">
        <div
          className="pop-in relative flex max-h-[88vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#080b14]/95 shadow-[0_60px_160px_-40px_rgba(0,0,0,1)]"
          role="dialog"
          aria-modal="true"
          aria-label={game.title}
        >
          <div className="relative h-[290px] shrink-0">
            <GameArt game={game} variant="hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080b14]/70 via-transparent to-transparent" />

            <div className="absolute top-5 right-5 z-20">
              <Focusable
                id="details-close"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md"
                onActivate={closeDetails}
                ariaLabel={t("common.close")}
              >
                <Icon name="close" size={16} />
              </Focusable>
            </div>

            <div className="absolute right-7 bottom-6 left-7">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="chip chip-accent">{t("home.featured")}</span>
                {game.custom && <span className="chip">{t("details.custom")}</span>}
                {game.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="chip">
                    {tagLabel(language, tag)}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-[clamp(30px,4vw,50px)] leading-[0.98] font-semibold tracking-[-0.035em]">
                {game.title}
              </h2>
            </div>
          </div>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-7 pt-6 pb-7">
            <div className="flex flex-wrap items-center gap-3">
              <Focusable
                id="details-play"
                className="btn btn-primary"
                onActivate={() => {
                  closeDetails();
                  void launchGame(game);
                }}
              >
                <Icon name="play" size={17} />
                {t("details.play")}
              </Focusable>
              <Focusable
                id="details-fav"
                className="btn btn-ghost"
                onActivate={() => toggleFavorite(game.id)}
              >
                <Icon name="heart-filled" size={16} className={favorite ? "text-violet" : "text-white/60"} />
                {favorite ? t("details.unfavorite") : t("details.favorite")}
              </Focusable>
              <Focusable
                id="details-open"
                className="btn btn-ghost"
                onActivate={() => void api.openExternal(game.url || settings.startUrl)}
              >
                <Icon name="external" size={16} />
                {t("details.openInLuna")}
              </Focusable>
              {game.custom && (
                <Focusable
                  id="details-remove"
                  className="btn btn-ghost ml-auto text-rose-200/80"
                  onActivate={() => removeCustomGame(game.id)}
                >
                  <Icon name="close" size={15} />
                  {t("common.remove")}
                </Focusable>
              )}
            </div>

            <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_300px]">
              <div>
                <h3 className="mb-2 text-[10px] font-bold tracking-[0.22em] text-white/30 uppercase">
                  {t("details.about")}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-white/60">
                  {game.description?.[language] ?? game.blurb[language]}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span key={genre} className="chip">
                      {genreLabel(language, genre)}
                    </span>
                  ))}
                  {game.tags?.map((tag) => (
                    <span key={tag} className="chip">
                      {tagLabel(language, tag)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 self-start">
                <Meta label={t("details.players")} value={playersLabel(language, game.players)} />
                <Meta label={t("details.year")} value={game.year ? String(game.year) : "—"} />
                <Meta label={t("details.studio")} value={game.studio ?? "—"} />
                <Meta
                  label={t("details.playtime")}
                  value={recent ? formatDuration(recent.seconds, language) : t("common.never")}
                />
                <Meta
                  label={t("details.lastPlayed")}
                  value={recent ? timeAgo(recent.lastPlayedAt, language) : t("common.never")}
                  wide
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div
      className={
        "rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3 " + (wide ? "col-span-2" : "")
      }
    >
      <div className="text-[9px] font-bold tracking-[0.16em] text-white/25 uppercase">{label}</div>
      <div className="mt-1 truncate text-[12.5px] font-semibold text-white/75">{value}</div>
    </div>
  );
}
