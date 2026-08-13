"use client";

import {
  useEffect,
  useState,
} from "react";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import {
  UploadCloud,
  X,
} from "lucide-react";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import MultiSelect from "@/components/forms/multiselect";
import CertificateCard from "@/components/card/certificate";
import DocumentActionButton from "@/components/forms/documentActionbutton";


const MAX_TEMPLATE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TEMPLATE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DOCUMENT_TYPE_OPTIONS = [
  {
    label: "លិខិតបញ្ជាក់",
    value: "លិខិតបញ្ជាក់",
  },
  {
    label: "បណ្ណសរសើរ",
    value: "បណ្ណសរសើរ",
  },
];

const FONT_OPTIONS = [
  {
    label: "Noto Sans Khmer",
    value: "Noto Sans",
  },
  {
    label: "Kantumruy Pro",
    value: "Kantumruy Pro",
  },
  {
    label: "Battambang",
    value: "Battambang",
  },
  {
    label: "Moul",
    value: "Moul",
  },
];

const CARD_SIZE_OPTIONS = [
  {
    label: "650 px",
    value: "650",
  },
  {
    label: "780 px",
    value: "780",
  },
  {
    label: "900 px",
    value: "900",
  },
];

const LANGUAGE_OPTIONS = [
  {
    label: "ភាសាខ្មែរ",
    value: "km",
  },
  {
    label: "English",
    value: "en",
  },
];

const COLORS = [
  "#12224c",
  "#4b3192",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#eab308",
  "#000000",
];

function normalizeSelectedMemberIds(
  form,
) {
  if (
    Array.isArray(
      form.memberIds,
    )
  ) {
    return form.memberIds.map(
      String,
    );
  }

  /*
   * Supports old form data
   * that still has memberId.
   */
  if (form.memberId) {
    return [
      String(
        form.memberId,
      ),
    ];
  }

  return [];
}

