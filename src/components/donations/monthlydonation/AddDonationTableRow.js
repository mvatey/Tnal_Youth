"use client";

import { useState } from "react";
import { Check, SquarePen, X } from "lucide-react";
import donationOptions from "@/data/donation/donationOptions.json";

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

const getAmountFieldClass = (value) =>
  Number(value) > 0
    ? "border-[#65686b] bg-[#eef5f3]"
    : "border-[#65686b] bg-[#e5e7eb]";

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
  rowEditMode = false,
  isEditing = false,
  editDisabled = false,
  onEdit,
  onCancelEdit,
  onSaveEdit,
}) {
  const [focusedAmountField, setFocusedAmountField] = useState(null);
  const receipt = member.receipt;
  const avatarUrl = normalizeAvatarUrl(member.avatar);

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
    <tr className="h-[42px] border-b border-[#e5eaf0] bg-[#fbfcfe] text-center text-[12px] text-slate-500 transition-colors hover:bg-[#f6f8fb]">
      {/* ល.រ */}
      <td className="px-3 font-medium">{index + 1}</td>

      {/* សមាជិក (avatar + name) */}
      <td className="px-3 text-left">
        <div className="flex items-center gap-3">
          <div className="relative h-[26px] w-[26px] shrink-0 overflow-hidden rounded-full bg-slate-200">
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
          <span className="whitespace-nowrap font-medium text-slate-500">{member.name}</span>
        </div>
      </td>

      {/* ភេទ */}
      <td className="px-3">{member.gender}</td>

      {/* ថ្ងៃខែឆ្នាំកំណើត */}
      <td className="whitespace-nowrap px-3">{member.dob}</td>

      {/* ចំនួនប្រាក់រៀល (editable) */}
      <td className="px-3">
        <div
          className={`mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border px-2 ${getAmountFieldClass(
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
            className="w-full bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          />
          <span className="text-[13px] text-slate-500">៛</span>
        </div>
      </td>

      {/* ចំនួនប្រាក់ដុល្លារ (editable) */}
      <td className="px-3">
        <div
          className={`mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border px-2 ${getAmountFieldClass(
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
            className="w-full bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          />
          <span className="text-[13px] text-slate-500">$</span>
        </div>
      </td>

      {/* វិធីសាស្ត្រទូទាត់ */}
      <td className="px-3">
        <select
          disabled={readOnly}
          value={member.paymentMethod || "Cash"}
          onChange={(e) => onPaymentMethodChange(member.id, e.target.value)}
          className="mx-auto block h-7 w-[82px] rounded-md border border-slate-400 bg-white px-2 text-[12px] text-slate-600 outline-none focus:border-[#4B2E91] disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {monthlyDonationPaymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </td>

      {/* វិក្ក័យបត្រ */}
      <td className="px-3 text-center">
        <div className="relative inline-flex items-center gap-1">
          <button
            key={receipt?.previewUrl || "receipt-icon"}
            type="button"
            disabled={readOnly}
            onClick={() => onShowInfo(member)}
            className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-md text-[#4B2E91] transition hover:bg-[#4B2E91]/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="receipt"
            title={receipt?.name || "receipt"}
          >
            <ReceiptIcon size={18} />
          </button>

          {rowEditMode && !isEditing && !readOnly ? (
            <button
              type="button"
              onClick={onEdit}
              disabled={editDisabled}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#F2A900] transition hover:bg-[#F2A900]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A900]/40 disabled:cursor-not-allowed disabled:opacity-40"
              title="Edit this donation"
              aria-label="Edit this donation"
            >
              <SquarePen size={20} strokeWidth={2.1} />
            </button>
          ) : null}

          {rowEditMode && isEditing && !readOnly ? (
            <>
              <button type="button" onClick={onCancelEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50" title="Cancel">
                <X size={14} />
              </button>
              <button type="button" onClick={onSaveEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#4B2E91] text-white hover:bg-[#3f267a]" title="Save">
                <Check size={14} />
              </button>
            </>
          ) : null}

        </div>
      </td>
    </tr>
  );
}
