"use client";

import { useState } from "react";
import { Check, SquarePen, X } from "lucide-react";
import donationOptions from "@/data/donation/donationOptions.json";
import { useLanguage } from "@/context/LanguageContext";

const RECEIPT_ICON_COLOR = "#4B2E91";
const DEFAULT_PROFILE_IMAGE = "/profiles/default-avatar.jpg";
const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8081";
const { monthlyDonationPaymentMethods } = donationOptions;

function normalizeAvatarUrl(value) {
  const source = String(value || "").trim().replace(/\\/g, "/");

  if (!source) return DEFAULT_PROFILE_IMAGE;
  if (
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("data:") ||
    source.startsWith("blob:") ||
    source.startsWith("/")
  ) {
    return source;
  }
  if (source.startsWith("uploads/")) {
    return `${BACKEND_ORIGIN}/${source}`;
  }
  if (source.startsWith("images/")) {
    return `${BACKEND_ORIGIN}/uploads/${source}`;
  }
  return `/${source}`;
}

// Every other "success" surface in this app (ParticipantStatusBadge,
// NotificationStatusBadge, ...) pairs bg-success-bg with text-success — the
// fill alone (#C3E4D5) is a pale mint that barely reads as green without
// that darker green text/border riding on top of it. These fields used to
// apply bg-success-bg alone, which is why a filled amount looked white/
// outlined instead of green. Now the border and the digits themselves also
// pick up the success color when there's an amount, matching that
// convention so the "green" state is unmistakable at a glance.
const getAmountFieldClass = (value) =>
  Number(value) > 0
    ? "border-success/30 bg-success-bg/70"
    : "border-border bg-bg-page-gray";

const getAmountTextClass = (value) =>
  Number(value) > 0 ? "text-success" : "text-text-primary";

const getAmountUnitClass = (value) =>
  Number(value) > 0 ? "text-success" : "text-text-secondary";

