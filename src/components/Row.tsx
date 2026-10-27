import type { ReactNode } from "react";
import { cx } from "../lib/utils";

export function Row({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("mb-9", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-4 px-1">
        <h2 className="font-display text-[21px] font-semibold tracking-[-0.02em] text-white/95">{title}</h2>
        {subtitle && <span className="text-[12px] font-medium text-white/35">{subtitle}</span>}
      </div>
      <div className="row-mask -mx-1">
        <div className="no-scrollbar flex gap-4 overflow-x-auto px-1 pt-2 pb-5 scroll-px-6">{children}</div>
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 px-1 text-[10.5px] font-bold tracking-[0.2em] text-white/30 uppercase">
      {children}
    </div>
  );
}
