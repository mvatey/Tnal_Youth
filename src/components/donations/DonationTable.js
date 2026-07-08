"use client";

import { useMemo, useState } from "react";
import FilterBar from "./FilterBar";
import Pagination from "../navigation/Pagination";
import TableRow from "./TableRow";
import { donationRows } from "@/data/donationData";

export default function DonationTable() {
  const headers = [
    "ល.រ",
    "ខែ",
    "ឆ្នាំ",
    "សាខា",
    "ចំនួនប្រាក់រៀល",
    "ចំនួនប្រាក់ដុល្លារ",
    "ប្រាក់សរុប(ដុល្លារ)",
    "សកម្មភាព",
  ];
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [rows, setRows] = useState(donationRows);

  const years = useMemo(() => [...new Set(rows.map((row) => row.year))], [rows]);
  const months = useMemo(() => [...new Set(rows.map((row) => row.month))], [rows]);
  const departments = useMemo(() => [...new Set(rows.map((row) => row.department))], [rows]);
  const handleDelete = (rowId) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  };
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesYear = selectedYear === "all" || row.year === selectedYear;
        const matchesMonth = selectedMonth === "all" || row.month === selectedMonth;
        const matchesDepartment = selectedDepartment === "all" || row.department === selectedDepartment;

        return matchesYear && matchesMonth && matchesDepartment;
      }),
    [rows, selectedYear, selectedMonth, selectedDepartment],
  );

  return (
    <section className="rounded-md border border-border bg-white px-7 py-4 shadow-sm">
      <FilterBar
        years={years}
        months={months}
        departments={departments}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDepartment={selectedDepartment}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        onDepartmentChange={setSelectedDepartment}
      />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {headers.map((header) => (
                <th key={header} className="px-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row, index) => (
              <TableRow key={row.id} row={row} rowNumber={index + 1} onDelete={handleDelete} />
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-xs font-medium text-text-secondary">
                  មិនមានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination />
    </section>
  );
}
