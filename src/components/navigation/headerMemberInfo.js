"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeaderMemberInfo({
  title,
  breadcrumb,
  buttonText,
  onButtonClick,
}) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between">
      {/* Left */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <button
            onClick={() => router.back()}
            className="hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span>{breadcrumb.parent}</span>

          <span>/</span>

          <span className="text-primary font-medium">
            {breadcrumb.current}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-3 text-3xl font-bold text-primary">
          {title}
        </h1>
      </div>

      {/* Right Button */}
      {buttonText && (
        <button
          onClick={onButtonClick}
          className="rounded-xl bg-primary px-5 py-2.5 text-white font-medium hover:opacity-90 transition"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}