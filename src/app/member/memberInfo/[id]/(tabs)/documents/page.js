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

import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";
import BackendDocumentCard from "@/components/document/BackendDocumentCard";

import {
  deleteTemplateFile,
  getTemplateUrl,
} from "@/lib/documentStorage";

/*
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const STORAGE_KEY =
  "tnal-member-documents";

const EMPTY_DOCUMENTS = {
  idCards: [],
  certificates: [],
};

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  "http://localhost:8081";

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function normalizeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function normalizeSavedDocuments(
  value,
) {
  const oldIdCard =
    value?.idCard;

  const oldCertificate =
    value?.certificate;

  const idCards =
    normalizeArray(
      value?.idCards,
    );

  const certificates =
    normalizeArray(
      value?.certificates,
    );

  return {
    idCards:
      idCards.length > 0
        ? idCards
        : oldIdCard
          ? [oldIdCard]
          : [],

    certificates:
      certificates.length >
      0
        ? certificates
        : oldCertificate
          ? [oldCertificate]
          : [],
  };
}

/*
 * =========================================================
 * FETCH HELPER
 * =========================================================
 */

async function fetchJson(
  path,
  signal,
) {
  const response =
    await fetch(
      `/api${path}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        cache:
          "no-store",

        signal,
      },
    );

  const text =
    await response.text();

  let body = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body ===
      "object"
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

/*
 * =========================================================
 * PROFILE PHOTO
 * =========================================================
 */

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
   * Sometimes profile_photo is
   * returned as an object.
   */
  if (
    typeof value === "object"
  ) {
    const objectUrl =
      value?.url ||
      value?.file_url ||
      value?.fileUrl ||
      value?.path ||
      value?.file_path ||
      value?.filePath ||
      "";

    if (!objectUrl) {
      return "/member.png";
    }

    return resolveBackendUrl(
      objectUrl,
    );
  }

  return resolveBackendUrl(
    value,
  );
}

function resolveBackendUrl(
  value,
) {
  if (!value) {
    return "";
  }

  const path =
    String(value);

  if (
    path.startsWith(
      "http://",
    ) ||
    path.startsWith(
      "https://",
    ) ||
    path.startsWith(
      "blob:",
    ) ||
    path.startsWith(
      "data:",
    )
  ) {
    return path;
  }

  if (
    path.startsWith("/")
  ) {
    return `${BACKEND_ORIGIN}${path}`;
  }

  return `${BACKEND_ORIGIN}/${path}`;
}

/*
 * =========================================================
 * MEMBER DISPLAY HELPERS
 * =========================================================
 */

function getGenderCode(
  value,
) {
  if (
    typeof value === "string"
  ) {
    return value.toUpperCase();
  }

  return String(
    value?.code ||
      value?.value ||
      "",
  ).toUpperCase();
}

function getGenderLabel(
  value,
) {
  if (
    value &&
    typeof value ===
      "object"
  ) {
    return (
      value?.label_km ||
      value?.labelKm ||
      value?.label_en ||
      value?.labelEn ||
      getGenderCode(value) ||
      "-"
    );
  }

  const code =
    getGenderCode(value);

  const labels = {
    MALE: "ប្រុស",
    FEMALE: "ស្រី",
    MONK: "ព្រះសង្ឃ",
    OTHER: "ផ្សេងៗ",
  };

  return (
    labels[code] ||
    value ||
    "-"
  );
}

function getRoleCode(
  value,
) {
  if (
    value &&
    typeof value ===
      "object"
  ) {
    return String(
      value?.code || "",
    ).toUpperCase();
  }

  return String(
    value || "",
  ).toUpperCase();
}

function getRoleLabel(
  value,
) {
  const code =
    getRoleCode(value);

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

  if (
    value &&
    typeof value ===
      "object"
  ) {
    return (
      value?.label_km ||
      value?.labelKm ||
      labels[code] ||
      code ||
      "-"
    );
  }

  return (
    labels[code] ||
    code ||
    "-"
  );
}

function getBranchLabel(
  member,
) {
  const branch =
    member?.branch;

  if (branch) {
    if (
      typeof branch ===
      "string"
    ) {
      return branch;
    }

    return (
      branch?.name_km ||
      branch?.nameKm ||
      branch?.label_km ||
      branch?.labelKm ||
      branch?.name_en ||
      branch?.nameEn ||
      "-"
    );
  }

  return (
    member?.branch_name_km ||
    member?.branchNameKm ||
    member?.branch_name_en ||
    member?.branchNameEn ||
    "-"
  );
}

function getMemberFilenameName(
  member,
) {
  const preferredName = String(
    member?.full_name_en ||
      member?.fullNameEn ||
      member?.name_en ||
      member?.nameEn ||
      member?.full_name_km ||
      member?.fullNameKm ||
      member?.name_kh ||
      member?.nameKm ||
      member?.member_no ||
      member?.memberNo ||
      member?.id ||
      "member",
  ).trim();

  const sanitizedName =
    preferredName
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
      .replace(/[. ]+$/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  return sanitizedName || "member";
}

function getMemberDocumentFilename(
  member,
  documentType,
  sequence,
) {
  const sequenceSuffix =
    sequence === undefined ||
    sequence === null
      ? ""
      : `-${sequence}`;

  return `${getMemberFilenameName(
    member,
  )}-${documentType}${sequenceSuffix}.pdf`;
}

/*
 * =========================================================
 * NORMALIZE MEMBER
 * =========================================================
 */

function mapMemberFromApi(
  response,
) {
  if (!response) {
    return null;
  }

  const member =
    response?.member ||
    response;

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

  const dateOfBirth =
    member?.date_of_birth ||
    member?.dateOfBirth ||
    "";

  const joinedOn =
    member?.joined_on ||
    member?.joinedOn ||
    member?.joined_at ||
    member?.joinedAt ||
    "";

  const role =
    member?.account_role ||
    member?.accountRole ||
    member?.role ||
    member?.user_role ||
    member?.userRole ||
    "";

  const gender =
    member?.gender;

  const branchName =
    getBranchLabel(
      member,
    );

  const profilePhoto =
    getProfilePhotoUrl(
      member,
    );

  /*
   * Keep both backend naming
   * and legacy frontend naming
   * because the card templates
   * still use both.
   */
  return {
    ...member,

    id:
      member?.id,

    memberId:
      member?.id,

    full_name_km:
      fullNameKm,

    fullNameKm:
      fullNameKm,

    name_kh:
      fullNameKm,

    nameKm:
      fullNameKm,

    full_name_en:
      fullNameEn,

    fullNameEn:
      fullNameEn,

    name_en:
      fullNameEn,

    nameEn:
      fullNameEn,

    phone:
      member?.phone ||
      "",

    email:
      member?.email ||
      "",

    gender:
      getGenderCode(
        gender,
      ),

    genderLabel:
      getGenderLabel(
        gender,
      ),

    date_of_birth:
      dateOfBirth,

    dateOfBirth,

    joined_on:
      joinedOn,

    joinedAt:
      joinedOn,

    branch:
      member?.branch ||
      branchName,

    branchName,

    role:
      getRoleCode(role),

    roleLabel:
      getRoleLabel(role),

    profile_photo:
      profilePhoto,

    profilePhoto,
  };
}

/*
 * =========================================================
 * DELETE BUTTON
 * =========================================================
 */

function DeleteDocumentButton({
  onClick,
  label = "លុបឯកសារ",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
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
  );
}

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function DocumentsPage() {
  const params =
    useParams();

  const memberId =
    Array.isArray(
      params?.id,
    )
      ? params.id[0]
      : params?.id;

  /*
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */

  const [
    member,
    setMember,
  ] = useState(null);

  const [
    savedDocuments,
    setSavedDocuments,
  ] = useState(
    EMPTY_DOCUMENTS,
  );

  const [
    templateUrls,
    setTemplateUrls,
  ] = useState({});

  const [
    backendDocuments,
    setBackendDocuments,
  ] = useState([]);

  const [
    selectedBackendDocument,
    setSelectedBackendDocument,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * =======================================================
   * LOAD MEMBER
   * =======================================================
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

        setMember(
          mapMemberFromApi(
            data,
          ),
        );
      } catch (
        fetchError
      ) {
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
      } finally {
        if (
          !controller
            .signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadMember();

    return () => {
      controller.abort();
    };
  }, [
    memberId,
  ]);

  /*
   * =======================================================
   * LOAD BACKEND DOCUMENTS
   * =======================================================
   */

  useEffect(() => {
    if (!memberId) {
      setBackendDocuments(
        [],
      );

      return undefined;
    }

    const controller =
      new AbortController();

    async function loadBackendDocuments() {
      try {
        const documents = [];
        let page = 0;
        let totalPages = 1;

        do {
          const data = await fetchJson(
            `/backend/documents?memberId=${encodeURIComponent(memberId)}&page=${page}&size=100`,
            controller.signal,
          );
          documents.push(...normalizeArray(data?.content || data));
          totalPages = Math.max(1, Number(data?.totalPages) || 1);
          page += 1;
        } while (page < totalPages);

        const credentialTab = await fetchJson(
          `/backend/members/${encodeURIComponent(memberId)}/credentials`,
          controller.signal,
        );
        const credentials = [
          ...normalizeArray(credentialTab?.certificates),
          ...normalizeArray(credentialTab?.appointment_letters),
        ];
        const existingFileIds = new Set(
          documents.map((document) => Number(document?.file?.id)).filter(Boolean),
        );
        const credentialDocuments = credentials
          .filter((credential) => credential?.file && !existingFileIds.has(Number(credential.file.id)))
          .map((credential) => ({
            id: `credential-${credential.id}`,
            title: credential.title,
            created_at: credential.created_at || credential.issued_on,
            file: {
              id: credential.file.id,
              url: credential.file.url,
              originalName: credential.file.original_name,
              mimeType: credential.file.mime_type,
              sizeKb: credential.file.size_kb,
            },
          }));

        setBackendDocuments(
          [...documents, ...credentialDocuments],
        );
      } catch (
        documentError
      ) {
        if (
          documentError.name !==
          "AbortError"
        ) {
          console.error(
            "Cannot load backend member documents:",
            documentError,
          );

          setBackendDocuments(
            [],
          );
        }
      }
    }

    loadBackendDocuments();

    return () => {
      controller.abort();
    };
  }, [
    memberId,
  ]);

  /*
   * =======================================================
   * LOAD LOCALLY GENERATED DOCUMENTS
   * =======================================================
   */

  useEffect(() => {
    if (!memberId) {
      setSavedDocuments(
        EMPTY_DOCUMENTS,
      );

      setTemplateUrls(
        {},
      );

      return undefined;
    }

    let active = true;

    const createdObjectUrls =
      [];

    async function loadGeneratedDocuments() {
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

        const normalized =
          normalizeSavedDocuments(
            memberDocuments,
          );

        const urls = {};

        const generatedDocuments =
          [
            ...normalized.idCards,
            ...normalized.certificates,
          ];

        for (
          const document
          of generatedDocuments
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

            if (!url) {
              continue;
            }

            urls[
              document.id
            ] = url;

            createdObjectUrls.push(
              url,
            );
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
          createdObjectUrls.forEach(
            (url) => {
              URL.revokeObjectURL(
                url,
              );
            },
          );

          return;
        }

        setSavedDocuments(
          normalized,
        );

        setTemplateUrls(
          urls,
        );
      } catch (
        documentError
      ) {
        console.error(
          "Cannot load generated member documents:",
          documentError,
        );

        if (active) {
          setSavedDocuments(
            EMPTY_DOCUMENTS,
          );

          setTemplateUrls(
            {},
          );
        }
      }
    }

    loadGeneratedDocuments();

    return () => {
      active = false;

      createdObjectUrls.forEach(
        (url) => {
          URL.revokeObjectURL(
            url,
          );
        },
      );
    };
  }, [
    memberId,
  ]);

  /*
   * =======================================================
   * DELETE GENERATED DOCUMENT
   * =======================================================
   */

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
        (
          previousDocuments,
        ) => {
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
                if (
                  documentId
                ) {
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

          const updatedDocuments =
            {
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

            const existingMemberDocuments =
              allDocuments[
                String(
                  memberId,
                )
              ] || {};

            localStorage.setItem(
              STORAGE_KEY,

              JSON.stringify({
                ...allDocuments,

                [String(
                  memberId,
                )]: {
                  ...existingMemberDocuments,

                  idCards:
                    updatedDocuments.idCards,

                  certificates:
                    updatedDocuments.certificates,

                  /*
                   * Remove support for old
                   * single-document storage.
                   */
                  idCard:
                    null,

                  certificate:
                    null,
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

      /*
       * Revoke preview URL.
       */
      if (documentId) {
        setTemplateUrls(
          (
            previousUrls,
          ) => {
            const currentUrl =
              previousUrls[
                documentId
              ];

            if (currentUrl) {
              URL.revokeObjectURL(
                currentUrl,
              );
            }

            const updatedUrls =
              {
                ...previousUrls,
              };

            delete updatedUrls[
              documentId
            ];

            return updatedUrls;
          },
        );
      }

      /*
       * Delete generated template
       * from browser storage.
       */
      if (
        templateStorageId
      ) {
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

  /*
   * =======================================================
   * NORMALIZED SAVED DOCUMENTS
   * =======================================================
   */

  const customIdCards =
    useMemo(
      () =>
        normalizeArray(
          savedDocuments
            .idCards,
        ),
      [
        savedDocuments
          .idCards,
      ],
    );

  const customCertificates =
    useMemo(
      () =>
        normalizeArray(
          savedDocuments
            .certificates,
        ),
      [
        savedDocuments
          .certificates,
      ],
    );

  /*
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          កំពុងទាញយកព័ត៌មានសមាជិក...
        </p>
      </div>
    );
  }

  /*
   * =======================================================
   * ERROR
   * =======================================================
   */

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-error">
          {error}
        </p>
      </div>
    );
  }

  /*
   * =======================================================
   * MEMBER NOT FOUND
   * =======================================================
   */

  if (!member) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        រកមិនឃើញព័ត៌មានសមាជិក
      </div>
    );
  }

  /*
   * =======================================================
   * PAGE CONTENT
   * =======================================================
   */

  return (
    <>
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
        {/* ===============================================
            DEFAULT MEMBER ID CARD
        =============================================== */}

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

        {/* ===============================================
            CUSTOM GENERATED ID CARDS
        =============================================== */}

        {customIdCards.map(
          (
            customIdCard,
            index,
          ) => {
            const idCardUser =
              {
                ...member,

                id:
                  customIdCard
                    ?.memberId ||
                  member.id,

                memberId:
                  customIdCard
                    ?.memberId ||
                  member.id,

                name_kh:
                  customIdCard
                    ?.member ||
                  customIdCard
                    ?.name_kh ||
                  member.name_kh,

                name_en:
                  customIdCard
                    ?.memberNameEn ||
                  customIdCard
                    ?.name_en ||
                  member.name_en,

                gender:
                  customIdCard
                    ?.gender ||
                  member.gender,

                email:
                  customIdCard
                    ?.email ||
                  member.email,

                phone:
                  customIdCard
                    ?.phone ||
                  member.phone,

                date_of_birth:
                  customIdCard
                    ?.dateOfBirth ||
                  customIdCard
                    ?.date_of_birth ||
                  member
                    .date_of_birth,

                branch:
                  customIdCard
                    ?.branch ||
                  member.branch,

                role:
                  customIdCard
                    ?.role ||
                  member.role ||
                  "",

                profile_photo:
                  customIdCard
                    ?.profilePhoto ||
                  customIdCard
                    ?.profile_photo ||
                  member
                    .profile_photo ||
                  "/profiles/default-avatar.png",
              };

            const templateStorageId =
              customIdCard
                ?.templateStorageId ||
              customIdCard
                ?.templateId;

            return (
              <div
                key={
                  customIdCard
                    ?.id ||
                  `id-card-${index}`
                }
                className="group relative min-w-0"
              >
                <DeleteDocumentButton
                  label="លុបប័ណ្ណសម្គាល់សមាជិក"
                  onClick={() =>
                    handleDeleteDocument(
                      {
                        group:
                          "idCards",

                        documentId:
                          customIdCard
                            ?.id ||
                          null,

                        documentIndex:
                          index,

                        templateStorageId,
                      },
                    )
                  }
                />

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
                        customIdCard
                          ?.id
                      ] || ""
                    }
                  />
                </DocumentPreviewCard>
              </div>
            );
          },
        )}

        {/* ===============================================
            CUSTOM GENERATED CERTIFICATES
        =============================================== */}

        {customCertificates.map(
          (
            customCertificate,
            index,
          ) => {
            const certificateMember =
              {
                ...member,

                id:
                  customCertificate
                    ?.memberId ||
                  member.id,

                memberId:
                  customCertificate
                    ?.memberId ||
                  member.id,

                name_kh:
                  customCertificate
                    ?.member ||
                  customCertificate
                    ?.name_kh ||
                  member.name_kh,

                name_en:
                  customCertificate
                    ?.memberNameEn ||
                  customCertificate
                    ?.name_en ||
                  member.name_en,

                branch:
                  customCertificate
                    ?.branch ||
                  member.branch,

                profile_photo:
                  customCertificate
                    ?.profilePhoto ||
                  customCertificate
                    ?.profile_photo ||
                  member
                    .profile_photo,
              };

            const templateStorageId =
              customCertificate
                ?.templateStorageId ||
              customCertificate
                ?.templateId;

            return (
              <div
                key={
                  customCertificate
                    ?.id ||
                  `certificate-${index}`
                }
                className="group relative min-w-0"
              >
                <DeleteDocumentButton
                  label="លុបវិញ្ញាបនបត្រ"
                  onClick={() =>
                    handleDeleteDocument(
                      {
                        group:
                          "certificates",

                        documentId:
                          customCertificate
                            ?.id ||
                          null,

                        documentIndex:
                          index,

                        templateStorageId,
                      },
                    )
                  }
                />

                <DocumentPreviewCard
                  title={
                    customCertificate
                      ?.title ||
                    "វិញ្ញាបនបត្រ"
                  }
                  actionType="download"
                  downloadText="ទាញយក"
                  filename={getMemberDocumentFilename(
                    certificateMember,
                    "certificate",
                    index + 1,
                  )}
                  orientation="landscape"
                  previewClass="scale-[0.35]"
                >
                  <CertificateCard
                    recipientType={
                      customCertificate
                        ?.recipientType ||
                      "member"
                    }
                    member={
                      certificateMember
                    }
                    activity={
                      customCertificate
                        ?.activity ||
                      null
                    }
                    language={
                      customCertificate
                        ?.language ||
                      "km"
                    }
                    color={
                      customCertificate
                        ?.color ||
                      "#12224c"
                    }
                    font={
                      customCertificate
                        ?.font ||
                      "Noto Sans"
                    }
                    fontSize={
                      customCertificate
                        ?.fontSize ||
                      "medium"
                    }
                    description={
                      customCertificate
                        ?.description ||
                      ""
                    }
                    templatePreview={
                      templateUrls[
                        customCertificate
                          ?.id
                      ] || ""
                    }
                  />
                </DocumentPreviewCard>
              </div>
            );
          },
        )}

        {/* ===============================================
            BACKEND DOCUMENTS
        =============================================== */}

        {backendDocuments.map(
          (document) => (
            <BackendDocumentCard
              key={`backend-document-${document.id}`}
              document={
                document
              }
              onView={
                setSelectedBackendDocument
              }
            />
          ),
        )}
      </div>

      {/* ===============================================
          BACKEND DOCUMENT PREVIEW MODAL
      =============================================== */}

      <CompanyDocumentPreview
        document={
          selectedBackendDocument
        }
        onClose={() =>
          setSelectedBackendDocument(
            null,
          )
        }
      />
    </>
  );
}
