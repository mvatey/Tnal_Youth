"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButtons from "@/components/forms/FormActionButton";
import { useLanguage } from "@/context/LanguageContext";

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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function EditDocumentForm({
  form,
  setForm,
  onSave,
  onClose,
  branchOptions = BRANCH_OPTIONS,
  documentTypeOptions = [],
}) {
  const { t } = useLanguage();
  // The Document entity holds exactly one file_id — editing replaces
  // that single file, it doesn't attach more of them. currentFile is
  // the document's existing file (read-only, shown for context);
  // replacementFile is the new upload, if any, that handleEditSave
  // will upload and swap in for file_id.
  const currentFile =
    Array.isArray(form.files) && form.files.length > 0
      ? form.files[0]
      : null;

  const [replacementFile, setReplacementFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [saving, setSaving] = useState(false);
  const [showValidationError, setShowValidationError] =
    useState(false);

  const updateField = (field) => (event) => {
    const value = event.target.value;

    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setShowValidationError(false);
  };

  const handleUpload = (event) => {
    const selectedFile = event.target.files?.[0];

    setFileError("");
    setShowValidationError(false);

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(t("documentPage.singleFileTooLarge"));
      event.target.value = "";
      return;
    }

    setReplacementFile({
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
      type:
        selectedFile.name
          .split(".")
          .pop()
          ?.toUpperCase() || "FILE",
      file: selectedFile,
    });

    event.target.value = "";
  };

  const removeReplacementFile = () => {
    setReplacementFile(null);
    setFileError("");
  };

  const isFormValid =
    Boolean(form.title?.trim()) &&
    Boolean(form.branch) &&
    Boolean(form.description?.trim()) &&
    Boolean(form.date) &&
    (Boolean(currentFile) || Boolean(replacementFile));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || saving) {
      setShowValidationError(true);
      return;
    }

    setSaving(true);
    setShowValidationError(false);

    const updatedForm = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      // replacementFile carries the raw File object for the parent to
      // upload before it builds the PUT body — file_id itself only
      // changes once that upload succeeds.
      replacementFile: replacementFile?.file || null,
    };

    try {
      await onSave?.(updatedForm);
      onClose?.();
    } catch (error) {
      console.error(t("documentPage.updateFailed"), error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PopupCard
      size="md"
      onClose={onClose}
      className="scale-[0.85]"
    >
      <button
  type="button"
  onClick={onClose}
  aria-label={t("documentPage.close")}
  className="
    absolute
    right-4
    top-4
    z-20
    flex
    h-8
    w-8
    items-center
    justify-center
    rounded-full
    text-text-secondary
    transition
    hover:bg-bg-page-gray
    hover:text-text-primary
  "
>
  <X size={18} />
</button>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <h2 className="mb-4 text-lg font-bold text-primary">
            {t("documentPage.editDocument")}
          </h2>

          {/* Title + Branch */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <BoxFill
              label={t("documentPage.documentName")}
              name="title"
              placeholder={t("documentPage.enterDocumentName")}
              value={form.title || ""}
              onChange={updateField("title")}
            />

            <BoxFill
              label={t("documentPage.branch")}
              type="select"
              name="branch"
              placeholder={t("documentPage.selectBranch")}
              value={form.branch || ""}
              onChange={updateField("branch")}
              options={branchOptions}
            />
          </div>

          {/* Document type */}

          <FormSelect
            label={t("documentPage.documentType")}
            name="typeId"
            placeholder={t("documentPage.selectDocumentType")}
            value={form.typeId != null ? String(form.typeId) : ""}
            onChange={(event) =>
              setForm((previousForm) => ({
                ...previousForm,
                typeId: Number(event.target.value),
              }))
            }
            options={documentTypeOptions}
          />

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              {t("documentPage.identifier")}
            </label>

            <textarea
              rows={3}
              value={form.description || ""}
              onChange={updateField("description")}
              placeholder={t("documentPage.enterIdentifier")}
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-border
                p-3
                text-sm
                outline-none
                transition
                placeholder:text-text-mute
                focus:border-primary
              "
            />
          </div>

          {/* Date */}

          <BoxFill
            label={t("documentPage.date")}
            type="date"
            name="date"
            value={form.date || ""}
            onChange={updateField("date")}
          />

          {/* File — a document has exactly one; uploading a new one
              here replaces it rather than adding to a list. */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              {t("documentPage.document")}
            </label>

            <div className="space-y-2">
              {replacementFile ? (
                <div
                  className="
                    flex
                    min-h-12
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    border
                    border-primary/40
                    bg-primary/5
                    px-3
                    py-2
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="
                        flex
                        h-8
                        min-w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded
                        bg-primary/10
                        px-1
                        text-[10px]
                        font-bold
                        text-primary
                      "
                    >
                      {replacementFile.type}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-secondary">
                        {replacementFile.name}
                      </p>

                      <p className="text-xs text-text-mute">
                        {t("documentPage.newDocumentWillReplace")} · {replacementFile.size}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeReplacementFile}
                    aria-label={t("documentPage.removeNewDocument")}
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-text-mute
                      transition
                      hover:bg-bg-page-gray
                      hover:text-red-500
                    "
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : currentFile ? (
                <div
                  className="
                    flex
                    min-h-12
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-border
                    px-3
                    py-2
                  "
                >
                  <div
                    className="
                      flex
                      h-8
                      min-w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded
                      bg-error-bg
                      px-1
                      text-[10px]
                      font-bold
                      text-error
                    "
                  >
                    {currentFile.type}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-secondary">
                      {currentFile.name}
                    </p>

                    <p className="text-xs text-text-mute">
                      {t("documentPage.currentDocument")} · {currentFile.size}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-mute">{t("documentPage.noDocumentYet")}</p>
              )}
            </div>

            {fileError && (
              <p className="mt-2 text-xs font-medium text-error">
                {fileError}
              </p>
            )}
          </div>

          {/* Replace file */}

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
              border-border
              text-center
              transition
              hover:border-primary
              hover:bg-bg-page-gray
            "
          >
            <UploadCloud
              size={28}
              className="mb-2 text-text-mute"
            />

            <p className="text-sm font-semibold text-primary">
              {t("documentPage.replaceDocument")}
            </p>

            <p className="text-[11px] text-text-mute">
              {t("documentPage.replaceFileHint")}
            </p>

            <input
              type="file"
              hidden
              accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleUpload}
            />
          </label>
        </div>

        {showValidationError && !isFormValid && (
          <p className="mt-4 text-xs font-medium text-error">
            {t("documentPage.allFieldsAndFileRequired")}
          </p>
        )}

        <FormActionButtons
          onCancel={onClose}
          isValid={isFormValid}
          saving={saving}
          saveText={t("documentPage.save")}
          cancelText={t("documentPage.cancel")}
          showSaveIcon
        />
      </form>
    </PopupCard>
  );
}
