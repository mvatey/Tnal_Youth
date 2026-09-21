"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

const FORCE_CHANGE_PATH = "/auth/force-password-change";

// Member-linked accounts start on a shared default password
// (PasswordPolicy.DEFAULT_MEMBER_PASSWORD) and are flagged
// mustChangePassword until they set a real one -- see
// MemberServiceImpl.createActiveUserAccount. This gate blocks every other
// route until that's resolved, mounted once at the root layout so it
// applies regardless of which section's layout.js is active.
export default function MustChangePasswordGate() {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      isLoggedIn &&
      user?.mustChangePassword &&
      pathname !== FORCE_CHANGE_PATH
    ) {
      router.replace(FORCE_CHANGE_PATH);
    }
  }, [isLoggedIn, user?.mustChangePassword, pathname, router]);

  return null;
}
