"use client";

import { FolderPlus, UploadCloud } from "lucide-react";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import CertificateCard from "@/components/card/certificate";

import members from "@/data/members.json";
import activities from "@/data/activity.json";

const BRANCH_OPTIONS = [
  {
    label: "សាខាភ្នំពេញ",
    value: "សាខាភ្នំពេញ",
  },
  {
    label: "សាខាសៀមរាប",
    value: "សាខាសៀមរាប",
  },
];

const MEMBER_OPTIONS = members
  .filter((member) => member?.name_kh)
  .map((member) => ({
    label: member.name_kh,
    value: member.name_kh,
  }));

const ACTIVITY_OPTIONS = activities
  .map((activity) => {
    const activityLabel =
      activity.title_kh ||
      activity.titleKh ||
      activity.title ||
      activity.name_kh ||
      activity.nameKh ||
      activity.name;

    return {
      label: activityLabel,
      value: activityLabel,
    };
  })
  .filter((activity) => activity.label);

const FONT_OPTIONS = [
  {
    label: "Noto Sans",
    value: "Noto Sans",
  },
  {
    label: "Kantumruy Pro",
    value: "Kantumruy Pro",
  },
];

const FONT_SIZE_OPTIONS = [
  {
    label: "6px",
    value: "6px",
  },
  {
    label: "8px",
    value: "8px",
  },
  {
    label: "10px",
    value: "10px",
  },
];

const LANGUAGE_OPTIONS = [
  {
    label: "ភាសាខ្មែរ",
    value: "ភាសាខ្មែរ",
  },
  {
    label: "English",
    value: "English",
  },
];

const COLORS = [
  "#12224c",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#fde047",
  "#000000",
];

export default function CertificateForm({
  form,
  setForm,
  onSave,
  onClose,
}) {
  /*
   * If recipientType does not exist yet,
   * use "member" as the default selected value.
   */
  const recipientType = form.recipientType || "member";

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleRecipientTypeChange = (event) => {
    const selectedType = event.target.value;

    setForm((previous) => ({
      ...previous,
      recipientType: selectedType,

      /*
       * Clear the old selection when switching.
       */
      member: "",
      activity: "",
    }));
  };

  const handleUpload = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const previewUrl = URL.createObjectURL(selectedFile);

    setForm((previous) => ({
      ...previous,
      templateFile: selectedFile,
      templatePreview: previewUrl,
    }));
  };

  const handleSave = () => {
    const commonFieldsComplete =
      form.title?.trim() &&
      form.branch;

    const recipientComplete =
      recipientType === "member"
        ? Boolean(form.member)
        : Boolean(form.activity);

    if (!commonFieldsComplete || !recipientComplete) {
      alert("សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់");
      return;
    }

    onSave?.();
  };

  const previewName =
    recipientType === "member"
      ? form.member || "Member Name"
      : form.activity || "Activity Name";

  return (
    <div className="w-full rounded-xl border border-[#e5eaf0] bg-white p-8">
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-[330px_minmax(0,1fr)]">
        {/* LEFT FORM */}

        <div className="space-y-5">
          <BoxFill
            label="ឈ្មោះឯកសារ *"
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

          {/* Member or activity selection */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              សម្រាប់សមាជិក ឬកម្មវិធី?
            </label>

            <div className="flex items-center gap-6">
              {/* Member - selected by default */}

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

              {/* Activity */}

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

          {/* Dynamic member/activity selector */}

          {recipientType === "member" ? (
            <FormSelect
              label="សមាជិក"
              name="member"
              value={form.member || ""}
              onChange={updateField("member")}
              placeholder="ជ្រើសរើសសមាជិក"
              options={MEMBER_OPTIONS}
            />
          ) : (
            <FormSelect
              label="កម្មវិធី"
              name="activity"
              value={form.activity || ""}
              onChange={updateField("activity")}
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

          {/* Upload */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              បញ្ចូលឯកសារ
            </label>

            <label
              className="
                flex
                h-[110px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-[#7180a8]
                bg-[#f8f9ff]
                text-gray-400
                transition
                hover:bg-secondary-light/30
              "
            >
              <UploadCloud
                size={27}
                className="mb-2 text-[#62708f]"
              />

              <p className="text-xs font-medium text-gray-400">
                បញ្ចូលឯកសារ
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                ប្រភេទ៖ JPG, DOCX, PDF, PNG (ទំហំអតិបរមា 5MB)
              </p>

              <p className="text-[10px] text-gray-400">
                សមាមាត្រ 16:9
              </p>

              <input
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>

        {/* RIGHT PREVIEW */}

        <div className="min-w-0">
          {/* Preview controls */}

          <div className="mb-5 grid grid-cols-1 items-end gap-4 md:grid-cols-[180px_120px_minmax(220px,1fr)_150px]">
            <FormSelect
              label="ពុម្ពអក្សរ"
              name="font"
              value={form.font || "Noto Sans"}
              onChange={updateField("font")}
              options={FONT_OPTIONS}
            />

            <FormSelect
              label="ទំហំ"
              name="fontSize"
              value={form.fontSize || "6px"}
              onChange={updateField("fontSize")}
              options={FONT_SIZE_OPTIONS}
            />

            {/* Colors */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">
                ពណ៌
              </label>

              <div className="flex h-11 items-center gap-3">
                {COLORS.map((color) => {
                  const selected = form.color === color;

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
                        h-6
                        w-6
                        shrink-0
                        rounded-full
                        border-2
                        transition
                        hover:scale-110
                        ${
                          selected
                            ? "border-text-primary ring-2 ring-primary/20"
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
              value={form.language || "English"}
              onChange={updateField("language")}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          {/* Certificate preview */}

          <div
            className="
              flex
              min-h-[480px]
              w-full
              items-center
              justify-center
              overflow-hidden
              rounded-sm
              border-[4px]
              border-[#12224c]
              bg-white
              p-3
              shadow-sm
            "
          >
            {form.templatePreview ? (
              <img
                src={form.templatePreview}
                alt="certificate template"
                className="h-full max-h-[470px] w-full object-contain"
              />
            ) : (
              <div className="origin-center scale-[0.9]">
                <CertificateCard
                  user={{
                    id: 1,
                    name_kh: previewName,
                    role: "member",
                    branch: form.branch || "-",
                  }}
                  activity={
                    recipientType === "activity"
                      ? form.activity
                      : undefined
                  }
                />
              </div>
            )}
          </div>

          {/* Buttons */}

          <div className="mt-5 flex items-center gap-5">
            <button
              type="button"
              onClick={onClose}
              className="
                h-11
                w-[165px]
                shrink-0
                rounded-lg
                border
                border-gray-300
                bg-white
                text-sm
                font-medium
                text-text-primary
                transition
                hover:bg-gray-50
              "
            >
              បោះបង់
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="
                flex
                h-11
                flex-1
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-primary
                text-sm
                font-medium
                text-white
                transition
                hover:opacity-90
              "
            >
              <FolderPlus size={19} />

              បង្កើតឯកសារ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}