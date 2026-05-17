export function SpikeMark({
  size = 16,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 1.5 L13.4 10.6 L22.5 12 L13.4 13.4 L12 22.5 L10.6 13.4 L1.5 12 L10.6 10.6 Z"
        fill={color}
      />
    </svg>
  );
}

export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <SpikeMark size={size} color="var(--color-ink)" />
      <span
        className="font-medium text-ink"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: size,
          letterSpacing: "-0.01em",
        }}
      >
        OC<span className="text-primary">·</span>Review
      </span>
    </div>
  );
}
