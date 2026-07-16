"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function MonthlyDonationMemberRow({ row, rowNumber }) {
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
    <tr className="h-[42px] border-b border-border bg-white text-center text-[12px] text-text-secondary last:border-b-0 hover:bg-primary-lighter/50">
      <td className="px-3 font-medium">{rowNumber}</td>
      <td className="px-3 text-left">
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
      <td className="px-3">{row.gender}</td>
      <td className="px-3">{row.role}</td>
      <td className="px-3">{row.year}</td>
      <td className="px-3 font-medium">{row.amount}</td>
      <td className="px-3">{row.paymentMethod}</td>
      <td className="px-3">
        <Link
          href={detailHref}
          className="inline-flex h-[22px] items-center justify-center gap-1 rounded-full bg-secondary px-3 text-[10px] font-medium leading-none text-white transition hover:bg-secondary-hover"
        >
          <CheckCircle2 size={12} strokeWidth={2.3} />
          បញ្ជាក់
        </Link>
      </td>
    </tr>
  );
}
