"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import activities from "@/data/activity.json";
import QuantityInput from "@/components/forms/QuantityInput";

const KHR_PER_USD = 4000;

const initialRows = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: "",
  category: "",
  quantity: 1,
  unitPriceRiel: 0,
  unitPriceDollar: 0,
  totalRiel: 0,
  totalDollar: 0,
}));

export default function ExpensePage({ params }) {
  const { id } = use(params);
  const activity = activities.find((item) => String(item.id) === String(id));
  const [rows, setRows] = useState(initialRows);

const updateRow = (rowId, key, value) => {
  setRows((current) =>
    current.map((row) => {
      if (row.id !== rowId) return row;

      const next = { ...row, [key]: value };
      const quantity = Number(next.quantity) || 0;
      const unitPriceRiel = Number(next.unitPriceRiel) || 0;
      const unitPriceDollar = unitPriceRiel / KHR_PER_USD;

        return {
        ...next,
        unitPriceDollar,
        totalRiel: quantity * unitPriceRiel,
        totalDollar: quantity * unitPriceDollar,
        };
      })
    );
  };


  const deleteRow = (rowId) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const addRowBelow = (rowId) => {
  setRows((current) => {
    const index = current.findIndex((row) => row.id === rowId);

    const newRow = {
      id: Date.now(),
      name: "",
      category: "",
      quantity: 1,
      unitPriceRiel: 0,
      unitPriceDollar: 0,
      totalRiel: 0,
      totalDollar: 0,
    };

    return [
      ...current.slice(0, index + 1),
      newRow,
      ...current.slice(index + 1),
    ];
  });
};

  const summary = useMemo(() => {
    return rows.reduce(
      (total, row) => ({
        riel: total.riel + Number(row.totalRiel || 0),
        dollar: total.dollar + Number(row.totalDollar || 0),
      }),
      { riel: 0, dollar: 0 }
    );
  }, [rows]);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Link href="/activity" className="hover:text-primary">កម្មវិធី</Link>
          <ChevronRight size={14} />
          <Link href={`/activity/${activity?.id}`} className="hover:text-primary">ព័ត៌មានលម្អិត</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-primary">ចំណាយ</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">ចំណាយ</h1>
        <p className="mt-1 text-sm text-text-secondary">{activity?.name}</p>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="mb-4 flex justify-end">
          <button className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white">
            <RiDownloadCloud2Line size={18} />
            ទាញយករបាយការណ៍
            </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="h-11 border-b border-border bg-bg-page-gray text-text-secondary">
                <th className="w-[5%] text-center">ល.រ</th>
                <th className="w-[18%] text-center">ឈ្មោះ</th>
                <th className="w-[18%] text-center">ការពិពណ៌នា</th>
                <th className="w-[9%] text-center">ចំនួន</th>
                <th className="w-[14%] text-center">តម្លៃ/ឯកតា (រៀល)</th>
                <th className="w-[14%] text-center">តម្លៃ/ឯកតា ($)</th>
                <th className="w-[14%] text-center">តម្លៃសរុប ($)</th>
                <th className="w-[8%] text-center">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="h-12 border-b border-border">
                  <td className="text-center text-text-secondary">{index + 1}</td>
                  <td className="px-1"><input value={row.name} onChange={(e) => updateRow(row.id, "name", e.target.value)} placeholder="បញ្ចូលឈ្មោះ" className="h-9 w-full rounded-md border border-border px-3 text-sm outline-none" /></td>
                  <td className="px-1"><input value={row.category} onChange={(e) => updateRow(row.id, "category", e.target.value)} placeholder="បញ្ចូលការពិពណ៌នា" className="h-9 w-full rounded-md border border-border px-3 text-sm outline-none" /></td>
                    <td className="px-1">
                    <QuantityInput value={row.quantity} onChange={(value) => updateRow(row.id, "quantity", value)} />
                    </td>
                    <td className="px-1">
                    <div className="relative">
                        <input type="number" value={row.unitPriceRiel} onChange={(e) => updateRow(row.id, "unitPriceRiel", e.target.value)} className="h-9 w-full rounded-md border border-border px-3 pr-8 text-sm outline-none" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                        ៛
                        </span>
                    </div>
                    </td>
                    <td className="px-1">
                    <div className="relative">
                        <input readOnly value={Number(row.unitPriceDollar || 0).toFixed(2)} className="h-9 w-full rounded-md border border-border bg-bg-page-gray px-3 pr-8 text-sm outline-none" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                        $
                        </span>
                    </div>
                    </td>                  
                    <td className="px-1">
                    <div className="relative">
                        <input readOnly value={Number(row.totalDollar || 0).toFixed(2)} className="h-9 w-full rounded-md border border-border bg-bg-page-gray px-3 pr-8 text-sm outline-none"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                        $
                        </span>
                    </div>
                    </td>                  
                    <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => addRowBelow(row.id)}  className="text-success hover:scale-110 transition">
                        <PlusCircle size={16} />
                        </button>

                        <button type="button" onClick={() => deleteRow(row.id)} className="text-error hover:scale-110 transition" >
                        <Trash2 size={16} />
                        </button>
                    </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 ml-auto w-[330px] rounded-lg border border-border p-4">
          <h3 className="mb-3 font-bold text-secondary">សរុបចំណាយ</h3>
          <div className="flex justify-between text-sm text-text-secondary"><span>សរុបចំណាយ (រៀល)</span><span>{summary.riel.toLocaleString()} រៀល</span></div>
          <div className="mt-2 flex justify-between text-sm text-text-secondary"><span>សរុបចំណាយ ($)</span><span>{summary.dollar.toLocaleString()} $</span></div>
          <div className="mt-3 border-t border-border pt-3 flex justify-between font-bold text-secondary"><span>សរុបទាំងអស់ ($)</span><span>{summary.dollar.toLocaleString()} $</span></div>
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