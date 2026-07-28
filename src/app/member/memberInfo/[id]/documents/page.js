"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";

import { getTemplateUrl } from "@/lib/documentStorage";

import users from "@/data/members.json";

const STORAGE_KEY = "tnal-member-documents";

const DEFAULT_SAVED_DOCUMENTS = {
  idCards: [],
  certificates: [],
};

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeOldDocuments(memberDocuments) {
  const oldIdCard = memberDocuments?.idCard;
  const oldCertificate = memberDocuments?.certificate;

  const idCards = normalizeArray(
    memberDocuments?.idCards,
  );

  const certificates = normalizeArray(
    memberDocuments?.certificates,
  );

  return {
    idCards:
      idCards.length > 0
        ? idCards
        : oldIdCard
          ? [oldIdCard]
          : [],

    certificates:
      certificates.length > 0
        ? certificates
        : oldCertificate
          ? [oldCertificate]
          : [],
  };
}

export default function DocumentPage() {
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const user = useMemo(() => {
    return users.find(
      (item) =>
        String(item.id) === String(id),
    );
  }, [id]);

  const [savedDocuments, setSavedDocuments] =
    useState(DEFAULT_SAVED_DOCUMENTS);

  const [templateUrls, setTemplateUrls] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let active = true;

    const generatedUrls = [];

    async function loadMemberDocuments() {
      try {
        setLoading(true);

        const allDocuments = JSON.parse(
          localStorage.getItem(
            STORAGE_KEY,
          ) || "{}",
        );

        const memberDocuments =
          allDocuments[String(id)] || {};

        const normalizedDocuments =
          normalizeOldDocuments(
            memberDocuments,
          );

        const urls = {};

        const allCreatedDocuments = [
          ...normalizedDocuments.idCards,
          ...normalizedDocuments.certificates,
        ];

        for (const document of allCreatedDocuments) {
          if (
            !document?.id ||
            !document?.templateStorageId
          ) {
            continue;
          }

          try {
            const url =
              await getTemplateUrl(
                document.templateStorageId,
              );

            if (url) {
              urls[document.id] = url;
              generatedUrls.push(url);
            }
          } catch (error) {
            console.error(
              `Cannot load template ${document.templateStorageId}:`,
              error,
            );
          }
        }

        if (!active) {
          generatedUrls.forEach(
            (url) => {
              URL.revokeObjectURL(url);
            },
          );

          return;
        }

        setSavedDocuments(
          normalizedDocuments,
        );

        setTemplateUrls(urls);
      } catch (error) {
        console.error(
          "Cannot load member documents:",
          error,
        );

        if (active) {
          setSavedDocuments(
            DEFAULT_SAVED_DOCUMENTS,
          );

          setTemplateUrls({});
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMemberDocuments();

    return () => {
      active = false;

      generatedUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          កំពុងទាញយកឯកសារ...
        </p>
      </div>
    );
  }

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

  const customIdCards =
    savedDocuments.idCards;

  const customCertificates =
    savedDocuments.certificates;

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
          DEFAULT ID CARD
      ===================================== */}

      <DocumentPreviewCard
        title="ប័ណ្ណសម្គាល់សមាជិក"
        data={[user]}
        filename="member-card.csv"
        previewClass="scale-[0.55]"
      >
        <IdCard
          user={user}
          templatePreview=""
        />
      </DocumentPreviewCard>

      {/* =====================================
          CREATED ID CARDS
      ===================================== */}

      {customIdCards.map(
        (customIdCard, index) => {
          const idCardUser = {
            id:
              customIdCard.memberId ||
              user.id,

            name_kh:
              customIdCard.member ||
              user.name_kh,

            name_en:
              customIdCard.memberNameEn ||
              user.name_en,

            gender:
              customIdCard.gender ||
              user.gender,

            email:
              customIdCard.email ||
              user.email,

            phone:
              customIdCard.phone ||
              user.phone,

            date_of_birth:
              customIdCard.dateOfBirth ||
              user.date_of_birth,

            branch:
              customIdCard.branch ||
              user.branch,

            role:
              customIdCard.role ||
              user.role ||
              "member",

            profile_photo:
              customIdCard.profilePhoto ||
              user.profile_photo ||
              "/profile.png",
          };

          return (
            <DocumentPreviewCard
              key={
                customIdCard.id ||
                `id-card-${index}`
              }
              title={`ប័ណ្ណសម្គាល់សមាជិក ${
                index + 1
              }`}
              data={[idCardUser]}
              filename={`member-card-${
                index + 1
              }.csv`}
              previewClass="scale-[0.55]"
            >
              <IdCard
                user={idCardUser}
                templatePreview={
                  templateUrls[
                    customIdCard.id
                  ] || ""
                }
              />
            </DocumentPreviewCard>
          );
        },
      )}

      {/* =====================================
          LETTER OF APPOINTMENT
      ===================================== */}

      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        data={[user]}
        filename="letter_of_appointment.csv"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment
          user={user}
        />
      </DocumentPreviewCard>

      {/* =====================================
          DEFAULT CERTIFICATE
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
          templatePreview=""
        />
      </DocumentPreviewCard>

      {/* =====================================
          CREATED CERTIFICATES
      ===================================== */}

      {customCertificates.map(
        (
          customCertificate,
          index,
        ) => {
          const certificateMember = {
            ...user,

            id:
              customCertificate.memberId ||
              user.id,

            name_kh:
              customCertificate.member ||
              user.name_kh,

            name_en:
              customCertificate.memberNameEn ||
              user.name_en,

            branch:
              customCertificate.branch ||
              user.branch,
          };

          return (
            <DocumentPreviewCard
              key={
                customCertificate.id ||
                `certificate-${index}`
              }
              title={
                customCertificate.title ||
                `វិញ្ញាបនបត្រ ${
                  index + 1
                }`
              }
              data={[certificateMember]}
              filename={`certificate-${
                index + 1
              }.csv`}
              previewClass="scale-[0.35]"
            >
              <CertificateCard
                recipientType={
                  customCertificate.recipientType ||
                  "member"
                }
                member={
                  certificateMember
                }
                activity={
                  customCertificate.activity ||
                  null
                }
                language={
                  customCertificate.language ||
                  "km"
                }
                color={
                  customCertificate.color ||
                  "#12224c"
                }
                font={
                  customCertificate.font ||
                  "Noto Sans"
                }
                fontSize={
                  customCertificate.fontSize ||
                  "medium"
                }
                description={
                  customCertificate.description ||
                  ""
                }
                templatePreview={
                  templateUrls[
                    customCertificate.id
                  ] || ""
                }
              />
            </DocumentPreviewCard>
          );
        },
      )}
    </div>
  );
}