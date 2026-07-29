"use client";

import { useEffect, useMemo, useState } from "react";
import { UploadCloud, X } from "lucide-react";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";
import FormActionButton from "@/components/forms/documentActionbutton";

import membersData from "@/data/members.json";

const MAX_TEMPLATE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TEMPLATE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ROLE_OPTIONS = [
  {
    label: "អ្នកគ្រប់គ្រង",
    value: "admin",
  },
  {
    label: "ប្រធានសាខា",
    value: "branch_leader",
  },
  {
    label: "លេខាធិការ",
    value: "secretary",
  },
  {
    label: "សមាជិក",
    value: "member",
  },
];

const MEMBER_OPTIONS = membersData
  .filter(
    (member) =>
      member?.id &&
      (member?.name_kh ||
        member?.name_en ||
        member?.fullNameKm ||
        member?.fullNameEn),
  )
  .map((member) => ({
    label:
      member.name_kh ||
      member.fullNameKm ||
      member.name_en ||
      member.fullNameEn,
    value: String(member.id),
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

function getBranchName(branch) {
  if (!branch) {
    return "";
  }

  if (typeof branch === "string") {
    return branch;
  }

  return branch.name_kh || branch.name_en || branch.name || "";
}

function getMemberNameKh(member) {
  return member?.name_kh || member?.fullNameKm || member?.full_name_km || "";
}

function getMemberNameEn(member) {
  return member?.name_en || member?.fullNameEn || member?.full_name_en || "";
}

function getMemberJoinedDate(member) {
  return (
    member?.joinedAt ||
    member?.joined_at ||
    member?.joinDate ||
    member?.joinedDate ||
    ""
  );
}

const BRANCH_OPTIONS = [
  ...new Set(
    membersData.map((member) => getBranchName(member.branch)).filter(Boolean),
  ),
].map((branch) => ({
  label: branch,
  value: branch,
}));

export default function LetterOfAppointmentForm({
  form,
  setForm,
  onSave,
  onClose,
  saving = false,
}) {
  const [showValidationError, setShowValidationError] = useState(false);
  const language = form.language || "km";

  const selectedColor = form.color || "#12224c";

  const selectedMember = useMemo(
    () =>
      membersData.find((member) => String(member.id) === String(form.memberId)),
    [form.memberId],
  );

  useEffect(() => {
    return () => {
      if (form.templatePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(form.templatePreview);
      }
    };
  }, [form.templatePreview]);

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));

    setShowValidationError(false);
  };
  const handleMemberChange = (event) => {
    setShowValidationError(false);
    const memberId = event.target.value;

    const member = membersData.find(
      (item) => String(item.id) === String(memberId),
    );

    if (!member) {
      setForm((previous) => ({
        ...previous,

        memberId: "",
        member: "",
        memberNameEn: "",
        branch: "",
        role: "member",
        joinedAt: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,

      memberId: String(member.id),

      member: getMemberNameKh(member),

      memberNameEn: getMemberNameEn(member),

      branch: getBranchName(member.branch) || previous.branch || "",

      role: member.role || previous.role || "member",

      joinedAt: getMemberJoinedDate(member) || previous.joinedAt || "",
    }));
  };

  const handleTemplateUpload = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

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

    if (form.templatePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.templatePreview);
    }

    const previewUrl = URL.createObjectURL(selectedFile);

    setForm((previous) => ({
      ...previous,

      templateFile: selectedFile,
      templatePreview: previewUrl,
    }));

    event.target.value = "";
  };

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

  const previewUser = selectedMember
    ? {
        ...selectedMember,

        id: selectedMember.id || form.memberId,

        name_kh: form.member || getMemberNameKh(selectedMember),

        name_en: form.memberNameEn || getMemberNameEn(selectedMember),

        branch: form.branch || getBranchName(selectedMember.branch),

        role: form.role || selectedMember.role || "member",

        joinedAt: form.joinedAt || getMemberJoinedDate(selectedMember),
      }
    : null;

  const handleSave = async () => {
    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);

    try {
      await onSave?.({
        ...form,
        type: "លិខិតតែងតាំង",
        documentType: "appointment_letter",
        selectedMember,
        user: previewUser,
      });
    } catch (error) {
      console.error("Cannot create appointment letter:", error);

      alert("មានបញ្ហាក្នុងការបង្កើតលិខិតតែងតាំង");
    }
  };

  const isFormValid =
    Boolean(form.title?.trim()) &&
    Boolean(form.memberId) &&
    Boolean(form.role) &&
    Boolean(form.branch?.trim()) &&
    Boolean(form.joinedAt) &&
    Boolean(form.templatePreview);
  return (
    <div className="w-full rounded-xl border border-[#e5eaf0] bg-white p-6">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[330px_minmax(0,1fr)]">
        {/* Left form */}

        <div className="space-y-5">
          <BoxFill
            label="ឈ្មោះឯកសារ"
            name="title"
            value={form.title || ""}
            onChange={updateField("title")}
            placeholder="លិខិតតែងតាំង"
          />
          <FormSelect
            label="សមាជិក"
            name="memberId"
            value={form.memberId || ""}
            onChange={handleMemberChange}
            placeholder="ជ្រើសរើសសមាជិក"
            options={MEMBER_OPTIONS}
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
            label="តួនាទីតែងតាំង"
            name="role"
            value={form.role || "member"}
            onChange={updateField("role")}
            placeholder="ជ្រើសរើសតួនាទី"
            options={ROLE_OPTIONS}
          />

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

          {/* Upload appointment template */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              រូបភាពគំរូលិខិតតែងតាំង
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
                  alt="uploaded appointment letter template"
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

        {/* Right side */}

        <div className="min-w-0">
          {/* Design controls */}

          <div className="mb-5 grid grid-cols-1 items-end gap-4 md:grid-cols-[180px_140px_minmax(220px,1fr)_160px] md:items-start">
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

          {/* Live preview */}

          <div
            className="
              h-[560px]
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-gray-100
              p-5
            "
          >
            {!form.templatePreview ? (
              <div className="flex h-full items-center justify-center">
                <div
                  className="
                    w-full
                    max-w-[390px]
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
                    មិនទាន់មានគំរូលិខិតតែងតាំង
                  </p>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    សូមបញ្ចូលរូបភាពគំរូលិខិតតែងតាំងជាមុនសិន
                  </p>
                </div>
              </div>
            ) : !form.memberId || !previewUser ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                សូមជ្រើសរើសសមាជិក
              </div>
            ) : (
              <div className="flex min-h-full min-w-full overflow-hidden items-center justify-center">
                <LetterOfAppointment
                  user={previewUser}
                  language={language}
                  color={selectedColor}
                  font={form.font || "Noto Sans"}
                  fontSize={form.fontSize || "medium"}
                  description={form.description || ""}
                  templatePreview={form.templatePreview}
                />
              </div>
            )}
          </div>

          {/* Buttons */}

          {showValidationError && !isFormValid && (
            <p className="mt-4 text-xs font-medium text-red-500">
              សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។
            </p>
          )}

          <FormActionButton
            onCancel={onClose}
            onCreate={handleSave}
            isValid={isFormValid}
            saving={saving}
            cancelText="បោះបង់"
            createText="បង្កើតលិខិតតែងតាំង"
            savingText="កំពុងរក្សាទុក..."
          />
        </div>
      </div>
    </div>
  );
}
