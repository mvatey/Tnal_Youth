
import { ArrowUp, UserRound } from "lucide-react";

export default function NumberSponsorCard({
  label = "អ្នកឧបត្ថម្ភ",
  value = "50 នាក់",
  growth = "+15%",
  note = "ក្នុងខែនេះ",
  selected = false,
  disabled = false,
  onClick,
}) {
  const [mainValue, ...unitParts] = String(value).split(" ");
  const unit = unitParts.join(" ");

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      title={disabled ? "សូមជ្រើសរើសសាខាជាមុន" : undefined}
      className={`h-[65px] w-[200px] rounded-2xl border-2 px-3 py-2 text-left shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 enabled:hover:-translate-y-0.5 enabled:hover:border-secondary/60 enabled:hover:shadow-md ${
        selected
          ? "border-secondary bg-secondary-light text-secondary ring-2 ring-secondary/15"
          : "border-border bg-white"
      }`}
    >
      <div className="flex h-full items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE7F3] text-[#DB2777]">
          <UserRound size={23} strokeWidth={2.4} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium leading-tight text-text-primary">
                {label}
              </p>
              <p className="mt-1 truncate text-[14px] font-medium leading-none text-black">
                {mainValue}{" "}
                {unit && <span className="text-[#1689F2]">{unit}</span>}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
              {growth && (
                <span className="flex items-center text-[10px] font-medium leading-none text-emerald-500">
                  <ArrowUp size={12} strokeWidth={3} />
                  {growth}
                </span>
              )}
              {note && (
                <span
                  className="max-w-[68px] truncate text-[10px] font-medium leading-none text-black"
                  title={note}
                >
                  {note}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
