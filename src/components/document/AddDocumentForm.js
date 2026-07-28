"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButtons from "@/components/forms/FormActionButton";

export default function AddDocumentForm({
  form,
  setForm,
  onSave,
  onClose,
}) {
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

  const isFormValid =
    Boolean(form.title?.trim()) &&
    Boolean(form.branch) &&
    Boolean(form.description?.trim());

  const handleSave = (event) => {
    event.preventDefault();

    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);
    onSave?.();
  };

  return (
    <PopupCard size="md" onClose={onClose}>
      <h2
        className="
          mb-6
          text-lg
          font-bold
          text-primary
        "
      >
        បញ្ចូលឯកសារ
      </h2>

      <form onSubmit={handleSave}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                "
              >
                ឈ្មោះឯកសារ
              </label>

              <input
                value={form.title || ""}
                onChange={updateField("title")}
                placeholder="បញ្ចូលឈ្មោះឯកសារ"
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  px-4
                  text-sm
                  outline-none
                  placeholder:text-gray-400
                  focus:border-primary
                "
              />
            </div>

            <FormSelect
              label="សាខា"
              placeholder="ជ្រើសរើសសាខា"
              value={form.branch || ""}
              onChange={updateField("branch")}
              options={[
                {
                  label: "សាខាភ្នំពេញ",
                  value: "សាខាភ្នំពេញ",
                },
                {
                  label: "សាខាសៀមរាប",
                  value: "សាខាសៀមរាប",
                },
              ]}
            />
          </div>

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
              "
            >
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
                placeholder:text-gray-400
                focus:border-primary
              "
            />
          </div>

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
              border-gray-200
            "
          >
            <UploadCloud
              size={30}
              className="mb-2 text-gray-400"
            />

            <p className="text-sm font-semibold text-primary">
              បញ្ចូលឯកសារ
            </p>

            <p className="text-xs text-gray-400">
              PDF, Excel, JPG, PNG (Max 5MB)
            </p>

            <input type="file" hidden />
          </label>
        </div>

        {showValidationError && !isFormValid && (
          <p className="mt-4 text-xs font-medium text-red-500">
            សូមបំពេញព័ត៌មានទាំងអស់ឱ្យបានគ្រប់គ្រាន់។
          </p>
        )}

        <FormActionButtons
          onCancel={onClose}
          isValid={isFormValid}
          saveText="រក្សាទុក"
          cancelText="បោះបង់"
        />
      </form>
    </PopupCard>
  );
}