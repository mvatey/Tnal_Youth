"use client";

import { FolderPlus, UploadCloud, X } from "lucide-react";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import CertificateCard from "@/components/card/certificate";

import membersData from "@/data/members.json";
import activities from "@/data/activity.json";

const BRANCH_OPTIONS = [
  ...new Set(
    membersData
      .map((member) => member.branch)
      .filter(Boolean),
  ),
].map((branch) => ({
  label: branch,
  value: branch,
}));

const MEMBER_OPTIONS = membersData
  .filter((member) => member?.name_kh)
  .map((member) => ({
    label: member.name_kh,
    value: String(member.id),
  }));

const ACTIVITY_OPTIONS = activities.map((activity) => ({
  label: activity.title_kh,
  value: String(activity.id),
}));

const FONT_OPTIONS = [
  {
    label: "Noto Sans",
    value: "Noto Sans",
  },
  {
    label: "Kantumruy Pro",
    value: "Kantumruy Pro",
  },
  {
    label: "Arial",
    value: "Arial",
  },
  {
    label: "Georgia",
    value: "Georgia",
  },
];

const FONT_SIZE_OPTIONS = [
  {
    label: "តូច",
    value: "small",
  },
  {
    label: "មធ្យម",
    value: "medium",
  },
  {
    label: "ធំ",
    value: "large",
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

export default function CertificateForm({
  form,
  setForm,
  onSave,
  onClose,
}) {
  const recipientType = form.recipientType || "member";
  const language = form.language || "km";
  const selectedColor = form.color || "#12224c";

  const selectedMember = membersData.find(
    (member) =>
      String(member.id) === String(form.memberId),
  );

  const selectedActivity = activities.find(
    (activity) =>
      String(activity.id) === String(form.activityId),
  );

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

      memberId: "",
      member: "",

      activityId: "",
      activity: "",
    }));
  };

  const handleMemberChange = (event) => {
    const memberId = event.target.value;

    const member = membersData.find(
      (item) => String(item.id) === String(memberId),
    );

    setForm((previous) => ({
      ...previous,
      memberId,
      member: member?.name_kh || "",
      branch: member?.branch || previous.branch || "",
    }));
  };

  const handleActivityChange = (event) => {
    const activityId = event.target.value;

    const activity = activities.find(
      (item) => String(item.id) === String(activityId),
    );

    setForm((previous) => ({
      ...previous,
      activityId,
      activity: activity?.title_kh || "",
      branch: activity?.branch || previous.branch || "",
    }));
  };

  const handleUpload = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("សូមជ្រើសរើសឯកសារ JPG, PNG ឬ WEBP");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("ទំហំឯកសារមិនអាចលើស 5MB");
      event.target.value = "";
      return;
    }

    if (form.templatePreview) {
      URL.revokeObjectURL(form.templatePreview);
    }

    const previewUrl = URL.createObjectURL(selectedFile);

    setForm((previous) => ({
      ...previous,
      templateFile: selectedFile,
      templatePreview: previewUrl,
    }));
  };

  const removeTemplate = () => {
    if (form.templatePreview) {
      URL.revokeObjectURL(form.templatePreview);
    }

    setForm((previous) => ({
      ...previous,
      templateFile: null,
      templatePreview: "",
    }));
  };

  const handleSave = () => {
    const hasTitle = Boolean(form.title?.trim());

    const hasRecipient =
      recipientType === "member"
        ? Boolean(form.memberId)
        : Boolean(form.activityId);

    if (!hasTitle || !hasRecipient) {
      alert("សូមបំពេញឈ្មោះឯកសារ និងជ្រើសរើសអ្នកទទួល");
      return;
    }

    alert("✅ បង្កើតវិញ្ញាបនបត្រដោយជោគជ័យ!");

    onSave?.({
      ...form,
      recipientType,
      selectedMember,
      selectedActivity,
    });
  };

  return (
    <div className="w-full rounded-xl border border-[#e5eaf0] bg-white p-6">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[330px_minmax(0,1fr)]">
        {/* LEFT FORM */}

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

          {/* Member or activity */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ប្រភេទអ្នកទទួល
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

          {/* Upload template */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              រូបភាពគំរូវិញ្ញាបនបត្រ
            </label>

            {form.templatePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={form.templatePreview}
                  alt="uploaded certificate template"
                  className="h-[150px] w-full object-contain"
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
                  h-[120px]
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

                <p className="text-xs font-semibold text-primary">
                  បញ្ចូលរូបភាពគំរូ
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  JPG, PNG, WEBP — មិនលើស 5MB
                </p>

                <p className="text-[10px] text-gray-400">
                  សមាមាត្រណែនាំ 16:9
                </p>

                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="min-w-0">
          {/* Design controls */}

          <div className="mb-5 grid grid-cols-1 items-end gap-4 md:grid-cols-[170px_125px_minmax(220px,1fr)_150px]">
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
              value={form.fontSize || "medium"}
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
                        h-6
                        w-6
                        shrink-0
                        rounded-full
                        border-2
                        transition
                        hover:scale-110
                        ${
                          selected
                            ? "border-gray-800 ring-2 ring-primary/20"
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

          {/* Live certificate */}

          <div className="flex min-h-[500px] items-center justify-center overflow-hidden rounded-lg bg-gray-100 p-5">
            <CertificateCard
              recipientType={recipientType}
              member={selectedMember}
              activity={selectedActivity}
              language={language}
              color={selectedColor}
              font={form.font || "Noto Sans"}
              fontSize={form.fontSize || "medium"}
              description={form.description || ""}
              templatePreview={form.templatePreview || ""}
            />
          </div>

          {/* Buttons */}

          <div className="mt-5 flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="
                h-11
                w-[150px]
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