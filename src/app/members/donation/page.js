"user client";

import DonationTabs from "@/components/donations/DonationTabs";
import DonationTable from "@/components/donations/monthlydonation/DonationTable";
import members from "@/data/donation/members.json";

const currentMember = members.find((member) => member.email === "member@example.com");

export default function DonationPage() {
    return (
        <div className="space-y-4">
            <DonationTabs />
            <DonationTable showActions={false} scopedBranch={currentMember?.branch} />
        </div>   
    )
}

