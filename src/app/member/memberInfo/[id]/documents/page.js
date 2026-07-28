"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";

import users from "@/data/members.json";

const STORAGE_KEY = "tnal-member-documents";

const DEFAULT_SAVED_DOCUMENTS = {
  idCard: null,
  certificate: null,
};

export default function DocumentPage() {
  const params = useParams();

  const id = params?.id;

  const user = users.find((item) => String(item.id) === String(id));

  const [savedDocuments, setSavedDocuments] = useState(DEFAULT_SAVED_DOCUMENTS);

  /*
   * Load custom documents created
   * by the secretary.
   *
   * When there is no custom document,
   * IdCard and CertificateCard will
   * automatically use their built-in
   * default designs.
   */
  useEffect(() => {
    if (!id) return;

    try {
      const allDocuments = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}",
      );

      const memberDocuments = allDocuments[String(id)] || {};

      setSavedDocuments({
        idCard: memberDocuments.idCard || null,

        certificate: memberDocuments.certificate || null,
      });
    } catch (error) {
      console.error("Cannot load member documents:", error);

      setSavedDocuments(DEFAULT_SAVED_DOCUMENTS);
    }
  }, [id]);

  if (!user) {
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

  /*
   * Use saved data when available.
   * Otherwise, use the current member
   * information from members.json.
   */
  const idCardUser = customIdCard
    ? {
        id: customIdCard.memberId || user.id,

        name_kh: customIdCard.member || user.name_kh,

        name_en: customIdCard.memberNameEn || user.name_en,

        gender: customIdCard.gender || user.gender,

        email: customIdCard.email || user.email,

        phone: customIdCard.phone || user.phone,

        date_of_birth: customIdCard.dateOfBirth || user.date_of_birth,

        branch: customIdCard.branch || user.branch,

        role: customIdCard.role || user.role || "member",

        profile_photo:
          customIdCard.profilePhoto || user.profile_photo || "/profile.png",
      }
    : user;

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
        data={[user]}
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
        data={[user]}
        filename="letter_of_appointment.csv"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment user={user} />
      </DocumentPreviewCard>

      {/* =====================================
          CERTIFICATE
      ===================================== */}

      <DocumentPreviewCard
        title="បណ្ណសរសើរ"
        data={[user]}
        filename="certificate.csv"
        previewClass="scale-[0.35]"
      >
        <CertificateCard
          recipientType="member"
          member={user}
          templatePreview={customCertificate?.templatePreview || ""}
        />
      </DocumentPreviewCard>
    </div>
  );
}
