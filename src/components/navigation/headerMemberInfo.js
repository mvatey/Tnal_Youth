"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeaderMemberInfo({ title, breadcrumb, buttonText, onButtonClick, onBack }) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    router.back();
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <button type="button" onClick={handleBack} className="inline-flex items-center gap-1.5 transition hover:text-primary" aria-label="ត្រឡប់ទៅក្រោយ">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{breadcrumb?.parent}</span>
          </button>

          <span>/</span>

          <span className="font-medium text-primary">{breadcrumb?.current}</span>
        </div>

        <h1 className="mt-1 text-xl font-bold text-primary">{title}</h1>
      </div>

      {buttonText && (
        <button type="button" onClick={onButtonClick} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
          {buttonText}
        </button>
      )}
    </div>
  );
}