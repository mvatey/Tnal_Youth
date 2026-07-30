"use client";

const SIZE = {
  sm: "w-full sm:max-w-[380px]",
  md: "w-full sm:max-w-[520px]",
  lg: "w-full sm:max-w-[700px]",
  xl: "w-full sm:max-w-[900px]",
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
        inset-0
        md:left-20
        lg:left-72
        md:top-16
        flex
        items-center
        justify-center
        p-3
        sm:p-4
        "
      >

        <div
          onClick={(e)=>e.stopPropagation()}
          className={`
          ${SIZE[size]}
          max-h-[calc(100dvh-1.5rem)]
          overflow-y-auto
          rounded-2xl
          bg-white
          p-4
          sm:p-6
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
