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
        absolute
        left-[55%]
        top-1/2
        -translate-x-1/2
        -translate-y-1/2
        "
      >

        <div
          className={`
          relative
          rounded-2xl
          bg-white
          p-6
          shadow-xl

          ${
            size === "large"
              ? "w-[700px]"
              : size === "certificate"
              ? "w-[360px]"
              : size === "institution"
              ? "w-[420px]"
              : "w-[600px]"
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
            text-gray-400
            hover:text-gray-700
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