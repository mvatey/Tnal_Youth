"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileUp } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import QuantityInput from "@/components/forms/QuantityInput";
import members from "@/data/members.json";
import { useSearchParams } from "next/navigation";
import activities from "@/data/activity.json";

import Pagination from "@/components/dashboard/Pagination";

const searchParams = useSearchParams();
const activityId = searchParams.get("activityId");

const activity = activities.find((item) => String(item.id) === String(activityId));

const ROWS_PER_PAGE = 10;
const KHR_PER_USD = 4000;
const initialRows = members.map((member) => ({
  id: member.id,
  name: member.name,
  gender: member.gender,
  joinedDate: member.joinedDate,

  amountRiel: "",
  amountDollar: 0,

  paymentMethod: "Cash",
  receipt: null,
}));

export default function IncomePage() {
  const [rows, setRows] = useState(initialRows);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / ROWS_PER_PAGE)
  );

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return rows.slice(start, start + ROWS_PER_PAGE);
  }, [rows, currentPage]);

  const updateRow = (rowId, key, value) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        const next = { ...row, [key]: value };
        const amountRiel = Number(next.amountRiel) || 0;

        return {
          ...next,
          amountDollar: amountRiel / KHR_PER_USD,
        };
      })
    );
  };

  const summary = useMemo(() => {
    return rows.reduce(
      (total, row) => ({
        riel: total.riel + (Number(row.amountRiel) || 0),
        dollar: total.dollar + (Number(row.amountDollar) || 0),
      }),
      { riel: 0, dollar: 0 }
    );
  }, [rows]);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Link href="/activity" className="hover:text-primary">
            កម្មវិធី
          </Link>
          <ChevronRight size={14} />
          <Link href="/activity/create" className="hover:text-primary">
            បង្កើតកម្មវិធីថ្មី
          </Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-primary">ចំណូល</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">ចំណូល</h1>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="mb-4 flex justify-end">
          <button type="button" className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white">
            <RiDownloadCloud2Line size={18} />
            ទាញយករបាយការណ៍
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="h-11 border-b border-border bg-bg-page-gray text-text-secondary">
                <th className="w-[5%] text-center">ល.រ</th>
                <th className="w-[22%] text-center">សមាជិក</th>
                <th className="w-[9%] text-center">ភេទ</th>
                <th className="w-[14%] text-center">ថ្ងៃខែឆ្នាំចូលរួម</th>
                <th className="w-[15%] text-center">ចំនួនវិភាគទាន(រៀល)</th>
                <th className="w-[15%] text-center">ចំនួនវិភាគទាន($)</th>
                <th className="w-[13%] text-center">វិធីបង់ប្រាក់</th>
                <th className="w-[7%] text-center">វិក្កយបត្រ</th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.map((row, index) => {
                const realIndex = (currentPage - 1) * ROWS_PER_PAGE + index;

                return (
                <tr key={row.id} className="h-12 border-b border-border">
                  <td className="text-center text-text-secondary">{realIndex + 1}</td>

                  <td className="px-2">
                    <p className="font-semibold text-text-primary">{row.name}</p>
                  </td>

                  <td className="text-center text-text-secondary">{row.gender}</td>

                  <td className="text-center text-text-secondary">{row.joinedAt}</td>

                  <td className="px-1">
                    <div className="relative">
                      <input
                        type="number"
                        value={row.amountRiel}
                        onChange={(e) => updateRow(row.id, "amountRiel", e.target.value)}
                        placeholder="0"
                        className="h-9 w-full rounded-md border border-border px-3 pr-8 text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">៛</span>
                    </div>
                  </td>

                  <td className="px-1">
                    <div className="relative">
                      <input
                        readOnly
                        value={Number(row.amountDollar || 0).toFixed(2)}
                        className="h-9 w-full rounded-md border border-border bg-bg-page-gray px-3 pr-8 text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">$</span>
                    </div>
                  </td>

                  <td className="px-1">
                    <select
                      value={row.paymentMethod}
                      onChange={(e) => updateRow(row.id, "paymentMethod", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm outline-none"
                    >
                      <option>Cash</option>
                      <option>ABA</option>
                      <option>ACLEDA</option>
                      <option>Wing</option>
                    </select>
                  </td>

                  <td className="text-center">
                    <button type="button" className="text-secondary hover:text-secondary-hover">
                      <FileUp size={17} />
                    </button>
                  </td>
                </tr>
                );
                })} 
            </tbody>
          </table>
        </div>

        {/* Pagination */}
            <div className="mt-4">
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                />
            </div>


        <div className="mt-5 ml-auto w-[330px] rounded-lg border border-border p-4">
          <h3 className="mb-3 font-bold text-secondary">សរុបចំណូល</h3>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>សរុបចំណូល (រៀល)</span>
            <span>{summary.riel.toLocaleString()} រៀល</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-text-secondary">
            <span>សរុបចំណូល ($)</span>
            <span>{summary.dollar.toFixed(2)} $</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold text-secondary">
            <span>សរុបទាំងអស់ ($)</span>
            <span>{summary.dollar.toFixed(2)} $</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Link href="/activity/create" className="flex h-10 w-32 items-center justify-center rounded-lg border border-border bg-white text-sm font-semibold text-text-secondary">
          បោះបង់
        </Link>

        <Link href="/activity/create" className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-8 text-sm font-semibold text-white hover:bg-secondary-hover">
          <RiDownloadCloud2Line size={18} />
          រក្សាទុក
        </Link>
      </div>
    </div>
  );
}