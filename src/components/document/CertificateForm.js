"use client";

import { useEffect } from "react";

import { FolderPlus, UploadCloud, X } from "lucide-react";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
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

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
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

    if (recipientType === "activity" && selectedActivityMembers.length === 0) {
      alert("កម្មវិធីនេះមិនមានសមាជិកចូលរួមទេ");

      return;
    }

    alert("✅ បង្កើតវិញ្ញាបនបត្រដោយជោគជ័យ!");

    onSave?.({
      ...form,

      recipientType,

      selectedMember,

      selectedActivity,

      selectedActivityMembers,
    });
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

          {/* Recipient type */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ប្រភេទ
            </label>

            <div
              className="
mt-2
flex
gap-2
text-sm
"
            >
              <label className="flex gap-2 items-center">
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

              <label className="flex gap-2 items-center">
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

          <SelectField
            label="សមាជិក"
            value={form.member || "ម៉ៅ សំណាង"}
            options={["ម៉ៅ សំណាង", "សុខ ចាន់"]}
            onChange={(v) =>
              setForm({
                ...form,
                member: v,
              })
            }
          />

          <Field label="សេចក្តីពិពណ៌នា">
            <textarea
              name="description"
              value={form.description || ""}
              onChange={updateField("description")}
              placeholder="បញ្ចូលសេចក្តីពិពណ៌នា"
              className="
h-[80px]
w-full
resize-none
rounded-lg
border
p-3
text-sm
"
            />
          </Field>

          <label
            className="
flex
h-[80px]
cursor-pointer
flex-col
items-center
justify-center
rounded-xl
border-2
border-dashed
border-[#7180a8]
text-gray-400
hover:bg-gray-50
"
          >
            <input hidden type="file" />

            <UploadCloud size={26} />

            <p
              className="
mt-2
text-xs
"
            >
              បញ្ចូលឯកសារ
            </p>

            <p
              className="
text-[10px]
"
            >
              PDF,JPG,PNG (5MB)
            </p>
          </label>
        </div>

        {/* RIGHT */}

        <div>
          <div
            className="
mb-4
grid
grid-cols-[160px_110px_1fr_130px]
gap-4
items-end
"
          >
            <SelectField
              label="ពុម្ពអក្សរ"
              name="font"
              value={form.font || "Noto Sans"}
              onChange={updateField("font")}
              options={FONT_OPTIONS}
            />

            <SelectField
              label="ទំហំ"
              value={form.fontSize || "6px"}
              options={["6px", "8px", "10px"]}
              onChange={(v) =>
                setForm({
                  ...form,
                  fontSize: v,
                })
              }
            />

            <div>
              <label className="text-xs">ពណ៌</label>

              <div
                className="
mt-3
flex
gap-3
"
              >
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setForm({
                        ...form,
                        color,
                      })
                    }
                    className="
h-5
w-5
rounded-full
border
"
                    style={{
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>
            </div>

            <SelectField
              label="ភាសា"
              name="language"
              value={language}
              onChange={updateField("language")}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          {/* PREVIEW */}

          <div
            className="
h-[390px]
w-full
rounded-sm
border-[4px]
border-[#12224c]
bg-white
p-2
shadow-sm
"
          >
            <img
              src="/sss.jpg"
              className="
h-full
w-full
object-contain
"
            />
          </div>

          <div
            className="
mt-5
flex
gap-4
"
          >
            <button
              type="button"
              onClick={onClose}
              className="
h-9
w-[130px]
rounded-lg
border
text-sm
"
            >
              បោះបង់
            </button>
            <button
              onClick={onSave}
              className="
flex-1
h-9
rounded-lg
bg-[#4b3192]
text-white
text-sm
flex
items-center
justify-center
gap-2
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

function Field({ label, children }) {
  return (
    <div>
      <label
        className="
text-xs
text-gray-600
"
      >
        {label}
      </label>

      <div className="mt-1">{children}</div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label
        className="
text-xs
text-gray-600
"
      >
        {label}
      </label>

      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
h-9
w-full
appearance-none
rounded-lg
border
px-3
pr-8
text-sm
outline-none
"
        >
          {options.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <ChevronDown
          className="
absolute
right-3
top-3
h-4
w-4
text-gray-500
"
        />
      </div>
    </div>
  );
}
