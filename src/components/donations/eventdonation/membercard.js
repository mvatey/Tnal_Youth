import { ArrowUp, UsersRound } from "lucide-react";

export default function MemberCard({
  label = "សមាជិក",
  value = "150 នាក់",
  growth = "+15%",
  note = "ក្នុងខែនេះ",
}) {
  const [mainValue, ...unitParts] = String(value).split(" ");
  const unit = unitParts.join(" ");

  return (
    <article
      className="min-h-[65px] w-full rounded-2xl border-2 border-border bg-bg-page-white px-3 py-2 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md sm:max-w-[200px]"
    >
      <div className="flex h-full items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
          <UsersRound size={23} strokeWidth={2.4} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium leading-tight text-text-primary">
                {label}
              </p>
              <p className="mt-1 truncate text-[14px] font-medium leading-none text-text-primary">
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
                  className="max-w-[68px] truncate text-[10px] font-medium leading-none text-text-primary"
                  title={note}
                >
                  {note}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
