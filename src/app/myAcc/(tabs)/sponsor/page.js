"use client";

import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";

// The member's own sponsor (activity) donations -- SponsorPanel already
// knows how to fetch and map this for a "member"-role viewer (see its
// isMemberScoped branch, backed by GET /api/my-account/donations/sponsors),
// the same real sponsor-donation shape (name, type, branch, activity,
// amount KHR/USD, payment method) the admin-side Sponsor tab shows,
// instead of the Month/Year monthly-donation shape this page used to
// reuse by mistake. readOnly hides the branch-management controls a plain
// member has no access to anyway (add button, per-row edit, branch/type
// filters), and shows the same totals summary the embedded read-only
// views elsewhere already use.
//
// Kept as its own file (rather than deleted along with the myAcc Sponsor
// tab) because src/app/donation/sponsor/page.js imports this component
// directly for a member-role viewer -- it is not dead code.
export default function MyAccountSponsorPage() {
  return <SponsorPanel readOnly embedded={false} />;
}
