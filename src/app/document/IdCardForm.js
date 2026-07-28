"use client";

import { useEffect } from "react";
import { FolderPlus, UploadCloud, X } from "lucide-react";

import IdCard from "@/components/card/idCard";
import FormSelect from "@/components/forms/FormSelect";
import BoxFill from "@/components/forms/boxFill";

import users from "@/data/members.json";

const USER_OPTIONS = users
  .filter((user) => user?.name_kh)
  .map((user) => ({
    label: user.name_kh,
    value: String(user.id),
  }));

const MAX_TEMPLATE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TEMPLATE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function IdCardForm({
  form,
  setForm,
  onSave,
  onClose,
}) {
  const selectedUser = users.find(
    (user) =>
      String(user.id) === String(form.userId),
  );

  /*
   * Revoke the temporary browser URL when
   * the component is removed or the URL changes.
   */
  useEffect(() => {
    const currentPreview =
      form.idCardTemplatePreview;

    return () => {
      if (currentPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [form.idCardTemplatePreview]);

  /*
   * Select a member and copy their information
   * into the form state.
   */
  const handleUserChange = (event) => {
    const selectedId = event.target.value;

    const user = users.find(
      (item) =>
        String(item.id) === String(selectedId),
    );

    if (!user) {
      setForm((previous) => ({
        ...previous,
        userId: "",
        member: "",
        memberNameEn: "",
        gender: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        branch: "",
        role: "",
        profilePhoto: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      userId: String(user.id),
      member: user.name_kh || "",
      memberNameEn: user.name_en || "",
      gender: user.gender || "",
      email: user.email || "",
      phone: user.phone || "",
      dateOfBirth:
        user.date_of_birth ||
        user.dateOfBirth ||
        "",
      branch:
        typeof user.branch === "object"
          ? user.branch?.name_kh ||
            user.branch?.name_en ||
            ""
          : user.branch || "",
      role: user.role || "member",
      profilePhoto:
        user.profile_photo ||
        user.profilePhoto ||
        "/profile.png",
    }));
  };

  /*
   * Upload a blank ID-card background.
   *
   * The uploaded image changes only the design.
   * Member information is still rendered above it.
   */
  const handleTemplateUpload = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    if (
      !ALLOWED_TEMPLATE_TYPES.includes(
        selectedFile.type,
      )
    ) {
      alert(
        "សូមជ្រើសរើសរូបភាព JPG, PNG ឬ WEBP",
      );

      event.target.value = "";

      return;
    }

    if (
      selectedFile.size > MAX_TEMPLATE_SIZE
    ) {
      alert(
        "ទំហំរូបភាពមិនអាចលើស 5MB",
      );

      event.target.value = "";

      return;
    }

    if (
      form.idCardTemplatePreview?.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        form.idCardTemplatePreview,
      );
    }

    const previewUrl =
      URL.createObjectURL(selectedFile);

    setForm((previous) => ({
      ...previous,
      idCardTemplateFile: selectedFile,
      idCardTemplatePreview: previewUrl,
    }));

    /*
     * Allow the same file to be selected again.
     */
    event.target.value = "";
  };

  /*
   * Remove the uploaded template.
   */
  const removeTemplate = () => {
    if (
      form.idCardTemplatePreview?.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        form.idCardTemplatePreview,
      );
    }

    setForm((previous) => ({
      ...previous,
      idCardTemplateFile: null,
      idCardTemplatePreview: "",
    }));
  };

  /*
   * Save the current ID card.
   */
  const handleSave = () => {
    if (!form.userId) {
      alert("សូមជ្រើសរើសសមាជិក");
      return;
    }

    if (!form.idCardTemplatePreview) {
      alert(
        "សូមបញ្ចូលរូបភាពគំរូប័ណ្ណសមាជិក",
      );
      return;
    }

    onSave?.({
      ...form,
      selectedUser,
    });

    alert(
      "✅ បង្កើតប័ណ្ណសមាជិកដោយជោគជ័យ!",
    );
  };

  /*
   * Prepare data for the IdCard component.
   */
  const cardUser = selectedUser
    ? {
        id: selectedUser.id,

        name_kh:
          selectedUser.name_kh || "",

        name_en:
          selectedUser.name_en || "",

        gender:
          selectedUser.gender || "",

        email:
          selectedUser.email || "",

        phone:
          selectedUser.phone || "",

        date_of_birth:
          selectedUser.date_of_birth ||
          selectedUser.dateOfBirth ||
          "",

        branch:
          typeof selectedUser.branch ===
          "object"
            ? selectedUser.branch?.name_kh ||
              selectedUser.branch?.name_en ||
              ""
            : selectedUser.branch || "",

        role:
          selectedUser.role || "member",

        profile_photo:
          selectedUser.profile_photo ||
          selectedUser.profilePhoto ||
          "/profile.png",
      }
    : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div
        className="
          grid
          grid-cols-1
          gap-8
          xl:grid-cols-[320px_minmax(0,1fr)]
        "
      >
        {/* =====================================
            LEFT FORM
        ===================================== */}

        <div className="space-y-4">
          <FormSelect
            label="ឈ្មោះសមាជិក"
            name="userId"
            value={form.userId || ""}
            onChange={handleUserChange}
            placeholder="ជ្រើសរើសសមាជិក"
            options={USER_OPTIONS}
          />

          <BoxFill
            label="ភេទ"
            name="gender"
            value={form.gender || ""}
            placeholder="ភេទ"
            readOnly
          />

          <BoxFill
            label="អ៊ីមែល"
            name="email"
            type="email"
            value={form.email || ""}
            placeholder="អ៊ីមែល"
            readOnly
          />

          <BoxFill
            label="លេខទូរស័ព្ទ"
            name="phone"
            value={form.phone || ""}
            placeholder="លេខទូរស័ព្ទ"
            readOnly
          />

          <BoxFill
            label="ថ្ងៃខែឆ្នាំកំណើត"
            name="dateOfBirth"
            value={form.dateOfBirth || ""}
            placeholder="ថ្ងៃខែឆ្នាំកំណើត"
            readOnly
          />

          <BoxFill
            label="សាខា"
            name="branch"
            value={form.branch || ""}
            placeholder="សាខា"
            readOnly
          />

          {/* Upload ID-card template */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              រូបភាពគំរូប័ណ្ណសមាជិក
            </label>

            {form.idCardTemplatePreview ? (
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
                    form.idCardTemplatePreview
                  }
                  alt="Uploaded ID card template"
                  className="
                    h-[150px]
                    w-full
                    object-contain
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
                  aria-label="លុបរូបភាពគំរូ"
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
                  size={28}
                  className="mb-2 text-[#62708f]"
                />

                <p className="text-sm font-semibold text-primary">
                  បញ្ចូលរូបភាពគំរូ
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG, WEBP — មិនលើស
                  5MB
                </p>

                <p className="text-xs text-gray-400">
                  ទំហំគំរូណែនាំ 856 × 540 px
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

        {/* =====================================
            RIGHT ID CARD PREVIEW
        ===================================== */}

        <div className="min-w-0">
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
            {!form.idCardTemplatePreview ? (
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
                    មិនទាន់មានគំរូប័ណ្ណសមាជិក
                  </p>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    សូមបញ្ចូលរូបភាពគំរូប័ណ្ណសមាជិកជាមុនសិន
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="
                  flex
                  min-h-full
                  items-center
                  justify-center
                "
              >
                <IdCard
                  user={cardUser}
                  templatePreview={
                    form.idCardTemplatePreview
                  }
                />
              </div>
            )}
          </div>

          {/* =====================================
              ACTION BUTTONS
          ===================================== */}

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
                h-10
                w-[120px]
                rounded-lg
                border
                border-gray-200
                bg-white
                text-sm
                transition
                hover:bg-gray-50
              "
            >
              បោះបង់
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                !form.userId ||
                !form.idCardTemplatePreview
              }
              className="
                flex
                h-10
                w-[180px]
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FolderPlus size={18} />
              បង្កើតប័ណ្ណ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}