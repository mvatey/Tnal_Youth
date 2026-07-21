import { notFound } from "next/navigation";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";


import users from "@/data/members.json";

export default async function Document({ params }) {
  const { id } = await params;

  const user = users.find((item) => String(item.id) === String(id));

  if (!user) {
    notFound();
  }

  return (
    <div className="flex justify-center gap-8 p-6">
      {/* ID CARD */}
      <DocumentPreviewCard
        title="ប័ណ្ណសម្គាល់សមាជិក"
        data={[user]}
        filename="member-card.csv"
        previewClass="scale-[0.55]"
      >
        <IdCard user={user} />
      </DocumentPreviewCard>

      {/* Letter of appointment */}
      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        data={[user]}
        filename="letter_of_appointment.csv"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment user={user} />
      </DocumentPreviewCard>

      {/* CERTIFICATE */}
      <DocumentPreviewCard
        title="បណ្ណសរសើរ"
        data={[user]}
        filename="certificate.csv"
        previewClass="scale-[0.35]"
      >
        <CertificateCard user={user} />
      </DocumentPreviewCard>

    </div>
  );
}
