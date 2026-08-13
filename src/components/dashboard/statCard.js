"use client";

export function StatCardGrid({
  children,
  minCardWidth = 210,
  gap = 12,
  className = "",
}) {
  return (
    <div
      className={`grid w-full min-w-0 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minCardWidth}px), 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  growth,
  iconColor = "text-secondary",
  iconBg = "bg-secondary-light",
  accent,
}) {
  const hasGrowth =
    growth !== undefined &&
    growth !== null &&
    growth !== "";

  const growthNumber = Number(growth) || 0;
  const isUp = growthNumber >= 0;

  const accentClass =
    accent ||
    (iconColor.startsWith("text-")
      ? iconColor.replace("text-", "bg-")
      : "bg-secondary");

  return (
    <div
      className="
        app-card
        relative
        w-full
        min-w-0
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-bg-page-white
      "
    >
      <div className={`h-[3px] w-full ${accentClass}`} />

      <div className="flex items-center gap-3 p-4">
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${iconBg}
          `}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 truncate text-sm text-text-primary">
            {label}
          </div>

          <div className="text-lg font-bold text-text-primary">
            {value}
          </div>
        </div>

        {hasGrowth && (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div
            className={`
              flex
              items-center
              gap-1
              whitespace-nowrap
              text-sm
              font-semibold
              ${isUp ? "text-success" : "text-error"}
            `}
          >
            <span>{isUp ? "↑" : "↓"}</span>

            <span>{Math.abs(growthNumber)}%</span>
          </div>

          <span className="whitespace-nowrap text-xs text-text-mute">
            ក្នុងខែនេះ
          </span>
        </div>
        )}
      </div>
    </div>
  );
}
