"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import FormDate from "@/components/forms/FormDate";
import FormSelect from "@/components/forms/FormSelect";

export default function EditDocumentForm({ form, setForm, onSave, onClose }) {
  const [files, setFiles] = useState(
    form.files || [
      {
        name: "របាយការណ៍ឆ្នាំ2026.pdf",
        size: "3.2 MB",
        type: "PDF",
      },
    ],
  );

  const updateField = (field) => (e) => {
    setForm({
      ...form,
      [field]: e.target.value,
    });
  };

  // Add files
  const handleUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const newFiles = selectedFiles.map((file) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      type: file.name.split(".").pop().toUpperCase(),
      file: file,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Remove file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <PopupCard
      size="md"
      onClose={onClose}
      className="
    scale-[0.85]
  "
    >
      <div className="space-y-4">
        <h2
          className="
          mb-4
          text-lg
          font-bold
          text-primary
          "
        >
          កែប្រែឯកសារ
        </h2>

        {/* Title + Branch */}

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ឈ្មោះឯកសារ
            </label>

            <input
              value={form.title || ""}
              onChange={updateField("title")}
              className="
              h-11
              w-full
              rounded-lg
              border
              border-gray-200
              px-4
              text-sm
              outline-none
              focus:border-primary
              "
            />
          </div>

          <FormSelect
            label="សាខា"
            placeholder="ជ្រើសរើសសាខា"
            value={form.branch}
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

        {/* Description */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-text-primary">
            លេខសម្គាល់
          </label>

          <textarea
            rows={3}
            value={form.description || ""}
            onChange={updateField("description")}
            className="
            w-full
            resize-none
            rounded-lg
            border
            border-gray-200
            p-3
            text-sm
            outline-none
            focus:border-primary
            "
          />
        </div>

        {/* Date */}

        <FormDate
          label="កាលបរិច្ឆេទ"
          value={form.date}
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
                key={index}
                className="
                flex
                h-12
                items-center
                justify-between
                rounded-lg
                border
                border-gray-200
                px-3
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded
                    bg-red-100
                    text-[10px]
                    font-bold
                    text-red-500
                    "
                  >
                    {file.type}
                  </div>

                  <div>
                    <p className="text-sm text-gray-700">{file.name}</p>

                    <p className="text-xs text-gray-400">
                      {file.type} - {file.size}
                    </p>
                  </div>
                </div>

                <button type="button" onClick={() => removeFile(index)}>
                  <X
                    size={18}
                    className="
                    cursor-pointer
                    text-gray-400
                    hover:text-red-500
                    "
                  />
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
          "
        >
          <UploadCloud size={28} className="mb-2 text-gray-400" />

          <p className="text-sm font-semibold text-primary">បញ្ចូលឯកសារ</p>

          <p className="text-[11px] text-gray-400">
            PDF, Excel, JPG, PNG (Max 5MB)
          </p>

          <input type="file" multiple hidden onChange={handleUpload} />
        </label>
      </div>

      {/* Buttons */}

      <div className="mt-5 flex gap-4">
        <button
          onClick={onClose}
          className="
          h-10
          flex-1
          rounded-lg
          border
          border-gray-200
          text-sm
          "
        >
          បោះបង់
        </button>

        <button
          onClick={() => {
            setForm({
              ...form,
              files,
            });

            onSave?.();
          }}
          className="
          h-10
          flex-1
          rounded-lg
          bg-primary
          text-sm
          font-medium
          text-white
          "
        >
          រក្សាទុក
        </button>
      </div>
    </PopupCard>
  );
}
