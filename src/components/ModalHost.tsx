import { useEffect, useRef, useState, type ReactNode } from "react";
import { Focusable } from "./Focusable";
import { Icon, type IconName } from "./Icon";
import { api } from "../lib/bridge";
import { isHttpsUrl } from "../lib/utils";
import { useT } from "../lib/useT";
import { useAppStore, type ModalState } from "../store";

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputRef,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onSubmit?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold tracking-[0.16em] text-white/35 uppercase">
        {label}
      </span>
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit?.();
          }
        }}
        className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[13px] font-medium text-white placeholder:text-white/25 focus:border-violet/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet/10"
      />
    </label>
  );
}

function ModalShell({
  title,
  description,
  icon = "info",
  children,
  footer,
  onClose,
}: {
  title: string;
  description?: string;
  icon?: IconName;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-6 fade-in">
      <div className="absolute inset-0 bg-[#03050b]/80 backdrop-blur-xl" onClick={onClose} aria-hidden="true" />
      <div
        className="pop-in relative w-full max-w-[560px] overflow-hidden rounded-[26px] border border-white/10 bg-[#0a0e19]/97 shadow-[0_50px_140px_-40px_rgba(0,0,0,1)]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start gap-4 p-6 pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet/25 bg-violet/15 text-[#cfc5ff]">
            <Icon name={icon} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[19px] font-semibold tracking-[-0.02em]">{title}</h2>
            {description && <p className="mt-1.5 text-[12px] leading-relaxed text-white/40">{description}</p>}
          </div>
          <Focusable
            id="modal-close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/45"
            onActivate={onClose}
            ariaLabel="Close"
          >
            <Icon name="close" size={14} />
          </Focusable>
        </div>
        {children && <div className="px-6 pb-2">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2.5 px-6 pt-5 pb-6">{footer}</div>}
      </div>
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const rows: Array<{ pad: string; keys: string; label: string }> = [
    { pad: "D-pad / LS", keys: "Strzałki / WASD", label: t("hints.select") },
    { pad: "A", keys: "Enter", label: t("hints.select") },
    { pad: "B", keys: "Esc", label: t("hints.back") },
    { pad: "X", keys: "F", label: t("hints.favorite") },
    { pad: "Y", keys: "I", label: t("hints.details") },
    { pad: "LB / RB", keys: "Q / E", label: t("hints.tabs") },
    { pad: "Menu", keys: "M", label: t("hints.menu") },
    { pad: "Select", keys: "H", label: t("hints.help") },
    { pad: "—", keys: "/", label: t("hints.search") },
  ];
  return (
    <ModalShell
      title={t("hints.help")}
      description={t("settings.controllerDesc")}
      icon="gamepad"
      onClose={onClose}
      footer={
        <Focusable id="modal-submit" className="btn btn-primary btn-sm" onActivate={onClose}>
          {t("common.close")}
        </Focusable>
      }
    >
      <div className="divide-y divide-white/[0.05] overflow-hidden rounded-2xl border border-white/[0.06]">
        {rows.map((row) => (
          <div key={`${row.pad}-${row.keys}`} className="flex items-center gap-4 px-4 py-2.5">
            <span className="w-[100px] shrink-0 text-[11px] font-semibold text-white/70">{row.pad}</span>
            <span className="w-[120px] shrink-0 font-mono text-[10.5px] text-white/35">{row.keys}</span>
            <span className="text-[12px] text-white/55">{row.label}</span>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function AddGameModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const settings = useAppStore((state) => state.settings);
  const addCustomGame = useAppStore((state) => state.addCustomGame);
  const openDetails = useAppStore((state) => state.openDetails);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState(settings.startUrl);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), 90);
    return () => window.clearTimeout(timer);
  }, []);

  const submit = () => {
    if (!title.trim()) {
      setError(t("modal.addGame.nameRequired"));
      return;
    }
    if (!isHttpsUrl(url)) {
      setError(t("toast.invalidUrl"));
      return;
    }
    const game = addCustomGame(title, url);
    if (game) {
      onClose();
      openDetails(game.id);
    }
  };

  return (
    <ModalShell
      title={t("modal.addGame.title")}
      description={t("modal.addGame.hint")}
      icon="plus"
      onClose={onClose}
      footer={
        <>
          <Focusable id="modal-cancel" className="btn btn-ghost btn-sm" onActivate={onClose}>
            {t("common.cancel")}
          </Focusable>
          <Focusable id="modal-submit" className="btn btn-primary btn-sm" onActivate={submit}>
            <Icon name="plus" size={14} />
            {t("common.add")}
          </Focusable>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field
          label={t("modal.addGame.name")}
          value={title}
          onChange={(value) => {
            setTitle(value);
            setError(null);
          }}
          placeholder={t("modal.addGame.namePlaceholder")}
          inputRef={titleRef}
          onSubmit={submit}
        />
        <Field
          label={t("modal.addGame.url")}
          value={url}
          onChange={(value) => {
            setUrl(value);
            setError(null);
          }}
          placeholder={t("modal.addGame.urlPlaceholder")}
          onSubmit={submit}
        />
        {error && <p className="text-[11.5px] text-rose-300">{error}</p>}
      </div>
    </ModalShell>
  );
}

function UrlModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const settings = useAppStore((state) => state.settings);
  const patchSettings = useAppStore((state) => state.patchSettings);
  const [url, setUrl] = useState(settings.startUrl);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 90);
    return () => window.clearTimeout(timer);
  }, []);

  const submit = () => {
    if (!isHttpsUrl(url)) {
      setError(t("settings.urlInvalid"));
      return;
    }
    patchSettings({ startUrl: url.trim() });
    onClose();
  };

  return (
    <ModalShell
      title={t("modal.url.title")}
      description={t("modal.url.body")}
      icon="external"
      onClose={onClose}
      footer={
        <>
          <Focusable id="modal-cancel" className="btn btn-ghost btn-sm" onActivate={onClose}>
            {t("common.cancel")}
          </Focusable>
          <Focusable id="modal-submit" className="btn btn-primary btn-sm" onActivate={submit}>
            {t("common.save")}
          </Focusable>
        </>
      }
    >
      <Field
        label={t("modal.addGame.url")}
        value={url}
        onChange={(value) => {
          setUrl(value);
          setError(null);
        }}
        onSubmit={submit}
        inputRef={inputRef}
      />
      {error && <p className="mt-3 text-[11.5px] text-rose-300">{error}</p>}
    </ModalShell>
  );
}

function PathModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const settings = useAppStore((state) => state.settings);
  const patchSettings = useAppStore((state) => state.patchSettings);
  const [path, setPath] = useState(settings.browserPath ?? "");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 90);
    return () => window.clearTimeout(timer);
  }, []);

  const submit = async () => {
    if (!path.trim()) {
      setError(t("settings.pathInvalid"));
      return;
    }
    setChecking(true);
    try {
      const browser = await api.checkBrowser(path.trim());
      if (!browser) {
        setError(t("settings.pathInvalid"));
        return;
      }
      patchSettings({ browserPath: browser.path });
      onClose();
    } catch {
      setError(t("settings.pathInvalid"));
    } finally {
      setChecking(false);
    }
  };

  return (
    <ModalShell
      title={t("modal.path.title")}
      description={t("modal.path.body")}
      icon="monitor"
      onClose={onClose}
      footer={
        <>
          <Focusable id="modal-cancel" className="btn btn-ghost btn-sm" onActivate={onClose}>
            {t("common.cancel")}
          </Focusable>
          <Focusable
            id="modal-submit"
            className="btn btn-primary btn-sm"
            onActivate={() => void submit()}
            disabled={checking}
          >
            {checking ? "…" : t("common.save")}
          </Focusable>
        </>
      }
    >
      <Field
        label={t("settings.pathTitle")}
        value={path}
        onChange={(value) => {
          setPath(value);
          setError(null);
        }}
        placeholder={t("settings.pathPlaceholder")}
        onSubmit={() => void submit()}
        inputRef={inputRef}
      />
      {error && <p className="mt-3 text-[11.5px] text-rose-300">{error}</p>}
    </ModalShell>
  );
}

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const patchSettings = useAppStore((state) => state.patchSettings);
  const setShowOnboarding = useAppStore((state) => state.setShowOnboarding);

  const start = () => {
    patchSettings({ onboardingDone: false });
    setShowOnboarding(true);
    onClose();
  };

  return (
    <ModalShell
      title={t("modal.onboarding.title")}
      description={t("modal.onboarding.body")}
      icon="refresh"
      onClose={onClose}
      footer={
        <>
          <Focusable id="modal-cancel" className="btn btn-ghost btn-sm" onActivate={onClose}>
            {t("common.cancel")}
          </Focusable>
          <Focusable id="modal-submit" className="btn btn-primary btn-sm" onActivate={start}>
            {t("common.next")}
          </Focusable>
        </>
      }
    />
  );
}

export function ModalHost() {
  const modal = useAppStore((state) => state.modal) as ModalState;
  const closeModal = useAppStore((state) => state.closeModal);
  if (!modal) return null;

  switch (modal.type) {
    case "help":
      return <HelpModal onClose={closeModal} />;
    case "addGame":
      return <AddGameModal onClose={closeModal} />;
    case "url":
      return <UrlModal onClose={closeModal} />;
    case "path":
      return <PathModal onClose={closeModal} />;
    case "onboarding":
      return <OnboardingModal onClose={closeModal} />;
    default:
      return null;
  }
}
