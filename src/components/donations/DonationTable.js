"use client";

import { useMemo, useState } from "react";
import FilterBar from "../forms/FilterBar";
import SaveButton from "../forms/save";
import Pagination from "../navigation/Pagination";
import TableRow from "./TableRow";
import { donationRows } from "@/data/donationData";

export default function DonationTable() {
  const rowsPerPage = 12;
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
  const [currentPage, setCurrentPage] = useState(1);

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
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <section className="rounded-md border border-border bg-white px-7 py-4 shadow-sm">
      <FilterBar
        years={years}
        months={months}
        departments={departments}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDepartment={selectedDepartment}
        onYearChange={updateFilter(setSelectedYear)}
        onMonthChange={updateFilter(setSelectedMonth)}
        onDepartmentChange={updateFilter(setSelectedDepartment)}
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
            {pagedRows.map((row, index) => (
              <TableRow
                key={row.id}
                row={row}
                rowNumber={(safePage - 1) * rowsPerPage + index + 1}
                onDelete={handleDelete}
              />
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

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
        <div className="mr-7 mt-[17px] flex justify-end">
        <SaveButton onClick={() => console.log("Save")} />
      </div>
    </section>

  );
}
