"use client";

import { useEffect, useState } from "react";

import { getCurrentMember } from "@/lib/currentMember";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";

const STORAGE_KEY = "tnal-member-documents";

const DEFAULT_SAVED_DOCUMENTS = {
  idCard: null,
  certificate: null,
};

export default function DocumentsPage() {
  const [member, setMember] = useState(null);

  const [savedDocuments, setSavedDocuments] = useState(DEFAULT_SAVED_DOCUMENTS);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const currentMember = getCurrentMember();

      setMember(currentMember);

      if (!currentMember?.id) {
        return;
      }

      const allDocuments = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}",
      );

      const memberDocuments = allDocuments[String(currentMember.id)] || {};

      setSavedDocuments({
        idCard: memberDocuments.idCard || null,

        certificate: memberDocuments.certificate || null,
      });
    } catch (error) {
      console.error("Cannot load current member documents:", error);

      setSavedDocuments(DEFAULT_SAVED_DOCUMENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-6
          text-center
          text-sm
          text-gray-500
        "
      >
        កំពុងផ្ទុកឯកសារ...
      </div>
    );
  }

  if (!member) {
    return (
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-6
          text-center
          text-sm
          text-gray-500
        "
      >
        រកមិនឃើញព័ត៌មានសមាជិក
      </div>
    );
  }

  const customIdCard = savedDocuments.idCard;

  const customCertificate = savedDocuments.certificate;

  const idCardUser = customIdCard
    ? {
        id: customIdCard.memberId || member.id,

        name_kh: customIdCard.member || member.name_kh,

        name_en: customIdCard.memberNameEn || member.name_en,

        gender: customIdCard.gender || member.gender,

        email: customIdCard.email || member.email,

        phone: customIdCard.phone || member.phone,

        date_of_birth: customIdCard.dateOfBirth || member.date_of_birth,

        branch: customIdCard.branch || member.branch,

        role: customIdCard.role || member.role || "member",

        profile_photo:
          customIdCard.profilePhoto || member.profile_photo || "/profile.png",
      }
    : member;

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-8
        p-6
        lg:grid-cols-2
        2xl:grid-cols-3
      "
    >
      {/* =====================================
          ID CARD
      ===================================== */}

      <DocumentPreviewCard
        title="ប័ណ្ណសម្គាល់សមាជិក"
        data={[member]}
        filename="member-card.csv"
        previewClass="scale-[0.55]"
      >
        <IdCard
          user={idCardUser}
          templatePreview={customIdCard?.templatePreview || ""}
        />
      </DocumentPreviewCard>

      {/* =====================================
          LETTER OF APPOINTMENT
      ===================================== */}

      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        data={[member]}
        filename="letter_of_appointment.csv"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment user={member} />
      </DocumentPreviewCard>

      {/* =====================================
          CERTIFICATE
      ===================================== */}

      <DocumentPreviewCard
        title="បណ្ណសរសើរ"
        data={[member]}
        filename="certificate.csv"
        previewClass="scale-[0.35]"
      >
        <CertificateCard
          recipientType="member"
          member={member}
          templatePreview={customCertificate?.templatePreview || ""}
        />
      </DocumentPreviewCard>
    </div>
  );
}
