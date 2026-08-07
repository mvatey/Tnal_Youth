"use client";

import {
  useEffect,
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

const STORAGE_KEY =
  "tnal-member-documents";

const DEFAULT_SAVED_DOCUMENTS = {
  idCards: [],
  certificates: [],
};

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  "http://localhost:8081";

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

async function fetchJson(
  path,
  signal,
) {
  const response = await fetch(
    `/api${path}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },

      cache: "no-store",
      signal,
    },
  );

  const responseText =
    await response.text();

  let responseBody = null;

  if (responseText) {
    try {
      responseBody =
        JSON.parse(responseText);
    } catch {
      responseBody =
        responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof responseBody ===
      "object"
        ? responseBody?.message ||
          responseBody?.detail ||
          responseBody?.error
        : responseBody;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return responseBody;
}

function getProfilePhotoUrl(
  member,
) {
  const value =
    member?.profile_photo?.url ||
    member?.profilePhoto?.url ||
    member?.profile_photo_url ||
    member?.profilePhotoUrl ||
    member?.profile_photo ||
    member?.profilePhoto ||
    "";

  if (!value) {
    return "/member.png";
  }

  /*
   * Object containing an ID but no URL.
   */
  if (
    typeof value === "object"
  ) {
    return (
      value?.url ||
      "/member.png"
    );
  }

  const path = String(value);

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${BACKEND_ORIGIN}${normalizedPath}`;
}

function getGenderCode(value) {
  if (typeof value === "string") {
    return value;
  }

  return (
    value?.code ||
    value?.value ||
    ""
  );
}

function getGenderLabel(value) {
  if (
    value &&
    typeof value === "object"
  ) {
    return (
      value?.label_km ||
      value?.labelKm ||
      value?.label_en ||
      value?.labelEn ||
      value?.code ||
      "-"
    );
  }

  const code = String(
    value || "",
  ).toUpperCase();

  if (code === "MALE") {
    return "ប្រុស";
  }

  if (code === "FEMALE") {
    return "ស្រី";
  }

  if (code === "OTHER") {
    return "ផ្សេងៗ";
  }

  return value || "-";
}

function getRoleLabel(value) {
  const code = String(
    typeof value === "object"
      ? value?.code || ""
      : value || "",
  ).toUpperCase();

  const labels = {
    ADMIN:
      "អ្នកគ្រប់គ្រង",

    BRANCH_LEADER:
      "ប្រធានសាខា",

    SECRETARY:
      "លេខាធិការ",

    MEMBER:
      "សមាជិក",
  };

  return (
    value?.label_km ||
    value?.labelKm ||
    labels[code] ||
    code ||
    "-"
  );
}

function getBranchLabel(value) {
  if (!value) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return (
    value?.name_km ||
    value?.nameKm ||
    value?.label_km ||
    value?.labelKm ||
    value?.name_en ||
    value?.nameEn ||
    "-"
  );
}

function mapMemberFromApi(
  data,
) {
  if (!data) {
    return null;
  }

  const member =
    data?.member || data;

  const fullNameKm =
    member?.full_name_km ||
    member?.fullNameKm ||
    member?.name_kh ||
    member?.nameKm ||
    "";

  const fullNameEn =
    member?.full_name_en ||
    member?.fullNameEn ||
    member?.name_en ||
    member?.nameEn ||
    "";

  const joinedOn =
    member?.joined_on ||
    member?.joinedOn ||
    member?.joined_at ||
    member?.joinedAt ||
    "";

  const dateOfBirth =
    member?.date_of_birth ||
    member?.dateOfBirth ||
    "";

  const branch =
    member?.branch ||
    member?.branch_name_km ||
    member?.branchNameKm ||
    "";

  const role =
    member?.role ||
    member?.user_role ||
    member?.userRole ||
    "MEMBER";

  const gender =
    member?.gender;

  const profilePhoto =
    getProfilePhotoUrl(
      member,
    );

  /*
   * Preserve both API-style and the old
   * frontend field names because your
   * document components may still use
   * the old JSON structure.
   */
  return {
    ...member,

    id:
      member?.id,

    memberId:
      member?.id,

    full_name_km:
      fullNameKm,

    full_name_en:
      fullNameEn,

    name_kh:
      fullNameKm,

    nameKm:
      fullNameKm,

    name_en:
      fullNameEn,

    nameEn:
      fullNameEn,

    phone:
      member?.phone || "",

    email:
      member?.email || "",

    gender:
      getGenderCode(gender),

    genderLabel:
      getGenderLabel(gender),

    date_of_birth:
      dateOfBirth,

    dateOfBirth:
      dateOfBirth,

    joined_on:
      joinedOn,

    joinedAt:
      joinedOn,

    branch,

    branchName:
      getBranchLabel(branch),

    role:
      typeof role === "object"
        ? role?.code || "MEMBER"
        : role,

    roleLabel:
      getRoleLabel(role),

    profile_photo:
      profilePhoto,

    profilePhoto,
  };
}

export default function DocumentsPage() {
  const params = useParams();

  const memberId =
    Array.isArray(params?.id)
      ? params.id[0]
      : params?.id;

  const [member, setMember] =
    useState(null);

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

  const [
    error,
    setError,
  ] = useState("");

  /*
   * =========================================
   * FETCH SELECTED MEMBER FROM BACKEND
   * =========================================
   */
  useEffect(() => {
    if (!memberId) {
      setMember(null);
      setLoading(false);

      return undefined;
    }

    const controller =
      new AbortController();

    async function loadMember() {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchJson(
            `/members/${memberId}`,
            controller.signal,
          );

        console.log(
          "Member detail response:",
          data,
        );

        setMember(
          mapMemberFromApi(data),
        );
      } catch (fetchError) {
        if (
          fetchError.name !==
          "AbortError"
        ) {
          console.error(
            "Cannot load member:",
            fetchError,
          );

          setMember(null);

          setError(
            fetchError.message ||
              "មិនអាចទាញយកព័ត៌មានសមាជិកបានទេ",
          );
        }
      }
    }

    loadMember();

    return () => {
      controller.abort();
    };
  }, [memberId]);

  /*
   * =========================================
   * LOAD SAVED GENERATED DOCUMENTS
   * =========================================
   */
  useEffect(() => {
    if (!memberId) {
      return undefined;
    }

    let active = true;

    const generatedUrls = [];

    async function loadMemberDocuments() {
      try {
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
            document
              ?.templateStorageId ||
            document?.templateId;

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
          } catch (
            templateError
          ) {
            console.error(
              `Cannot load template ${templateStorageId}:`,
              templateError,
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
      } catch (
        documentError
      ) {
        console.error(
          "Cannot load member documents:",
          documentError,
        );

        if (active) {
          setSavedDocuments(
            DEFAULT_SAVED_DOCUMENTS,
          );

          setTemplateUrls({});
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

  /*
   * Wait for both member request and
   * initial document setup.
   */
  useEffect(() => {
    if (member || error) {
      setLoading(false);
    }
  }, [member, error]);

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

                  idCard: null,
                  certificate: null,
                },
              }),
            );
          } catch (
            storageError
          ) {
            console.error(
              "Cannot update saved documents:",
              storageError,
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
        } catch (
          deleteError
        ) {
          console.error(
            "Cannot delete template file:",
            deleteError,
          );
        }
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          កំពុងទាញយកព័ត៌មានសមាជិក...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-error">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
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
      {/* DEFAULT ID CARD */}

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

      {/* CREATED ID CARDS */}

      {customIdCards.map(
        (
          customIdCard,
          index,
        ) => {
          const idCardUser = {
            ...member,

            id:
              customIdCard
                .memberId ||
              member.id,

            memberId:
              customIdCard
                .memberId ||
              member.id,

            name_kh:
              customIdCard.member ||
              customIdCard.name_kh ||
              member.name_kh,

            name_en:
              customIdCard
                .memberNameEn ||
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
              customIdCard
                .dateOfBirth ||
              customIdCard
                .date_of_birth ||
              member.date_of_birth,

            branch:
              customIdCard.branch ||
              member.branch,

            role:
              customIdCard.role ||
              member.role ||
              "MEMBER",

            profile_photo:
              customIdCard
                .profilePhoto ||
              customIdCard
                .profile_photo ||
              member.profile_photo ||
              "/member.png",
          };

          const templateStorageId =
            customIdCard
              .templateStorageId ||
            customIdCard.templateId;

          return (
            <div
              key={
                customIdCard.id ||
                `id-card-${index}`
              }
              className="group relative min-w-0"
            >
              <button
                type="button"
                onClick={() =>
                  handleDeleteDocument(
                    {
                      group:
                        "idCards",

                      documentId:
                        customIdCard.id ||
                        null,

                      documentIndex:
                        index,

                      templateStorageId,
                    },
                  )
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

      {/* LETTER OF APPOINTMENT */}

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

      {/* DEFAULT CERTIFICATE */}

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

      {/* CREATED CERTIFICATES */}

      {customCertificates.map(
        (
          customCertificate,
          index,
        ) => {
          const certificateMember = {
            ...member,

            id:
              customCertificate
                .memberId ||
              member.id,

            memberId:
              customCertificate
                .memberId ||
              member.id,

            name_kh:
              customCertificate.member ||
              customCertificate.name_kh ||
              member.name_kh,

            name_en:
              customCertificate
                .memberNameEn ||
              customCertificate.name_en ||
              member.name_en,

            branch:
              customCertificate.branch ||
              member.branch,

            profile_photo:
              customCertificate
                .profilePhoto ||
              customCertificate
                .profile_photo ||
              member.profile_photo,
          };

          const templateStorageId =
            customCertificate
              .templateStorageId ||
            customCertificate
              .templateId;

          return (
            <div
              key={
                customCertificate.id ||
                `certificate-${index}`
              }
              className="group relative min-w-0"
            >
              <button
                type="button"
                onClick={() =>
                  handleDeleteDocument(
                    {
                      group:
                        "certificates",

                      documentId:
                        customCertificate
                          .id ||
                        null,

                      documentIndex:
                        index,

                      templateStorageId,
                    },
                  )
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
                  customCertificate
                    .title ||
                  "វិញ្ញាបនបត្រ"
                }
                actionType="download"
                downloadText="ទាញយក"
                filename={`certificate-${
                  customCertificate
                    .id ||
                  index + 1
                }.pdf`}
                orientation="landscape"
                previewClass="scale-[0.35]"
              >
                <CertificateCard
                  recipientType={
                    customCertificate
                      .recipientType ||
                    "member"
                  }
                  member={
                    certificateMember
                  }
                  activity={
                    customCertificate
                      .activity ||
                    null
                  }
                  language={
                    customCertificate
                      .language ||
                    "km"
                  }
                  color={
                    customCertificate
                      .color ||
                    "#12224c"
                  }
                  font={
                    customCertificate
                      .font ||
                    "Noto Sans"
                  }
                  fontSize={
                    customCertificate
                      .fontSize ||
                    "medium"
                  }
                  description={
                    customCertificate
                      .description ||
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