"use client";

import { usePathname } from "next/navigation";
import DonationDetailButton from "@/components/donations/DonationDetailButton";

export default function TableRow({ row, rowNumber }) {
  const pathname = usePathname();
  const addPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/monthly/add"
    : "/donation/monthlydonation/add";
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
      <td className="px-4 font-normal text-text-secondary">{row.branch}</td>
      <td className="px-4">{row.month}</td>
      <td className="px-4">{row.year}</td>
      <td className="px-4">{row.monthlyUsd}</td>
      <td className="px-4">
        <div className="flex items-center justify-center gap-[5px]">
          <DonationDetailButton href={detailHref} />
        </div>
      </td>
    </tr>
  );
}
