// app/variable/layout.js

"use client";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import useCurrentMember from "@/hooks/useCurrentMember";

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  admin: "អ្នកគ្រប់គ្រង",
};

export default function VariableLayout({ children }) {
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
    "អ្នកគ្រប់គ្រង";

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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="កំណត់អថេរ" />

        <main className="min-h-0 flex-1 overflow-hidden bg-bg-page-gray">
          <div className="no-scrollbar h-full overflow-y-auto p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}