"use client";

import useCurrentMember from "@/hooks/useCurrentMember";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";

export default function DocumentsPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 text-error">
        {error}
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl bg-white p-6">
        រកមិនឃើញព័ត៌មានសមាជិក
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-8 p-6">
      {/* ID CARD */}
      <DocumentPreviewCard
        title="ប័ណ្ណសម្គាល់សមាជិក"
        data={[member]}
        filename="member-card.csv"
        previewClass="scale-[0.55]"
      >
        <IdCard user={member} />
      </DocumentPreviewCard>

      {/* LETTER */}
      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        data={[member]}
        filename="letter_of_appointment.csv"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment user={member} />
      </DocumentPreviewCard>

      {/* CERTIFICATE */}
      <DocumentPreviewCard
        title="បណ្ណសរសើរ"
        data={[member]}
        filename="certificate.csv"
        previewClass="scale-[0.35]"
      >
        <CertificateCard user={member} />
      </DocumentPreviewCard>
    </div>
  );
}