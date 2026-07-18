"use client";

import { useEffect, useState } from "react";
import { FileText, ImportIcon, X, UploadCloud } from "lucide-react";

export default function UploadPopup({
  onClose,
  onSave,
  onRemoveReceipt,
  initialReceipt,
}) {
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [isReceiptRemoved, setIsReceiptRemoved] = useState(false);

  useEffect(() => {
    setReceiptFile(null);
    setIsReceiptRemoved(false);
  }, [initialReceipt]);

  useEffect(() => {
    if (!receiptFile || !receiptFile.type.startsWith("image/")) {
      setReceiptPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(receiptFile);
    setReceiptPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [receiptFile]);

  const activeReceipt = isReceiptRemoved ? null : initialReceipt;
  const activePreview = receiptPreview || activeReceipt?.previewUrl || "";
  const activeFileName = receiptFile?.name || activeReceipt?.name || "";
  const hasActiveReceipt = receiptFile || activeReceipt;

  const clearReceipt = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (receiptFile) {
      setReceiptFile(null);
      return;
    }

    if (activeReceipt) {
      setIsReceiptRemoved(true);
      onRemoveReceipt?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="relative h-[319px] w-[391px] rounded-[8px] bg-white px-7 py-7 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-[#000000] text-[#000000] transition hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={12} />
        </button>

        <h2 className="mb-6 text-[24px] font-semibold leading-none text-[#4B3391]">
          បញ្ចូលវិក្ក័យបត្រ
        </h2>

        <label className="mb-3 block text-[14px] font-medium text-[#6B7280]">
          ឯកសារ
        </label>

        <label
          htmlFor="file-upload"
          className="relative flex h-[116px] w-full cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4"
        >
          {hasActiveReceipt && (
            <button
              type="button"
              onClick={clearReceipt}
              className="absolute right-2 top-2 z-10 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#EF4444] text-white shadow-sm transition hover:bg-[#DC2626]"
              aria-label="Remove receipt"
            >
              <X size={10} strokeWidth={1} />
            </button>
          )}

          {activePreview ? (
            <img
              src={activePreview}
              alt={activeFileName || "Receipt preview"}
              className="h-[92px] w-full rounded-[12px] object-cover"
            />
          ) : hasActiveReceipt ? (
            <>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                <FileText size={26} strokeWidth={2.4} className="text-[#6D4E9F]" />
              </div>
              <p className="max-w-full truncate text-[13px] font-semibold leading-none text-[#6D4E9F]">
                {activeFileName}
              </p>
            </>
          ) : (
            <>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                <UploadCloud size={26} strokeWidth={2.4} className="text-[#6B7280]" />
              </div>

              <p className="mb-2 text-[14px] font-semibold leading-none text-[#6D4E9F]">
                បញ្ចូលឯកសារ
              </p>

              <p className="text-center text-[10px] font-normal text-[#9CA3AF]">
                គាំទ្រ: PDF, Excel, JPG, Docx, PNG ... (អតិបរមា 5MB), ទំហំគឺ: 16:9
              </p>
            </>
          )}

          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*,.pdf,.xls,.xlsx,.doc,.docx"
            onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className="mt-7 flex items-center gap-4">
          <button
            onClick={onClose}
            className="h-[34px] w-[96px] rounded-[8px] border border-[#D1D5DB] bg-[#F9FAFB] text-center text-[14px] font-semibold text-black shadow-md transition hover:bg-[#F3F4F6]"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={() => onSave(receiptFile)}
            className="flex h-[34px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#4B3391] text-[14px] font-semibold text-white shadow-md transition hover:bg-[#3f2b7d]"
          >
            <ImportIcon size={18} />
            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}
