"use client";

export default function StatCard({
  icon: Icon,
  label,
  value,
  growth,
  iconColor,
  iconBg,
}) {
  const isUp = Number(growth) >= 0;
  const accent = iconColor.replace("text-", "bg-");

  return (
    <div className="app-card relative overflow-hidden rounded-xl border border-border bg-bg-page-white">
      <div className={`h-[3px] w-full ${accent}`} />

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
          <Icon
            className={`
            h-5
            w-5
            ${iconColor}
            `}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-sm text-text-primary">
            {label}
          </div>

          <div className="text-lg font-bold text-text-primary">
            {value}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div
            className={`
            flex
            items-center
            gap-1
            text-sm
            font-semibold
            ${isUp ? "text-success" : "text-error"}
            `}
          >
            <span>
              {isUp ? "↑" : "↓"}
            </span>

            <span>
              {Math.abs(Number(growth))}%
            </span>
          </div>

          <span className="text-xs text-text-mute">
            ក្នុងខែនេះ
          </span>
        </div>
      </div>
    </div>
  );
}