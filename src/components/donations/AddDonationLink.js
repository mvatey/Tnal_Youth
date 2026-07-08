"use client";

import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddDonationLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/donation/add")}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-success px-4 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
    >
      <PlusCircle size={17} />
      បន្ថែមវិភាគទាន
    </button>
  );
}
