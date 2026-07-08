"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "../navigation/Pagination";
import AddDonationActions from "../donations/AddDonationActions";
import AddDonationTableHeader from "../donations/AddDonationTableHeader";
import AddDonationTableRow from "../donations/AddDonationTableRow";

const ROWS_PER_PAGE = 10;

export default function Table({
  members = [],
  selectedBranch = "all",
  searchQuery = "",
  onSave,
}) {
  const [rows, setRows] = useState(members);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setRows(members);
    setCurrentPage(1);
  }, [members]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return rows.filter((member) => {
      const matchesBranch =
        selectedBranch === "all" || member.department === selectedBranch;
      const matchesSearch =
        !normalizedQuery ||
        member.name?.toLocaleLowerCase().includes(normalizedQuery);

      return matchesBranch && matchesSearch;
    });
  }, [rows, selectedBranch, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );

  const updateRow = (id, values) => {
    setRows((current) =>
      current.map((member) =>
        member.id === id ? { ...member, ...values } : member,
      ),
    );
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <table className="w-full border-collapse">
          <AddDonationTableHeader />
          <tbody>
            {pagedRows.length > 0 ? (
              pagedRows.map((member, index) => (
                <AddDonationTableRow
                  key={member.id}
                  index={(safePage - 1) * ROWS_PER_PAGE + index}
                  member={member}
                  onAmountChange={(id, value) => updateRow(id, { newAmount: value })}
                  onPaymentMethodChange={(id, paymentMethod) =>
                    updateRow(id, { paymentMethod })
                  }
                  onShowInfo={() => {}}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  មិនមានទិន្នន័យសមាជិកសម្រាប់សាខានេះទេ
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

      <AddDonationActions
        onReset={() => setRows(members)}
        onCancel={() => setRows(members)}
        onSave={() => onSave?.(filteredRows)}
      />
    </div>
  );
}
