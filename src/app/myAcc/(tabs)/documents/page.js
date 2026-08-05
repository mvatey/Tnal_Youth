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
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          កំពុងទាញយកឯកសារ...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">
          រកមិនឃើញព័ត៌មានសមាជិក
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-10
        p-6
        lg:grid-cols-2
        2xl:grid-cols-3
      "
    >
      <DocumentPreviewCard
        title="ប័ណ្ណសម្គាល់សមាជិក"
        actionType="print"
        printText="បោះពុម្ព"
        previewClass="scale-[0.55]"
      >
        <IdCard
          user={member}
          templatePreview=""
        />
      </DocumentPreviewCard>

      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        actionType="download"
        downloadText="ទាញយក"
        filename={`letter-of-appointment-${member.id}.pdf`}
        orientation="landscape"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment
          user={member}
          templatePreview=""
        />
      </DocumentPreviewCard>

      <DocumentPreviewCard
        title="បណ្ណសរសើរ"
        actionType="download"
        downloadText="ទាញយក"
        filename={`certificate-${member.id}.pdf`}
        orientation="landscape"
        previewClass="scale-[0.35]"
      >
        <CertificateCard
          recipientType="member"
          member={member}
          templatePreview=""
        />
      </DocumentPreviewCard>
    </div>
  );
}