function unwrapList(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getBranchLabel(branch) {
  return (
    branch?.label_km ||
    branch?.labelKm ||
    branch?.name_km ||
    branch?.nameKm ||
    branch?.name_en ||
    branch?.nameEn ||
    branch?.name ||
    ""
  );
}

function mapBranchOption(branch) {
  const id = branch?.id ?? branch?.value ?? branch?.branch_id ?? branch?.branchId;
  return {
    value: String(id ?? ""),
    label: getBranchLabel(branch) || branch?.label || String(id || ""),
  };
}

function mapApiMember(member) {
  const branch = member?.branch || {};
  return {
    ...member,
    id: member?.id,
    name_kh:
      member?.full_name_km ||
      member?.fullNameKm ||
      member?.name_kh ||
      member?.nameKh ||
      member?.full_name_en ||
      member?.fullNameEn ||
      "",
    name_en:
      member?.full_name_en ||
      member?.fullNameEn ||
      member?.name_en ||
      member?.nameEn ||
      "",
    gender:
      member?.gender?.code ||
      member?.gender?.label_km ||
      member?.gender?.labelKm ||
      member?.gender ||
      "",
    branch: getBranchLabel(branch),
    branchId: branch?.id ?? member?.branch_id ?? member?.branchId ?? "",
    profile_photo:
      member?.profile_image_url ||
      member?.profileImageUrl ||
      member?.profile_photo?.url ||
      member?.profilePhoto?.url ||
      member?.profile_photo ||
      member?.profilePhoto ||
      "/profile.png",
  };
}

export default function CertificateForm({
  form,
  setForm,
  onSave,
  onClose,
  saving = false,
}) {
  const recipientType =
    form.recipientType ||
    "member";

  const language =
    form.language || "km";

  const selectedColor =
    form.color || "#12224c";

  const [
    showValidationError,
    setShowValidationError,
  ] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activityParticipants, setActivityParticipants] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const rows = [];
        let page = 0;
        let totalPages = 1;
        do {
          const response = await fetch(`/api/backend/activities?page=${page}&size=100`, {
            cache: "no-store",
            signal: controller.signal,
          });
          const body = await response.json().catch(() => null);
          if (!response.ok) throw new Error(body?.message || "Unable to load activities");
          rows.push(...(Array.isArray(body?.content) ? body.content : []));
          totalPages = Math.max(1, Number(body?.totalPages) || 1);
          page += 1;
        } while (page < totalPages);
        setActivities(rows);
      } catch (error) {
        if (error.name !== "AbortError") setDataError(error.message || "Unable to load activities");
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!form.activityId) {
      setActivityParticipants([]);
      return undefined;
    }
    const controller = new AbortController();
    fetch(`/api/backend/activities/${encodeURIComponent(form.activityId)}/participants`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || "Unable to load activity attendees");
        setActivityParticipants(Array.isArray(body) ? body : (body?.content || []));
      })
      .catch((error) => {
        if (error.name !== "AbortError") setDataError(error.message || "Unable to load activity attendees");
      });
    return () => controller.abort();
  }, [form.activityId]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBranches() {
      setLoadingBranches(true);
      setDataError("");

      try {
        const response = await fetch("/api/lookups/branches", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.message || "Unable to load branches");
        }

        setBranchOptions(
          unwrapList(body)
            .map(mapBranchOption)
            .filter((branch) => branch.value && branch.label),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setDataError(error.message || "Unable to load branches");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingBranches(false);
      }
    }

    loadBranches();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const branchId = String(form.branch || "");
    if (!branchId) {
      setMembers([]);
      setLoadingMembers(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadMembers() {
      setLoadingMembers(true);
      setDataError("");

      try {
        const rows = [];
        let page = 0;
        let totalPages = 1;
        do {
          const response = await fetch(
            `/api/members?branchId=${encodeURIComponent(branchId)}&page=${page}&size=100`,
            { cache: "no-store", signal: controller.signal },
          );
          const body = await response.json().catch(() => null);
          if (!response.ok) throw new Error(body?.message || "Unable to load members");
          rows.push(...unwrapList(body));
          totalPages = Math.max(1, Number(body?.totalPages ?? body?.data?.totalPages) || 1);
          page += 1;
        } while (page < totalPages);

        setMembers(
          rows
            .map(mapApiMember)
            .filter((member) => member.id && member.name_kh),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setMembers([]);
          setDataError(error.message || "Unable to load members");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingMembers(false);
      }
    }

    loadMembers();
    return () => controller.abort();
  }, [form.branch]);

  /*
   * Multi-member IDs.
   */
  const selectedMemberIds =
    normalizeSelectedMemberIds(
      form,
    );

  /*
   * Full member objects selected
   * through the multi-select.
   */
  const selectedMembers =
    members.filter(
      (member) =>
        selectedMemberIds.includes(
          String(member.id),
        ),
    );

  /*
   * Keep first selected member
   * for compatibility with older logic.
   */
  const selectedMember =
    selectedMembers[0] ||
    null;

  const selectedActivity =
    activities.find(
      (activity) =>
        String(activity.id) ===
        String(
          form.activityId,
        ),
    );

  const activityOptions = activities
    .map((activity) => ({
      label: activity.titleKm || activity.title_km || activity.titleEn || activity.title_en,
      value: String(activity.id),
    }))
    .filter((option) => option.label && option.value);

  /*
   * Members participating in
   * the selected activity.
   */
  const selectedActivityMembers =
    recipientType === "activity"
      ? activityParticipants
          .filter(
            (participant) =>
              Boolean(participant.checkedInAt || participant.checked_in_at) ||
              String(participant.attendanceStatusCode || participant.attendance_status_code || "").toUpperCase() === "PRESENT",
          )
          .map(
            (participant) =>
              members.find(
                (member) =>
                  String(
                    member.id,
                  ) ===
                  String(
                    participant.memberId || participant.member_id,
                  ),
              ),
          )
          .filter(Boolean)
      : [];

  const memberOptions = members.map((member) => ({
    label: member.name_kh,
    value: String(member.id),
  }));

  const handleBranchChange = (event) => {
    const branchId = event.target.value;

    setForm((previous) => ({
      ...previous,
      branch: branchId,
      memberId: "",
      memberIds: [],
      member: "",
      members: [],
    }));
    setShowValidationError(false);
  };

  const hasTitle =
    Boolean(
      form.title?.trim(),
    );

  const hasDocumentType =
    Boolean(
      form.documentType?.trim(),
    );

  const hasRecipient =
    recipientType === "member"
      ? selectedMembers.length > 0
      : Boolean(
          form.activityId,
        );

  const hasValidActivityMembers =
    recipientType !==
      "activity" ||
    selectedActivityMembers.length >
      0;

  const isFormValid =
    hasTitle &&
    hasDocumentType &&
    hasRecipient &&
    Boolean(
      form.templatePreview,
    ) &&
    hasValidActivityMembers;

  /*
   * Remove temporary template URL
   * when component is unmounted.
   */
  useEffect(() => {
    return () => {
      if (
        form.templatePreview?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          form.templatePreview,
        );
      }
    };
  }, [
    form.templatePreview,
  ]);

  const updateField =
    (field) => (event) => {
      setForm(
        (previous) => ({
          ...previous,
          [field]:
            event.target.value,
        }),
      );

      setShowValidationError(
        false,
      );
    };

  /*
   * Switch between:
   * - multiple selected members
   * - one activity
   */
  const handleRecipientTypeChange =
    (event) => {
      const selectedType =
        event.target.value;

      setForm(
        (previous) => ({
          ...previous,

          recipientType:
            selectedType,

          /*
           * Reset member values.
           */
          memberId: "",
          memberIds: [],
          member: "",
          members: [],

          /*
           * Reset activity values.
           */
          activityId: "",
          activity: "",

          branch: "",
        }),
      );

      setShowValidationError(
        false,
      );
    };

  /*
   * Select multiple members.
   *
   * memberIds stores all IDs.
   * memberId stores the first selected ID
   * for compatibility with old code.
   */
  const handleMemberChange = (
    memberIds,
  ) => {
    const normalizedIds =
      Array.isArray(memberIds)
        ? memberIds.map(
            String,
          )
        : [];

    const selectedMembersForForm =
      members.filter(
        (member) =>
          normalizedIds.includes(
            String(member.id),
          ),
      );

    const firstMember =
      selectedMembersForForm[0] || null;

    setForm(
      (previous) => ({
        ...previous,

        memberIds:
          normalizedIds,

        /*
         * Compatibility with
         * old single-member code.
         */
        memberId:
          normalizedIds[0] ||
          "",

        members:
          selectedMembersForForm.map(
            (member) =>
              member.name_kh ||
              "",
          ),

        member:
          firstMember
            ?.name_kh ||
          "",

        /*
         * Use the first selected
         * member's branch.
         */
        branch: previous.branch || firstMember?.branchId || "",
      }),
    );

    setShowValidationError(
      false,
    );
  };

  /*
   * Select one activity.
   */
  const handleActivityChange =
    (event) => {
      const activityId =
        event.target.value;

      const activity =
        activities.find(
          (item) =>
            String(
              item.id,
            ) ===
            String(
              activityId,
            ),
        );

      if (!activity) {
        setForm(
          (previous) => ({
            ...previous,

            activityId: "",
            activity: "",
            branch: "",
          }),
        );

        return;
      }

      setForm(
        (previous) => ({
          ...previous,

          activityId:
            String(
              activity.id,
            ),

          activity:
            activity.titleKm || activity.title_kh || activity.titleEn || activity.title_en ||
            "",

          branch:
            activity.branchId || activity.branch_id || activity.branch ||
            previous.branch ||
            "",
        }),
      );

      setShowValidationError(
        false,
      );
    };

  /*
   * Upload certificate
   * background template.
   */
  const handleTemplateUpload =
    (event) => {
      const selectedFile =
        event.target
          .files?.[0];

      if (!selectedFile) {
        return;
      }

      if (
        !ALLOWED_TEMPLATE_TYPES.includes(
          selectedFile.type,
        )
      ) {
        alert(
          "សូមជ្រើសរើសរូបភាព JPG, PNG ឬ WEBP",
        );

        event.target.value =
          "";

        return;
      }

      if (
        selectedFile.size >
        MAX_TEMPLATE_SIZE
      ) {
        alert(
          "ទំហំរូបភាពមិនអាចលើស 5MB",
        );

        event.target.value =
          "";

        return;
      }

      if (
        form.templatePreview?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          form.templatePreview,
        );
      }

      const previewUrl =
        URL.createObjectURL(
          selectedFile,
        );

      setForm(
        (previous) => ({
          ...previous,

          templateFile:
            selectedFile,

          templatePreview:
            previewUrl,
        }),
      );

      setShowValidationError(
        false,
      );

      /*
       * Allows selecting
       * the same file again.
       */
      event.target.value =
        "";
    };

  const removeTemplate = () => {
    if (
      form.templatePreview?.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        form.templatePreview,
      );
    }

    setForm(
      (previous) => ({
        ...previous,

        templateFile: null,
        templatePreview: "",
      }),
    );
  };

  /*
   * Save document data.
   *
   * For member recipient:
   * selectedMembers contains
   * every selected member.
   *
   * For activity recipient:
   * selectedActivityMembers contains
   * every activity participant.
   */
  const handleSave =
    async () => {
      if (!isFormValid) {
        setShowValidationError(
          true,
        );

        return;
      }

      setShowValidationError(
        false,
      );

      try {
        await document.fonts?.ready;

        const generatedDocuments = [];
        const recipients =
          recipientType === "activity"
            ? selectedActivityMembers
            : selectedMembers;

        for (const member of recipients) {
          const captureElement = document.querySelector(
            `[data-certificate-capture="member-${member.id}"]`,
          );

          if (!captureElement) {
            throw new Error("Cannot find the generated certificate preview.");
          }

          const canvas = await html2canvas(captureElement, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
          });

          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
            hotfixes: ["px_scaling"],
          });

          pdf.addImage(
            canvas.toDataURL("image/jpeg", 0.96),
            "JPEG",
            0,
            0,
            canvas.width,
            canvas.height,
            undefined,
            "FAST",
          );

          const safeMemberName = String(
            member.name_en || member.name_kh || member.id,
          )
            .trim()
            .replace(/[\\/:*?"<>|]+/g, "-");

          generatedDocuments.push({
            member,
            file: new File(
              [pdf.output("blob")],
              `certificate-${safeMemberName || member.id}.pdf`,
              { type: "application/pdf" },
            ),
          });
        }

        await onSave?.({
          ...form,

          type:
            form.documentType,

          documentType:
            form.documentType,

          recipientType,

          /*
           * Multiple-member data.
           */
          memberIds:
            selectedMembers.map(
              (member) =>
                String(
                  member.id,
                ),
            ),

          selectedMembers,
          generatedDocuments,

          /*
           * Keep first member
           * for old single-member code.
           */
          selectedMember,

          /*
           * Activity data.
           */
          selectedActivity,
          selectedActivityMembers,
        });
      } catch (error) {
        console.error(
          "Cannot create certificate:",
          error,
        );

        alert(
          "មានបញ្ហាក្នុងការបង្កើតវិញ្ញាបនបត្រ",
        );
      }
    };

  return (
    <div
      className="
        w-full
        rounded-xl
        border
        border-[#e5eaf0]
        bg-white
        p-4
        sm:p-5
        lg:p-6
      "
    >
      <div
        className="
          grid
          grid-cols-1
          gap-8
          xl:grid-cols-[330px_minmax(0,1fr)]
        "
      >
        {/* Left form */}

        <div className="space-y-5">
          <BoxFill
            label="ឈ្មោះឯកសារ"
            name="title"
            value={
              form.title || ""
            }
            onChange={updateField(
              "title",
            )}
            placeholder="បញ្ចូលឈ្មោះឯកសារ"
          />

          <FormSelect
            label="សាខា"
            name="branch"
            value={
              form.branch || ""
            }
            onChange={handleBranchChange}
            placeholder="ជ្រើសរើសសាខា"
            options={
              branchOptions
            }
            loading={loadingBranches}
            error={dataError && branchOptions.length === 0 ? dataError : ""}
          />

          <FormSelect
            label="ប្រភេទឯកសារ"
            name="documentType"
            value={
              form.documentType ||
              ""
            }
            onChange={updateField(
              "documentType",
            )}
            placeholder="ជ្រើសរើសប្រភេទឯកសារ"
            options={
              DOCUMENT_TYPE_OPTIONS
            }
          />

          {/* Recipient type */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-text-primary
              "
            >
              ប្រភេទ
            </label>

            <div className="flex flex-wrap items-center gap-6">
              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  text-sm
                  text-text-primary
                "
              >
                <input
                  type="radio"
                  name="recipientType"
                  value="member"
                  checked={
                    recipientType ===
                    "member"
                  }
                  onChange={
                    handleRecipientTypeChange
                  }
                  className="h-4 w-4 accent-primary"
                />

                សមាជិក
              </label>

              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  text-sm
                  text-text-primary
                "
              >
                <input
                  type="radio"
                  name="recipientType"
                  value="activity"
                  checked={
                    recipientType ===
                    "activity"
                  }
                  onChange={
                    handleRecipientTypeChange
                  }
                  className="h-4 w-4 accent-primary"
                />

                កម្មវិធី
              </label>
            </div>
          </div>

          {/* Dynamic recipient selector */}

          {recipientType ===
          "member" ? (
            <MultiSelect
              label="សមាជិក"
              value={
                selectedMemberIds
              }
              onChange={
                handleMemberChange
              }
              placeholder="ជ្រើសរើសសមាជិក"
              options={
                memberOptions
              }
              disabled={!form.branch || loadingMembers}
              emptyLabel={
                !form.branch
                  ? "សូមជ្រើសរើសសាខាជាមុន"
                  : loadingMembers
                    ? "កំពុងទាញយកសមាជិក..."
                    : "មិនមានសមាជិកនៅក្នុងសាខានេះ"
              }
            />
          ) : (
            <FormSelect
              label="កម្មវិធី"
              name="activityId"
              value={
                form.activityId ||
                ""
              }
              onChange={
                handleActivityChange
              }
              placeholder="ជ្រើសរើសកម្មវិធី"
              options={
                activityOptions
              }
            />
          )}

          {dataError && branchOptions.length > 0 ? (
            <p className="text-xs font-medium text-red-500">{dataError}</p>
          ) : null}

          {/* Description */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-text-primary
              "
            >
              សេចក្តីពិពណ៌នា
            </label>

            <textarea
              name="description"
              value={
                form.description ||
                ""
              }
              onChange={updateField(
                "description",
              )}
              placeholder="បញ្ចូលសេចក្តីពិពណ៌នា"
              className="
                h-[105px]
                w-full
                resize-none
                rounded-lg
                border
                border-gray-200
                bg-white
                p-4
                text-sm
                text-text-primary
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-primary
              "
            />
          </div>

          {/* Template upload */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-text-primary
              "
            >
              រូបភាពគំរូវិញ្ញាបនបត្រ
            </label>

            {form.templatePreview ? (
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                "
              >
                <img
                  src={
                    form.templatePreview
                  }
                  alt="uploaded certificate template"
                  className="
                    aspect-[16/9]
                    w-full
                    object-fill
                  "
                />

                <button
                  type="button"
                  onClick={
                    removeTemplate
                  }
                  aria-label="លុបគំរូ"
                  className="
                    absolute
                    right-2
                    top-2
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-red-500
                    shadow
                    transition
                    hover:bg-red-50
                  "
                >
                  <X size={17} />
                </button>
              </div>
            ) : (
              <label
                className="
                  flex
                  h-[130px]
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border-2
                  border-dashed
                  border-[#7180a8]
                  bg-[#f8f9ff]
                  text-center
                  transition
                  hover:bg-secondary-light/30
                "
              >
                <UploadCloud
                  size={27}
                  className="mb-2 text-[#62708f]"
                />

                <p className="text-xs font-semibold text-primary">
                  បញ្ចូលរូបភាពគំរូ
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  JPG, PNG, WEBP —
                  មិនលើស 5MB
                </p>

                <p className="text-[10px] text-gray-400">
                  ទំហំគំរូណែនាំ
                  1600 × 900 px
                </p>

                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={
                    handleTemplateUpload
                  }
                />
              </label>
            )}
          </div>
        </div>

        {/* Right side */}

        <div className="min-w-0">
          {/* Design controls */}

          <div
            className="
              mb-5
              grid
              grid-cols-1
              items-end
              gap-4
              md:grid-cols-[180px_140px_minmax(220px,1fr)_160px]
              md:items-start
            "
          >
            <FormSelect
              label="ពុម្ពអក្សរ"
              name="font"
              value={
                form.font ||
                "Noto Sans"
              }
              onChange={updateField(
                "font",
              )}
              options={
                FONT_OPTIONS
              }
            />

            <FormSelect
              label="ទំហំ"
              name="cardSize"
              value={
                form.cardSize ||
                "780"
              }
              onChange={updateField(
                "cardSize",
              )}
              options={
                CARD_SIZE_OPTIONS
              }
            />

            {/* Colors */}

            <div className="flex flex-col">
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-text-primary
                "
              >
                ពណ៌
              </label>

              <div className="flex h-[34px] items-center gap-3">
                {COLORS.map(
                  (color) => {
                    const selected =
                      selectedColor ===
                      color;

                    return (
                      <button
                        key={
                          color
                        }
                        type="button"
                        onClick={() => {
                          setForm(
                            (
                              previous,
                            ) => ({
                              ...previous,
                              color,
                            }),
                          );

                          setShowValidationError(
                            false,
                          );
                        }}
                        className={`
                          h-5
                          w-5
                          shrink-0
                          rounded-full
                          border-2
                          transition
                          hover:scale-110
                          ${
                            selected
                              ? `
                                border-gray-800
                                ring-2
                                ring-gray-300
                              `
                              : "border-transparent"
                          }
                        `}
                        style={{
                          backgroundColor:
                            color,
                        }}
                        aria-label={`ជ្រើសរើសពណ៌ ${color}`}
                      />
                    );
                  },
                )}
              </div>
            </div>

            <FormSelect
              label="ភាសា"
              name="language"
              value={language}
              onChange={updateField(
                "language",
              )}
              options={
                LANGUAGE_OPTIONS
              }
            />
          </div>

          {/* Scrollable certificate preview */}

          <div
            className="
              h-[560px]
              overflow-y-auto
              overflow-x-hidden
              rounded-xl
              border
              border-gray-200
              bg-gray-100
              p-5
            "
          >
            {!form.templatePreview ? (
              <EmptyPreview
                title="មិនទាន់មានគំរូវិញ្ញាបនបត្រ"
                message="សូមបញ្ចូលរូបភាពគំរូវិញ្ញាបនបត្រជាមុនសិន"
              />
            ) : recipientType ===
              "member" ? (
              selectedMembers.length ===
              0 ? (
                <EmptyPreview
                  title="មិនទាន់ជ្រើសរើសសមាជិក"
                  message="សូមជ្រើសរើសសមាជិកយ៉ាងតិចម្នាក់"
                />
              ) : (
                <div className="space-y-6">
                  {selectedMembers.map(
                    (
                      member,
                      index,
                    ) => (
                      <CertificatePreviewItem
                        key={`member-certificate-${member.id}`}
                        index={
                          index
                        }
                        total={
                          selectedMembers.length
                        }
                      >
                        <CertificateCard
                          title={
                            form.title ||
                            ""
                          }
                          recipientType="member"
                          member={
                            member
                          }
                          activity={
                            null
                          }
                          language={
                            language
                          }
                          color={
                            selectedColor
                          }
                          font={
                            form.font ||
                            "Noto Sans"
                          }
                          cardSize={
                            form.cardSize ||
                            "780"
                          }
                          description={
                            form.description ||
                            ""
                          }
                          templatePreview={
                            form.templatePreview
                          }
                          captureId={`member-${member.id}`}
                        />
                      </CertificatePreviewItem>
                    ),
                  )}
                </div>
              )
            ) : !form.activityId ? (
              <EmptyPreview
                title="មិនទាន់ជ្រើសរើសកម្មវិធី"
                message="សូមជ្រើសរើសកម្មវិធី"
              />
            ) : selectedActivityMembers.length ===
              0 ? (
              <EmptyPreview
                title="មិនមានសមាជិក"
                message="មិនមានសមាជិកចូលរួមក្នុងកម្មវិធីនេះទេ"
              />
            ) : (
              <div className="space-y-6">
                {selectedActivityMembers.map(
                  (
                    member,
                    index,
                  ) => (
                    <CertificatePreviewItem
                      key={`activity-certificate-${form.activityId}-${member.id}`}
                      index={
                        index
                      }
                      total={
                        selectedActivityMembers.length
                      }
                    >
                      <CertificateCard
                        title={
                          form.title ||
                          ""
                        }
                        recipientType="activity"
                        member={
                          member
                        }
                        activity={
                          selectedActivity
                        }
                        language={
                          language
                        }
                        color={
                          selectedColor
                        }
                        font={
                          form.font ||
                          "Noto Sans"
                        }
                        cardSize={
                          form.cardSize ||
                          "780"
                        }
                        description={
                          form.description ||
                          ""
                        }
                        templatePreview={
                          form.templatePreview
                        }
                      />
                    </CertificatePreviewItem>
                  ),
                )}
              </div>
            )}
          </div>

          {showValidationError &&
            !isFormValid && (
              <p className="mt-4 text-xs font-medium text-red-500">
                សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។
              </p>
            )}

          <DocumentActionButton
            onCancel={onClose}
            onCreate={handleSave}
            isValid={
              isFormValid
            }
            saving={saving}
            cancelText="បោះបង់"
            createText="បង្កើតឯកសារ"
          />
        </div>
      </div>
    </div>
  );
}

function CertificatePreviewItem({
  index,
  total,
  children,
}) {
  return (
    <div>
      <div
        className="
          mb-2
          text-sm
          font-semibold
          text-text-primary
        "
      >
        វិញ្ញាបនបត្រ{" "}
        {index + 1} / {total}
      </div>

      <div className="flex min-h-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function EmptyPreview({
  title,
  message,
}) {
  return (
    <div
      className="
        flex
        h-full
        items-center
        justify-center
      "
    >
      <div
        className="
          w-full
          max-w-[360px]
          rounded-3xl
          border
          border-gray-200
          bg-white
          px-10
          py-8
          text-center
          shadow-sm
        "
      >
        <p className="text-xl font-bold text-text-primary">
          {title}
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          {message}
        </p>
      </div>
    </div>
  );
}
