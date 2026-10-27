import { Icon } from "./Icon";
import { useAppStore } from "../store";
import { cx } from "../lib/utils";

export function Toasts() {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-6 bottom-[78px] z-[70] flex w-[330px] flex-col gap-2.5">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className="toast pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0c1120]/95 p-3.5 text-left shadow-[0_20px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl"
          onClick={() => dismissToast(toast.id)}
        >
          <span
            className={cx(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              toast.kind === "success" && "bg-emerald-400/15 text-emerald-300",
              toast.kind === "error" && "bg-rose-400/15 text-rose-300",
              toast.kind === "info" && "bg-violet/20 text-[#c9beff]",
            )}
          >
            <Icon
              name={toast.kind === "error" ? "info" : toast.kind === "success" ? "check" : "sparkles"}
              size={14}
            />
          </span>
          <span className="pt-0.5 text-[12px] leading-snug text-white/80">{toast.message}</span>
        </button>
      ))}
    </div>
  );
}
