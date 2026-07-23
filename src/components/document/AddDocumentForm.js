"use client";

import { UploadCloud } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import FormSelect from "@/components/forms/FormSelect";
import SaveButton from "@/components/forms/SaveButton";

export default function AddDocumentForm({ form, setForm, onSave, onClose }) {
  const updateField = (field) => (e) => {
    setForm({
      ...form,
      [field]: e.target.value,
    });
  };
  const handleSave = () => {
    if (!form.title?.trim() || !form.branch || !form.description?.trim()) {
      alert("សូមបំពេញព័ត៌មានទាំងអស់");

      return;
    }

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

      <div className="space-y-4">
        {/* Title + Branch */}

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

        {/* Upload */}

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
          <UploadCloud size={30} className="mb-2 text-gray-400" />

          <p
            className="
            text-sm
            font-semibold
            text-primary
            "
          >
            បញ្ចូលឯកសារ
          </p>

          <p
            className="
            text-xs
            text-gray-400
            "
          >
            PDF, Excel, JPG, PNG (Max 5MB)
          </p>

          <input type="file" hidden />
        </label>
      </div>

      {/* Buttons */}

      {/* Buttons */}

      <div
        className="
  mt-5
  flex
  justify-end
  gap-4
  "
      >
        <button
          type="button"
          onClick={onClose}
          className="
    h-10
    w-[120px]
    rounded-lg
    border
    border-gray-200
    text-sm
    "
        >
          បោះបង់
        </button>

        <SaveButton onClick={handleSave} />
      </div>
    </PopupCard>
  );
}
