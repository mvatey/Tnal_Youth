import { notFound } from "next/navigation";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";

import users from "@/data/members.json";

export default async function Page({ params }) {
  const { id } = await params;

  const user = users.find((item) => String(item.id) === String(id));

  if (!user) {
    notFound();
  }

  return (
    <div className="flex justify-center gap-6 p-6">
      {/* ID CARD */}
      <DocumentPreviewCard
        title="ប័ណ្ណសមាជិក"
        data={[user]}
        filename="member-card.csv"
        previewClass="scale-[0.55]"
      >
        <IdCard user={user} />
      </DocumentPreviewCard>

      {/* CERTIFICATE */}
      <DocumentPreviewCard
        title="វិញ្ញាបនបត្រ"
        data={[user]}
        filename="certificate.csv"
        previewClass="scale-[0.35]"
      >
        <CertificateCard user={user} />
      </DocumentPreviewCard>
    </div>
  );
}
