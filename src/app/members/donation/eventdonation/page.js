import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationPanel from "@/components/donations/eventdonation/EventDonationPanel";
import members from "@/data/donation/members.json";

const currentMember = members.find((member) => member.email === "member@example.com");

export default function MemberEventDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <EventDonationPanel
        showBranchFilter={false}
        showActions={false}
        scopedBranch={currentMember?.branch}
      />
    </div>
  );
}
