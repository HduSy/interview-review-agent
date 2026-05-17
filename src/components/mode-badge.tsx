import clsx from "clsx";

export function ModeBadge({
  label,
  sub,
  dark = false,
}: {
  label: string;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full text-xs",
        dark
          ? "bg-surface-dark-elevated border border-[#33312d] text-on-dark"
          : "bg-canvas border border-hairline text-ink",
      )}
    >
      <span className="bg-primary text-white font-mono text-[11px] font-medium px-1.5 py-0.5 rounded-full tracking-[0.04em]">
        {label}
      </span>
      {sub && (
        <span className={clsx("text-xs", dark ? "text-on-dark-soft" : "text-muted")}>
          {sub}
        </span>
      )}
    </div>
  );
}
