"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import DonationDetailButton from "@/components/donations/DonationDetailButton";

export default function MonthlyDonationMemberRow({ row, rowNumber }) {
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
      <td className="px-4 font-normal">{rowNumber}</td>
      <td className="px-4 text-left">
        <div className="flex items-center gap-3">
          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-primary-light">
            {row.avatar ? (
              <Image src={row.avatar} alt={row.name} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-primary">
                {row.name?.charAt(0)}
              </span>
            )}
          </div>
          <span className="min-w-0 truncate font-medium">{row.name}</span>
        </div>
      </td>
      <td className="px-4">{row.branch}</td>
      <td className="px-4">{row.month}</td>
      <td className="px-4">{row.year}</td>
      <td className="px-4">{row.amount}</td>
      <td className="px-4">{row.paymentMethod}</td>
      <td className="px-4">
        <DonationDetailButton href={detailHref} />
      </td>
    </tr>
  );
}
