"use client";

const SIZE = {
  sm: "w-full sm:w-[380px]",
  md: "w-full sm:w-[520px]",
  lg: "w-full sm:w-[700px]",
  xl: "w-full sm:w-[900px]",
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
          left-0
          right-0
          top-0
          flex
          items-center
          justify-center
          p-3
          sm:top-16
          sm:p-4
          lg:left-64
        "
      >
        <div
          onClick={(event) =>
            event.stopPropagation()
          }
          className={`
            relative
            ${SIZE[size]}
            max-h-[calc(100vh-1.5rem)]
            sm:max-h-[90vh]
            overflow-y-auto
            rounded-2xl
            bg-bg-page-white
            p-4
            shadow-xl
            sm:p-6
            ${className}
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
