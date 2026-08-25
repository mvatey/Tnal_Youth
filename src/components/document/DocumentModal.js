"use client";

import { X } from "lucide-react";

export default function DocumentModal({
  children,
  onClose,
  size = "normal",
}) {
  return (
    <div
      className="
      fixed
      inset-0
      z-50
      bg-black/60
      "
    >

      {/* Modal position */}
      <div
        className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        p-4
        "
      >

        <div
          className={`
          relative
          rounded-2xl
          bg-bg-page-white
          p-6
          shadow-xl

          ${
            size === "large"
              ? "w-full max-w-[700px]"
              : size === "certificate"
              ? "w-full max-w-[360px]"
              : size === "institution"
              ? "w-full max-w-[420px]"
              : "w-full max-w-[600px]"
          }

          ${
            size === "certificate" || size === "institution"
              ? ""
              : "max-h-[90vh] overflow-y-auto"
          }

          `}
        >

          {/* Close */}
          <button
            onClick={onClose}
            className="
            absolute
            right-4
            top-4
            text-text-mute
            hover:text-text-secondary
            "
          >
            <X className="h-5 w-5" />
          </button>


          {children}


        </div>

      </div>

    </div>
  );
}
