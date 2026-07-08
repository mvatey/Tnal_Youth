"use client";

import Image from "next/image";
import { Info } from "lucide-react";

const PAYMENT_METHODS = ["Cash", "ABA", "Wing", "Bank Transfer"];

export default function AddDonationTableRow({ index, member, onAmountChange, onPaymentMethodChange, onShowInfo }) {
  const handleAmountInput = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    onAmountChange(member.id, value);
  };

  return (
    <tr className="h-10 border-b border-gray-100 text-xs transition-colors hover:bg-gray-50">
      {/* ល.រ */}
      <td className="px-3 text-xs text-gray-600">{index + 1}</td>

      {/* សមាជិក (avatar + name) */}
      <td className="px-3">
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {member.avatar ? (
              <Image src={member.avatar} alt={member.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
                {member.name?.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-gray-800">{member.name}</span>
        </div>
      </td>

      {/* ភេទ */}
      <td className="px-3 text-xs text-gray-600">{member.gender}</td>

      {/* ថ្ងៃខែឆ្នាំកំណើត */}
      <td className="whitespace-nowrap px-3 text-xs text-gray-600">{member.dob}</td>

      {/* ចំនួនប្រាក់ចាស់ (read-only, previous amount) */}
      <td className="px-3">
        <div className="w-20 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500">
          {member.oldAmount ?? 0}
        </div>
      </td>

      {/* ចំនួនប្រាក់ថ្មី (editable) */}
      <td className="px-3">
        <div className="flex w-24 items-center gap-1 rounded-md border border-gray-300 px-2 py-1">
          <input
            type="text"
            inputMode="decimal"
            value={member.newAmount ?? ""}
            onChange={handleAmountInput}
            placeholder="0.00"
            className="w-full text-xs text-gray-800 outline-none"
          />
          <span className="text-xs text-gray-400">$</span>
        </div>
      </td>

      {/* វិធីសាស្ត្រទូទាត់ */}
      <td className="px-3">
        <select
          value={member.paymentMethod || "Cash"}
          onChange={(e) => onPaymentMethodChange(member.id, e.target.value)}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 outline-none focus:border-indigo-400"
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </td>

      {/* ព័ត៌មានបន្ថែម */}
      <td className="px-3 text-center">
        <button
          type="button"
          onClick={() => onShowInfo(member)}
          className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50"
          aria-label="More info"
        >
          <Info size={16} />
        </button>
      </td>
    </tr>
  );
}
