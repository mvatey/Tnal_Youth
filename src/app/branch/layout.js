"use client";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import useCurrentMember from "@/hooks/useCurrentMember";

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",

  admin: "អ្នកគ្រប់គ្រង",
  secretary: "លេខាធិការ",
  branch_leader: "ប្រធានសាខា",
  member: "សមាជិក",
};

export default function BranchLayout({ children }) {
  const { member } = useCurrentMember();

  const userName =
    member?.name_kh ||
    member?.fullNameKm ||
    member?.name_en ||
    member?.fullNameEn ||
    "អ្នកប្រើប្រាស់";

  const userTitle =
    member?.roleLabel ||
    ROLE_LABELS[member?.role] ||
    member?.role ||
    "គណនី";

  const userAvatar =
    member?.profile_photo ||
    member?.profileImage ||
    "/member.png";

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role={member?.role || "ADMIN"}
        userName={userName}
        userTitle={userTitle}
        userAvatar={userAvatar}
      />

      {/* Right-side application area */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="សាខា" />

        <main className="min-h-0 flex-1 overflow-hidden bg-bg-page-gray">
          <div className="branch-ui no-scrollbar h-full overflow-y-auto p-5">
            {children}
          </div>
        </main>

        {/* Branch modals render here, excluding the sidebar */}
        <div
          id="branch-modal-root"
          className="pointer-events-none absolute inset-0 z-[9999]"
        />
      </div>
    </div>
  );
}