import { useMemo } from "react";
import { catalog } from "../data/catalog";
import { GameCard, WideCard } from "../components/GameCard";
import { Hero } from "../components/Hero";
import { Row } from "../components/Row";
import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import type { Game, RecentEntry } from "../types";

export function HomeScreen() {
  const library = useAppStore((state) => state.library);
  const launchGame = useAppStore((state) => state.launchGame);
  const openDetails = useAppStore((state) => state.openDetails);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const t = useT();

  const games = useMemo<Game[]>(() => [...library.custom, ...catalog], [library.custom]);
  const gameMap = useMemo(() => new Map(games.map((game) => [game.id, game])), [games]);
  const favoriteSet = useMemo(() => new Set(library.favorites), [library.favorites]);

  const featured = useMemo(() => catalog.find((game) => game.featured) ?? catalog[0], []);

  const recent = useMemo(() => {
    return library.recents
      .slice()
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
      .map((entry) => ({ entry, game: gameMap.get(entry.id) }))
      .filter((item): item is { entry: RecentEntry; game: Game } => Boolean(item.game))
      .slice(0, 10);
  }, [library.recents, gameMap]);

  const recentMap = useMemo(
    () => new Map(library.recents.map((entry) => [entry.id, entry])),
    [library.recents],
  );

  const recommended = useMemo(
    () => catalog.filter((game) => !game.featured && !favoriteSet.has(game.id)).slice(0, 10),
    [favoriteSet],
  );
  const fresh = useMemo(() => catalog.slice().reverse().slice(0, 10), []);

  const favoriteGames = useMemo(
    () =>
      library.favorites
        .map((id) => gameMap.get(id))
        .filter((game): game is Game => Boolean(game))
        .slice(0, 10),
    [library.favorites, gameMap],
  );

  const featuredRecent = recentMap.get(featured.id);

  return (
    <div className="screen-in px-8 pb-12 lg:px-10">
      <Hero
        game={featured}
        favorite={favoriteSet.has(featured.id)}
        playtimeSeconds={featuredRecent?.seconds}
        lastPlayedAt={featuredRecent?.lastPlayedAt}
        onPlay={() => void launchGame(featured)}
        onDetails={() => openDetails(featured.id)}
        onFavorite={() => toggleFavorite(featured.id)}
      />

      {recent.length > 0 && (
        <Row title={t("home.continue")}>
          {recent.map(({ entry, game }) => (
            <WideCard
              key={`recent-${game.id}`}
              game={game}
              focusId={`home-recent-${game.id}`}
              favorite={favoriteSet.has(game.id)}
              seconds={entry.seconds}
              lastPlayedAt={entry.lastPlayedAt}
              onPlay={() => void launchGame(game)}
              onDetails={() => openDetails(game.id)}
              onFavorite={() => toggleFavorite(game.id)}
            />
          ))}
        </Row>
      )}

      {favoriteGames.length > 0 && (
        <Row title={t("home.favorites")}>
          {favoriteGames.map((game) => (
            <GameCard
              key={`fav-${game.id}`}
              game={game}
              focusId={`home-fav-${game.id}`}
              favorite
              onPlay={() => void launchGame(game)}
              onDetails={() => openDetails(game.id)}
              onFavorite={() => toggleFavorite(game.id)}
            />
          ))}
        </Row>
      )}

      <Row title={t("home.recommended")}>
        {recommended.map((game) => (
          <GameCard
            key={`rec-${game.id}`}
            game={game}
            focusId={`home-rec-${game.id}`}
            favorite={favoriteSet.has(game.id)}
            onPlay={() => void launchGame(game)}
            onDetails={() => openDetails(game.id)}
            onFavorite={() => toggleFavorite(game.id)}
          />
        ))}
      </Row>

      <Row title={t("home.fresh")}>
        {fresh.map((game) => (
          <GameCard
            key={`fresh-${game.id}`}
            game={game}
            focusId={`home-fresh-${game.id}`}
            favorite={favoriteSet.has(game.id)}
            onPlay={() => void launchGame(game)}
            onDetails={() => openDetails(game.id)}
            onFavorite={() => toggleFavorite(game.id)}
          />
        ))}
      </Row>
    </div>
  );
}
