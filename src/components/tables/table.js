"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Pagination from "../navigation/Pagination";
import AddDonationActions from "../donations/monthlydonation/AddDonationActions";
import AddDonationTableHeader from "../donations/monthlydonation/AddDonationTableHeader";
import AddDonationTableRow from "../donations/monthlydonation/AddDonationTableRow";
import UploadPopup from "../forms/popup";
import ResetConfirmModal from "../popup/ResetConfirmModal";
import { useLanguage } from "@/context/LanguageContext";

const ROWS_PER_PAGE = 11;
const DONATION_ROWS_CHANGE_EVENT = "tnal-youth:donation-rows-change";

export default function Table({
  members = [],
  selectedBranch = "all",
  searchQuery = "",
  onRowsChange,
  onReset,
  onCancel,
  onSave,
  onReceiptSave,
  onEditingRowChange,
  readOnly = false,
  rowEditMode = false,
  // Optional per-row lock independent of rowEditMode/readOnly — e.g. a
  // monthly/sponsor donation member who already has a recorded entry for
  // the selected period. The backend has no update endpoint for that case
  // (only create), so re-submitting it would fail the whole batch; locking
  // it here keeps it visible (with its existing amount) but un-editable.
  isRowLocked,
  // See AddDonationTableHeader/AddDonationTableRow — hides the
  // date-of-birth column for the event-donation "សមាជិក" tab.
  hideDob = false,
}) {
  const { t } = useLanguage();
  // NOTE: `readOnly` here is this table's own "does this viewer have edit
  // rights at all" flag — it gets threaded down to AddDonationTableRow as
  // `globalReadOnly` (distinct from the per-row `readOnly` computed below,
  // which also locks a row simply for not being the one under active edit
  // in rowEditMode). This was previously not being passed down at all,
  // which meant the Edit button's visibility check silently fell back to
  // its default (false) instead of reflecting real edit rights.
  const [rows, setRows] = useState(members);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceiptMember, setSelectedReceiptMember] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const receiptUrlsRef = useRef(new Set());

  useEffect(() => {
    setRows((currentRows) =>
      members.map((member) => {
        const currentRow = currentRows.find((row) => row.id === member.id);

        return {
          ...member,
          receipt: member.receipt ?? currentRow?.receipt,
        };
      }),
    );
    setCurrentPage(1);
  }, [members]);

  useEffect(() => {
    return () => {
      receiptUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      receiptUrlsRef.current.clear();
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return rows.filter((member) => {
      const matchesBranch =
        selectedBranch === "all" ||
        String(member.branchId ?? member.branch) === String(selectedBranch);
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

  const notifyRowsChange = (nextRows) => {
    onRowsChange?.(nextRows);

    window.dispatchEvent(
      new CustomEvent(DONATION_ROWS_CHANGE_EVENT, {
        detail: nextRows,
      }),
    );
  };

  const updateRow = (id, values) => {
    const nextRows = rows.map((member) =>
      member.id === id
        ? {
            ...member,
            ...values,
          }
        : member,
    );

    setRows(nextRows);
    notifyRowsChange(nextRows);

    if (id === editingRowId) {
      onEditingRowChange?.(nextRows.find((member) => member.id === id) ?? null);
    }
  };

  const handleReceiptSave = async (id, file) => {
    if (!file) {
      setSelectedReceiptMember(null);
      return;
    }

    const isImage =
      file.type.startsWith("image/") ||
      /\.(avif|bmp|gif|heic|heif|jpe?g|jfif|png|svg|webp)$/i.test(file.name);
    const previewUrl = isImage
      ? await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
      : "";

    const receipt = {
      name: file.name,
      type: file.type,
      previewUrl,
    };

    setRows((current) =>
      current.map((member) => {
        if (member.id !== id) {
          return member;
        }

        if (member.receipt?.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(member.receipt.previewUrl);
          receiptUrlsRef.current.delete(member.receipt.previewUrl);
        }

        return {
          ...member,
          receipt,
        };
      }),
    );

    setSelectedReceiptMember(null);
    onReceiptSave?.(id, receipt);
  };

  const handleReceiptRemove = (id) => {
    setRows((current) =>
      current.map((member) => {
        if (member.id !== id) {
          return member;
        }

        if (member.receipt?.previewUrl) {
          URL.revokeObjectURL(member.receipt.previewUrl);
          receiptUrlsRef.current.delete(member.receipt.previewUrl);
        }

        const { receipt, ...memberWithoutReceipt } = member;
        return memberWithoutReceipt;
      }),
    );

    onReceiptSave?.(id, null);
  };

  const performReset = () => {
    const resettableRows = filteredRows.filter((member) => !isRowLocked?.(member));
    const resetIds = new Set(resettableRows.map((member) => member.id));
    const resetRows = resettableRows.map((member) => ({
      ...member,
      realAmount: "0",
      dollarAmount: "0",
    }));

    const nextRows = rows.map((member) =>
      resetIds.has(member.id)
        ? {
            ...member,
            realAmount: "0",
            dollarAmount: "0",
          }
        : member,
    );

    setRows(nextRows);
    notifyRowsChange(nextRows);

    onReset?.(resetRows);
  };

  const handleStartRowEdit = (member) => {
    setEditingRowId(member.id);
    setEditingSnapshot({ ...member });
    onEditingRowChange?.(member);
  };

  const handleCancelRowEdit = () => {
    if (editingSnapshot) updateRow(editingSnapshot.id, editingSnapshot);
    setEditingRowId(null);
    setEditingSnapshot(null);
    onEditingRowChange?.(null);
  };

  const handleSaveRow = async (member) => {
    const saved = await onSave?.([member]);
    if (saved === true) {
      setEditingRowId(null);
      setEditingSnapshot(null);
      onEditingRowChange?.(null);
    }
  };

  return (
    <div className="min-w-0">
      <div className="overflow-x-auto rounded-lg border border-border bg-bg-page-white shadow-sm">
        <table className="w-full min-w-[980px] border-collapse">
          <AddDonationTableHeader hideDob={hideDob} hideAction={!rowEditMode} />
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
                    // Clear the old method id when the dropdown changes.
                    // It will be resolved again from the selected method on save.
                    updateRow(id, { paymentMethod, paymentMethodId: "" })
                  }
                  readOnly={readOnly || (rowEditMode && editingRowId !== member.id) || Boolean(isRowLocked?.(member))}
                  globalReadOnly={readOnly}
                  rowEditMode={rowEditMode}
                  isEditing={editingRowId === member.id}
                  editDisabled={editingRowId !== null && editingRowId !== member.id}
                  onEdit={() => handleStartRowEdit(member)}
                  onCancelEdit={handleCancelRowEdit}
                  onSaveEdit={() => handleSaveRow(member)}
                  onShowInfo={setSelectedReceiptMember}
                  onRemoveReceipt={handleReceiptRemove}
                  hideDob={hideDob}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={9 - (hideDob ? 1 : 0) - (rowEditMode ? 0 : 1)}
                  className="px-4 py-10 text-center text-sm text-text-mute"
                >
                  {t("donationPage.noBranchMemberData")}
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

      {!rowEditMode && !readOnly && (
        <AddDonationActions
          onReset={() => setShowResetConfirm(true)}
          onCancel={onCancel}
          onSave={() => onSave?.(filteredRows)}
          readOnly={readOnly}
        />
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={() => {
          setShowResetConfirm(false);
          performReset();
        }}
      />

      {selectedReceiptMember && (
        <UploadPopup
          onClose={() => setSelectedReceiptMember(null)}
          onSave={(file) => handleReceiptSave(selectedReceiptMember.id, file)}
          onRemoveReceipt={() => handleReceiptRemove(selectedReceiptMember.id)}
          initialReceipt={
            rows.find((member) => member.id === selectedReceiptMember.id)?.receipt
          }
        />
      )}
    </div>
  );
}
