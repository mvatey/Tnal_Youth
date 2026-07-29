"use client";

export default function StatCard({
  icon: Icon,
  label = "",
  value = 0,
  growth = 0,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  accentColor = "bg-primary",
}) {
  const growthNumber = Number(growth) || 0;
  const isUp = growthNumber >= 0;

  return (
    <div
      className="
        app-card
        relative
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-bg-page-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className={`h-[3px] w-full ${accentColor}`} />

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
          {Icon && (
            <Icon
              className={`
                h-5
                w-5
                ${iconColor}
              `}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
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
            <span>{isUp ? "↑" : "↓"}</span>

            <span>{Math.abs(growthNumber)}%</span>
          </div>

          <span className="text-xs text-text-mute">
            ក្នុងខែនេះ
          </span>
        </div>
      </div>
    </div>
  );
}