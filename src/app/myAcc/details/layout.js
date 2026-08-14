"use client";

import MyAccountDetailTabNav from "@/components/navigation/MyAccountDetailTabNav";

export default function DetailsLayout({ children }) {
  return (
    <div className="space-y-4">
      <MyAccountDetailTabNav />
      <div>{children}</div>
    </div>
  );
}
