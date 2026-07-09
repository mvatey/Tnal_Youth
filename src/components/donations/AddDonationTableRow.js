"use client";

import Image from "next/image";

const PAYMENT_METHODS = ["Cash", "ABA", "Wing", "Bank Transfer"];
const RECEIPT_ICON_COLOR = "#4B2E91";

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
}) {
  const handleAmountInput = (callback) => (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    callback(member.id, value);
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
        <div className="mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border border-slate-400 bg-white px-2">
          <input
            type="text"
            inputMode="decimal"
            value={member.realAmount ?? ""}
            onChange={handleAmountInput(onRealAmountChange)}
            placeholder="0"
            className="w-full bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-500"
          />
          <span className="text-[13px] text-slate-500">៛</span>
        </div>
      </td>

      {/* ចំនួនប្រាក់ដុល្លារ (editable) */}
      <td className="px-3">
        <div className="mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border border-slate-400 bg-white px-2">
          <input
            type="text"
            inputMode="decimal"
            value={member.dollarAmount ?? ""}
            onChange={handleAmountInput(onDollarAmountChange)}
            placeholder="0.00"
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
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </td>

      {/* វិក្ក័យបត្រ */}
      <td className="px-3 text-center">
        <button
          type="button"
          onClick={() => onShowInfo(member)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#4B2E91] hover:bg-[#4B2E91]/10"
          aria-label="receipt"
        >
          <ReceiptIcon size={18} />
        </button>
      </td>
    </tr>
  );
}
