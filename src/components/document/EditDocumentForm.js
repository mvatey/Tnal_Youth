"use client";

import { UploadCloud, X, CheckCircle } from "lucide-react";

export default function EditDocumentForm({ form, setForm, onSave, onClose }) {
  return (
    <div className="w-full">
      {/* Header */}

      <h2
        className="
        mb-6
        text-xl
        font-bold
        text-[#4b3192]
      "
      >
        កែប្រែឯកសារ
      </h2>

      <div className="space-y-4">
        {/* Name + Branch */}

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label
              className="
              mb-2 block
              text-sm
              text-gray-600
            "
            >
              ឈ្មោះឯកសារ
            </label>

            <input
              value={form.title || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              className="
              h-10
              w-full
              rounded-lg
              border
              border-gray-200
              px-3
              text-sm
              outline-none
              focus:border-[#4b3192]
              "
            />
          </div>

          <div>
            <label
              className="
              mb-2 block
              text-sm
              text-gray-600
            "
            >
              សាខា
            </label>

            <select
              value={form.branch || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  branch: e.target.value,
                })
              }
              className="
              h-10
              w-full
              rounded-lg
              border
              border-gray-200
              px-3
              text-sm
              outline-none
              "
            >
              <option>សាខាភ្នំពេញ</option>

              <option>សាខាសៀមរាប</option>
            </select>
          </div>
        </div>

        {/* Description */}

        <div>
          <label
            className="
            mb-2 block
            text-sm
            text-gray-600
          "
          >
            លេខសម្គាល់
          </label>

          <textarea
            rows={3}
            value={form.description || ""}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="
            w-full
            resize-none
            rounded-lg
            border
            border-gray-200
            p-3
            text-sm
            outline-none
            focus:border-[#4b3192]
            "
          />
        </div>

        {/* Existing File */}

        <div>
          <label
            className="
            mb-2 block
            text-sm
            text-gray-600
          "
          >
            ឯកសារ
          </label>

          <div
            className="
            flex
            h-[48px]
            items-center
            justify-between
            rounded-lg
            border
            border-gray-200
            px-3
          "
          >
            <div
              className="
              flex
              items-center
              gap-3
            "
            >
              {/* PDF */}

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
                PDF
              </div>

              <div>
                <p
                  className="
                  text-sm
                  text-gray-700
                "
                >
                  {form.fileName || "របាយការណ៍ឆ្នាំ2026.pdf"}
                </p>

                <p
                  className="
                  text-xs
                  text-gray-400
                "
                >
                  PDF - {form.fileSize || "3.2 MB"}
                </p>
              </div>
            </div>

            <div
              className="
              flex
              items-center
              gap-3
            "
            >
              <CheckCircle
                className="
                h-5
                w-5
                text-green-500
                "
              />

              <X
                className="
                h-5
                w-5
                cursor-pointer
                text-gray-400
                hover:text-red-500
                "
              />
            </div>
          </div>
        </div>

        {/* Upload Box */}

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
          <UploadCloud
            className="
            mb-2
            h-7
            w-7
            text-gray-400
            "
          />

          <p
            className="
            text-sm
            font-medium
            text-[#4b3192]
          "
          >
            បញ្ចូលឯកសារ
          </p>

          <p
            className="
            text-[11px]
            text-gray-400
          "
          >
            PDF, Excel, JPG, PNG (Max 5MB), មិនលើស 16:9
          </p>

          <input type="file" hidden />
        </label>
      </div>

      {/* Buttons */}

      <div
        className="
        mt-5
        flex
        gap-4
      "
      >
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
          onClick={onSave}
          className="
            h-10
            flex-1
            rounded-lg
            bg-[#4b3192]
            text-sm
            font-medium
            text-white
          "
        >
          រក្សាទុក
        </button>
      </div>
    </div>
  );
}