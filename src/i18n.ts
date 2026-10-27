import type { Language } from "./types";

const dict = {
  "app.name": { pl: "Luna Client", en: "Luna Client" },
  "app.tagline": { pl: "Twoja biblioteka w chmurze", en: "Your cloud library" },
  "app.version": { pl: "Wersja", en: "Version" },

  "nav.home": { pl: "Start", en: "Home" },
  "nav.library": { pl: "Biblioteka", en: "Library" },
  "nav.favorites": { pl: "Ulubione", en: "Favorites" },
  "nav.settings": { pl: "Ustawienia", en: "Settings" },
  "nav.controller": { pl: "Pad gotowy", en: "Controller ready" },
  "nav.noController": { pl: "Brak pada", en: "No controller" },

  "top.home.title": { pl: "Dobry wieczór", en: "Good evening" },
  "top.home.subtitle": { pl: "Wszystko, w co chcesz zagrać — bez pobierania.", en: "Everything you want to play — no downloads." },
  "top.library.title": { pl: "Biblioteka", en: "Library" },
  "top.library.subtitle": { pl: "Wybierz grę i wskocz do akcji w kilka sekund.", en: "Pick a game and jump in within seconds." },
  "top.favorites.title": { pl: "Ulubione", en: "Favorites" },
  "top.favorites.subtitle": { pl: "Twoje osobiste półki z grami.", en: "Your personal shelves." },
  "top.settings.title": { pl: "Ustawienia", en: "Settings" },
  "top.settings.subtitle": { pl: "Przeglądarka, pad i sposób uruchamiania.", en: "Browser, controller and launch behaviour." },
  "top.live": { pl: "Sesja trwa", en: "Session live" },
  "top.stop": { pl: "Zatrzymaj", en: "Stop" },

  "home.featured": { pl: "Wyróżnione", en: "Featured" },
  "home.continue": { pl: "Kontynuuj grę", en: "Continue playing" },
  "home.recommended": { pl: "Polecane na dziś", en: "Recommended today" },
  "home.fresh": { pl: "Świeże w Lunie", en: "Fresh on Luna" },
  "home.favorites": { pl: "Twoje ulubione", en: "Your favorites" },
  "home.emptyRecents": { pl: "Zagraj pierwszy raz, aby zobaczyć tutaj historię.", en: "Play for the first time to see your history here." },
  "home.play": { pl: "Graj", en: "Play" },
  "home.details": { pl: "Szczegóły", en: "Details" },
  "home.playtime": { pl: "czas gry", en: "playtime" },

  "common.back": { pl: "Wstecz", en: "Back" },
  "common.close": { pl: "Zamknij", en: "Close" },
  "common.cancel": { pl: "Anuluj", en: "Cancel" },
  "common.save": { pl: "Zapisz", en: "Save" },
  "common.add": { pl: "Dodaj", en: "Add" },
  "common.remove": { pl: "Usuń", en: "Remove" },
  "common.skip": { pl: "Pomiń", en: "Skip" },
  "common.next": { pl: "Dalej", en: "Next" },
  "common.finish": { pl: "Gotowe", en: "Done" },
  "common.search": { pl: "Szukaj", en: "Search" },
  "common.all": { pl: "Wszystko", en: "All" },
  "common.on": { pl: "Włączone", en: "On" },
  "common.off": { pl: "Wyłączone", en: "Off" },
  "common.never": { pl: "nigdy", en: "never" },
  "common.minShort": { pl: "min", en: "min" },
  "common.hourShort": { pl: "godz.", en: "h" },
  "common.demoMode": { pl: "Tryb podglądu", en: "Preview mode" },
  "common.retry": { pl: "Spróbuj ponownie", en: "Try again" },
  "common.browse": { pl: "Przeglądaj", en: "Browse" },

  "library.search": { pl: "Szukaj gry…", en: "Search games…" },
  "library.empty": { pl: "Nic tu nie pasuje. Zmień filtr lub wyszukaj inną grę.", en: "Nothing matches. Change the filter or search for another game." },
  "library.sort": { pl: "Sortowanie", en: "Sorting" },
  "library.sortFeatured": { pl: "Polecane", en: "Featured" },
  "library.sortAz": { pl: "A–Z", en: "A–Z" },
  "library.count": { pl: "{count} gier", en: "{count} games" },

  "favorites.empty": { pl: "Nie masz jeszcze ulubionych. Wciśnij X na padzie lub F na klawiaturze.", en: "No favorites yet. Press X on the pad or F on the keyboard." },

  "details.about": { pl: "O grze", en: "About" },
  "details.players": { pl: "Gracze", en: "Players" },
  "details.studio": { pl: "Studio", en: "Studio" },
  "details.year": { pl: "Rok", en: "Year" },
  "details.playtime": { pl: "Czas gry", en: "Playtime" },
  "details.lastPlayed": { pl: "Ostatnio grane", en: "Last played" },
  "details.openInLuna": { pl: "Otwórz w Lunie", en: "Open in Luna" },
  "details.favorite": { pl: "Ulubione", en: "Favorite" },
  "details.unfavorite": { pl: "Usuń z ulubionych", en: "Remove favorite" },
  "details.custom": { pl: "Własna gra", en: "Custom game" },
  "details.play": { pl: "Zagraj teraz", en: "Play now" },

  "settings.language": { pl: "Język", en: "Language" },
  "settings.languageDesc": { pl: "Język interfejsu launchera.", en: "Launcher interface language." },
  "settings.group.general": { pl: "Ogólne", en: "General" },
  "settings.group.games": { pl: "Gry i uruchamianie", en: "Games and launching" },
  "settings.group.controller": { pl: "Sterowanie", en: "Controls" },
  "settings.group.library": { pl: "Biblioteka", en: "Library" },
  "settings.group.info": { pl: "Informacje", en: "About" },
  "settings.browserManual": { pl: "Wskaż plik ręcznie", en: "Choose executable" },
  "settings.browserManualDesc": { pl: "Gdy autodetekcja nie znajdzie Chrome lub Edge.", en: "When detection cannot find Chrome or Edge." },
  "settings.browser": { pl: "Przeglądarka do gier", en: "Game browser" },
  "settings.browserDesc": { pl: "Luna działa w Chrome lub Edge — tylko one mają Widevine.", en: "Luna runs in Chrome or Edge — only they ship Widevine." },
  "settings.browserNone": { pl: "Nie wykryto przeglądarki", en: "No browser detected" },
  "settings.browserWidevine": { pl: "Widevine gotowy", en: "Widevine ready" },
  "settings.browserNoWidevine": { pl: "Brak Widevine", en: "No Widevine" },
  "settings.redetect": { pl: "Wykryj ponownie", en: "Detect again" },
  "settings.redetectDesc": { pl: "Odśwież listę zainstalowanych przeglądarek.", en: "Refresh the list of installed browsers." },
  "settings.installHint": { pl: "Zainstaluj Google Chrome, aby mieć pewność, że DRM zadziała.", en: "Install Google Chrome to be sure DRM works." },
  "settings.mode": { pl: "Tryb uruchamiania", en: "Launch mode" },
  "settings.modeDesc": { pl: "Jak ma otwierać się okno gry.", en: "How the game window should open." },
  "settings.mode.window": { pl: "Okno", en: "Window" },
  "settings.mode.fullscreen": { pl: "Pełny ekran", en: "Fullscreen" },
  "settings.mode.kiosk": { pl: "Kiosk TV", en: "TV kiosk" },
  "settings.hide": { pl: "Ukryj launcher podczas gry", en: "Hide launcher while playing" },
  "settings.hideDesc": { pl: "Launcher wraca automatycznie po zamknięciu okna gry.", en: "The launcher returns automatically when the game window closes." },
  "settings.url": { pl: "Adres startowy Luny", en: "Luna start URL" },
  "settings.urlDesc": { pl: "Dokąd prowadzi przycisk „Graj”, gdy gra nie ma własnego adresu.", en: "Where Play leads when a game has no direct URL." },
  "settings.motion": { pl: "Oszczędzaj animacje", en: "Reduce motion" },
  "settings.motionDesc": { pl: "Wyłącza tła i przejścia dla spokojniejszego obrazu.", en: "Turns off ambient motion and transitions." },
  "settings.controller": { pl: "Sterowanie padem", en: "Controller input" },
  "settings.controllerDesc": { pl: "Pady wykrywane są natywnie, także po podłączeniu w trakcie.", en: "Controllers are detected natively, including hot-plug." },
  "settings.pads": { pl: "Podłączone pady", en: "Connected pads" },
  "settings.noPads": { pl: "Nie wykryto pada — podłącz go przez USB lub Bluetooth.", en: "No pad detected — connect it via USB or Bluetooth." },
  "settings.pair": { pl: "Parowanie pada Luna", en: "Pairing the Luna Controller" },
  "settings.pairDesc": { pl: "Przytrzymaj parowanie na padzie, dodaj go w ustawieniach Bluetooth systemu, a potem otwórz stronę parowania Luny w przeglądarce.", en: "Hold pairing on the pad, add it in your OS Bluetooth settings, then open Luna's pairing page in the browser." },
  "settings.custom": { pl: "Dodaj własną grę", en: "Add a custom game" },
  "settings.customDesc": { pl: "Wklej adres gry lub dowolnej strony Luny.", en: "Paste a game URL or any Luna page." },
  "settings.customList": { pl: "Własne gry", en: "Custom games" },
  "settings.customEmpty": { pl: "Brak własnych gier.", en: "No custom games." },
  "settings.about": { pl: "O aplikacji", en: "About" },
  "settings.aboutDesc": { pl: "Nieoficjalny launcher. Nie jest powiązany z Amazon. Amazon Luna i nazwy gier należą do ich właścicieli.", en: "Unofficial launcher. Not affiliated with Amazon. Amazon Luna and game names belong to their owners." },
  "settings.version": { pl: "Wersja", en: "Version" },
  "settings.profile": { pl: "Profil gracza", en: "Player profile" },
  "settings.data": { pl: "Dane aplikacji", en: "App data" },
  "settings.onboarding": { pl: "Kreator konfiguracji", en: "Setup wizard" },
  "settings.onboardingDesc": { pl: "Uruchom ponownie wybór przeglądarki, pada i języka.", en: "Re-run browser, controller and language setup." },
  "settings.openLuna": { pl: "Otwórz Lunę w przeglądarce", en: "Open Luna in the browser" },
  "settings.openLunaDesc": { pl: "Przydatne, gdy chcesz zalogować się poza launcherem.", en: "Useful when you want to sign in outside the launcher." },
  "settings.removeCustom": { pl: "Usuń", en: "Remove" },
  "settings.urlTitle": { pl: "Adres startowy", en: "Start URL" },
  "settings.urlInvalid": { pl: "Podaj poprawny adres https://", en: "Enter a valid https:// URL" },
  "settings.pathTitle": { pl: "Ścieżka do przeglądarki", en: "Browser executable" },
  "settings.pathPlaceholder": { pl: "/usr/bin/google-chrome-stable", en: "/usr/bin/google-chrome-stable" },
  "settings.pathInvalid": { pl: "Nie znaleziono pliku wykonywalnego.", en: "Executable not found." },
  "settings.saved": { pl: "Ustawienia zapisane", en: "Settings saved" },

  "onboarding.step": { pl: "Krok {current} z {total}", en: "Step {current} of {total}" },
  "onboarding.brand.title": { pl: "Graj w chmurze. Bez konsoli.", en: "Play in the cloud. No console." },
  "onboarding.brand.body": { pl: "Twoja biblioteka, pad i telewizor. Resztą zajmuje się streaming — gra startuje w kilka sekund.", en: "Your library, a controller and a TV. Streaming takes care of the rest — games start in seconds." },
  "onboarding.brand.note": { pl: "4K · HDR · 60 FPS", en: "4K · HDR · 60 FPS" },
  "onboarding.ready.none": { pl: "Nie wybrano", en: "Not selected" },
  "onboarding.welcome.title": { pl: "Witaj w Luna Client", en: "Welcome to Luna Client" },
  "onboarding.welcome.body": { pl: "Launcher do gier w chmurze Amazon Luna, stworzony pod telewizor i pada. Bez pobierania, bez konsoli.", en: "A launcher for Amazon Luna cloud gaming, built for a TV and a controller. No downloads, no console." },
  "onboarding.welcome.f1": { pl: "Graj od razu", en: "Play instantly" },
  "onboarding.welcome.f1d": { pl: "Gry startują w kilka sekund w Chrome z Widevine.", en: "Games start in seconds in Chrome with Widevine." },
  "onboarding.welcome.f2": { pl: "Pad przede wszystkim", en: "Controller first" },
  "onboarding.welcome.f2d": { pl: "Nawigacja po interfejsie bez wyciągania klawiatury.", en: "Navigate the whole UI without reaching for a keyboard." },
  "onboarding.welcome.f3": { pl: "Twoja biblioteka", en: "Your library" },
  "onboarding.welcome.f3d": { pl: "Ulubione, historia i czas gry zapisane lokalnie.", en: "Favorites, history and playtime stored locally." },
  "onboarding.start": { pl: "Zaczynamy", en: "Let's start" },
  "onboarding.browser.title": { pl: "Wybierz przeglądarkę", en: "Pick a browser" },
  "onboarding.browser.body": { pl: "Streaming Luny wymaga Widevine. Wybierz Chrome lub Edge — launcher zapamięta wybór.", en: "Luna streaming needs Widevine. Pick Chrome or Edge — the launcher remembers your choice." },
  "onboarding.browser.none": { pl: "Nie znaleziono Chrome ani Edge. Zainstaluj Google Chrome i wróć tutaj.", en: "Chrome or Edge was not found. Install Google Chrome and come back." },
  "onboarding.browser.install": { pl: "Pobierz Google Chrome", en: "Download Google Chrome" },
  "onboarding.browser.detected": { pl: "Wykryte przeglądarki", en: "Detected browsers" },
  "onboarding.browser.manual": { pl: "Wskaż ręcznie", en: "Choose manually" },
  "onboarding.browser.recommended": { pl: "Zalecana", en: "Recommended" },
  "onboarding.pad.title": { pl: "Podłącz pad", en: "Connect a controller" },
  "onboarding.pad.body": { pl: "Podłącz pad przez USB lub Bluetooth. Możesz też używać klawiatury: strzałki, Enter i Esc.", en: "Connect a pad over USB or Bluetooth. You can also use the keyboard: arrows, Enter and Esc." },
  "onboarding.pad.none": { pl: "Nie widzę jeszcze żadnego pada. To nie problem — możesz podłączyć go później.", en: "No pad yet. No problem — you can connect one later." },
  "onboarding.pad.hint": { pl: "Pad Luna: przytrzymaj przycisk parowania, aż dioda zacznie migać, i dodaj urządzenie w Bluetooth systemu.", en: "Luna Controller: hold the pairing button until the light blinks, then add it in your OS Bluetooth settings." },
  "onboarding.prefs.title": { pl: "Język i ekran", en: "Language and screen" },
  "onboarding.prefs.body": { pl: "Dostosuj launcher do swojego telewizora lub monitora.", en: "Tune the launcher for your TV or monitor." },
  "onboarding.prefs.mode": { pl: "Sposób otwierania gry", en: "How games open" },
  "onboarding.prefs.lang": { pl: "Język interfejsu", en: "Interface language" },
  "onboarding.prefs.hide": { pl: "Ukrywaj launcher w trakcie gry", en: "Hide launcher while playing" },
  "onboarding.ready.title": { pl: "Wszystko gotowe", en: "All set" },
  "onboarding.ready.body": { pl: "Możesz zaczynać. Gry otwierają się w osobnym oknie przeglądarki z Twoim profilem Luny.", en: "You are ready. Games open in a separate browser window using your Luna profile." },
  "onboarding.ready.open": { pl: "Otwórz launcher", en: "Open the launcher" },
  "onboarding.ready.browser": { pl: "Przeglądarka", en: "Browser" },
  "onboarding.ready.mode": { pl: "Tryb", en: "Mode" },
  "onboarding.ready.pad": { pl: "Pad", en: "Controller" },

  "hints.select": { pl: "Wybierz", en: "Select" },
  "hints.back": { pl: "Wstecz", en: "Back" },
  "hints.favorite": { pl: "Ulubione", en: "Favorite" },
  "hints.details": { pl: "Szczegóły", en: "Details" },
  "hints.tabs": { pl: "Zakładki", en: "Tabs" },
  "hints.menu": { pl: "Menu", en: "Menu" },
  "hints.search": { pl: "Szukaj", en: "Search" },
  "hints.help": { pl: "Pomoc", en: "Help" },
  "hints.keyboard": { pl: "Klawiatura", en: "Keyboard" },

  "toast.launching": { pl: "Uruchamianie Luny…", en: "Launching Luna…" },
  "toast.launchError": { pl: "Nie udało się uruchomić gry", en: "Could not launch the game" },
  "toast.noBrowser": { pl: "Najpierw wybierz przeglądarkę w ustawieniach.", en: "Pick a browser in settings first." },
  "toast.favoriteAdded": { pl: "Dodano do ulubionych", en: "Added to favorites" },
  "toast.favoriteRemoved": { pl: "Usunięto z ulubionych", en: "Removed from favorites" },
  "toast.sessionEnded": { pl: "Sesja zakończona — {time}", en: "Session ended — {time}" },
  "toast.stopped": { pl: "Sesja zatrzymana", en: "Session stopped" },
  "toast.customAdded": { pl: "Dodano grę", en: "Game added" },
  "toast.customRemoved": { pl: "Usunięto grę", en: "Game removed" },
  "toast.invalidUrl": { pl: "Adres musi zaczynać się od https://", en: "URL must start with https://" },
  "toast.demoLaunch": { pl: "Tryb podglądu: gra otworzyłaby się w Chrome.", en: "Preview mode: the game would open in Chrome." },
  "toast.saved": { pl: "Zapisano", en: "Saved" },
  "toast.padConnected": { pl: "Podłączono pad: {name}", en: "Controller connected: {name}" },
  "toast.padDisconnected": { pl: "Odłączono pad", en: "Controller disconnected" },
  "toast.error": { pl: "Coś poszło nie tak", en: "Something went wrong" },

  "pad.battery": { pl: "Bateria", en: "Battery" },
  "pad.wired": { pl: "Przewodowo", en: "Wired" },
  "pad.full": { pl: "Pełna", en: "Full" },
  "pad.high": { pl: "Wysoka", en: "High" },
  "pad.medium": { pl: "Średnia", en: "Medium" },
  "pad.low": { pl: "Niska", en: "Low" },
  "pad.empty": { pl: "Pusta", en: "Empty" },
  "pad.unknown": { pl: "Nieznana", en: "Unknown" },

  "time.now": { pl: "teraz", en: "just now" },
  "time.minAgo": { pl: "{count} min temu", en: "{count} min ago" },
  "time.hoursAgo": { pl: "{count} godz. temu", en: "{count} h ago" },
  "time.daysAgo": { pl: "{count} dni temu", en: "{count} days ago" },
  "time.never": { pl: "nigdy", en: "never" },

  "genre.action": { pl: "Akcja", en: "Action" },
  "genre.adventure": { pl: "Przygoda", en: "Adventure" },
  "genre.racing": { pl: "Wyścigi", en: "Racing" },
  "genre.sports": { pl: "Sport", en: "Sports" },
  "genre.family": { pl: "Rodzinna", en: "Family" },
  "genre.rpg": { pl: "RPG", en: "RPG" },
  "genre.horror": { pl: "Horror", en: "Horror" },
  "genre.fighting": { pl: "Bijatyka", en: "Fighting" },
  "genre.party": { pl: "Imprezowa", en: "Party" },

  "tag.4k": { pl: "4K", en: "4K" },
  "tag.hdr": { pl: "HDR", en: "HDR" },
  "tag.rt": { pl: "Ray tracing", en: "Ray tracing" },
  "tag.coop": { pl: "Co-op", en: "Co-op" },
  "tag.online": { pl: "Online", en: "Online" },
  "tag.single": { pl: "Single player", en: "Single player" },
  "tag.60fps": { pl: "60 FPS", en: "60 FPS" },
  "tag.crossplay": { pl: "Crossplay", en: "Crossplay" },
  "tag.party": { pl: "Impreza", en: "Party" },

  "modal.addGame.title": { pl: "Dodaj własną grę", en: "Add a custom game" },
  "modal.addGame.name": { pl: "Tytuł", en: "Title" },
  "modal.addGame.url": { pl: "Adres https://", en: "https:// URL" },
  "modal.addGame.namePlaceholder": { pl: "np. Moja gra", en: "e.g. My game" },
  "modal.addGame.urlPlaceholder": { pl: "https://luna.amazon.com/…", en: "https://luna.amazon.com/…" },
  "modal.addGame.hint": { pl: "Możesz wkleić adres konkretnej gry lub dowolnej strony Luny.", en: "Paste a specific game URL or any Luna page." },
  "modal.addGame.nameRequired": { pl: "Podaj tytuł.", en: "Enter a title." },
  "modal.url.title": { pl: "Adres startowy Luny", en: "Luna start URL" },
  "modal.url.body": { pl: "Ten adres otworzy się, gdy gra nie ma własnego linku.", en: "This URL opens when a game has no direct link." },
  "modal.path.title": { pl: "Wskaż przeglądarkę", en: "Choose a browser" },
  "modal.path.body": { pl: "Podaj pełną ścieżkę do pliku wykonywalnego Chrome lub Edge.", en: "Enter the full path to the Chrome or Edge executable." },
  "modal.onboarding.title": { pl: "Uruchomić kreator ponownie?", en: "Run the setup wizard again?" },
  "modal.onboarding.body": { pl: "Przejdziesz przez wybór przeglądarki, pada i języka od nowa.", en: "You will go through browser, controller and language setup again." },

  "search.shortcut": { pl: "/", en: "/" },

  "legal.disclaimer": {
    pl: "Projekt nieoficjalny, niezwiązany z Amazon. Amazon Luna jest znakiem towarowym Amazon.com, Inc. Katalog gier jest przykładowy i może się różnić od aktualnej oferty.",
    en: "Unofficial project, not affiliated with Amazon. Amazon Luna is a trademark of Amazon.com, Inc. The game catalog is a sample and may differ from the current lineup.",
  },
} as const;

