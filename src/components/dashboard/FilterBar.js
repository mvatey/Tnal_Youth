import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function FilterBar({
  years = [],
  months = [],
  departments = [],
  selectedYear,
  selectedMonth,
  selectedDepartment,
  onYearChange,
  onMonthChange,
  onDepartmentChange,
}) {
  const selectClass =
    "h-9 w-[158px] rounded-lg border border-border bg-white px-3 text-xs font-medium text-text-secondary shadow-sm outline-none transition focus:border-secondary";

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-secondary">វិភាគទានប្រចាំខែ</h3>

      <div className="flex flex-wrap items-center justify-end gap-5">
         <select
          className={selectClass}
          value={selectedDepartment}
          onChange={(event) => onDepartmentChange(event.target.value)}
        >
          <option value="all">ជ្រើសរើសសាខា</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
         <select className={selectClass} value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)}>
          <option value="all">ខែទាំងអស់</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        
        <select className={selectClass} value={selectedYear} onChange={(event) => onYearChange(event.target.value)}>
          <option value="all">ឆ្នាំទាំងអស់</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

       
        <Link href="/donation/add">
          <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-success px-4 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700">
            <PlusCircle size={17} />
            បន្ថែមវិភាគទាន
          </button>
        </Link>
      </div>
    </div>
  );
}
