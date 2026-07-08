"use client";

import { useMemo, useState,useEffect} from "react";
import { RefreshCw } from "lucide-react";
import AddDonationTableRow from "./AddDonationTableRow";
import Pagination from "../navigation/Pagination";

const ROWS_PER_PAGE = 10;

/**
 * DonationTable
 *
 * Props:
 * - members: full array of member/donor records, each shaped like:
 *     { id, name, avatar, gender, dob, branch, oldAmount, newAmount, paymentMethod }
 * - selectedBranch: the branch currently chosen in FilterBar (e.g. "ភ្នំពេញ", or "" / "all")
 * - searchQuery: text typed into the search box in FilterBar
 * - onSave: callback fired with the edited rows when the user clicks "រក្សាទុក"
 */
export default function DonationTable({ members = [], selectedBranch, searchQuery = "", onSave }) {
  const [rows, setRows] = useState(members);
  const [currentPage, setCurrentPage] = useState(1);

  // Keep local editable state in sync whenever the parent gives us a new member list
  // (e.g. after fetching a different branch from the API)
 useEffect(() => {
  setRows(members);
  setCurrentPage(1);
}, [members]);

  // Filter by selected branch + search text
  const filteredRows = useMemo(() => {
    return rows.filter((m) => {
      const matchesBranch =
        !selectedBranch || selectedBranch === "all" || m.branch === selectedBranch;
      const matchesSearch =
        !searchQuery || m.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBranch && matchesSearch;
    });
  }, [rows, selectedBranch, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const pagedRows = filteredRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleAmountChange = (id, value) => {
    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, newAmount: value } : m)));
  };

  const handlePaymentMethodChange = (id, method) => {
    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, paymentMethod: method } : m)));
  };

  const handleShowInfo = (member) => {
    // Wire this up to your existing modals folder, e.g. open a MemberInfoModal
    console.log("Show info for", member);
  };

  const handleRefresh = () => {
    setRows(members);
  };

  const handleSaveClick = () => {
    onSave?.(filteredRows);
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="px-4 py-3 font-medium">ល.រ</th>
              <th className="px-4 py-3 font-medium">សមាជិក</th>
              <th className="px-4 py-3 font-medium">ភេទ</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">ថ្ងៃខែឆ្នាំកំណើត</th>
              <th className="px-4 py-3 font-medium">ចំនួនប្រាក់ចាស់</th>
              <th className="px-4 py-3 font-medium">ចំនួនប្រាក់ថ្មី</th>
              <th className="px-4 py-3 font-medium">វិធីសាស្ត្រទូទាត់</th>
              <th className="px-4 py-3 font-medium text-center">វិក្ក័យបត្រ</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length > 0 ? (
              pagedRows.map((member, i) => (
                <AddDonationTableRow
                  key={member.id}
                  index={(currentPage - 1) * ROWS_PER_PAGE + i}
                  member={member}
                  onAmountChange={handleAmountChange}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onShowInfo={handleShowInfo}
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
  

    </div>
  );
}