"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import useCurrentMember from "@/hooks/useCurrentMember";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";
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
    fetch(`/api/backend/documents?memberId=${encodeURIComponent(memberId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || "Unable to load member documents.");
        setBackendDocuments(Array.isArray(body) ? body : []);
      })
      .catch((documentError) => {
        if (documentError.name !== "AbortError") {
          console.error("Cannot load my account documents:", documentError);
          setBackendDocuments([]);
        }
      });

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
        <p className="text-sm text-gray-500">
          កំពុងទាញយកឯកសារ...
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
          border-red-200
          bg-white
          p-6
          text-center
        "
      >
        <p className="text-sm text-red-500">
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
          border-gray-200
          bg-white
          p-6
          text-center
        "
      >
        <p className="text-sm text-gray-500">
          រកមិនឃើញព័ត៌មានគណនី
        </p>
      </div>
    );
  }

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
      {/* ID CARD */}

      <DocumentPreviewCard
  title="ប័ណ្ណសម្គាល់សមាជិក"
  actionType="download"
  downloadText="ទាញយក"
  filename={`member-id-card-${currentMember.id || "account"}.pdf`}
  orientation="landscape"
  previewClass="scale-[0.55]"
>
  <IdCard
    user={currentMember}
    templatePreview=""
  />
</DocumentPreviewCard>

      {/* LETTER OF APPOINTMENT */}

      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        actionType="download"
        downloadText="ទាញយក"
        filename={`letter-of-appointment-${currentMember.id || "account"}.pdf`}
        orientation="landscape"
        previewClass="scale-[0.35]"
      >
        <LetterOfAppointment
          user={currentMember}
          templatePreview=""
        />
      </DocumentPreviewCard>

      {/* CERTIFICATE */}

      <DocumentPreviewCard
        title="បណ្ណសរសើរ"
        actionType="download"
        downloadText="ទាញយក"
        filename={`certificate-${currentMember.id || "account"}.pdf`}
        orientation="landscape"
        previewClass="scale-[0.35]"
      >
        <CertificateCard
          recipientType="member"
          member={currentMember}
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

      <CompanyDocumentPreview
        document={selectedBackendDocument}
        onClose={() => setSelectedBackendDocument(null)}
      />
    </div>
  );
}
