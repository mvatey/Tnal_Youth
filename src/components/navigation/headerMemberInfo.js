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
    <div className="flex items-center justify-between">
      {/* Left */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <button
            onClick={() => router.back()}
            className="hover:text-primary transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>

          <span>{breadcrumb.parent}</span>

          <span>/</span>

          <span className="text-primary font-medium">
            {breadcrumb.current}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-1 text-xl font-bold text-primary">
          {title}
        </h1>
      </div>


      {buttonText && (
        <button
          onClick={onButtonClick}
          className="
            rounded-lg 
            bg-primary 
            px-4 
            py-2 
            text-sm 
            font-medium 
            text-white
            hover:opacity-90 
            transition
          "
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}