"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import useCurrentMember from "@/hooks/useCurrentMember";

import IdCard from "@/components/card/idCard";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";
import BackendDocumentCard from "@/components/document/BackendDocumentCard";

function getFirstValidValue(...values) {
  return values.find((value) => {
    return (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    );
  });
}

function getBranchName(branch) {
  if (!branch) {
    return "";
  }

  if (typeof branch === "string") {
    return branch;
  }

  return (
    branch.nameKm ||
    branch.name_km ||
    branch.nameEn ||
    branch.name_en ||
    branch.name ||
    ""
  );
}

function buildLoggedInMember(member, authUser) {
  if (!member && !authUser) {
    return null;
  }

  /*
   * Prefer the real member ID.
   *
   * authUser.id is only the final fallback because
   * it may be the account ID instead of the member ID.
   */
  const resolvedMemberId = getFirstValidValue(
    member?.memberId,
    member?.id,
    member?.member_id,
    authUser?.memberId,
    authUser?.member_id,
    authUser?.id,
  );

  const resolvedProfileImage =
    getFirstValidValue(
      member?.profile_photo,
      member?.profileImage,
      member?.profile_image,
      member?.profilePhoto,
      authUser?.profileImage,
      authUser?.profile_photo,
      authUser?.profile_image,
    ) || "/profiles/default-avatar.jpg";

  const resolvedNameKh =
    getFirstValidValue(
      member?.name_kh,
      member?.fullNameKm,
      member?.full_name_km,
      authUser?.fullNameKm,
      authUser?.name_kh,
      authUser?.full_name_km,
    ) || "";

  const resolvedNameEn =
    getFirstValidValue(
      member?.name_en,
      member?.fullNameEn,
      member?.full_name_en,
      authUser?.fullNameEn,
      authUser?.name_en,
      authUser?.full_name_en,
    ) || "";

  const resolvedRole =
    getFirstValidValue(
      member?.role,
      authUser?.role,
    ) || "member";

  const resolvedBranch = getBranchName(
    getFirstValidValue(
      member?.branch,
      member?.branchName,
      authUser?.branch,
      authUser?.branchName,
    ),
  );

  return {
    ...(authUser || {}),
    ...(member || {}),

    id: resolvedMemberId,
    memberId: resolvedMemberId,

    name_kh: resolvedNameKh,
    name_en: resolvedNameEn,

    fullNameKm: resolvedNameKh,
    fullNameEn: resolvedNameEn,

    role: resolvedRole,

    phone:
      getFirstValidValue(
        member?.phone,
        authUser?.phone,
      ) || "",

    email:
      getFirstValidValue(
        member?.email,
        authUser?.email,
      ) || "",

    gender:
      getFirstValidValue(
        member?.gender,
        authUser?.gender,
      ) || "",

    branch: resolvedBranch,

    date_of_birth:
      getFirstValidValue(
        member?.date_of_birth,
        member?.dateOfBirth,
        authUser?.date_of_birth,
        authUser?.dateOfBirth,
      ) || "",

    joinedAt:
      getFirstValidValue(
        member?.joinedAt,
        member?.joined_on,
        member?.joinedOn,
        authUser?.joinedAt,
        authUser?.joined_on,
        authUser?.joinedOn,
      ) || "",

    nationality:
      getFirstValidValue(
        member?.nationality,
        authUser?.nationality,
      ) || "",

    ethnicity:
      getFirstValidValue(
        member?.ethnicity,
        authUser?.ethnicity,
      ) || "",

    profile_photo: resolvedProfileImage,
    profileImage: resolvedProfileImage,
    profile_image: resolvedProfileImage,
    profilePhoto: resolvedProfileImage,
  };
}

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [backendDocuments, setBackendDocuments] = useState([]);
  const [selectedBackendDocument, setSelectedBackendDocument] = useState(null);
  const {
    user,
    authLoading,
  } = useAuth();

  const {
    member,
    loading: memberLoading,
    error,
  } = useCurrentMember();

  const currentMember = useMemo(() => {
    return buildLoggedInMember(
      member,
      user,
    );
  }, [member, user]);

  const loading =
    authLoading ||
    memberLoading;

  useEffect(() => {
    const memberId = currentMember?.id;

    if (!memberId) {
      setBackendDocuments([]);
      return undefined;
    }

    const controller = new AbortController();

    async function readJson(response) {
      const text = await response.text();

      let body = null;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }

      if (!response.ok) {
        const message =
          typeof body === "object"
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

    async function loadDocuments() {
      try {
        const documents = [];
        let page = 0;
        let totalPages = 1;

        do {
          const response = await fetch(
            `/api/backend/documents?memberId=${encodeURIComponent(memberId)}&page=${page}&size=100`,
            {
              cache: "no-store",
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            },
          );

          const body = await readJson(response);
          const rows = Array.isArray(body)
            ? body
            : Array.isArray(body?.content)
              ? body.content
              : Array.isArray(body?.data)
                ? body.data
                : [];

          documents.push(...rows);

          totalPages = Math.max(
            1,
            Number(body?.totalPages) || 1,
          );

          page += 1;
        } while (page < totalPages);

        /*
         * Credentials are also documents in Member Detail.
         * Try to include them here too. If the current role is not
         * authorized for this endpoint, the normal document list still works.
         */
        try {
          const credentialResponse = await fetch(
            `/api/backend/members/${encodeURIComponent(memberId)}/credentials`,
            {
              cache: "no-store",
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (credentialResponse.ok) {
            const credentialBody =
              await credentialResponse.json().catch(() => null);

            const credentials = [
              ...(Array.isArray(credentialBody?.certificates)
                ? credentialBody.certificates
                : []),
              ...(Array.isArray(credentialBody?.appointment_letters)
                ? credentialBody.appointment_letters
                : []),
            ];

            const existingFileIds = new Set(
              documents
                .map((document) => Number(document?.file?.id))
                .filter(Boolean),
            );

            for (const credential of credentials) {
              const fileId = Number(credential?.file?.id);

              if (!credential?.file || existingFileIds.has(fileId)) {
                continue;
              }

              documents.push({
                id: `credential-${credential.id}`,
                title: credential.title,
                created_at:
                  credential.created_at ||
                  credential.issued_on,
                file: {
                  id: credential.file.id,
                  url: credential.file.url,
                  originalName:
                    credential.file.original_name,
                  mimeType:
                    credential.file.mime_type,
                  sizeKb:
                    credential.file.size_kb,
                },
              });
            }
          }
        } catch (credentialError) {
          if (credentialError.name !== "AbortError") {
            console.warn(
              "Cannot load my account credentials:",
              credentialError,
            );
          }
        }

        setBackendDocuments(documents);
      } catch (documentError) {
        if (documentError.name !== "AbortError") {
          console.error(
            "Cannot load my account documents:",
            documentError,
          );
          setBackendDocuments([]);
        }
      }
    }

    loadDocuments();

    return () => controller.abort();
  }, [currentMember?.id]);

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
        <p className="text-sm text-text-secondary">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (error && !currentMember) {
    return (
      <div
        className="
          rounded-xl
          border
          border-error/30
          bg-bg-page-white
          p-6
          text-center
        "
      >
        <p className="text-sm text-error">
          {error}
        </p>
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div
        className="
          rounded-xl
          border
          border-border
          bg-bg-page-white
          p-6
          text-center
        "
      >
        <p className="text-sm text-text-secondary">
          {t("myAccount.accountNotFound")}
        </p>
      </div>
    );
  }

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
        <DocumentPreviewCard
          title={t("memberPage.memberIdCard")}
          actionType="print"
          printText={t("memberPage.print")}
          previewClass="scale-[0.55]"
        >
          <IdCard
            user={currentMember}
            templatePreview=""
          />
        </DocumentPreviewCard>

        {backendDocuments.map((document) => (
          <BackendDocumentCard
            key={`account-document-${document.id}`}
            document={document}
            onView={setSelectedBackendDocument}
          />
        ))}
      </div>

      <CompanyDocumentPreview
        document={selectedBackendDocument}
        onClose={() => setSelectedBackendDocument(null)}
      />
    </>
  );
}
