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

import users from "@/data/members.json";

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

export default function DocumentPage() {
  const params = useParams();

  const id = Array.isArray(
    params?.id,
  )
    ? params.id[0]
    : params?.id;

  const user = useMemo(() => {
    return users.find(
      (item) =>
        String(item.id) ===
        String(id),
    );
  }, [id]);

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

        const allDocuments =
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEY,
            ) || "{}",
          );

        const memberDocuments =
          allDocuments[
            String(id)
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

          setTemplateUrls(
            {},
          );
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
  }, [id]);

  const handleDeleteDocument =
    async ({
      group,
      documentId,
      documentIndex,
      templateStorageId,
    }) => {
      if (!group) return;

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
                String(id)
              ] || {};

            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                ...allDocuments,

                [String(id)]: {
                  ...currentMemberDocuments,

                  idCards:
                    updatedDocuments.idCards,

                  certificates:
                    updatedDocuments.certificates,

                  idCard: null,
                  certificate:
                    null,
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
        gap-10
        p-6
        lg:grid-cols-2
        2xl:grid-cols-3
      "
    >
      {/* DEFAULT ID CARD */}

      <DocumentPreviewCard
        title="ប័ណ្ណសម្គាល់សមាជិក"
        actionType="print"
        printText="បោះពុម្ព"
        previewClass="scale-[0.55]"
      >
        <IdCard
          user={user}
          templatePreview=""
        />
      </DocumentPreviewCard>

      {/* CREATED ID CARDS */}

      {customIdCards.map(
        (
          customIdCard,
          index,
        ) => {
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
                w-fit
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

      {/* LETTER OF APPOINTMENT — PDF */}

      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        actionType="download"
        downloadText="ទាញយក"
        filename={`letter-of-appointment-${
          user.id
        }.pdf`}
        orientation="landscape"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment
          user={user}
        />
      </DocumentPreviewCard>

      {/* DEFAULT CERTIFICATE — PDF */}

      <DocumentPreviewCard
        title="បណ្ណសរសើរ"
        actionType="download"
        downloadText="ទាញយក"
        filename={`certificate-${
          user.id
        }.pdf`}
        orientation="landscape"
        previewClass="scale-[0.35]"
      >
        <CertificateCard
          recipientType="member"
          member={user}
          templatePreview=""
        />
      </DocumentPreviewCard>

      {/* CREATED CERTIFICATES — PDF */}

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
                w-fit
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