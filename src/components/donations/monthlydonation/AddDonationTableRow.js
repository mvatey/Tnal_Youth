"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, X } from "lucide-react";
import donationOptions from "@/data/donation/donationOptions.json";

const RECEIPT_ICON_COLOR = "#4B2E91";
const { monthlyDonationPaymentMethods } = donationOptions;

const getAmountFieldClass = (value) =>
  Number(value) > 0
    ? "border-[#65686b] bg-[#eef5f3]"
    : "border-[#65686b] bg-[#e5e7eb]";

function ReceiptIcon({ size = 20 }) {
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
  onRemoveReceipt,
}) {
  const [focusedAmountField, setFocusedAmountField] = useState(null);
  const receipt = member.receipt;
  const hasReceiptImage = Boolean(receipt?.previewUrl);

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
            {member.avatar ? (
              <Image src={member.avatar} alt={member.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[12px] font-medium text-slate-500">
                {member.name?.charAt(0)}
              </div>
            )}
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
            value={member.realAmount ?? ""}
            onChange={handleAmountInput(onRealAmountChange)}
            onFocus={handleAmountFocus(
              "realAmount",
              member.realAmount,
              onRealAmountChange,
            )}
            onBlur={() => setFocusedAmountField(null)}
            placeholder={focusedAmountField === "realAmount" ? "" : "0"}
            className="w-full bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-500"
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
            value={member.dollarAmount ?? ""}
            onChange={handleAmountInput(onDollarAmountChange)}
            onFocus={handleAmountFocus(
              "dollarAmount",
              member.dollarAmount,
              onDollarAmountChange,
            )}
            onBlur={() => setFocusedAmountField(null)}
            placeholder={focusedAmountField === "dollarAmount" ? "" : "0.00"}
            className="w-full bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-500"
          />
          <span className="text-[13px] text-slate-500">$</span>
        </div>
      </td>

      {/* វិធីសាស្ត្រទូទាត់ */}
      <td className="px-3">
        <select
          value={member.paymentMethod || "Cash"}
          onChange={(e) => onPaymentMethodChange(member.id, e.target.value)}
          className="mx-auto block h-7 w-[82px] rounded-md border border-slate-400 bg-white px-2 text-[12px] text-slate-600 outline-none focus:border-[#4B2E91]"
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
        <div className="relative inline-flex">
          <button
            key={receipt?.previewUrl || "receipt-icon"}
            type="button"
            onClick={() => onShowInfo(member)}
            className={`inline-flex items-center justify-center overflow-hidden rounded-md text-[#4B2E91] transition hover:bg-[#4B2E91]/10 ${
              receipt
                ? "h-8 w-11 border border-[#4B2E91]/20 bg-white"
                : "h-7 w-7"
            }`}
            aria-label="receipt"
            title={receipt?.name || "receipt"}
          >
            {hasReceiptImage ? (
              <img
                key={receipt.previewUrl}
                src={receipt.previewUrl}
                alt={receipt.name || "Receipt"}
                className="block h-full w-full object-cover"
              />
            ) : receipt ? (
              <FileText size={18} strokeWidth={2.2} />
            ) : (
              <ReceiptIcon size={18} />
            )}
          </button>

          {receipt && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveReceipt?.(member.id);
              }}
              className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-sm transition hover:bg-[#DC2626]"
              aria-label="Remove receipt"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
