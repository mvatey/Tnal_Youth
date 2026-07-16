"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function AddDonationLink({ href = "/donation/add" }) {
  return (
    <Link
      href={href}
      className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-lg bg-success px-4 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
    >
      <PlusCircle size={17} />
      បន្ថែមវិភាគទាន
    </Link>
  );
}
