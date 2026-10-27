import { useEffect, useMemo, useRef, useState } from "react";
import { catalog } from "../data/catalog";
import { Focusable } from "../components/Focusable";
import { GameCard } from "../components/GameCard";
import { Icon } from "../components/Icon";
import { genreLabel } from "../i18n";
import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import { cx } from "../lib/utils";
import type { Game, Genre } from "../types";

const GENRE_ORDER: Genre[] = [
  "action",
  "adventure",
  "racing",
  "sports",
  "family",
  "rpg",
  "horror",
  "fighting",
  "party",
];

export function LibraryScreen({ mode }: { mode: "library" | "favorites" }) {
  const library = useAppStore((state) => state.library);
  const launchGame = useAppStore((state) => state.launchGame);
  const openDetails = useAppStore((state) => state.openDetails);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const setScreen = useAppStore((state) => state.setScreen);
  const language = useAppStore((state) => state.settings.language);
  const t = useT();

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [sort, setSort] = useState<"featured" | "az">("featured");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("luna:focus-search", handler);
    return () => window.removeEventListener("luna:focus-search", handler);
  }, []);

  const allGames = useMemo<Game[]>(() => [...library.custom, ...catalog], [library.custom]);
  const favoriteSet = useMemo(() => new Set(library.favorites), [library.favorites]);

  const base = useMemo(() => {
    if (mode === "favorites") {
      return allGames.filter((game) => favoriteSet.has(game.id));
    }
    return allGames;
  }, [allGames, favoriteSet, mode]);

  const genres = useMemo(() => {
    const present = new Set<Genre>();
    for (const game of base) game.genres.forEach((item) => present.add(item));
    return GENRE_ORDER.filter((item) => present.has(item));
  }, [base]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let result = base.filter((game) => {
      if (genre !== "all" && !game.genres.includes(genre)) return false;
      if (!needle) return true;
      const haystack = `${game.title} ${game.studio ?? ""} ${game.blurb[language]} ${game.blurb.en}`.toLowerCase();
      return haystack.includes(needle);
    });
    if (sort === "az") {
      result = result.slice().sort((a, b) => a.title.localeCompare(b.title, language));
    }
    return result;
  }, [base, genre, language, query, sort]);

  const resetFilters = () => {
    setQuery("");
    setGenre("all");
    setSort("featured");
    inputRef.current?.focus();
  };

  return (
    <div className="screen-in flex h-full min-h-0 flex-col px-8 pb-12 lg:px-10">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="search-field flex min-w-[260px] flex-1 items-center gap-2.5 px-3.5 md:max-w-[380px]">
          <Icon name="search" size={16} className="shrink-0 text-white/35" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                event.currentTarget.blur();
              }
            }}
            placeholder={t("library.search")}
            aria-label={t("library.search")}
            className="h-full w-full bg-transparent text-[13px] font-medium text-white placeholder:text-white/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white/80"
              aria-label={t("common.close")}
            >
              <Icon name="close" size={13} />
            </button>
          )}
        </div>

        <Focusable
          id={`${mode}-filter-all`}
          className={cx(
            "chip h-[34px] cursor-pointer",
            genre === "all" ? "chip-accent" : "hover:bg-white/10",
          )}
          onActivate={() => setGenre("all")}
          ariaLabel={t("common.all")}
        >
          {t("common.all")}
        </Focusable>

        {genres.map((item) => (
          <Focusable
            key={item}
            id={`${mode}-filter-${item}`}
            className={cx(
              "chip h-[34px] cursor-pointer",
              genre === item ? "chip-accent" : "hover:bg-white/10",
            )}
            onActivate={() => setGenre(item)}
            ariaLabel={genreLabel(language, item)}
          >
            {genreLabel(language, item)}
          </Focusable>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[11px] font-medium text-white/30 sm:inline">
            {t("library.count", { count: filtered.length })}
          </span>
          <Focusable
            id={`${mode}-sort`}
            className="flex h-[34px] items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 text-[11px] font-semibold text-white/60"
            onActivate={() => setSort((current) => (current === "featured" ? "az" : "featured"))}
            ariaLabel={t("library.sort")}
          >
            <Icon name="grid" size={13} />
            {sort === "featured" ? t("library.sortFeatured") : t("library.sortAz")}
            <Icon name="refresh" size={11} className="opacity-50" />
          </Focusable>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.03]">
            <Icon name={mode === "favorites" ? "heart" : "search"} size={24} className="text-white/25" />
          </div>
          <p className="max-w-[360px] text-[13px] leading-relaxed text-white/40">
            {mode === "favorites" ? t("favorites.empty") : t("library.empty")}
          </p>
          {mode === "library" ? (
            <Focusable id="library-empty-reset" className="btn btn-ghost btn-sm" onActivate={resetFilters}>
              <Icon name="refresh" size={14} />
              {t("common.retry")}
            </Focusable>
          ) : (
            <Focusable id="favorites-empty-cta" className="btn btn-soft btn-sm" onActivate={() => setScreen("library")}>
              <Icon name="arrow-right" size={14} />
              {t("nav.library")}
            </Focusable>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 pb-6 xl:gap-5">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              focusId={`${mode}-card-${game.id}`}
              favorite={favoriteSet.has(game.id)}
              fluid
              onPlay={() => void launchGame(game)}
              onDetails={() => openDetails(game.id)}
              onFavorite={() => toggleFavorite(game.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
