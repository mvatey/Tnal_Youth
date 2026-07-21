"use client";

import { getCurrentMember } from "@/lib/currentMember";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";

export default function DocumentsPage() {
  const member = getCurrentMember();

  if (!member) {
    return (
      <div className="rounded-xl bg-white p-6">
        រកមិនឃើញព័ត៌មានសមាជិក
      </div>
    );
  }

  return (
    <div className="min-w-0 p-5">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* ID CARD */}
        <div className="min-w-0">
          <DocumentPreviewCard
            title="ប័ណ្ណសម្គាល់សមាជិក"
            data={[member]}
            filename="member-card.csv"
            previewClass="scale-[0.52]"
          >
            <IdCard user={member} />
          </DocumentPreviewCard>
        </div>

        {/* LETTER */}
        <div className="min-w-0">
          <DocumentPreviewCard
            title="លិខិតតែងតាំង"
            data={[member]}
            filename="letter_of_appointment.csv"
            previewClass="scale-[0.34]"
          >
            <LetterOfAppointment user={member} />
          </DocumentPreviewCard>
        </div>

        {/* CERTIFICATE */}
        <div className="min-w-0">
          <DocumentPreviewCard
            title="បណ្ណសរសើរ"
            data={[member]}
            filename="certificate.csv"
            previewClass="scale-[0.34]"
          >
            <CertificateCard user={member} />
          </DocumentPreviewCard>
        </div>
      </div>
    </div>
  );
}