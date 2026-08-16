"use client";

const SIZE = {
  sm: "w-[380px]",
  md: "w-[520px]",
  lg: "w-[700px]",
  xl: "w-[900px]",
};

export default function PopupCard({
  children,
  onClose,
  size = "md",
  className = "",
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[999]
        bg-black/40
      "
      onClick={onClose}
    >
      <div
        className="
          fixed
          bottom-0
          left-64
          right-0
          top-16
          flex
          items-center
          justify-center
          p-4
        "
      >
        <div
          onClick={(event) =>
            event.stopPropagation()
          }
          className={`
            relative
            ${SIZE[size]}
            max-h-[90vh]
            overflow-y-auto
            rounded-2xl
            bg-bg-page-white
            p-6
            shadow-xl
            ${className}
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}