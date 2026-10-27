import { useEffect, useMemo, useState } from "react";
import { Focusable } from "../components/Focusable";
import { Icon } from "../components/Icon";
import { Logo, LogoWordmark } from "../components/Logo";
import { useFocus } from "../focus/FocusProvider";
import { api, previewMode } from "../lib/bridge";
import { useT } from "../lib/useT";
import { cx } from "../lib/utils";
import { useAppStore } from "../store";

const TOTAL_STEPS = 5;

export function Onboarding() {
  const showOnboarding = useAppStore((state) => state.showOnboarding);
  const settings = useAppStore((state) => state.settings);
  const system = useAppStore((state) => state.system);
  const pads = useAppStore((state) => state.pads);
  const patchSettings = useAppStore((state) => state.patchSettings);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const finishOnboarding = useAppStore((state) => state.finishOnboarding);
  const redetectBrowsers = useAppStore((state) => state.redetectBrowsers);
  const t = useT();
  const language = settings.language;
  const { focus, focusFirst } = useFocus();

  const [step, setStep] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(settings.browserPath);
  const [manualPath, setManualPath] = useState("");
  const [pathError, setPathError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const browsers = system?.browsers ?? [];
  const selectedBrowser = browsers.find((browser) => browser.path === selectedPath) ?? null;

  useEffect(() => {
    if (!showOnboarding) return;
    const handler = () => setStep((current) => Math.max(0, current - 1));
    window.addEventListener("luna:onboarding-back", handler);
    return () => window.removeEventListener("luna:onboarding-back", handler);
  }, [showOnboarding]);

  useEffect(() => {
    if (!selectedPath && browsers.length > 0) {
      const best = browsers.find((browser) => browser.recommended) ?? browsers[0];
      setSelectedPath(best.path);
    }
  }, [browsers, selectedPath]);

  useEffect(() => {
    if (!showOnboarding) return;
    const timer = window.setTimeout(() => {
      const primaryOnly = step === 0 || step === 2 || step === 4;
      if (primaryOnly) {
        if (!focus(`onb-s${step}-next`)) focusFirst(`onb-s${step}-`);
      } else {
        focusFirst(`onb-s${step}-`);
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [step, showOnboarding, focus, focusFirst]);

  const goNext = () => {
    if (step === 1 && selectedPath) {
      patchSettings({ browserPath: selectedPath });
    }
    if (step >= TOTAL_STEPS - 1) {
      finishOnboarding();
      setStep(0);
      return;
    }
    setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1));
  };

  const goBack = () => setStep((current) => Math.max(0, current - 1));

  const applyManual = async () => {
    if (!manualPath.trim()) return;
    setChecking(true);
    try {
      const browser = await api.checkBrowser(manualPath.trim());
      if (!browser) {
        setPathError(t("settings.pathInvalid"));
        return;
      }
      setSelectedPath(browser.path);
      setPathError(null);
    } catch {
      setPathError(t("settings.pathInvalid"));
    } finally {
      setChecking(false);
    }
  };

  const modeLabel =
    settings.launchMode === "window"
      ? t("settings.mode.window")
      : settings.launchMode === "fullscreen"
        ? t("settings.mode.fullscreen")
        : t("settings.mode.kiosk");

  const summaryBrowser = useMemo(() => {
    if (selectedBrowser) return selectedBrowser.name;
    if (selectedPath) return selectedPath.split(/[\\/]/).pop() ?? selectedPath;
    return t("onboarding.ready.none");
  }, [selectedBrowser, selectedPath, t]);

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#05070d] fade-in">
      <aside className="relative hidden w-[41%] flex-col justify-between overflow-hidden border-r border-white/[0.06] p-10 xl:flex">
        <div className="absolute inset-0">
          <div className="blob blob-a" style={{ opacity: 0.55 }} />
          <div className="blob blob-b" style={{ opacity: 0.4 }} />
          <div className="grid-lines" />
        </div>

        <div className="relative z-10">
          <LogoWordmark />
        </div>

        <div className="relative z-10">
          <div className="relative mb-10 flex h-[230px] w-[230px] items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-violet/20" />
            <span className="absolute inset-6 rounded-full border border-white/[0.07]" />
            <span className="absolute inset-12 rounded-full border border-cyan/15" />
            <span className="absolute inset-0 rounded-full border border-dashed border-white/10 spin-slow" />
            <span className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_18px_#22d3ee]" />
            <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-violet shadow-[0_0_14px_#7c5cff]" />
            <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl">
              <Logo size={62} />
            </div>
          </div>

          <h2 className="font-display max-w-[360px] text-[38px] leading-[1.02] font-semibold tracking-[-0.03em] text-white">
            {t("onboarding.brand.title")}
          </h2>
          <p className="mt-4 max-w-[330px] text-[13px] leading-relaxed text-white/40">
            {t("onboarding.brand.body")}
          </p>
          <div className="mt-6 flex items-center gap-2">
            {["4K", "HDR", "60 FPS"].map((item) => (
              <span key={item} className="chip h-7 text-[9.5px]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-[360px] text-[9.5px] leading-relaxed text-white/20">
          {t("legal.disclaimer")}
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-8 pt-7 lg:px-12">
          <div className="flex items-center gap-2.5 lg:hidden">
            <Logo size={28} />
            <span className="font-display text-[15px] font-semibold">Luna Client</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {previewMode && <span className="preview-chip chip h-7 text-[9px]">{t("common.demoMode")}</span>}
            <span className="text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
              {t("onboarding.step", { current: step + 1, total: TOTAL_STEPS })}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <span
                  key={index}
                  data-active={index === step}
                  className="progress-dot w-4"
                  style={{ width: index === step ? 26 : 10 }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="no-scrollbar flex min-h-0 flex-1 items-center overflow-y-auto px-8 py-8 lg:px-12">
          <div className="mx-auto w-full max-w-[640px]">
            {step === 0 && (
              <div className="screen-in">
                <span className="chip chip-accent mb-5">
                  <Icon name="sparkles" size={12} />
                  Amazon Luna
                </span>
                <h1 className="font-display text-[clamp(32px,4vw,46px)] leading-[1.02] font-semibold tracking-[-0.035em]">
                  {t("onboarding.welcome.title")}
                </h1>
                <p className="mt-3 max-w-[520px] text-[13.5px] leading-relaxed text-white/45">
                  {t("onboarding.welcome.body")}
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {[
                    { icon: "monitor" as const, title: t("onboarding.welcome.f1"), body: t("onboarding.welcome.f1d") },
                    { icon: "gamepad" as const, title: t("onboarding.welcome.f2"), body: t("onboarding.welcome.f2d") },
                    { icon: "library" as const, title: t("onboarding.welcome.f3"), body: t("onboarding.welcome.f3d") },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet/20 bg-violet/10 text-[#c9beff]">
                        <Icon name={feature.icon} size={17} />
                      </span>
                      <div>
                        <div className="text-[12.5px] font-semibold text-white/80">{feature.title}</div>
                        <div className="mt-0.5 text-[11.5px] leading-relaxed text-white/35">{feature.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="screen-in">
                <h1 className="font-display text-[clamp(28px,3.4vw,38px)] leading-[1.05] font-semibold tracking-[-0.03em]">
                  {t("onboarding.browser.title")}
                </h1>
                <p className="mt-2.5 max-w-[540px] text-[13px] leading-relaxed text-white/45">
                  {t("onboarding.browser.body")}
                </p>

                <div className="mt-6 flex flex-col gap-2.5">
                  {browsers.map((browser, index) => {
                    const selected = browser.path === selectedPath;
                    return (
                      <Focusable
                        key={browser.path}
                        id={`onb-s1-browser-${index}`}
                        className={cx(
                          "flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left",
                          selected
                            ? "border-violet/50 bg-violet/[0.12]"
                            : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.045]",
                        )}
                        onActivate={() => setSelectedPath(browser.path)}
                        ariaLabel={browser.name}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-white/60">
                          <Icon name="monitor" size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-white/85">{browser.name}</span>
                            {browser.recommended && (
                              <span className="chip chip-accent h-5 px-2 text-[8.5px] tracking-[0.1em]">
                                {t("onboarding.browser.recommended")}
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block truncate text-[10.5px] text-white/30">{browser.path}</span>
                        </span>
                        <span
                          className={cx(
                            "chip h-6 shrink-0 px-2 text-[8.5px]",
                            browser.widevine ? "chip-ok" : "chip-warn",
                          )}
                        >
                          {browser.widevine ? "Widevine" : "No DRM"}
                        </span>
                        <span
                          className={cx(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                            selected ? "border-violet bg-violet text-white" : "border-white/20 text-transparent",
                          )}
                        >
                          <Icon name="check" size={11} />
                        </span>
                      </Focusable>
                    );
                  })}

                  {browsers.length === 0 && (
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <Icon name="info" size={16} className="mt-0.5 shrink-0 text-amber-300/80" />
                        <div>
                          <p className="text-[12px] leading-relaxed text-amber-100/70">
                            {t("onboarding.browser.none")}
                          </p>
                          <Focusable
                            id="onb-s1-install"
                            className="btn btn-ghost btn-sm mt-3"
                            onActivate={() => void api.openExternal("https://www.google.com/chrome/")}
                          >
                            <Icon name="external" size={13} />
                            {t("onboarding.browser.install")}
                          </Focusable>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <div className="search-field flex h-10 min-w-[220px] flex-1 items-center gap-2 px-3">
                    <Icon name="monitor" size={14} className="shrink-0 text-white/30" />
                    <input
                      value={manualPath}
                      onChange={(event) => {
                        setManualPath(event.target.value);
                        setPathError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void applyManual();
                      }}
                      placeholder={t("settings.pathPlaceholder")}
                      aria-label={t("onboarding.browser.manual")}
                      className="h-full w-full bg-transparent text-[11.5px] font-medium text-white placeholder:text-white/25"
                    />
                  </div>
                  <Focusable
                    id="onb-s1-manual"
                    className="btn btn-ghost btn-sm"
                    onActivate={() => void applyManual()}
                    disabled={!manualPath.trim() || checking}
                  >
                    <Icon name="plus" size={13} />
                    {checking ? "…" : t("onboarding.browser.manual")}
                  </Focusable>
                  <Focusable
                    id="onb-s1-redetect"
                    className="btn btn-ghost btn-sm"
                    onActivate={() => void redetectBrowsers(true)}
                  >
                    <Icon name="refresh" size={13} />
                    {t("settings.redetect")}
                  </Focusable>
                </div>
                {pathError && <p className="mt-2 text-[11px] text-rose-300">{pathError}</p>}
              </div>
            )}

            {step === 2 && (
              <div className="screen-in">
                <h1 className="font-display text-[clamp(28px,3.4vw,38px)] leading-[1.05] font-semibold tracking-[-0.03em]">
                  {t("onboarding.pad.title")}
                </h1>
                <p className="mt-2.5 max-w-[540px] text-[13px] leading-relaxed text-white/45">
                  {t("onboarding.pad.body")}
                </p>

                <div className="mt-7 flex items-center gap-6">
                  <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.04]">
                    <span className="absolute inset-0 rounded-[30px] border border-dashed border-white/10 spin-slow" />
                    <Icon name="gamepad" size={52} className={pads.length ? "text-emerald-300" : "text-white/30"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold tracking-[0.18em] text-white/25 uppercase">
                      {t("settings.pads")}
                    </div>
                    {pads.length === 0 ? (
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/40">{t("onboarding.pad.none")}</p>
                    ) : (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {pads.map((pad) => (
                          <div key={pad.id} className="flex items-center gap-2 text-[12px] text-white/70">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="truncate">{pad.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet/20 bg-violet/10 text-[#c9beff]">
                    <Icon name="info" size={16} />
                  </span>
                  <div>
                    <div className="text-[12.5px] font-semibold text-white/80">{t("settings.pair")}</div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">{t("onboarding.pad.hint")}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { glyph: "A", label: t("hints.select") },
                    { glyph: "B", label: t("hints.back") },
                    { glyph: "X", label: t("hints.favorite") },
                    { glyph: "Y", label: t("hints.details") },
                  ].map((item) => (
                    <div
                      key={item.glyph}
                      className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] py-1.5 pr-3 pl-2"
                    >
                      <span className="hint-glyph hint-glyph--pad">{item.glyph}</span>
                      <span className="text-[10.5px] text-white/40">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="screen-in">
                <h1 className="font-display text-[clamp(28px,3.4vw,38px)] leading-[1.05] font-semibold tracking-[-0.03em]">
                  {t("onboarding.prefs.title")}
                </h1>
                <p className="mt-2.5 max-w-[540px] text-[13px] leading-relaxed text-white/45">
                  {t("onboarding.prefs.body")}
                </p>

                <div className="mt-7">
                  <div className="mb-2.5 text-[10px] font-bold tracking-[0.18em] text-white/25 uppercase">
                    {t("onboarding.prefs.lang")}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { code: "pl" as const, label: "Polski", sub: "PL" },
                      { code: "en" as const, label: "English", sub: "EN" },
                    ].map((item) => {
                      const active = language === item.code;
                      return (
                        <Focusable
                          key={item.code}
                          id={`onb-s3-lang-${item.code}`}
                          className={cx(
                            "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left",
                            active ? "border-violet/50 bg-violet/[0.12]" : "border-white/[0.07] bg-white/[0.025]",
                          )}
                          onActivate={() => setLanguage(item.code)}
                          ariaLabel={item.label}
                        >
                          <span
                            className={cx(
                              "flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold",
                              active ? "bg-violet text-white" : "bg-white/[0.06] text-white/40",
                            )}
                          >
                            {item.sub}
                          </span>
                          <span className="text-[13px] font-semibold text-white/80">{item.label}</span>
                        </Focusable>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2.5 text-[10px] font-bold tracking-[0.18em] text-white/25 uppercase">
                    {t("onboarding.prefs.mode")}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { value: "window" as const, icon: "monitor" as const, label: t("settings.mode.window") },
                      { value: "fullscreen" as const, icon: "tv" as const, label: t("settings.mode.fullscreen") },
                      { value: "kiosk" as const, icon: "grid" as const, label: t("settings.mode.kiosk") },
                    ].map((item) => {
                      const active = settings.launchMode === item.value;
                      return (
                        <Focusable
                          key={item.value}
                          id={`onb-s3-mode-${item.value}`}
                          className={cx(
                            "flex flex-col items-start gap-2 rounded-2xl border px-3.5 py-3.5",
                            active ? "border-violet/50 bg-violet/[0.12]" : "border-white/[0.07] bg-white/[0.025]",
                          )}
                          onActivate={() => patchSettings({ launchMode: item.value })}
                          ariaLabel={item.label}
                        >
                          <Icon name={item.icon} size={17} className={active ? "text-[#c9beff]" : "text-white/35"} />
                          <span className="text-[11.5px] font-semibold text-white/75">{item.label}</span>
                        </Focusable>
                      );
                    })}
                  </div>
                </div>

                <Focusable
                  id="onb-s3-hide"
                  variant="row"
                  className="settings-row mt-6"
                  onActivate={() => patchSettings({ hideLauncher: !settings.hideLauncher })}
                >
                  <Icon name="monitor" size={17} className="text-white/45" />
                  <span className="flex-1 text-[12.5px] font-semibold text-white/80">
                    {t("onboarding.prefs.hide")}
                  </span>
                  <span className={cx("value-pill", settings.hideLauncher && "value-pill--accent")}>
                    {settings.hideLauncher ? t("common.on") : t("common.off")}
                  </span>
                </Focusable>
              </div>
            )}

            {step === 4 && (
              <div className="screen-in">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
                  <Icon name="check" size={24} />
                </div>
                <h1 className="font-display text-[clamp(28px,3.4vw,38px)] leading-[1.05] font-semibold tracking-[-0.03em]">
                  {t("onboarding.ready.title")}
                </h1>
                <p className="mt-2.5 max-w-[540px] text-[13px] leading-relaxed text-white/45">
                  {t("onboarding.ready.body")}
                </p>

                <div className="mt-7 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                  {[
                    { label: t("onboarding.ready.browser"), value: summaryBrowser, icon: "monitor" as const },
                    { label: t("onboarding.ready.mode"), value: modeLabel, icon: "tv" as const },
                    {
                      label: t("onboarding.ready.pad"),
                      value: pads.length > 0 ? pads[0].name : t("nav.noController"),
                      icon: "gamepad" as const,
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3 px-4 py-3.5">
                      <Icon name={row.icon} size={16} className="shrink-0 text-white/30" />
                      <span className="w-[110px] shrink-0 text-[10px] font-bold tracking-[0.14em] text-white/25 uppercase">
                        {row.label}
                      </span>
                      <span className="min-w-0 truncate text-[12px] font-semibold text-white/75">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-violet/20 bg-violet/[0.06] p-4">
                  <Icon name="info" size={15} className="mt-0.5 shrink-0 text-[#c9beff]" />
                  <p className="text-[11px] leading-relaxed text-white/40">{t("settings.browserDesc")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/[0.05] px-8 py-6 lg:px-12">
          <div>
            {step > 0 && (
              <Focusable id={`onb-s${step}-back`} className="btn btn-ghost" onActivate={goBack}>
                <Icon name="chevron-left" size={15} />
                {t("common.back")}
              </Focusable>
            )}
          </div>
          <Focusable id={`onb-s${step}-next`} className="btn btn-primary min-w-[170px]" onActivate={goNext}>
            {step === 0 ? t("onboarding.start") : step === TOTAL_STEPS - 1 ? t("onboarding.ready.open") : t("common.next")}
            <Icon name="arrow-right" size={16} />
          </Focusable>
        </div>
      </main>
    </div>
  );
}
