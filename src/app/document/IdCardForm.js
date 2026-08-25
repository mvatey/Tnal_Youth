"use client";

import { useEffect, useState } from "react";
import { UploadCloud, X } from "lucide-react";

import IdCard from "@/components/card/idCard";
import FormSelect from "@/components/forms/FormSelect";
import BoxFill from "@/components/forms/boxFill";
import DocumentActionButton from "@/components/forms/documentActionbutton";
import { useLanguage } from "@/context/LanguageContext";

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
  saving = false,
}) {
  const { t, label } = useLanguage();
  const [users, setUsers] = useState([]);
  const [membersError, setMembersError] = useState("");
  const [showValidationError, setShowValidationError] =
    useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMembers() {
      try {
        const rows = [];
        let page = 0;
        let totalPages = 1;

        do {
          const response = await fetch(
            `/api/members?page=${page}&size=100`,
            { cache: "no-store", signal: controller.signal },
          );
          const body = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(body?.message || t("documentPage.loadMembersFailed"));
          }

          const pageRows = body?.content ?? body?.data?.content ?? body?.data ?? body;
          rows.push(...(Array.isArray(pageRows) ? pageRows : []));
          totalPages = Math.max(
            1,
            Number(body?.totalPages ?? body?.data?.totalPages) || 1,
          );
          page += 1;
        } while (page < totalPages);

        setUsers(rows.map((user) => ({
          ...user,
          name_kh: user.full_name_km || user.fullNameKm || user.name_kh || "",
          name_en: user.full_name_en || user.fullNameEn || user.name_en || "",
          phone: user.phone_number || user.phoneNumber || user.phone || "",
          date_of_birth: user.date_of_birth || user.dateOfBirth || "",
          profile_photo:
            user.profile_image_url || user.profileImageUrl || user.profile_photo || "/profile.png",
        })).filter((user) => user.id && user.name_kh));
      } catch (error) {
        if (error.name !== "AbortError") {
          setMembersError(error.message || t("documentPage.loadMembersFailed"));
        }
      }
    }

    loadMembers();
    return () => controller.abort();
  }, [t]);

  const userOptions = users.map((user) => ({
    label: label({ labelKm: user.name_kh, labelEn: user.name_en }, user.name_kh),
    labelKm: user.name_kh,
    labelEn: user.name_en,
    value: String(user.id),
  }));

  const selectedUser = users.find(
    (user) =>
      String(user.id) === String(form.userId),
  );

  /*
   * Remove the temporary browser image URL
   * when the preview changes or the component closes.
   */
  useEffect(() => {
    const currentPreview =
      form.idCardTemplatePreview;

    return () => {
      if (
        currentPreview?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          currentPreview,
        );
      }
    };
  }, [form.idCardTemplatePreview]);

  /*
   * The form is valid only when:
   * 1. A member is selected.
   * 2. An ID card template is uploaded.
   */
  const isFormValid =
    Boolean(form.userId) &&
    Boolean(form.idCardTemplatePreview);

  /*
   * Select a member and copy their information
   * into the form state.
   */
  const handleUserChange = (event) => {
    const selectedId = event.target.value;

    setShowValidationError(false);

    const user = users.find(
      (item) =>
        String(item.id) ===
        String(selectedId),
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

      memberNameEn:
        user.name_en || "",

      gender: user.gender || "",

      email: user.email || "",

      phone: user.phone || "",

      dateOfBirth:
        user.date_of_birth ||
        user.dateOfBirth ||
        "",

      branch:
        typeof user.branch === "object"
          ? label(user.branch, "")
          : user.branch || "",

      role: user.role || "member",

      profilePhoto:
        user.profile_photo ||
        user.profilePhoto ||
        "/profile.png",
    }));
  };

  /*
   * Upload a blank ID card template.
   */
  const handleTemplateUpload = (event) => {
    const selectedFile =
      event.target.files?.[0];

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

      event.target.value = "";

      return;
    }

    if (
      selectedFile.size >
      MAX_TEMPLATE_SIZE
    ) {
      alert(
        t("documentPage.imageMaxSize"),
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
      URL.createObjectURL(
        selectedFile,
      );

    setForm((previous) => ({
      ...previous,

      idCardTemplateFile:
        selectedFile,

      idCardTemplatePreview:
        previewUrl,
    }));

    setShowValidationError(false);

    /*
     * Allow the same image to be selected again.
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

    setShowValidationError(false);
  };

  /*
   * Save the ID card.
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
        selectedUser,
      });
    } catch (error) {
      console.error(
        "Cannot create ID card:",
        error,
      );

      alert(
        t("documentPage.createIdCardFailed"),
      );
    }
  };

  /*
   * Prepare member data for the ID card preview.
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
            ? selectedUser.branch
                ?.name_kh ||
              selectedUser.branch
                ?.name_en ||
              ""
            : selectedUser.branch || "",

        role:
          selectedUser.role ||
          "member",

        profile_photo:
          selectedUser.profile_photo ||
          selectedUser.profilePhoto ||
          "/profile.png",
      }
    : null;

  return (
    <div className="rounded-xl border border-border bg-bg-page-white p-5">
      <div
        className="
          grid
          grid-cols-1
          gap-8
          xl:grid-cols-[320px_minmax(0,1fr)]
        "
      >
        {/* Left form */}

        <div className="space-y-4">
          <FormSelect
            label={t("documentPage.memberName")}
            name="userId"
            value={form.userId || ""}
            onChange={handleUserChange}
            placeholder={t("documentPage.selectMember")}
            options={userOptions}
          />

          {membersError && (
            <p className="text-sm text-error" role="alert">
              {membersError}
            </p>
          )}

          <BoxFill
            label={t("documentPage.gender")}
            name="gender"
            value={form.gender || ""}
            placeholder={t("documentPage.gender")}
            readOnly
          />

          <BoxFill
            label={t("documentPage.email")}
            name="email"
            type="email"
            value={form.email || ""}
            placeholder={t("documentPage.email")}
            readOnly
          />

          <BoxFill
            label={t("documentPage.phone")}
            name="phone"
            value={form.phone || ""}
            placeholder={t("documentPage.phone")}
            readOnly
          />

          <BoxFill
            label={t("documentPage.dateOfBirth")}
            name="dateOfBirth"
            value={
              form.dateOfBirth || ""
            }
            placeholder={t("documentPage.dateOfBirth")}
            readOnly
          />

          <BoxFill
            label={t("documentPage.branch")}
            name="branch"
            value={form.branch || ""}
            placeholder={t("documentPage.branch")}
            readOnly
          />

          {/* Upload ID card template */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              {t("documentPage.idCardTemplateImage")}
            </label>

            {form.idCardTemplatePreview ? (
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
                  onClick={
                    removeTemplate
                  }
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
                  aria-label={t("documentPage.removeTemplateImage")}
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
                  size={28}
                  className="mb-2 text-text-secondary"
                />

                <p className="text-sm font-semibold text-primary">
                  {t("documentPage.uploadTemplateImage")}
                </p>

                <p className="mt-1 text-xs text-text-mute">
                  JPG, PNG, WEBP —
                  {t("documentPage.max5Mb")}
                </p>

                <p className="text-xs text-text-mute">
                  {t("documentPage.recommendedTemplateSize")} 856 × 540 px
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

        {/* Right ID card preview */}

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
                    {t("documentPage.noIdCardTemplate")}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {t("documentPage.uploadIdCardTemplateFirst")}
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

          {/* Validation text */}

          {showValidationError &&
            !isFormValid && (
              <p className="mt-4 text-xs font-medium text-error">
                {t("documentPage.completeRequiredInfo")}
              </p>
            )}

          {/* Shared action buttons */}

          <DocumentActionButton
            onCancel={onClose}
            onCreate={handleSave}
            isValid={isFormValid}
            saving={saving}
            cancelText={t("documentPage.cancel")}
            createText={t("documentPage.createCard")}
            savingText={t("documentPage.saving")}
          />
        </div>
      </div>
    </div>
  );
}
