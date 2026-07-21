"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloudUpload, FileText, X } from "lucide-react";

export default function UploadBox({
  label,
  accept = "image/*",
  uploadText = "បញ្ចូលរូបភាព",
  helperText = "គាំទ្រ៖ JPG, PNG (អតិបរមា 5MB), ទំហំកាត់៖ 16:9",
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text-secondary">
        {label}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="
            activity-upload-button flex h-44 w-full items-center justify-center
            rounded-2xl border-2 border-dashed border-[#E2E5EA]
            bg-[#F8F9FB]
            transition
            hover:border-primary
            hover:bg-primary-light/20
          "
        >
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            width={800}
            height={500}
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : selectedFile ? (
          <div className="flex max-w-full flex-col items-center gap-2 px-4 text-center">
            <FileText size={34} className="text-secondary" />
            <p className="max-w-full truncate text-sm font-semibold text-secondary">
              {selectedFile.name}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6E8EC]">
              <CloudUpload
                size={25}
                strokeWidth={2}
                className="text-[#697386]"
              />
            </div>

            <p className="font-semibold text-secondary">
              {uploadText}
            </p>

            <p className="mt-1 text-xs text-[#98A2B3]">
              {helperText}
            </p>
          </div>
          
        )}
        </button>

        {selectedFile && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove selected file"
            className="activity-upload-cancel absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-error shadow-md transition hover:bg-error-bg"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
