"use client";

import { useEffect } from "react";
import { useState } from "react";

import { UploadCloud, X } from "lucide-react";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import CertificateCard from "@/components/card/certificate";
import DocumentActionButton from "@/components/forms/documentActionbutton";

import membersData from "@/data/members.json";
import activities from "@/data/activity.json";
import participantsData from "@/data/participants.json";

const MAX_TEMPLATE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TEMPLATE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const BRANCH_OPTIONS = [
  ...new Set(membersData.map((member) => member.branch).filter(Boolean)),
].map((branch) => ({
  label: branch,
  value: branch,
}));
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

const MEMBER_OPTIONS = membersData
  .filter((member) => member?.name_kh)
  .map((member) => ({
    label: member.name_kh,
    value: String(member.id),
  }));

const ACTIVITY_OPTIONS = activities
  .filter((activity) => activity?.title_kh)
  .map((activity) => ({
    label: activity.title_kh,
    value: String(activity.id),
  }));

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

export default function CertificateForm({ form, setForm, onSave, onClose }) {
  const recipientType = form.recipientType || "member";

  const language = form.language || "km";

  const selectedColor = form.color || "#12224c";

  const selectedMember = membersData.find(
    (member) => String(member.id) === String(form.memberId),
  );

  const selectedActivity = activities.find(
    (activity) => String(activity.id) === String(form.activityId),
  );

  /*
   * Find every active participant
   * for the selected activity.
   */
  const selectedActivityMembers =
    recipientType === "activity"
      ? participantsData
          .filter(
            (participant) =>
              String(participant.activityId) === String(form.activityId) &&
              participant.status !== "CANCELLED",
          )
          .map((participant) =>
            membersData.find(
              (member) => String(member.id) === String(participant.memberId),
            ),
          )
          .filter(Boolean)
      : [];

  /*
   * Clean the temporary browser URL
   * when the component is removed.
   */
  useEffect(() => {
    return () => {
      if (form.templatePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(form.templatePreview);
      }
    };
  }, [form.templatePreview]);
  const [showValidationError, setShowValidationError] = useState(false);
  const hasTitle = Boolean(form.title?.trim());

  const hasRecipient =
    recipientType === "member"
      ? Boolean(form.memberId)
      : Boolean(form.activityId);

  const hasDocumentType = Boolean(
  form.documentType?.trim(),
);

const isFormValid =
  hasTitle &&
  hasDocumentType &&
  hasRecipient &&
  Boolean(form.templatePreview) &&
  (
    recipientType !== "activity" ||
    selectedActivityMembers.length > 0
  );

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));

    setShowValidationError(false);
  };

  /*
   * Switch between single-member
   * certificate and activity certificates.
   */
  const handleRecipientTypeChange = (event) => {
    const selectedType = event.target.value;

    setForm((previous) => ({
      ...previous,

      recipientType: selectedType,

      memberId: "",
      member: "",

      activityId: "",
      activity: "",

      branch: "",
    }));
  };

  /*
   * Select a single member.
   */
  const handleMemberChange = (event) => {
    const memberId = event.target.value;

    const member = membersData.find(
      (item) => String(item.id) === String(memberId),
    );

    if (!member) {
      setForm((previous) => ({
        ...previous,

        memberId: "",
        member: "",
        branch: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,

      memberId: String(member.id),

      member: member.name_kh || "",

      branch: member.branch || previous.branch || "",
    }));
  };

  /*
   * Select an activity.
   */
  const handleActivityChange = (event) => {
    const activityId = event.target.value;

    const activity = activities.find(
      (item) => String(item.id) === String(activityId),
    );

    if (!activity) {
      setForm((previous) => ({
        ...previous,

        activityId: "",
        activity: "",
        branch: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,

      activityId: String(activity.id),

      activity: activity.title_kh || "",

      branch: activity.branch || previous.branch || "",
    }));
  };

  /*
   * Upload blank certificate template.
   *
   * This only replaces the certificate
   * background. Certificate information
   * stays above the image.
   */
  const handleTemplateUpload = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!ALLOWED_TEMPLATE_TYPES.includes(selectedFile.type)) {
      alert("សូមជ្រើសរើសរូបភាព JPG, PNG ឬ WEBP");

      event.target.value = "";

      return;
    }

    if (selectedFile.size > MAX_TEMPLATE_SIZE) {
      alert("ទំហំរូបភាពមិនអាចលើស 5MB");

      event.target.value = "";

      return;
    }

    /*
     * Delete the previous temporary URL
     * before creating a new one.
     */
    if (form.templatePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.templatePreview);
    }

    const previewUrl = URL.createObjectURL(selectedFile);

    setForm((previous) => ({
      ...previous,

      templateFile: selectedFile,

      templatePreview: previewUrl,
    }));

    /*
     * Allows the same image to be
     * selected again later.
     */
    event.target.value = "";
  };

  /*
   * Remove uploaded template and
   * return to the default design.
   */
  const removeTemplate = () => {
    if (form.templatePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.templatePreview);
    }

    setForm((previous) => ({
      ...previous,

      templateFile: null,
      templatePreview: "",
    }));
  };

  /*
   * Save certificate data.
   */
  const handleSave = async () => {
    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);

    try {
      await onSave?.({
  ...form,

  type: form.documentType,
  documentType: form.documentType,

  recipientType,
  selectedMember,
  selectedActivity,
  selectedActivityMembers,
});
    } catch (error) {
      console.error(error);

      alert("មានបញ្ហាក្នុងការបង្កើតវិញ្ញាបនបត្រ");
    }
  };

  return (
    <div className="w-full rounded-xl border border-[#e5eaf0] bg-white p-6">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[330px_minmax(0,1fr)]">
        {/* =====================================
            LEFT FORM
        ===================================== */}

        <div className="space-y-5">
          <BoxFill
            label="ឈ្មោះឯកសារ"
            name="title"
            value={form.title || ""}
            onChange={updateField("title")}
            placeholder="បញ្ចូលឈ្មោះឯកសារ"
          />

          <FormSelect
            label="សាខា"
            name="branch"
            value={form.branch || ""}
            onChange={updateField("branch")}
            placeholder="ជ្រើសរើសសាខា"
            options={BRANCH_OPTIONS}
          />
          <FormSelect
  label="ប្រភេទឯកសារ"
  name="documentType"
  value={form.documentType || ""}
  onChange={updateField("documentType")}
  placeholder="ជ្រើសរើសប្រភេទឯកសារ"
  options={DOCUMENT_TYPE_OPTIONS}
/>

          {/* Recipient type */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ប្រភេទ
            </label>

            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
                <input
                  type="radio"
                  name="recipientType"
                  value="member"
                  checked={recipientType === "member"}
                  onChange={handleRecipientTypeChange}
                  className="h-4 w-4 accent-primary"
                />
                សមាជិក
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
                <input
                  type="radio"
                  name="recipientType"
                  value="activity"
                  checked={recipientType === "activity"}
                  onChange={handleRecipientTypeChange}
                  className="h-4 w-4 accent-primary"
                />
                កម្មវិធី
              </label>
            </div>
          </div>

          {/* Dynamic selector */}

          {recipientType === "member" ? (
            <FormSelect
              label="សមាជិក"
              name="memberId"
              value={form.memberId || ""}
              onChange={handleMemberChange}
              placeholder="ជ្រើសរើសសមាជិក"
              options={MEMBER_OPTIONS}
            />
          ) : (
            <FormSelect
              label="កម្មវិធី"
              name="activityId"
              value={form.activityId || ""}
              onChange={handleActivityChange}
              placeholder="ជ្រើសរើសកម្មវិធី"
              options={ACTIVITY_OPTIONS}
            />
          )}

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              សេចក្តីពិពណ៌នា
            </label>

            <textarea
              name="description"
              value={form.description || ""}
              onChange={updateField("description")}
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
                placeholder:text-gray-400
                focus:border-primary
              "
            />
          </div>

          {/* =====================================
              UPLOAD CERTIFICATE TEMPLATE
          ===================================== */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
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
                  src={form.templatePreview}
                  alt="uploaded certificate template"
                  className="
                    aspect-[16/9]
                    w-full
                    object-fill
                  "
                />

                <button
                  type="button"
                  onClick={removeTemplate}
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
                  aria-label="លុបគំរូ"
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
                <UploadCloud size={27} className="mb-2 text-[#62708f]" />

                <p className="text-xs font-semibold text-primary">
                  បញ្ចូលរូបភាពគំរូ
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  JPG, PNG, WEBP — មិនលើស 5MB
                </p>

                <p className="text-[10px] text-gray-400">
                  ទំហំគំរូណែនាំ 1600 × 900 px
                </p>

                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleTemplateUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* =====================================
            RIGHT SIDE
        ===================================== */}

        <div className="min-w-0">
          {/* Design controls */}

          <div className="mb-5 grid grid-cols-1 items-end gap-4  md:grid-cols-[180px_140px_minmax(220px,1fr)_160px]  md:items-start">
            <FormSelect
              label="ពុម្ពអក្សរ"
              name="font"
              value={form.font || "Noto Sans"}
              onChange={updateField("font")}
              options={FONT_OPTIONS}
            />

            <FormSelect
              label="ទំហំ"
              name="cardSize"
              value={form.cardSize || "780"}
              onChange={updateField("cardSize")}
              options={CARD_SIZE_OPTIONS}
            />

            {/* Colors */}

            <div className="flex flex-col">
              <label className="mb-2 block text-sm font-semibold text-text-primary">
                ពណ៌
              </label>

              <div className="flex h-11 items-center gap-3">
                {COLORS.map((color) => {
                  const selected = selectedColor === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          color,
                        }))
                      }
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
                ? "border-gray-800 ring-2 ring-gray-300"
                : "border-transparent"
            }
          `}
                      style={{
                        backgroundColor: color,
                      }}
                      aria-label={`ជ្រើសរើសពណ៌ ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            <FormSelect
              label="ភាសា"
              name="language"
              value={language}
              onChange={updateField("language")}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          {/* =====================================
              LIVE CERTIFICATE PREVIEW
          ===================================== */}

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
                    មិនទាន់មានគំរូវិញ្ញាបនបត្រ
                  </p>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    សូមបញ្ចូលរូបភាពគំរូវិញ្ញាបនបត្រជាមុនសិន
                  </p>
                </div>
              </div>
            ) : recipientType === "member" ? (
              <div className="flex min-h-full items-center justify-center">
                <CertificateCard
                  title={form.title || ""}
                  recipientType="member"
                  member={selectedMember}
                  activity={null}
                  language={language}
                  color={selectedColor}
                  font={form.font || "Noto Sans"}
                  cardSize={form.cardSize || "780"}
                  description={form.description || ""}
                  templatePreview={form.templatePreview}
                />
              </div>
            ) : !form.activityId ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                សូមជ្រើសរើសកម្មវិធី
              </div>
            ) : selectedActivityMembers.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                មិនមានសមាជិកចូលរួមក្នុងកម្មវិធីនេះទេ
              </div>
            ) : (
              <div className="space-y-6">
                {selectedActivityMembers.map((member, index) => (
                  <div key={`${form.activityId}-${member.id}`}>
                    <div className="mb-2 text-sm font-semibold text-text-primary">
                      វិញ្ញាបនបត្រ {index + 1} /{" "}
                      {selectedActivityMembers.length}
                    </div>

                    <CertificateCard
                      title={form.title || ""}
                      recipientType="activity"
                      member={member}
                      activity={selectedActivity}
                      language={language}
                      color={selectedColor}
                      font={form.font || "Noto Sans"}
                      cardSize={form.cardSize || "780"}
                      description={form.description || ""}
                      templatePreview={form.templatePreview}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Buttons */}

          {showValidationError && !isFormValid && (
            <p className="mt-4 text-xs font-medium text-red-500">
              សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។
            </p>
          )}

          <DocumentActionButton
            onCancel={onClose}
            onCreate={handleSave}
            isValid={isFormValid}
            cancelText="បោះបង់"
            createText="បង្កើតឯកសារ"
          />
        </div>
      </div>
    </div>
  );
}
