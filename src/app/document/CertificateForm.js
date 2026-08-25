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
import { useLanguage } from "@/context/LanguageContext";


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
    labelKm: "លិខិតបញ្ជាក់",
    labelEn: "Certificate letter",
    value: "លិខិតបញ្ជាក់",
  },
  {
    label: "បណ្ណសរសើរ",
    labelKm: "បណ្ណសរសើរ",
    labelEn: "Appreciation certificate",
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
    labelKm: "ភាសាខ្មែរ",
    labelEn: "Khmer",
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
    labelKm: branch?.labelKm || branch?.label_km || branch?.nameKm || branch?.name_km,
    labelEn: branch?.labelEn || branch?.label_en || branch?.nameEn || branch?.name_en,
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
  const { t, label, isEnglish } = useLanguage();
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
          if (!response.ok) throw new Error(body?.message || t("documentPage.loadActivitiesFailed"));
          rows.push(...(Array.isArray(body?.content) ? body.content : []));
          totalPages = Math.max(1, Number(body?.totalPages) || 1);
          page += 1;
        } while (page < totalPages);
        setActivities(rows);
      } catch (error) {
        if (error.name !== "AbortError") setDataError(error.message || t("documentPage.loadActivitiesFailed"));
      }
    })();
    return () => controller.abort();
  }, [t]);

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
        if (!response.ok) throw new Error(body?.message || t("documentPage.loadActivityParticipantsFailed"));
        setActivityParticipants(Array.isArray(body) ? body : (body?.content || []));
      })
      .catch((error) => {
        if (error.name !== "AbortError") setDataError(error.message || t("documentPage.loadActivityParticipantsFailed"));
      });
    return () => controller.abort();
  }, [form.activityId, t]);

  /*
   * Every time a different activity is selected, reset which of the
   * host branch's own members are selected (default: every present
   * one) and clear any previously selected "other branches to notify"
   * -- both lists are derived from this specific activity's roster and
   * are meaningless once the activity changes.
   */
  useEffect(() => {
    if (recipientType !== "activity") {
      return;
    }

    setForm((previous) => ({
      ...previous,
      activityMemberIds: null,
      notifyBranchIds: [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          throw new Error(body?.message || t("documentPage.loadBranchesFailed"));
        }

        setBranchOptions(
          unwrapList(body)
            .map((branch) => {
              const option = mapBranchOption(branch);
              return {
                ...option,
                label: label(option, option.label),
              };
            })
            .filter((branch) => branch.value && branch.label),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setDataError(error.message || t("documentPage.loadBranchesFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setLoadingBranches(false);
      }
    }

    loadBranches();
    return () => controller.abort();
  }, [label, t]);

  useEffect(() => {
    const branchId = String(form.branch || "");

    /*
     * The "activity" recipient flow no longer needs this branch-scoped
     * member list at all -- selectedActivityMembers below is built
     * directly from activityParticipants (which already carries each
     * participant's own branch), so members from every invited branch
     * are available, not just whichever single branch happens to be in
     * form.branch.
     */
    if (recipientType !== "member" || !branchId) {
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
          if (!response.ok) throw new Error(body?.message || t("documentPage.loadMembersFailed"));
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
          setDataError(error.message || t("documentPage.loadMembersFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setLoadingMembers(false);
      }
    }

    loadMembers();
    return () => controller.abort();
  }, [form.branch, recipientType, t]);

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
      label: label(activity, activity.titleKm || activity.title_km || activity.titleEn || activity.title_en),
      labelKm: activity.titleKm || activity.title_km,
      labelEn: activity.titleEn || activity.title_en,
      value: String(activity.id),
    }))
    .filter((option) => option.label && option.value);

  /*
   * The host (organizer) branch of the selected activity -- own-branch
   * members get individual certificates generated directly; every other
   * branch only gets grouped and, if selected, notified (never
   * generated certificates for their individual members here).
   */
  const hostBranchId = String(
    selectedActivity?.branchId ?? selectedActivity?.branch_id ?? "",
  );

  /*
   * Every participant of the selected activity who actually attended --
   * built straight from activityParticipants, which already carries
   * each participant's own branch (branch_id / branch_name_km /
   * branch_name_en), so this works across every invited branch, not
   * just whichever single branch happens to be loaded into `members`.
   */
  const presentActivityParticipants =
    recipientType === "activity"
      ? activityParticipants.filter(
          (participant) =>
            Boolean(participant.checkedInAt || participant.checked_in_at) ||
            String(
              participant.attendanceStatusCode ||
                participant.attendance_status_code ||
                "",
            ).toUpperCase() === "PRESENT",
        )
      : [];

  function participantToMember(participant) {
    const id = participant.memberId ?? participant.member_id;
    return {
      id,
      name_kh:
        participant.fullNameKm ||
        participant.full_name_km ||
        participant.fullNameEn ||
        participant.full_name_en ||
        "",
      name_en: participant.fullNameEn || participant.full_name_en || "",
      branchId: String(participant.branchId ?? participant.branch_id ?? ""),
    };
  }

  /*
   * Own-branch members -- listed individually, each one multi-selectable,
   * and generate a personal certificate the same way the "member"
   * recipient type already does.
   */
  const ownBranchMembers = presentActivityParticipants
    .filter(
      (participant) =>
        Boolean(hostBranchId) &&
        String(participant.branchId ?? participant.branch_id ?? "") ===
          hostBranchId,
    )
    .map(participantToMember)
    .filter((member) => member.id);

  /*
   * Every other invited branch that has attending participants --
   * grouped by branch, listed as one selectable entry per branch (not
   * per member). Selecting a branch never generates certificates for its
   * individual members; it only queues that branch for the "certificates
   * ready" notification sent to the branch's own leadership.
   */
  const otherBranchGroups = Array.from(
    presentActivityParticipants
      .filter(
        (participant) =>
          String(participant.branchId ?? participant.branch_id ?? "") &&
          String(participant.branchId ?? participant.branch_id ?? "") !==
            hostBranchId,
      )
      .reduce((groups, participant) => {
        const branchId = String(
          participant.branchId ?? participant.branch_id ?? "",
        );
        const branchLabel = label({
          labelKm: participant.branchNameKm || participant.branch_name_km,
          labelEn: participant.branchNameEn || participant.branch_name_en,
        }, branchId);
        const existing = groups.get(branchId);
        if (existing) {
          existing.count += 1;
        } else {
          groups.set(branchId, { branchId, label: branchLabel, count: 1 });
        }
        return groups;
      }, new Map())
      .values(),
  );

  const selectedActivityMemberIds = (
    Array.isArray(form.activityMemberIds)
      ? form.activityMemberIds
      : ownBranchMembers.map((member) => member.id)
  ).map(String);

  /*
   * Members from the host branch that are both present and currently
   * selected -- these are the ones certificates get generated for.
   */
  const selectedActivityMembers = ownBranchMembers.filter((member) =>
    selectedActivityMemberIds.includes(String(member.id)),
  );

  const selectedNotifyBranchIds = (
    Array.isArray(form.notifyBranchIds) ? form.notifyBranchIds : []
  ).map(String);

  const selectedNotifyBranches = otherBranchGroups.filter((branch) =>
    selectedNotifyBranchIds.includes(String(branch.branchId)),
  );

  const memberOptions = members.map((member) => ({
    label: label({ labelKm: member.name_kh, labelEn: member.name_en }, member.name_kh),
    labelKm: member.name_kh,
    labelEn: member.name_en,
    value: String(member.id),
  }));

  const ownBranchMemberOptions = ownBranchMembers.map((member) => ({
    label: label({ labelKm: member.name_kh, labelEn: member.name_en }, member.name_kh),
    labelKm: member.name_kh,
    labelEn: member.name_en,
    value: String(member.id),
  }));

  const otherBranchOptions = otherBranchGroups.map((branch) => ({
    label: `${branch.label} (${branch.count})`,
    value: String(branch.branchId),
  }));

  const handleActivityMemberChange = (memberIds) => {
    setForm((previous) => ({
      ...previous,
      activityMemberIds: Array.isArray(memberIds)
        ? memberIds.map(String)
        : [],
    }));
    setShowValidationError(false);
  };

  const handleNotifyBranchChange = (branchIds) => {
    setForm((previous) => ({
      ...previous,
      notifyBranchIds: Array.isArray(branchIds) ? branchIds.map(String) : [],
    }));
    setShowValidationError(false);
  };

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
      : selectedActivityMembers.length > 0 ||
        selectedNotifyBranches.length > 0;

  /*
   * A certificate template image is only required when something is
   * actually going to be generated. Notifying other branches' leadership
   * that certificates are ready doesn't generate anything here, so a
   * request that selects ONLY other branches (no own-branch members)
   * doesn't need a template.
   */
  const needsTemplate =
    recipientType === "member" ||
    selectedActivityMembers.length > 0;

  const isFormValid =
    hasTitle &&
    hasDocumentType &&
    hasRecipient &&
    (!needsTemplate || Boolean(form.templatePreview));

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
          t("documentPage.selectImageType"),
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
          t("documentPage.imageMaxSize"),
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

          /*
           * Other invited branches to notify (leadership only) that
           * certificates from this activity are ready for their own
           * members -- no certificates are generated for them here.
           */
          notifyBranchIds: selectedNotifyBranches.map(
            (branch) => branch.branchId,
          ),
        });
      } catch (error) {
        console.error(
          "Cannot create certificate:",
          error,
        );

        alert(
          t("documentPage.createCertificateFailed"),
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
        bg-bg-page-white
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
            label={t("documentPage.documentName")}
            name="title"
            value={
              form.title || ""
            }
            onChange={updateField(
              "title",
            )}
            placeholder={t("documentPage.enterDocumentName")}
          />

          <FormSelect
            label={t("documentPage.branch")}
            name="branch"
            value={
              form.branch || ""
            }
            onChange={handleBranchChange}
            placeholder={t("documentPage.selectBranch")}
            options={
              branchOptions
            }
            loading={loadingBranches}
            error={dataError && branchOptions.length === 0 ? dataError : ""}
          />

          <FormSelect
            label={t("documentPage.documentType")}
            name="documentType"
            value={
              form.documentType ||
              ""
            }
            onChange={updateField(
              "documentType",
            )}
            placeholder={t("documentPage.selectDocumentType")}
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
              {t("documentPage.type")}
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

                {t("documentPage.member")}
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

                {t("documentPage.activity")}
              </label>
            </div>
          </div>

          {/* Dynamic recipient selector */}

          {recipientType ===
          "member" ? (
            <MultiSelect
              label={t("documentPage.member")}
              value={
                selectedMemberIds
              }
              onChange={
                handleMemberChange
              }
              placeholder={t("documentPage.selectMember")}
              options={
                memberOptions
              }
              disabled={!form.branch || loadingMembers}
              emptyLabel={
                !form.branch
                  ? t("documentPage.selectBranchFirst")
                  : loadingMembers
                    ? t("documentPage.loadingMembers")
                    : t("documentPage.noMembersInBranch")
              }
            />
          ) : (
            <div className="space-y-5">
              <FormSelect
                label={t("documentPage.activity")}
                name="activityId"
                value={
                  form.activityId ||
                  ""
                }
                onChange={
                  handleActivityChange
                }
                placeholder={t("documentPage.selectActivity")}
                options={
                  activityOptions
                }
              />

              {form.activityId ? (
                <>
                  <MultiSelect
                    label={t("documentPage.ownBranchMembersForCertificates")}
                    value={selectedActivityMemberIds}
                    onChange={handleActivityMemberChange}
                    placeholder={t("documentPage.selectMember")}
                    options={ownBranchMemberOptions}
                    emptyLabel={t("documentPage.noOwnBranchMembersInActivity")}
                  />

                  <MultiSelect
                    label={t("documentPage.invitedBranchesForNotification")}
                    value={selectedNotifyBranchIds}
                    onChange={handleNotifyBranchChange}
                    placeholder={t("documentPage.selectBranch")}
                    options={otherBranchOptions}
                    emptyLabel={t("documentPage.noOtherBranchesInActivity")}
                  />

                  {selectedNotifyBranches.length > 0 ? (
                    <p className="text-xs text-text-mute">
                      {t("documentPage.notifyBranchesOnlyHint")}
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          )}

          {dataError && branchOptions.length > 0 ? (
            <p className="text-xs font-medium text-error">{dataError}</p>
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
              {t("documentPage.description")}
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
              placeholder={t("documentPage.enterDescription")}
              className="
                h-[105px]
                w-full
                resize-none
                rounded-lg
                border
                border-border
                bg-bg-page-white
                p-4
                text-sm
                text-text-primary
                outline-none
                transition
                placeholder:text-text-mute
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
              {t("documentPage.certificateTemplateImage")}
            </label>

            {form.templatePreview ? (
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-bg-page-gray
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
                  aria-label={t("documentPage.removeTemplate")}
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
                    bg-bg-page-white
                    text-error
                    shadow
                    transition
                    hover:bg-error-bg
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
                  border-border
                  bg-bg-page-gray
                  text-center
                  transition
                  hover:bg-secondary-light/30
                "
              >
                <UploadCloud
                  size={27}
                  className="mb-2 text-text-secondary"
                />

                <p className="text-xs font-semibold text-primary">
                  {t("documentPage.uploadTemplateImage")}
                </p>

                <p className="mt-1 text-[10px] text-text-mute">
                  JPG, PNG, WEBP —
                  {t("documentPage.max5Mb")}
                </p>

                <p className="text-[10px] text-text-mute">
                  {t("documentPage.recommendedTemplateSize")} 1600 × 900 px
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
              label={t("documentPage.font")}
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
              label={t("documentPage.size")}
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
                {t("documentPage.color")}
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
                                border-text-primary
                                ring-2
                                ring-border
                              `
                              : "border-transparent"
                          }
                        `}
                        style={{
                          backgroundColor:
                            color,
                        }}
                        aria-label={`${t("documentPage.selectColor")} ${color}`}
                      />
                    );
                  },
                )}
              </div>
            </div>

            <FormSelect
              label={t("documentPage.language")}
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
                title={t("documentPage.noCertificateTemplate")}
                message={t("documentPage.uploadCertificateTemplateFirst")}
              />
            ) : recipientType ===
              "member" ? (
              selectedMembers.length ===
              0 ? (
                <EmptyPreview
                  title={t("documentPage.noMemberSelected")}
                  message={t("documentPage.selectAtLeastOneMember")}
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
                        label={t("documentPage.certificate")}
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
                title={t("documentPage.noActivitySelected")}
                message={t("documentPage.selectActivity")}
              />
            ) : selectedActivityMembers.length === 0 &&
              selectedNotifyBranches.length === 0 ? (
              <EmptyPreview
                title={t("documentPage.noRecipients")}
                message={t("documentPage.selectMembersOrBranchesToNotify")}
              />
            ) : (
              <div className="space-y-6">
                {selectedNotifyBranches.length > 0 ? (
                  <div
                    className="
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      p-5
                      text-sm
                    "
                  >
                    <p className="mb-2 font-semibold text-text-primary">
                      {t("documentPage.branchesToNotifyNoDocuments")}
                    </p>

                    <ul className="list-inside list-disc space-y-1 text-text-secondary">
                      {selectedNotifyBranches.map((branch) => (
                        <li key={`notify-branch-${branch.branchId}`}>
                          {branch.label} — {t("documentPage.memberCount").replace("{count}", branch.count)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

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
                      label={t("documentPage.certificate")}
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
              <p className="mt-4 text-xs font-medium text-error">
                {t("documentPage.completeRequiredInfo")}
              </p>
            )}

          <DocumentActionButton
            onCancel={onClose}
            onCreate={handleSave}
            isValid={
              isFormValid
            }
            saving={saving}
            cancelText={t("documentPage.cancel")}
            createText={t("documentPage.createDocument")}
          />
        </div>
      </div>
    </div>
  );
}

function CertificatePreviewItem({
  index,
  total,
  label,
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
        {label}{" "}
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
