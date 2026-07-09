"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "../navigation/Pagination";
import AddDonationActions from "../donations/monthlydonation/AddDonationActions";
import AddDonationTableHeader from "../donations/monthlydonation/AddDonationTableHeader";
import AddDonationTableRow from "../donations/monthlydonation/AddDonationTableRow";
import UploadPopup from "../forms/popup";

const ROWS_PER_PAGE = 11;

export default function Table({
  members = [],
  selectedBranch = "all",
  searchQuery = "",
  onReset,
  onCancel,
  onSave,
  onReceiptSave,
}) {
  const [rows, setRows] = useState(members);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceiptMember, setSelectedReceiptMember] = useState(null);

  useEffect(() => {
    setRows(members);
    setCurrentPage(1);
  }, [members]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return rows.filter((member) => {
      const matchesBranch =
        selectedBranch === "all" || member.branch === selectedBranch;
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

  const handleReset = () => {
    const resetIds = new Set(filteredRows.map((member) => member.id));
    const resetRows = filteredRows.map((member) => ({
      ...member,
      realAmount: "0",
      dollarAmount: "0",
    }));

    setRows((current) => {
      return current.map((member) =>
        resetIds.has(member.id)
          ? { ...member, realAmount: "0", dollarAmount: "0" }
          : member,
      );
    });

    onReset?.(resetRows);
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-sm border border-[#e5eaf0] bg-white">
        <table className="w-full min-w-[980px] border-collapse">
          <AddDonationTableHeader />
          <tbody>
            {pagedRows.length > 0 ? (
              pagedRows.map((member, index) => (
                <AddDonationTableRow
                  key={member.id}
                  index={(safePage - 1) * ROWS_PER_PAGE + index}
                  member={member}
                  onRealAmountChange={(id, value) => updateRow(id, { realAmount: value })}
                  onDollarAmountChange={(id, value) => updateRow(id, { dollarAmount: value })}
                  onPaymentMethodChange={(id, paymentMethod) =>
                    updateRow(id, { paymentMethod })
                  }
                  onShowInfo={setSelectedReceiptMember}
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
        onReset={handleReset}
        onCancel={onCancel}
        onSave={() => onSave?.(filteredRows)}
      />

      {selectedReceiptMember && (
        <UploadPopup
          onClose={() => setSelectedReceiptMember(null)}
          onSave={() => {
            setSelectedReceiptMember(null);
            onReceiptSave?.();
          }}
        />
      )}
    </div>
  );
}
