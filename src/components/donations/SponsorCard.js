import { ArrowUp, CircleDollarSign } from "lucide-react";

export default function SponsorCard({
  label = "ថវិកាឧបត្ថម្ភ",
  value = "$5000",
  growth = "+15%",
  note = "ក្នុងខែនេះ",
}) {
  return (
    <article className="h-[65px] w-[200px] rounded-2xl border-2 border-border bg-white px-3 py-2 shadow-sm">
      <div className="flex h-full items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EADDFC] text-[#5636A3]">
          <CircleDollarSign size={24} strokeWidth={2.5} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium leading-tight text-text-primary">
                {label}
              </p>
              <p className="mt-1 truncate text-[14px] font-medium leading-none text-black">
                {value}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
              <span className="flex items-center text-[10px] font-medium leading-none text-emerald-500">
                <ArrowUp size={12} strokeWidth={3} />
                {growth}
              </span>
              <span className="text-[10px] font-medium leading-none text-black">
                {note}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
