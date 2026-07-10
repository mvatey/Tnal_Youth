"use client";

import { X, UploadCloud, Download } from "lucide-react";

export default function UploadPopup({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="relative w-[800px] rounded-[34px] bg-white px-14 py-12 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-8 top-7 flex h-11 w-11 items-center justify-center rounded-full border-2 border-black"
        >
          <X size={28} />
        </button>

        <h2 className="mb-10 text-5xl font-bold text-[#4B2E91]">
          បញ្ចូលឯកសារ
        </h2>

        <label className="mb-3 block text-2xl font-semibold text-gray-500">
          ឯកសារ
        </label>

        <label
          htmlFor="file-upload"
          className="flex h-[240px] cursor-pointer flex-col items-center justify-center rounded-[30px] border-4 border-dashed border-gray-200 bg-gray-50"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
            <UploadCloud size={44} className="text-gray-500" />
          </div>

          <p className="mb-3 text-2xl font-bold text-[#4B2E91]">
            បញ្ចូលឯកសារ
          </p>

          <p className="text-xl text-gray-400">
            គាំទ្រ: PDF, Excel, JPG, Docx, PNG ... (អតិបរមា 5MB), ទំហំគឺ: 16:9
          </p>

          <input id="file-upload" type="file" className="hidden" />
        </label>

        <div className="mt-12 flex items-center gap-7">
          <button
            onClick={onClose}
            className="h-14 w-[170px] rounded-2xl border-2 border-gray-300 bg-white text-2xl font-bold shadow-md"
          >
            បោះបង់
          </button>

          <button className="flex h-14 flex-1 items-center justify-center gap-5 rounded-2xl bg-[#4B2E91] text-2xl font-bold text-white shadow-md">
            <Download size={34} />
            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}