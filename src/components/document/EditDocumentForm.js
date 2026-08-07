"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import BoxFill from "@/components/forms/boxFill";
import FormActionButtons from "@/components/forms/FormActionButton";

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

export default function EditDocumentForm({
  form,
  setForm,
  onSave,
  onClose,
}) {
  const [files, setFiles] = useState(
    Array.isArray(form.files) && form.files.length > 0
      ? form.files
      : [
          {
            name: "របាយការណ៍ឆ្នាំ2026.pdf",
            size: "3.2 MB",
            type: "PDF",
          },
        ],
  );

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
    const selectedFiles = Array.from(
      event.target.files || [],
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const newFiles = selectedFiles.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      type:
        file.name
          .split(".")
          .pop()
          ?.toUpperCase() || "FILE",
      file,
    }));

    setFiles((previousFiles) => [
      ...previousFiles,
      ...newFiles,
    ]);

    event.target.value = "";
  };

  const removeFile = (indexToRemove) => {
    setFiles((previousFiles) =>
      previousFiles.filter(
        (_, index) => index !== indexToRemove,
      ),
    );
  };

  const isFormValid =
    Boolean(form.title?.trim()) &&
    Boolean(form.branch) &&
    Boolean(form.description?.trim()) &&
    Boolean(form.date) &&
    files.length > 0;

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
      files,
    };

    try {
      setForm(updatedForm);
      await onSave?.(updatedForm);
      onClose?.();
    } catch (error) {
      console.error("Cannot update document:", error);
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
  aria-label="បិទ"
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
    hover:bg-gray-100
    hover:text-text-primary
  "
>
  <X size={18} />
</button>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <h2 className="mb-4 text-lg font-bold text-primary">
            កែប្រែឯកសារ
          </h2>

          {/* Title + Branch */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <BoxFill
              label="ឈ្មោះឯកសារ"
              name="title"
              placeholder="បញ្ចូលឈ្មោះឯកសារ"
              value={form.title || ""}
              onChange={updateField("title")}
            />

            <BoxFill
              label="សាខា"
              type="select"
              name="branch"
              placeholder="ជ្រើសរើសសាខា"
              value={form.branch || ""}
              onChange={updateField("branch")}
              options={BRANCH_OPTIONS}
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              លេខសម្គាល់
            </label>

            <textarea
              rows={3}
              value={form.description || ""}
              onChange={updateField("description")}
              placeholder="បញ្ចូលលេខសម្គាល់"
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-gray-200
                p-3
                text-sm
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-primary
              "
            />
          </div>

          {/* Date */}

          <BoxFill
            label="កាលបរិច្ឆេទ"
            type="date"
            name="date"
            value={form.date || ""}
            onChange={updateField("date")}
          />

          {/* Files */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ឯកសារ
            </label>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="
                    flex
                    min-h-12
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    border
                    border-gray-200
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
                        bg-red-100
                        px-1
                        text-[10px]
                        font-bold
                        text-red-500
                      "
                    >
                      {file.type}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-gray-700">
                        {file.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {file.type} - {file.size}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label="លុបឯកសារ"
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-red-500
                    "
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload */}

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
              border-gray-200
              text-center
              transition
              hover:border-primary
              hover:bg-gray-50
            "
          >
            <UploadCloud
              size={28}
              className="mb-2 text-gray-400"
            />

            <p className="text-sm font-semibold text-primary">
              បញ្ចូលឯកសារ
            </p>

            <p className="text-[11px] text-gray-400">
              PDF, Excel, JPG, PNG (Max 5MB)
            </p>

            <input
              type="file"
              multiple
              hidden
              accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleUpload}
            />
          </label>
        </div>

        {showValidationError && !isFormValid && (
          <p className="mt-4 text-xs font-medium text-red-500">
            សូមបំពេញព័ត៌មានទាំងអស់ និងមានឯកសារយ៉ាងតិចមួយ។
          </p>
        )}

        <FormActionButtons
          onCancel={onClose}
          isValid={isFormValid}
          saving={saving}
          saveText="រក្សាទុក"
          cancelText="បោះបង់"
          showSaveIcon
        />
      </form>
    </PopupCard>
  );
}