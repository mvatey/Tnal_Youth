"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CertificateForm from "@/app/document/CertificateForm";
import IdCardForm from "@/app/document/IdCardForm";
import LetterOfAppointmentForm from "@/app/document/LetterOfAppointmentForm";
import Link from "next/link";
import useMemberPermissions from "@/hooks/useMemberPermissions";

const ID_CARD_DOCUMENT_MARKER = "[TNAL:ID_CARD]";

const EMPTY_FORM = {
  title: "",
  branch: "",
  branchId: "",
  description: "",
  type: "",

  recipientType: "member",

  memberId: "",
  memberIds: [],
  selectedMembers: [],
  member: "",
  memberNameEn: "",

  activityId: "",
  activity: "",

  activityMemberIds: null,
  notifyBranchIds: [],

  gender: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  role: "member",
  profilePhoto: "/profile.png",
  userId: "",

  // Certificate template
  templateFile: null,
  templatePreview: "",

  // ID-card template
  idCardTemplateFile: null,
  idCardTemplatePreview: "",

  font: "Noto Sans",
  fontSize: "medium",
  color: "#12224c",
  language: "km",
};

function getBranchName(branch) {
  if (!branch) {
    return "";
  }

  if (typeof branch === "string") {
    return branch;
  }

  return branch.name_kh || branch.name_en || branch.name || "";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export default function CreateDocumentPage() {
  const router = useRouter();

  const [type, setType] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const { role: loggedInRole, loading: permissionsLoading } = useMemberPermissions();
  const canCreateDocuments = ["ADMIN", "SECRETARY", "BRANCH_LEADER"].includes(loggedInRole);

  if (!permissionsLoading && !canCreateDocuments) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-bg p-6 text-center text-error">
        <p className="text-sm font-semibold">អ្នកមិនមានសិទ្ធិបង្កើតឯកសារទេ</p>

        <p className="mt-1 text-xs">
          មានតែអ្នកដឹកនាំសាខា ឬលេខាធិការប៉ុណ្ណោះ ដែលអាចបង្កើតឯកសារថ្មីបាន។
        </p>

        <Link
          href="/document"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-white hover:bg-secondary-hover"
        >
          ត្រឡប់ទៅឯកសារទាំងអស់
        </Link>
      </div>
    );
  }

  const selectDocumentType = (selectedType) => {
    setType(selectedType);

    setForm({
      ...EMPTY_FORM,

      type:
        selectedType === "certificate"
          ? "វិញ្ញាបនបត្រ"
          : selectedType === "id_card"
            ? "ប័ណ្ណសមាជិក"
            : "លិខិតតែងតាំង",
    });
  };

  const handleBack = () => {
    if (type) {
      setType("");
      setForm(EMPTY_FORM);
      return;
    }

    router.push("/document/member");
  };

  const openMemberDocuments = (memberId) => {
    if (!memberId) {
      console.error("Cannot route because member ID is missing.");

      return;
    }

    const targetUrl =
      `/member/memberInfo/${memberId}/documents` + `?updated=${Date.now()}`;

    window.location.assign(targetUrl);
  };

  const saveIdCardToBackend = async (data) => {
    const memberId = Number(data.userId || data.selectedUser?.id);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      throw new Error("រកមិនឃើញលេខសម្គាល់សមាជិក");
    }

    if (!data.idCardTemplateFile) {
      throw new Error("សូមបញ្ចូលរូបភាពគំរូប័ណ្ណសមាជិក");
    }

    const typeResponse = await fetch("/api/backend/document-types", {
      cache: "no-store",
    });
    const typeBody = await typeResponse.json().catch(() => null);

    if (!typeResponse.ok) {
      throw new Error(typeBody?.message || "Unable to load document types.");
    }

    const memberDocumentType = normalizeArray(typeBody?.data ?? typeBody).find(
      (item) =>
        String(item.code || "").trim().toUpperCase() === "MEMBER_DOCUMENT",
    );

    if (!memberDocumentType?.id) {
      throw new Error("The member document type is not configured.");
    }

    const upload = new FormData();
    upload.append("file", data.idCardTemplateFile);

    const uploadResponse = await fetch("/api/backend/files/images", {
      method: "POST",
      body: upload,
    });
    const uploadedFile = await uploadResponse.json().catch(() => null);

    if (!uploadResponse.ok || !uploadedFile?.id) {
      throw new Error(
        uploadedFile?.message ||
          uploadedFile?.detail ||
          "ID-card template upload failed.",
      );
    }

    const createResponse = await fetch("/api/backend/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type_id: Number(memberDocumentType.id),
        file_id: Number(uploadedFile.id),
        title: "ប័ណ្ណសម្គាល់សមាជិក",
        description: ID_CARD_DOCUMENT_MARKER,
        member_id: memberId,
      }),
    });
    const createdDocument = await createResponse.json().catch(() => null);

    if (!createResponse.ok) {
      throw new Error(
        createdDocument?.message ||
          createdDocument?.detail ||
          "Unable to save the member ID card.",
      );
    }

    return String(memberId);
  };

  const notifyInvitedBranchesForCertificates = async (data) => {
    const branchIds = normalizeArray(data.notifyBranchIds)
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    if (branchIds.length === 0) {
      return { notifiedBranchIds: [], skippedBranchIds: [] };
    }

    if (!data.activityId) {
      throw new Error("សូមជ្រើសរើសកម្មវិធីជាមុនសិន");
    }

    const response = await fetch(
      `/api/backend/activities/${encodeURIComponent(data.activityId)}/invited-branches/certificates/notify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_ids: branchIds }),
      },
    );
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        body?.message || "មិនអាចផ្ញើការជូនដំណឹងទៅសាខាបានទេ។",
      );
    }

    return {
      notifiedBranchIds: normalizeArray(
        body?.data?.notified_branch_ids ??
          body?.notified_branch_ids ??
          body?.notifiedBranchIds,
      ),
      skippedBranchIds: normalizeArray(
        body?.data?.skipped_branch_ids ??
          body?.skipped_branch_ids ??
          body?.skippedBranchIds,
      ),
    };
  };

  const saveMemberCertificatesToBackend = async (data) => {
    const generatedDocuments = normalizeArray(data.generatedDocuments);

    if (generatedDocuments.length === 0) {
      throw new Error("No generated certificate file was found.");
    }

    const typeResponse = await fetch("/api/backend/document-types", {
      cache: "no-store",
    });
    const typeBody = await typeResponse.json().catch(() => null);

    if (!typeResponse.ok) {
      throw new Error(typeBody?.message || "Unable to load document types.");
    }

    const documentTypes = normalizeArray(typeBody?.data ?? typeBody);
    const memberDocumentType = documentTypes.find(
      (item) =>
        String(item.code || "").trim().toUpperCase() ===
        "MEMBER_DOCUMENT",
    );

    if (!memberDocumentType?.id) {
      throw new Error("The member document type is not configured.");
    }

    for (const generatedDocument of generatedDocuments) {
      const memberId = Number(generatedDocument.member?.id);

      if (!memberId) {
        throw new Error("Member ID is required.");
      }

      const upload = new FormData();
      upload.append("file", generatedDocument.file);

      const uploadResponse = await fetch(
        "/api/backend/files/attachments",
        { method: "POST", body: upload },
      );
      const uploadedFile = await uploadResponse.json().catch(() => null);

      if (!uploadResponse.ok || !uploadedFile?.id) {
        throw new Error(uploadedFile?.message || "Certificate upload failed.");
      }

      const createResponse = await fetch("/api/backend/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_id: Number(memberDocumentType.id),
          file_id: Number(uploadedFile.id),
          title: data.title,
          description: data.description || "",
          member_id: memberId,
        }),
      });
      const createdDocument = await createResponse.json().catch(() => null);

      if (!createResponse.ok) {
        throw new Error(createdDocument?.message || "Unable to save certificate.");
      }

      if (data.activityId) {
        const credentialResponse = await fetch(
          `/api/backend/members/${memberId}/credentials`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.title?.trim() || "Certificate",
              credentialKind: "ACTIVITY_CERTIFICATE",
              credentialNo: `CERT-${memberId}-${Date.now()}-${generatedDocuments.indexOf(generatedDocument) + 1}`,
              activityId: Number(data.activityId),
              issuedOn: new Date().toISOString().slice(0, 10),
              fileId: Number(uploadedFile.id),
            }),
          },
        );
        const credentialBody = await credentialResponse.json().catch(() => null);

        if (!credentialResponse.ok) {
          throw new Error(
            credentialBody?.message || "Unable to connect the certificate to the member credential tab.",
          );
        }
      }
    }

    return String(generatedDocuments[0].member.id);
  };

  const saveAppointmentLettersToBackend = async (data) => {
    const selectedMembers = normalizeArray(data.selectedMembers);
    const memberIds = normalizeArray(data.memberIds).map(Number).filter(Number.isInteger);
    const memberId = Number(data.memberId || memberIds[0]);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      throw new Error("សូមជ្រើសរើសសមាជិកម្នាក់");
    }
    const appointmentMemberIds = memberIds.length > 0 ? memberIds : [memberId];

    if (!data.templateFile) {
      throw new Error("សូមបញ្ចូលលិខិតតែងតាំង");
    }

    const typeResponse = await fetch("/api/backend/document-types", { cache: "no-store" });
    const typeBody = await typeResponse.json().catch(() => null);
    if (!typeResponse.ok) {
      throw new Error(typeBody?.message || "Unable to load document types.");
    }

    const memberDocumentType = normalizeArray(typeBody?.data ?? typeBody).find(
      (item) => String(item.code || "").trim().toUpperCase() === "MEMBER_DOCUMENT",
    );
    if (!memberDocumentType?.id) {
      throw new Error("The member document type is not configured.");
    }

    const upload = new FormData();
    upload.append("file", data.templateFile);

    const uploadEndpoint = String(data.templateFile.type || "")
      .toLowerCase()
      .startsWith("image/")
      ? "/api/backend/files/images"
      : "/api/backend/files/attachments";

    const uploadResponse = await fetch(uploadEndpoint, {
      method: "POST",
      body: upload,
    });
    const uploadedFile = await uploadResponse.json().catch(() => null);
    if (!uploadResponse.ok || !uploadedFile?.id) {
      throw new Error(
        uploadedFile?.message ||
          uploadedFile?.detail ||
          uploadedFile?.error ||
          "Appointment letter upload failed.",
      );
    }

    for (const [index, selectedMemberId] of appointmentMemberIds.entries()) {
      const member = selectedMembers.find((item) => Number(item.id) === selectedMemberId);
      const title = data.title?.trim() || "លិខិតតែងតាំង";
      const createResponse = await fetch("/api/backend/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_id: Number(memberDocumentType.id),
          file_id: Number(uploadedFile.id),
          title,
          description: data.description?.trim() || `លិខិតតែងតាំងសម្រាប់ ${getBranchName(data.branch) || getBranchName(member?.branch)}`,
          member_id: selectedMemberId,
        }),
      });
      const createdDocument = await createResponse.json().catch(() => null);
      if (!createResponse.ok) {
        throw new Error(
          createdDocument?.message || createdDocument?.detail || createdDocument?.error ||
            "Unable to save appointment letter.",
        );
      }

      const credentialResponse = await fetch(
        `/api/backend/members/${selectedMemberId}/credentials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            credentialKind: "APPOINTMENT_LETTER",
            credentialNo: `APPT-${selectedMemberId}-${Date.now()}-${index + 1}`,
            issuedOn: new Date().toISOString().slice(0, 10),
            fileId: Number(uploadedFile.id),
          }),
        },
      );
      const credentialBody = await credentialResponse.json().catch(() => null);
      if (!credentialResponse.ok) {
        throw new Error(
          credentialBody?.message || "Unable to connect the appointment letter to the member credential tab.",
        );
      }
    }

    return String(memberId);
  };

  const handleSave = async (createdData) => {
    if (saving) {
      return;
    }

    const data = createdData || form;

    setSaving(true);

    try {
      if (type === "id_card") {
        const memberId = await saveIdCardToBackend(data);

        alert("✅ បង្កើតប័ណ្ណសមាជិកដោយជោគជ័យ!");

        openMemberDocuments(memberId);

        return;
      }

      if (type === "certificate" && data.recipientType === "member") {
        const memberId = await saveMemberCertificatesToBackend(data);

        alert("✅ បង្កើតវិញ្ញាបនបត្រដោយជោគជ័យ!");

        openMemberDocuments(memberId);

        return;
      }

      if (type === "certificate" && data.recipientType === "activity") {
        const notifyResult = await notifyInvitedBranchesForCertificates(data);
        const generatedDocuments = normalizeArray(data.generatedDocuments);

        if (generatedDocuments.length > 0) {
          const firstMemberId = await saveMemberCertificatesToBackend(data);

          const notifiedNote =
            notifyResult.notifiedBranchIds.length > 0
              ? ` និងបានជូនដំណឹងទៅ ${notifyResult.notifiedBranchIds.length} សាខា`
              : "";

          alert(`✅ បង្កើតវិញ្ញាបនបត្រដោយជោគជ័យ${notifiedNote}!`);

          openMemberDocuments(firstMemberId);

          return;
        }

        if (notifyResult.notifiedBranchIds.length > 0) {
          alert(
            `✅ បានផ្ញើការជូនដំណឹងទៅ ${notifyResult.notifiedBranchIds.length} សាខាដោយជោគជ័យ!`,
          );

          router.push("/document/member");

          return;
        }

        throw new Error(
          "សូមជ្រើសរើសសមាជិកសាខារបស់អ្នក ឬសាខាដែលត្រូវជូនដំណឹង",
        );
      }
      if (type === "appointment_letter") {
        const memberId = await saveAppointmentLettersToBackend(data);

        alert("✅ បង្កើតលិខិតតែងតាំងដោយជោគជ័យ!");

        openMemberDocuments(memberId);

        return;
      }

      router.push("/document/member");
    } catch (error) {
      console.error("Cannot save created document:", error);

      alert(error?.message || "មានបញ្ហាក្នុងការរក្សាទុកឯកសារ");
    } finally {
      setSaving(false);
    }
  };

  const pageTitle =
    type === "certificate"
      ? "បង្កើតវិញ្ញាបនបត្រ"
      : type === "id_card"
        ? "បង្កើតប័ណ្ណសមាជិក"
        : type === "appointment_letter"
          ? "បង្កើតលិខិតតែងតាំង"
          : "បង្កើតឯកសារ";

  const pageDescription =
    type === "certificate"
      ? "បំពេញព័ត៌មានដើម្បីបង្កើតវិញ្ញាបនបត្រ"
      : type === "id_card"
        ? "បំពេញព័ត៌មានដើម្បីបង្កើតប័ណ្ណសមាជិក"
        : type === "appointment_letter"
          ? "បំពេញព័ត៌មានដើម្បីបង្កើតលិខិតតែងតាំង"
          : "ជ្រើសរើសប្រភេទឯកសារដែលអ្នកចង់បង្កើត";

  return (
    <div className="space-y-4">
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => router.push("/document/member")}
            className="
              font-medium
              text-text-mute
              transition
              hover:text-primary
            "
          >
            បញ្ជីឯកសារ
          </button>

          <span className="text-base text-text-mute">›</span>

          {type && (
            <>
              <button
                type="button"
                onClick={() => {
                  setType("");
                  setForm(EMPTY_FORM);
                }}
                className="
                  font-medium
                  text-text-mute
                  transition
                  hover:text-primary
                "
              >
                ប្រភេទឯកសារ
              </button>

              <span className="text-base text-text-mute">›</span>
            </>
          )}

          <span className="font-semibold text-primary">{pageTitle}</span>
        </div>

        <h1 className="text-xl font-bold text-primary">{pageTitle}</h1>

        <p className="text-sm text-text-secondary">{pageDescription}</p>
      </div>

      {/* =====================================
          SELECT DOCUMENT TYPE
      ===================================== */}

      {!type && (
        <div className="flex flex-wrap items-start gap-4">
          {/* Certificate card */}

          <div
            className="
              w-[270px]
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-bg-page-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="h-1 bg-primary" />

            <div className="flex h-[115px] flex-col justify-between p-4">
              <div>
                <h2 className="text-base font-bold text-primary">
                  វិញ្ញាបនបត្រ
                </h2>

                <p className="mt-1 text-xs text-text-secondary">
                  បង្កើតវិញ្ញាបនបត្រសម្រាប់សមាជិក ឬកម្មវិធី
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => selectDocumentType("certificate")}
                  className="
                    inline-flex
                    h-8
                    min-w-[86px]
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary
                    px-3
                    text-xs
                    font-medium
                    text-white
                    transition
                    hover:opacity-80
                  "
                >
                  ជ្រើសរើស
                </button>
              </div>
            </div>
          </div>

          {/* ID-card card */}

          {/* Letter of appointment card */}

          <div
            className="
              w-[270px]
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-bg-page-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="h-1 bg-secondary" />

            <div className="flex h-[115px] flex-col justify-between p-4">
              <div>
                <h2 className="text-base font-bold text-primary">
                  លិខិតតែងតាំង
                </h2>

                <p className="mt-1 text-xs text-text-secondary">
                  បង្កើតលិខិតតែងតាំងសម្រាប់សមាជិក
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => selectDocumentType("appointment_letter")}
                  className="
                    inline-flex
                    h-8
                    min-w-[86px]
                    items-center
                    justify-center
                    rounded-lg
                    bg-secondary
                    px-3
                    text-xs
                    font-medium
                    text-white
                    transition
                    hover:opacity-80
                  "
                >
                  ជ្រើសរើស
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          CERTIFICATE FORM
      ===================================== */}

      {type === "certificate" && (
        <CertificateForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={handleBack}
          saving={saving}
        />
      )}

      {/* =====================================
          ID-CARD FORM
      ===================================== */}

      {type === "id_card" && (
        <IdCardForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={handleBack}
          saving={saving}
        />
      )}
            {/* =====================================
          LETTER OF APPOINTMENT FORM
      ===================================== */}

      {type === "appointment_letter" && (
        <LetterOfAppointmentForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={handleBack}
          saving={saving}
        />
      )}
    </div>
  );
}
