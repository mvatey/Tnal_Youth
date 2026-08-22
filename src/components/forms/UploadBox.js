"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloudUpload, FileText, X } from "lucide-react";

export default function UploadBox({
  label,
  accept = "image/*",
  uploadText = "បញ្ចូលរូបភាព",
  helperText = "គាំទ្រ៖ JPG, PNG (អតិបរមា 5MB), ទំហំកាត់៖ 16:9",
  maxSizeMb = 5,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      window.alert(`ឯកសារធំពេក។ សូមជ្រើសរើសឯកសារតូចជាង ${maxSizeMb}MB។`);
      e.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

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
            rounded-2xl border-2 border-dashed border-border
            bg-bg-page-gray
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-page-gray">
              <CloudUpload
                size={25}
                strokeWidth={2}
                className="text-text-secondary"
              />
            </div>

            <p className="font-semibold text-secondary">
              {uploadText}
            </p>

            <p className="mt-1 text-xs text-text-mute">
              {helperText}
            </p>
          </div>
          
        )}
        </button>

        {selectedFile && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-12 z-10 rounded-lg bg-black/60 px-3 py-2 text-xs text-white">
            <div className="truncate font-semibold">{selectedFile.name}</div>
            <div>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        )}

        {selectedFile && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove selected file"
            className="activity-upload-cancel absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-page-white text-error shadow-md transition hover:bg-error-bg"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
