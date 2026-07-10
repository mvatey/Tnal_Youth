"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloudUpload } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";

export default function UploadBox({
  label,
  accept = "image/*",
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
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

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="
          flex h-44 w-full items-center justify-center
          rounded-xl border border-dashed border-border
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
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-light">
              <RiDownloadCloud2Line
                size={22}
                className="text-secondary"
              />
            </div>

            <p className="font-semibold text-secondary">
              បញ្ចូលរូបភាព
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              JPG, PNG, ទំហំក្រោម 5MB
            </p>
          </div>
        )}
      </button>
    </div>
  );
}