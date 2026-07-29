"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DetailButton from "@/components/ui/actions/DetailButton";
import { Trash2 } from "lucide-react";

export default function TableRow({ row, rowNumber, onDelete, hasMoney = false }) {
  const pathname = usePathname();
  const addPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/add"
    : "/donation/add";
  const detailHref = {
    pathname: addPath,
    query: {
      branch: row.branch,
      month: row.month,
      year: row.year,
    },
  };

  return (
    <tr className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0">
      <td className="px-4 font-normal text-text-secondary">{rowNumber}</td>
      <td className="px-4 font-normal text-text-secondary">{row.month}</td>
      <td className="px-4">{row.year}</td>
      <td className="px-4">{row.branch}</td>
      <td className="px-4">{row.monthlyRiel}</td>
      <td className="px-4">{row.monthlyUsd}</td>
      <td className="px-4">{row.total}</td>
      <td className="px-4">
        <div className="flex items-center justify-center gap-[5px]">
          <Link href={detailHref}>
            <DetailButton />
          </Link>
          <button
          type="button"
          className="inline-flex h-[18px] w-[18px] items-center justify-center text-[#E92824] transition hover:text-red-700"
          aria-label={`Delete donation row ${row.id}`}
          onClick={() => onDelete(row.id)}
          >
        <Trash2 size={18} />
        </button>
        </div>
      </td>
    </tr>
  );
}