export type TKey = keyof typeof dict;

export function translate(language: Language, key: TKey, vars?: Record<string, string | number>): string {
  const entry = dict[key];
  let value: string = entry[language] ?? entry.pl;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}

export function genreLabel(language: Language, genre: string): string {
  const key = `genre.${genre}` as TKey;
  return key in dict ? translate(language, key) : genre;
}

export function tagLabel(language: Language, tag: string): string {
  const key = `tag.${tag}` as TKey;
  return key in dict ? translate(language, key) : tag.toUpperCase();
}

export function playersLabel(language: Language, players?: string): string {
  const value = (players ?? "").trim();
  if (!value) return "—";
  if (value.toLowerCase() === "online") return "Online";
  const numeric = value.replace(/[^0-9–-]/g, "");
  if (!numeric) return value;
  if (/^\d+$/.test(numeric)) {
    const count = Number(numeric);
    if (language === "pl") return `${count} ${count === 1 ? "gracz" : "graczy"}`;
    return `${count} ${count === 1 ? "player" : "players"}`;
  }
  return language === "pl" ? `${numeric} graczy` : `${numeric} players`;
}

export function padBatteryLabel(language: Language, battery: string): string {
  const key = `pad.${battery}` as TKey;
  return key in dict ? translate(language, key) : battery;
}
