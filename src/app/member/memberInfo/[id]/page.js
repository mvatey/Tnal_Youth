"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemberInfoPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    router.replace(
      `/member/memberInfo/${encodeURIComponent(id)}/documents`,
    );
  }, [id, router]);

  return null;
}
