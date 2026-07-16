"use client";

import Link from "next/link";
import { ListIcon } from "lucide-react";

export default function DonationDetailButton({ href, className = "" }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-[22px] items-center justify-center gap-1 rounded-full bg-secondary px-3 text-[10px] font-medium leading-none text-white transition hover:bg-secondary-hover ${className}`}
    >
      <ListIcon size={12} strokeWidth={2.3} />
      លម្អិត
    </Link>
  );
}