export function ReceiptIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 3.75c1.25 0 1.25 1 2.5 1s1.25-1 2.5-1 1.25 1 2.5 1 1.25-1 2.5-1 1.25 1 2.5 1c.45 0 .82-.13 1.15-.32v13.07a2.75 2.75 0 0 0 2.75 2.75H7.25A3.25 3.25 0 0 1 4 17V4.05c.15-.17.31-.3.5-.3Z"
        stroke={RECEIPT_ICON_COLOR}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.65 9.5h2.85c.55 0 1 .45 1 1v6.75a3 3 0 0 1-3 3h-.1"
        stroke={RECEIPT_ICON_COLOR}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h6.5M8 12h5.5M8 15h6.5"
        stroke={RECEIPT_ICON_COLOR}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AddDonationTableRow({
  index,
  member,
  onRealAmountChange,
  onDollarAmountChange,
  onPaymentMethodChange,
  onShowInfo,
  readOnly = false,
  // Whether the current viewer has NO edit rights at all (e.g. admin, or a
  // secretary/branch_leader viewing a page they can't edit) — distinct
  // from `readOnly` above, which ALSO turns true for a row that simply
  // isn't the one currently being edited in rowEditMode (see Table.js).
  // The Edit (pencil) button below must key off THIS, not `readOnly` — see
  // the comment at its render condition.
  globalReadOnly = false,
  rowEditMode = false,
  isEditing = false,
  editDisabled = false,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  // See AddDonationTableHeader — the event-donation "សមាជិក" tab hides
  // date-of-birth; the monthly-donation table still shows it.
  hideDob = false,
}) {
  const { t } = useLanguage();
  const [focusedAmountField, setFocusedAmountField] = useState(null);
  const receipt = member.receipt;
  const avatarUrl = normalizeAvatarUrl(member.avatar);
  const amountFieldDisabledClass = readOnly
    ? "cursor-not-allowed opacity-70"
    : "transition-colors focus-within:border-secondary";

  const handleAmountInput = (callback) => (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    callback(member.id, value);
  };

  const handleAmountFocus = (field, value, callback) => () => {
    setFocusedAmountField(field);

    if (Number(value) === 0) {
      callback(member.id, "");
    }
  };

  return (
    <tr className="h-[42px] border-b border-border bg-bg-page-white text-center text-[12px] text-text-secondary transition-colors hover:bg-bg-page-gray">
      {/* ល.រ */}
      <td className="px-3 font-medium">{index + 1}</td>

      {/* សមាជិក (avatar + name) */}
      <td className="px-3 text-left">
        <div className="flex items-center gap-3">
          <div className="relative h-[26px] w-[26px] shrink-0 overflow-hidden rounded-full bg-bg-page-gray">
            <img
              src={avatarUrl}
              alt={member.name || "Member profile"}
              className="h-full w-full object-cover"
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(DEFAULT_PROFILE_IMAGE)) {
                  event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                }
              }}
            />
          </div>
          <span className="whitespace-nowrap font-medium text-text-secondary">{member.name}</span>
        </div>
      </td>

      {/* ភេទ */}
      <td className="px-3">{member.gender}</td>

      {/* ថ្ងៃខែឆ្នាំកំណើត */}
      {!hideDob && <td className="whitespace-nowrap px-3">{member.dob}</td>}

      {/* ចំនួនប្រាក់រៀល (editable) */}
      <td className="px-3">
        <div
          className={`mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border px-2 ${amountFieldDisabledClass} ${getAmountFieldClass(
            member.realAmount,
          )}`}
        >
          <input
            type="text"
            inputMode="decimal"
            disabled={readOnly}
            value={member.realAmount ?? ""}
            onChange={handleAmountInput(onRealAmountChange)}
            onFocus={handleAmountFocus(
              "realAmount",
              member.realAmount,
              onRealAmountChange,
            )}
            onBlur={() => setFocusedAmountField(null)}
            placeholder={focusedAmountField === "realAmount" ? "" : "0"}
            className={`w-full bg-transparent text-[13px] outline-none placeholder:text-text-mute disabled:cursor-not-allowed disabled:text-text-mute ${getAmountTextClass(
              member.realAmount,
            )}`}
          />
          <span className={`text-[13px] ${getAmountUnitClass(member.realAmount)}`}>៛</span>
        </div>
      </td>

      {/* ចំនួនប្រាក់ដុល្លារ (editable) */}
      <td className="px-3">
        <div
          className={`mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border px-2 ${amountFieldDisabledClass} ${getAmountFieldClass(
            member.dollarAmount,
          )}`}
        >
          <input
            type="text"
            inputMode="decimal"
            disabled={readOnly}
            value={member.dollarAmount ?? ""}
            onChange={handleAmountInput(onDollarAmountChange)}
            onFocus={handleAmountFocus(
              "dollarAmount",
              member.dollarAmount,
              onDollarAmountChange,
            )}
            onBlur={() => setFocusedAmountField(null)}
            placeholder={focusedAmountField === "dollarAmount" ? "" : "0.00"}
            className={`w-full bg-transparent text-[13px] outline-none placeholder:text-text-mute disabled:cursor-not-allowed disabled:text-text-mute ${getAmountTextClass(
              member.dollarAmount,
            )}`}
          />
          <span className={`text-[13px] ${getAmountUnitClass(member.dollarAmount)}`}>$</span>
        </div>
      </td>

      {/* វិធីសាស្ត្រទូទាត់ */}
      <td className="px-3">
        <select
          disabled={readOnly}
          value={member.paymentMethod || "Cash"}
          onChange={(e) => onPaymentMethodChange(member.id, e.target.value)}
          className="mx-auto block h-7 w-[82px] rounded-md border border-border bg-bg-page-white px-2 text-[12px] text-text-secondary outline-none focus:border-secondary disabled:cursor-not-allowed disabled:bg-bg-page-gray"
        >
          {monthlyDonationPaymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </td>

      {/* វិក័យប័ត្រ (receipt icon only — the reference text input that used
          to sit above it was dropped; the icon alone opens the receipt
          upload/preview popup). */}
      <td className="px-3">
        <div className="mx-auto flex w-[110px] flex-col items-center">
          <button
            key={receipt?.previewUrl || "receipt-icon"}
            type="button"
            disabled={readOnly}
            onClick={() => onShowInfo(member)}
            className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-md text-secondary transition hover:bg-secondary-light/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("donationPage.receipt")}
            title={receipt?.name || t("donationPage.receipt")}
          >
            <ReceiptIcon size={16} />
          </button>
        </div>
      </td>

      {/* សកម្មភាព (row edit lock only) — nothing renders here outside
          rowEditMode (the whole list is directly editable at once instead),
          so the column itself is dropped rather than left empty; see
          hideAction on AddDonationTableHeader. */}
      {rowEditMode ? (
        <td className="px-3 text-center">
          <div className="relative inline-flex items-center gap-1">
            {/*
              BUGFIX: this used to key off `readOnly`, but `readOnly` is
              ALSO true for every row that isn't currently being edited
              (Table.js: readOnly={globalReadOnly || (rowEditMode &&
              editingRowId !== member.id)}) — that's the intentional lock
              protecting an already-saved donation from stray edits. Keying
              the button that STARTS editing off that same flag meant it
              could never render: a locked row (readOnly=true) hid the only
              control that could unlock it. Only `globalReadOnly` (no edit
              rights at all) should hide this button.
            */}
            {!isEditing && !globalReadOnly ? (
              <button
                type="button"
                onClick={onEdit}
                disabled={editDisabled}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#F2A900] transition hover:bg-[#F2A900]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A900]/40 disabled:cursor-not-allowed disabled:opacity-40"
                title={t("donationPage.editDonation")}
                aria-label={t("donationPage.editDonation")}
              >
                <SquarePen size={16} strokeWidth={2.1} />
              </button>
            ) : null}

            {isEditing && !readOnly ? (
              <>
                <button type="button" onClick={onCancelEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-bg-page-white text-text-secondary hover:bg-bg-page-gray" title={t("donationPage.cancel")}>
                  <X size={14} />
                </button>
                <button type="button" onClick={onSaveEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#4B2E91] text-white hover:bg-[#3f267a]" title={t("donationPage.save")}>
                  <Check size={14} />
                </button>
              </>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  );
}
