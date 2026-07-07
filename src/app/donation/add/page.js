"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import DonationTabs from "@/components/dashboard/DonationTabs";
import DonationCards from "@/components/dashboard/DonationCards";
import { donationRows } from "@/data/donationData";

export default function AddDonationPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const departments = useMemo(() => [...new Set(donationRows.map((r) => r.department))], []);
  const months = useMemo(() => [...new Set(donationRows.map((r) => r.month))], []);
  const years = useMemo(() => [...new Set(donationRows.map((r) => r.year))], []);

  return (
    <div className="space-y-4">
      <DonationTabs />
      <DonationCards />

      <div className="rounded-md border border-border bg-white p-6">
        <h1 className="mb-4 text-lg font-semibold text-secondary">បន្ថែមវិភាគទាន</h1>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">សាខា</label>
              <select
                className="h-9 w-[220px] rounded-lg border border-border bg-white px-3 text-xs font-medium text-text-secondary outline-none"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">ជ្រើសរើសសាខា</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">ខែ</label>
              <select
                className="h-9 w-[160px] rounded-lg border border-border bg-white px-3 text-xs font-medium text-text-secondary outline-none"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">ខែទាំងអស់</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">ឆ្នាំ</label>
              <select
                className="h-9 w-[160px] rounded-lg border border-border bg-white px-3 text-xs font-medium text-text-secondary outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">ឆ្នាំទាំងអស់</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto w-[320px]">
              <label className="mb-1 block text-xs font-medium text-text-secondary">ស្វែងរក</label>
              <div className="flex items-center rounded-lg border border-border bg-white px-3 py-2">
                <input
                  className="w-full flex-1 text-xs outline-none pr-2"
                  placeholder="ស្វែងរកតាមរយៈឈ្មោះសមាជិក..."
                />
                <Search size={16} className="text-text-secondary" />
              </div>
            </div>
          </div>

          <div className="h-[56vh] rounded border border-border bg-[#fbfbfd]"></div>
        </div>
      </div>
    </div>
  );
}
