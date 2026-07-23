"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUp, CircleDollarSign } from "lucide-react";
import sponsorData from "@/data/donation/sponsorData.json";

const { sponsorRows } = sponsorData;
const SPONSOR_CREATED_ROWS_KEY = "tnal-youth:sponsor-donation-created-rows";
const RIEL_PER_DOLLAR = 4000;
const parseMoney = (value) =>
  Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

export default function SponsorCard({
  label = "ថវិកាឧបត្ថម្ភ",
  growth = "+15%",
  note = "ក្នុងខែនេះ",
}) {
  const [createdRows, setCreatedRows] = useState([]);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(SPONSOR_CREATED_ROWS_KEY);

    try {
      const rows = savedValue ? JSON.parse(savedValue) : [];
      setCreatedRows(
        Array.isArray(rows) ? rows.filter((row) => row.name?.trim()) : [],
      );
    } catch {
      setCreatedRows([]);
    }
  }, []);

  const value = useMemo(() => {
    const totals = [...createdRows, ...sponsorRows].reduce(
      (sum, row) => ({
        riel: sum.riel + parseMoney(row.rielAmount),
        dollar: sum.dollar + parseMoney(row.dollarAmount),
      }),
      { riel: 0, dollar: 0 },
    );
    const dollarTotal = totals.dollar + totals.riel / RIEL_PER_DOLLAR;

    return `$${dollarTotal.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  }, [createdRows]);

  return (
    <article className="h-[65px] w-[200px] rounded-2xl border-2 border-border bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md">
      <div className="flex h-full items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EADDFC] text-[#5636A3]">
          <CircleDollarSign size={24} strokeWidth={2.5} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium leading-tight text-text-primary">
                {label}
              </p>
              <p className="mt-1 truncate text-[14px] font-medium leading-none text-black">
                {value}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
              <span className="flex items-center text-[10px] font-medium leading-none text-emerald-500">
                <ArrowUp size={12} strokeWidth={3} />
                {growth}
              </span>
              <span className="text-[10px] font-medium leading-none text-black">
                {note}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
