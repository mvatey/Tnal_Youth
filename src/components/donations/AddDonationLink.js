"use client";

import { PlusCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import useCurrentMember from "@/hooks/useCurrentMember";

export default function AddDonationLink() {
  const router = useRouter();
  const pathname = usePathname();
  const { member, loading } = useCurrentMember();
  const canAddDonation = ["secretary", "branch_leader"].includes(
    member?.role,
  );

  if (loading || !canAddDonation) return null;

  const addPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/add"
    : "/donation/add";

  return (
    <button
      type="button"
      onClick={() => router.push(addPath)}
      className="inline-flex h-[34px] items-center gap-2 rounded-lg bg-success px-4 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
    >
      <PlusCircle size={17} />
      បន្ថែមវិភាគទាន
    </button>
  );
}
