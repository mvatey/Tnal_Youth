import { Check, Eye } from "lucide-react";

export default function SuccessAlert({
  message = "ការទាញយកវិភាគទានប្រចាំខែជោគជ័យ!",
}) {
  return (
    <div className="h-[42px] w-[461px] rounded-[8px] bg-white px-5 shadow-sm">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
            <Check size={17} strokeWidth={3} />
          </div>

          <p className="truncate text-[14px] font-medium text-[#6B7280]">
            {message}
          </p>
        </div>

        <button className="flex h-[25px] w-[54px] items-center justify-center gap-1 rounded-[6px] bg-[#4B2E91] text-[10px] font-medium leading-none text-white shadow-sm transition hover:bg-[#432982]">
          <Eye size={15} />
          <span className="text-[12px] leading-none">មើល</span>
        </button>
      </div>
    </div>
  );
}
