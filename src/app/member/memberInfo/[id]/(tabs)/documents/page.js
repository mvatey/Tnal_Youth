"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "next/navigation";
import { Minus } from "lucide-react";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";

import {
  deleteTemplateFile,
  getTemplateUrl,
} from "@/lib/documentStorage";

import members from "@/data/members.json";

const STORAGE_KEY =
  "tnal-member-documents";

const DEFAULT_SAVED_DOCUMENTS = {
  idCards: [],
  certificates: [],
};

function normalizeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function normalizeOldDocuments(
  memberDocuments,
) {
  const oldIdCard =
    memberDocuments?.idCard;

  const oldCertificate =
    memberDocuments?.certificate;

  const idCards =
    normalizeArray(
      memberDocuments?.idCards,
    );

  const certificates =
    normalizeArray(
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

export default function DocumentsPage() {
  const params = useParams();

  const memberId = Array.isArray(
    params?.id,
  )
    ? params.id[0]
    : params?.id;

  /*
   * This page must use the member ID
   * from the URL.
   *
   * Do not use useCurrentMember() here,
   * because that would return the
   * currently logged-in member instead
   * of the selected member.
   */
  const member = useMemo(() => {
    return members.find(
      (item) =>
        String(item.id) ===
        String(memberId),
    );
  }, [memberId]);

  const [
    savedDocuments,
    setSavedDocuments,
  ] = useState(
    DEFAULT_SAVED_DOCUMENTS,
  );

  const [
    templateUrls,
    setTemplateUrls,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    const generatedUrls = [];

    async function loadMemberDocuments() {
      try {
        setLoading(true);

        const allDocuments =
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEY,
            ) || "{}",
          );

        const memberDocuments =
          allDocuments[
            String(memberId)
          ] || {};

        const normalizedDocuments =
          normalizeOldDocuments(
            memberDocuments,
          );

        const urls = {};

        const allCreatedDocuments = [
          ...normalizedDocuments.idCards,
          ...normalizedDocuments.certificates,
        ];

        for (
          const document
          of allCreatedDocuments
        ) {
          const templateStorageId =
            document.templateStorageId ||
            document.templateId;

          if (
            !document?.id ||
            !templateStorageId
          ) {
            continue;
          }

          try {
            const url =
              await getTemplateUrl(
                templateStorageId,
              );

            if (url) {
              urls[document.id] =
                url;

              generatedUrls.push(
                url,
              );
            }
          } catch (error) {
            console.error(
              `Cannot load template ${templateStorageId}:`,
              error,
            );
          }
        }

        if (!active) {
          generatedUrls.forEach(
            (url) => {
              URL.revokeObjectURL(
                url,
              );
            },
          );

          return;
        }

        setSavedDocuments(
          normalizedDocuments,
        );

        setTemplateUrls(
          urls,
        );
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

      generatedUrls.forEach(
        (url) => {
          URL.revokeObjectURL(
            url,
          );
        },
      );
    };
  }, [memberId]);

  const handleDeleteDocument =
    async ({
      group,
      documentId,
      documentIndex,
      templateStorageId,
    }) => {
      if (
        !group ||
        !memberId
      ) {
        return;
      }

      setSavedDocuments(
        (previousDocuments) => {
          const currentGroup =
            normalizeArray(
              previousDocuments[
                group
              ],
            );

          const updatedGroup =
            currentGroup.filter(
              (
                document,
                index,
              ) => {
                if (documentId) {
                  return (
                    String(
                      document.id,
                    ) !==
                    String(
                      documentId,
                    )
                  );
                }

                return (
                  index !==
                  documentIndex
                );
              },
            );

          const updatedDocuments = {
            ...previousDocuments,

            [group]:
              updatedGroup,
          };

          try {
            const allDocuments =
              JSON.parse(
                localStorage.getItem(
                  STORAGE_KEY,
                ) || "{}",
              );

            const currentMemberDocuments =
              allDocuments[
                String(memberId)
              ] || {};

            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                ...allDocuments,

                [String(memberId)]: {
                  ...currentMemberDocuments,

                  idCards:
                    updatedDocuments.idCards,

                  certificates:
                    updatedDocuments.certificates,

                  /*
                   * Clear old single-document
                   * storage fields.
                   */
                  idCard: null,
                  certificate: null,
                },
              }),
            );
          } catch (error) {
            console.error(
              "Cannot update saved documents:",
              error,
            );
          }

          return updatedDocuments;
        },
      );

      if (documentId) {
        setTemplateUrls(
          (previousUrls) => {
            const currentUrl =
              previousUrls[
                documentId
              ];

            if (currentUrl) {
              URL.revokeObjectURL(
                currentUrl,
              );
            }

            const updatedUrls = {
              ...previousUrls,
            };

            delete updatedUrls[
              documentId
            ];

            return updatedUrls;
          },
        );
      }

      if (templateStorageId) {
        try {
          await deleteTemplateFile(
            templateStorageId,
          );
        } catch (error) {
          console.error(
            "Cannot delete template file:",
            error,
          );
        }
      }
    };

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[300px]
          items-center
          justify-center
        "
      >
        <p className="text-sm text-gray-500">
          កំពុងទាញយកឯកសារ...
        </p>
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

  const customIdCards =
    savedDocuments.idCards;

  const customCertificates =
    savedDocuments.certificates;

  return (
    <div
      className="
        grid
        min-w-0
        grid-cols-1
        gap-6
        p-4
        md:p-6
        xl:grid-cols-2
        2xl:grid-cols-3
        2xl:gap-10
      "
    >
      {/* =====================================
          DEFAULT ID CARD
      ===================================== */}

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

      {/* =====================================
          CREATED ID CARDS
      ===================================== */}

      {customIdCards.map(
        (
          customIdCard,
          index,
        ) => {
          const idCardUser = {
            ...member,

            id:
              customIdCard.memberId ||
              member.id,

            memberId:
              customIdCard.memberId ||
              member.id,

            name_kh:
              customIdCard.member ||
              customIdCard.name_kh ||
              member.name_kh,

            name_en:
              customIdCard.memberNameEn ||
              customIdCard.name_en ||
              member.name_en,

            gender:
              customIdCard.gender ||
              member.gender,

            email:
              customIdCard.email ||
              member.email,

            phone:
              customIdCard.phone ||
              member.phone,

            date_of_birth:
              customIdCard.dateOfBirth ||
              customIdCard.date_of_birth ||
              member.date_of_birth,

            branch:
              customIdCard.branch ||
              member.branch,

            role:
              customIdCard.role ||
              member.role ||
              "member",

            profile_photo:
              customIdCard.profilePhoto ||
              customIdCard.profile_photo ||
              member.profile_photo ||
              "/profile.png",
          };

          const templateStorageId =
            customIdCard.templateStorageId ||
            customIdCard.templateId;

          return (
            <div
              key={
                customIdCard.id ||
                `id-card-${index}`
              }
              className="
                group
                relative
                min-w-0
              "
            >
              <button
                type="button"
                onClick={() =>
                  handleDeleteDocument({
                    group:
                      "idCards",

                    documentId:
                      customIdCard.id ||
                      null,

                    documentIndex:
                      index,

                    templateStorageId,
                  })
                }
                aria-label="លុបប័ណ្ណសម្គាល់សមាជិក"
                title="លុប"
                className="
                  absolute
                  right-2
                  top-2
                  z-50
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  text-white
                  opacity-0
                  shadow-md
                  transition-all
                  duration-200
                  hover:scale-105
                  hover:bg-red-600
                  group-hover:opacity-100
                  group-focus-within:opacity-100
                "
              >
                <Minus
                  size={17}
                  strokeWidth={3}
                />
              </button>

              <DocumentPreviewCard
                title="ប័ណ្ណសម្គាល់សមាជិក"
                actionType="print"
                printText="បោះពុម្ព"
                previewClass="scale-[0.55]"
              >
                <IdCard
                  user={
                    idCardUser
                  }
                  templatePreview={
                    templateUrls[
                      customIdCard.id
                    ] || ""
                  }
                />
              </DocumentPreviewCard>
            </div>
          );
        },
      )}

      {/* =====================================
          LETTER OF APPOINTMENT
      ===================================== */}

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

      {/* =====================================
          DEFAULT CERTIFICATE
      ===================================== */}

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

      {/* =====================================
          CREATED CERTIFICATES
      ===================================== */}

      {customCertificates.map(
        (
          customCertificate,
          index,
        ) => {
          const certificateMember = {
            ...member,

            id:
              customCertificate.memberId ||
              member.id,

            memberId:
              customCertificate.memberId ||
              member.id,

            name_kh:
              customCertificate.member ||
              customCertificate.name_kh ||
              member.name_kh,

            name_en:
              customCertificate.memberNameEn ||
              customCertificate.name_en ||
              member.name_en,

            branch:
              customCertificate.branch ||
              member.branch,

            profile_photo:
              customCertificate.profilePhoto ||
              customCertificate.profile_photo ||
              member.profile_photo,
          };

          const templateStorageId =
            customCertificate.templateStorageId ||
            customCertificate.templateId;

          return (
            <div
              key={
                customCertificate.id ||
                `certificate-${index}`
              }
              className="
                group
                relative
                min-w-0
              "
            >
              <button
                type="button"
                onClick={() =>
                  handleDeleteDocument({
                    group:
                      "certificates",

                    documentId:
                      customCertificate.id ||
                      null,

                    documentIndex:
                      index,

                    templateStorageId,
                  })
                }
                aria-label="លុបវិញ្ញាបនបត្រ"
                title="លុប"
                className="
                  absolute
                  right-2
                  top-2
                  z-50
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  text-white
                  opacity-0
                  shadow-md
                  transition-all
                  duration-200
                  hover:scale-105
                  hover:bg-red-600
                  group-hover:opacity-100
                  group-focus-within:opacity-100
                "
              >
                <Minus
                  size={17}
                  strokeWidth={3}
                />
              </button>

              <DocumentPreviewCard
                title={
                  customCertificate.title ||
                  "វិញ្ញាបនបត្រ"
                }
                actionType="download"
                downloadText="ទាញយក"
                filename={`certificate-${
                  customCertificate.id ||
                  index + 1
                }.pdf`}
                orientation="landscape"
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
            </div>
          );
        },
      )}
    </div>
  );
}