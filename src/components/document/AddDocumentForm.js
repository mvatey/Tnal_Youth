"use client";

import {
  UploadCloud,
  X,
  Building2,
  ChevronDown,
} from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

export default function AddDocumentForm({ form, setForm, onSave, onClose }) {
  function handleFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    setForm({
      ...form,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });
  }

  return (
    <div >
      {/* Title */}

      <h2
        className="
      mb-6
      text-xl
      font-bold
      text-[#4b3192]
      "
      >
        បញ្ចូលឯកសារ
      </h2>

      <div className="space-y-4">
        {/* Name + Branch */}

        <div
          className="
        grid grid-cols-2 gap-5
        "
        >
          <div>
            <label
              className="
            mb-2 block
            text-sm text-gray-600
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
              placeholder="បញ្ចូលឈ្មោះឯកសារ"
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
            text-sm text-gray-600
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
          text-sm text-gray-600
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
            placeholder="បញ្ចូលព័ត៌មានលម្អិត"
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

        {/* Upload */}

        <div>
          <label
            className="
          mb-2 block
          text-sm text-gray-600
          "
          >
            ឯកសារ
          </label>

          {/* Uploaded preview */}

          {form.fileName && (
            <div
              className="
          mb-3
          flex
          h-[48px]
          items-center
          justify-between
          rounded-lg
          border
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
                  PDF
                </div>

                <div>
                  <p className="text-sm">{form.fileName}</p>

                  <p
                    className="
                text-xs text-gray-400
                "
                  >
                    PDF - {form.fileSize}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    fileName: "",
                    fileSize: "",
                  })
                }
              >
                <X
                  className="
              h-5 w-5
              text-gray-400
              "
                />
              </button>
            </div>
          )}

          {/* Upload area */}

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

            <input type="file" hidden onChange={handleFile} />
          </label>
        </div>
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
