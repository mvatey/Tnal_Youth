"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CertificateForm from "@/app/document/CertificateForm";
import IdCardForm from "@/app/document/IdCardForm";
import LetterOfAppointmentForm from "@/app/document/LetterOfAppointmentForm";

import { createDocumentId, saveTemplateFile } from "@/lib/documentStorage";

const STORAGE_KEY = "tnal-member-documents";

const EMPTY_FORM = {
  title: "",
  branch: "",
  description: "",
  type: "",

  recipientType: "member",

  memberId: "",
  member: "",
  memberNameEn: "",

  activityId: "",
  activity: "",

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

function readSavedDocuments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (error) {
    console.error("Cannot read saved documents:", error);

    return {};
  }
}

function writeSavedDocuments(documents) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

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

  const saveIdCard = async (data, allDocuments) => {
    const memberId = data.userId || data.selectedUser?.id;

    if (!memberId) {
      throw new Error("រកមិនឃើញលេខសម្គាល់សមាជិក");
    }

    if (!data.idCardTemplateFile) {
      throw new Error("សូមបញ្ចូលរូបភាពគំរូប័ណ្ណសមាជិក");
    }

    const memberKey = String(memberId);

    const documentId = createDocumentId();

    const templateStorageId = `id-card-${documentId}`;

    await saveTemplateFile({
      id: templateStorageId,
      file: data.idCardTemplateFile,
    });

    const existingMemberDocuments = allDocuments[memberKey] || {};

    const existingIdCards = normalizeArray(existingMemberDocuments.idCards);

    const newIdCard = {
      id: documentId,

      memberId: memberKey,

      member: data.member || data.selectedUser?.name_kh || "",

      memberNameEn: data.memberNameEn || data.selectedUser?.name_en || "",

      gender: data.gender || data.selectedUser?.gender || "",

      email: data.email || data.selectedUser?.email || "",

      phone: data.phone || data.selectedUser?.phone || "",

      dateOfBirth:
        data.dateOfBirth ||
        data.selectedUser?.date_of_birth ||
        data.selectedUser?.dateOfBirth ||
        "",

      branch:
        getBranchName(data.branch) || getBranchName(data.selectedUser?.branch),

      role: data.role || data.selectedUser?.role || "member",

      profilePhoto:
        data.profilePhoto ||
        data.selectedUser?.profile_photo ||
        data.selectedUser?.profilePhoto ||
        "/profile.png",

      templateStorageId,

      createdAt: new Date().toISOString(),
    };

    allDocuments[memberKey] = {
      ...existingMemberDocuments,

      idCards: [...existingIdCards, newIdCard],
    };

    writeSavedDocuments(allDocuments);

    return memberKey;
  };

  const saveMemberCertificate = async (data, allDocuments) => {
    const memberId = data.memberId || data.selectedMember?.id;

    if (!memberId) {
      throw new Error("រកមិនឃើញលេខសម្គាល់សមាជិក");
    }

    if (!data.templateFile) {
      throw new Error("សូមបញ្ចូលរូបភាពគំរូវិញ្ញាបនបត្រ");
    }

    const memberKey = String(memberId);

    const documentId = createDocumentId();

    const templateStorageId = `certificate-${documentId}`;

    await saveTemplateFile({
      id: templateStorageId,
      file: data.templateFile,
    });

    const existingMemberDocuments = allDocuments[memberKey] || {};

    const existingCertificates = normalizeArray(
      existingMemberDocuments.certificates,
    );

    const newCertificate = {
      id: documentId,

      title: data.title || "វិញ្ញាបនបត្រ",

      recipientType: "member",

      memberId: memberKey,

      member: data.member || data.selectedMember?.name_kh || "",

      memberNameEn: data.memberNameEn || data.selectedMember?.name_en || "",

      branch:
        getBranchName(data.branch) ||
        getBranchName(data.selectedMember?.branch),

      description: data.description || "",

      language: data.language || "km",

      color: data.color || "#12224c",

      font: data.font || "Noto Sans",

      fontSize: data.fontSize || "medium",

      templateStorageId,

      createdAt: new Date().toISOString(),
    };

    allDocuments[memberKey] = {
      ...existingMemberDocuments,

      certificates: [...existingCertificates, newCertificate],
    };

    writeSavedDocuments(allDocuments);

    return memberKey;
  };

  const saveActivityCertificates = async (data, allDocuments) => {
    const activityMembers = data.selectedActivityMembers || [];

    if (activityMembers.length === 0) {
      throw new Error("កម្មវិធីនេះមិនមានសមាជិកចូលរួមទេ");
    }

    if (!data.templateFile) {
      throw new Error("សូមបញ្ចូលរូបភាពគំរូវិញ្ញាបនបត្រ");
    }

    /*
     * Save the uploaded activity template
     * one time in IndexedDB.
     *
     * Every participant certificate uses
     * the same templateStorageId.
     */
    const templateGroupId = createDocumentId();

    const templateStorageId = `activity-certificate-${templateGroupId}`;

    await saveTemplateFile({
      id: templateStorageId,
      file: data.templateFile,
    });

    activityMembers.forEach((member) => {
      const memberKey = String(member.id);

      const existingMemberDocuments = allDocuments[memberKey] || {};

      const existingCertificates = normalizeArray(
        existingMemberDocuments.certificates,
      );

      const newCertificate = {
        id: createDocumentId(),

        title: data.title || "វិញ្ញាបនបត្រ",

        recipientType: "activity",

        memberId: memberKey,

        member: member.name_kh || "",

        memberNameEn: member.name_en || "",

        activityId: data.activityId || data.selectedActivity?.id || "",

        activity: data.selectedActivity || null,

        branch: getBranchName(data.branch) || getBranchName(member.branch),

        description: data.description || "",

        language: data.language || "km",

        color: data.color || "#12224c",

        font: data.font || "Noto Sans",

        fontSize: data.fontSize || "medium",

        templateStorageId,

        createdAt: new Date().toISOString(),
      };

      allDocuments[memberKey] = {
        ...existingMemberDocuments,

        certificates: [...existingCertificates, newCertificate],
      };
    });

    writeSavedDocuments(allDocuments);

    return String(activityMembers[0].id);
  };
  const saveAppointmentLetter = async (data, allDocuments) => {
    const memberId = data.memberId || data.selectedMember?.id || data.user?.id;

    if (!memberId) {
      throw new Error("រកមិនឃើញលេខសម្គាល់សមាជិក");
    }

    const memberKey = String(memberId);
    const documentId = createDocumentId();

    const existingMemberDocuments = allDocuments[memberKey] || {};

    const existingAppointmentLetters = normalizeArray(
      existingMemberDocuments.appointmentLetters,
    );

    const selectedMember = data.selectedMember || data.user || {};

    const newAppointmentLetter = {
      id: documentId,

      title: data.title || "លិខិតតែងតាំង",

      documentType: "appointment_letter",

      memberId: memberKey,

      member: data.member || selectedMember.name_kh || "",

      memberNameEn: data.memberNameEn || selectedMember.name_en || "",

      branch:
        getBranchName(data.branch) || getBranchName(selectedMember.branch),

      role: data.role || selectedMember.role || "member",

      joinedAt:
        data.joinedAt ||
        selectedMember.joinedAt ||
        selectedMember.joined_at ||
        "",

      description: data.description || "",

      createdAt: new Date().toISOString(),
    };

    allDocuments[memberKey] = {
      ...existingMemberDocuments,

      appointmentLetters: [...existingAppointmentLetters, newAppointmentLetter],
    };

    writeSavedDocuments(allDocuments);

    return memberKey;
  };

  const handleSave = async (createdData) => {
    if (saving) {
      return;
    }

    const data = createdData || form;

    setSaving(true);

    try {
      const allDocuments = readSavedDocuments();

      if (type === "id_card") {
        const memberId = await saveIdCard(data, allDocuments);

        alert("✅ បង្កើតប័ណ្ណសមាជិកដោយជោគជ័យ!");

        openMemberDocuments(memberId);

        return;
      }

      if (type === "certificate" && data.recipientType === "member") {
        const memberId = await saveMemberCertificate(data, allDocuments);

        alert("✅ បង្កើតវិញ្ញាបនបត្រដោយជោគជ័យ!");

        openMemberDocuments(memberId);

        return;
      }

      if (type === "certificate" && data.recipientType === "activity") {
        const firstMemberId = await saveActivityCertificates(
          data,
          allDocuments,
        );

        alert("✅ បង្កើតវិញ្ញាបនបត្រដោយជោគជ័យ!");

        openMemberDocuments(firstMemberId);

        return;
      }
      if (type === "appointment_letter") {
        const memberId = await saveAppointmentLetter(data, allDocuments);

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
              bg-white
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
              bg-white
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
