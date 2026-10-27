import { api, previewMode } from "../lib/bridge";
import { padBatteryLabel } from "../i18n";
import { cx } from "../lib/utils";
import { useT } from "../lib/useT";
import { useAppStore } from "../store";
import { Focusable } from "../components/Focusable";
import { Icon, type IconName } from "../components/Icon";
import { SectionLabel } from "../components/Row";

function SettingRow({
  id,
  icon,
  title,
  description,
  value,
  accent,
  onClick,
}: {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  value?: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <Focusable id={id} variant="row" className="settings-row" onActivate={onClick} ariaLabel={title}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/50">
        <Icon name={icon} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-white/85">{title}</span>
        <span className="mt-0.5 block text-[11.5px] leading-relaxed text-white/40">{description}</span>
      </span>
      {value && (
        <span className={cx("value-pill max-w-[230px] shrink-0 truncate", accent && "value-pill--accent")}>
          {value}
        </span>
      )}
      <Icon name="chevron-right" size={15} className="shrink-0 text-white/20" />
    </Focusable>
  );
}

export function SettingsScreen() {
  const t = useT();
  const settings = useAppStore((state) => state.settings);
  const system = useAppStore((state) => state.system);
  const pads = useAppStore((state) => state.pads);
  const library = useAppStore((state) => state.library);
  const patchSettings = useAppStore((state) => state.patchSettings);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const redetectBrowsers = useAppStore((state) => state.redetectBrowsers);
  const openModal = useAppStore((state) => state.openModal);
  const openDetails = useAppStore((state) => state.openDetails);
  const removeCustomGame = useAppStore((state) => state.removeCustomGame);
  const language = settings.language;

  const browsers = system?.browsers ?? [];
  const browser = browsers.find((item) => item.path === settings.browserPath) ?? null;
  const browserLabel = browser?.name ?? (settings.browserPath ? settings.browserPath.split(/[\\/]/).pop() : null);

  const cycleBrowser = () => {
    if (browsers.length === 0) {
      openModal({ type: "path" });
      return;
    }
    const options: Array<string | null> = [null, ...browsers.map((item) => item.path)];
    const index = options.indexOf(settings.browserPath);
    patchSettings({ browserPath: options[(index + 1) % options.length] });
  };

  const cycleMode = () => {
    const modes = ["window", "fullscreen", "kiosk"] as const;
    const index = modes.indexOf(settings.launchMode);
    patchSettings({ launchMode: modes[(index + 1) % modes.length] });
  };

  const modeLabel =
    settings.launchMode === "window"
      ? t("settings.mode.window")
      : settings.launchMode === "fullscreen"
        ? t("settings.mode.fullscreen")
        : t("settings.mode.kiosk");

  return (
    <div className="screen-in px-8 pb-12 lg:px-10">
      <div className="mx-auto max-w-[1020px]">
        <section className="mb-8">
          <SectionLabel>{t("settings.group.general")}</SectionLabel>
          <div className="flex flex-col gap-2.5">
            <SettingRow
              id="settings-language"
              icon="sparkles"
              title={t("settings.language")}
              description={t("settings.languageDesc")}
              value={language === "pl" ? "Polski" : "English"}
              accent
              onClick={() => setLanguage(language === "pl" ? "en" : "pl")}
            />
            <SettingRow
              id="settings-motion"
              icon="tv"
              title={t("settings.motion")}
              description={t("settings.motionDesc")}
              value={settings.reduceMotion ? t("common.on") : t("common.off")}
              onClick={() => patchSettings({ reduceMotion: !settings.reduceMotion })}
            />
          </div>
        </section>

        <section className="mb-8">
          <SectionLabel>{t("settings.group.games")}</SectionLabel>
          <div className="flex flex-col gap-2.5">
            <SettingRow
              id="settings-browser"
              icon="monitor"
              title={t("settings.browser")}
              description={t("settings.browserDesc")}
              value={browserLabel ?? t("settings.browserNone")}
              accent={Boolean(browser?.widevine)}
              onClick={cycleBrowser}
            />
            <SettingRow
              id="settings-path"
              icon="search"
              title={t("settings.browserManual")}
              description={t("settings.browserManualDesc")}
              onClick={() => openModal({ type: "path" })}
            />
            <SettingRow
              id="settings-redetect"
              icon="refresh"
              title={t("settings.redetect")}
              description={t("settings.redetectDesc")}
              onClick={() => void redetectBrowsers(true)}
            />
            <SettingRow
              id="settings-mode"
              icon="tv"
              title={t("settings.mode")}
              description={t("settings.modeDesc")}
              value={modeLabel}
              accent
              onClick={cycleMode}
            />
            <SettingRow
              id="settings-hide"
              icon="monitor"
              title={t("settings.hide")}
              description={t("settings.hideDesc")}
              value={settings.hideLauncher ? t("common.on") : t("common.off")}
              onClick={() => patchSettings({ hideLauncher: !settings.hideLauncher })}
            />
            <SettingRow
              id="settings-url"
              icon="external"
              title={t("settings.url")}
              description={t("settings.urlDesc")}
              value={settings.startUrl.replace("https://", "")}
              onClick={() => openModal({ type: "url" })}
            />
            {browsers.length === 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] px-4 py-3.5">
                <Icon name="info" size={15} className="mt-0.5 shrink-0 text-amber-300/80" />
                <p className="text-[11.5px] leading-relaxed text-amber-100/60">{t("settings.installHint")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="mb-8">
          <SectionLabel>{t("settings.group.controller")}</SectionLabel>
          <div className="flex flex-col gap-2.5">
            <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.025] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/50">
                  <Icon name="gamepad" size={17} />
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold text-white/85">{t("settings.pads")}</div>
                  <div className="text-[11.5px] text-white/40">
                    {pads.length === 0 ? t("settings.noPads") : `${pads.length} × connected`}
                  </div>
                </div>
              </div>
              {pads.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {pads.map((pad) => (
                    <div
                      key={pad.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-3.5 py-2.5"
                    >
                      <span className="min-w-0 truncate text-[12px] font-medium text-white/70">{pad.name}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-[10.5px] text-white/35">
                        <Icon name="battery" size={13} />
                        {padBatteryLabel(language, pad.battery)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-start gap-3 rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet/20 bg-violet/10 text-[#c9beff]">
                <Icon name="info" size={16} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-white/80">{t("settings.pair")}</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">{t("settings.pairDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <SectionLabel>{t("settings.group.library")}</SectionLabel>
          <div className="flex flex-col gap-2.5">
            <SettingRow
              id="settings-add-custom"
              icon="plus"
              title={t("settings.custom")}
              description={t("settings.customDesc")}
              onClick={() => openModal({ type: "addGame" })}
            />
            <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-2.5 px-1 text-[10px] font-bold tracking-[0.16em] text-white/25 uppercase">
                {t("settings.customList")}
              </div>
              {library.custom.length === 0 ? (
                <p className="px-1 py-1 text-[11.5px] text-white/30">{t("settings.customEmpty")}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {library.custom.map((game) => (
                    <div key={game.id} className="flex items-center gap-2">
                      <Focusable
                        id={`settings-custom-${game.id}`}
                        variant="row"
                        className="settings-row flex-1 px-3.5 py-3"
                        onActivate={() => openDetails(game.id)}
                        ariaLabel={game.title}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold text-white/80">
                            {game.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[10.5px] text-white/30">
                            {game.url}
                          </span>
                        </span>
                      </Focusable>
                      <Focusable
                        id={`settings-remove-${game.id}`}
                        variant="row"
                        className="settings-row icon-only h-[58px] w-[58px] text-rose-300/70"
                        onActivate={() => removeCustomGame(game.id)}
                        ariaLabel={`${t("common.remove")} ${game.title}`}
                      >
                        <Icon name="close" size={16} />
                      </Focusable>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <SectionLabel>{t("settings.group.info")}</SectionLabel>
          <div className="flex flex-col gap-2.5">
            <SettingRow
              id="settings-onboarding"
              icon="refresh"
              title={t("settings.onboarding")}
              description={t("settings.onboardingDesc")}
              onClick={() => openModal({ type: "onboarding" })}
            />
            <SettingRow
              id="settings-open-luna"
              icon="external"
              title={t("settings.openLuna")}
              description={t("settings.openLunaDesc")}
              onClick={() => void api.openExternal(settings.startUrl)}
            />
            <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-white/75">{t("settings.about")}</span>
                <span className="chip h-6 text-[9.5px]">
                  {t("settings.version")} {system?.appVersion ?? "0.1.0"}
                </span>
              </div>
              <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/35">{t("legal.disclaimer")}</p>
              <dl className="mt-4 flex flex-col gap-2 border-t border-white/[0.06] pt-4 text-[10.5px]">
                <div className="flex gap-3">
                  <dt className="w-[110px] shrink-0 font-semibold tracking-wide text-white/30 uppercase">
                    {t("settings.profile")}
                  </dt>
                  <dd className="min-w-0 break-all text-white/45">{system?.profileDir ?? "—"}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-[110px] shrink-0 font-semibold tracking-wide text-white/30 uppercase">
                    {t("settings.data")}
                  </dt>
                  <dd className="min-w-0 break-all text-white/45">{system?.dataDir ?? "—"}</dd>
                </div>
              </dl>
              {previewMode && (
                <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-400/[0.06] px-3 py-2 text-[10.5px] leading-relaxed text-amber-100/60">
                  {t("common.demoMode")} — {t("toast.demoLaunch")}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
