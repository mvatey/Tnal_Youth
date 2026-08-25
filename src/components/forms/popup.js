"use client";

import { useEffect, useState } from "react";
import { FileText, X, UploadCloud } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

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

  const handleClose = () => {
    if (
      receiptFile &&
      !window.confirm("Discard the uploaded receipt without saving it?")
    ) {
      return;
    }

    onClose?.();
  };

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

  const handleSave = () => {
    if (receiptFile) {
      onSave?.(receiptFile);
      return;
    }

    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="relative min-h-[319px] w-[calc(100vw-2rem)] max-w-[391px] rounded-[8px] bg-bg-page-white px-7 py-7 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-border text-text-secondary transition hover:bg-bg-page-gray"
          aria-label="Close"
        >
          <X size={12} />
        </button>

        <h2 className="mb-6 text-[24px] font-semibold leading-none text-secondary">
          បញ្ចូលវិក្ក័យបត្រ
        </h2>

        <label className="mb-3 block text-[14px] font-medium text-text-secondary">
          ឯកសារ
        </label>

        <label
          htmlFor="file-upload"
          className="relative flex h-[116px] w-full cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-border bg-bg-page-gray px-4"
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
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-bg-page-white">
                <FileText size={26} strokeWidth={2.4} className="text-secondary" />
              </div>
              <p className="max-w-full truncate text-[13px] font-semibold leading-none text-secondary">
                {activeFileName}
              </p>
            </>
          ) : (
            <>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-bg-page-white">
                <UploadCloud size={26} strokeWidth={2.4} className="text-text-secondary" />
              </div>

              <p className="mb-2 text-[14px] font-semibold leading-none text-secondary">
                បញ្ចូលឯកសារ
              </p>

              <p className="text-center text-[10px] font-normal text-text-mute">
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
            onClick={handleClose}
            className="h-[34px] w-[96px] rounded-[8px] border border-border bg-bg-page-gray text-center text-[14px] font-semibold text-text-primary shadow-md transition hover:bg-bg-page-gray/70"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex h-[34px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#4B3391] text-[14px] font-semibold text-white shadow-md transition hover:bg-[#3f2b7d]"
          >
            <HiSaveAs size={18} />
            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}
