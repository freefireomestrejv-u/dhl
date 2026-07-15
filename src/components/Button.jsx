const VARIANTS = {
  primary:
    "bg-royal text-white shadow-[var(--shadow-button)] hover:bg-royal-dark active:bg-royal-dark disabled:bg-royal/50",
  secondary:
    "bg-white text-ink border border-line hover:border-line-strong hover:bg-black/[0.02] disabled:opacity-50",
  ghost:
    "bg-transparent text-ink-muted hover:text-ink hover:bg-black/[0.03] disabled:opacity-50",
  tint:
    "bg-royal-light text-white hover:bg-royal active:bg-royal disabled:bg-royal-light/50",
  danger:
    "bg-transparent text-error hover:bg-error-tint disabled:opacity-50",
  yellow:
    "bg-[#F5C518] text-ink hover:bg-[#E3B70F] active:bg-[#E3B70F] disabled:opacity-50",
  dark:
    "bg-ink text-white hover:bg-black active:bg-black disabled:opacity-50",
};

export default function Button({
  children,
  variant = "primary",
  size = "lg",
  className = "",
  icon = null,
  ...props
}) {
  const sizing =
    size === "lg"
      ? "h-14 px-6 text-[15px]"
      : size === "sm"
        ? "h-9 px-3.5 text-sm"
        : "h-11 px-4 text-sm";

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold
        transition-all duration-150 ease-out
        disabled:cursor-not-allowed active:translate-y-px
        ${sizing} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}