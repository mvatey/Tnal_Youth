"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import FormSelect from "@/components/forms/FormSelect";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function EditDocumentForm({
  form,
  setForm,
  onSave,
  onClose,
  branchOptions = [],
  saving = false,
  error = "",
}) {
  const [fileError, setFileError] = useState("");

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFileError("");

    if (file && file.size > MAX_FILE_SIZE) {
      setFileError("File size must not exceed 20 MB.");
      event.target.value = "";
      return;
    }

    setForm((current) => ({ ...current, newFile: file }));
  };

  return (
    <PopupCard size="md" onClose={onClose} className="scale-[0.85]">
      <div className="space-y-4">
        <h2 className="mb-4 text-lg font-bold text-primary">កែប្រែឯកសារ</h2>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ឈ្មោះឯកសារ
            </label>
            <input
              value={form.title || ""}
              onChange={updateField("title")}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-primary"
            />
          </div>

          <FormSelect
            label="សាខា"
            placeholder="ជ្រើសរើសសាខា"
            value={String(form.branchId || "")}
            onChange={updateField("branchId")}
            options={branchOptions}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-text-primary">
            សេចក្ដីពិពណ៌នា
          </label>
          <textarea
            rows={3}
            value={form.description || ""}
            onChange={updateField("description")}
            className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-600">
          {form.fileName || "No existing file"}
        </div>

        <label className="flex h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
          <UploadCloud size={26} className="mb-2 text-gray-400" />
          <span className="text-sm font-semibold text-primary">ជំនួសឯកសារ (មិនចាំបាច់)</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
            hidden
            onChange={handleFileChange}
          />
        </label>

        {form.newFile && (
          <p className="text-xs text-gray-600">New file: {form.newFile.name}</p>
        )}
        {fileError && <p className="text-xs text-red-500">{fileError}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="mt-5 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="h-10 flex-1 rounded-lg border border-gray-200 text-sm disabled:opacity-60"
        >
          បោះបង់
        </button>
        <button
          type="button"
          onClick={() => onSave?.(form)}
          disabled={saving || !form.title?.trim() || !form.branchId}
          className="h-10 flex-1 rounded-lg bg-primary text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
        </button>
      </div>
    </PopupCard>
  );
}
