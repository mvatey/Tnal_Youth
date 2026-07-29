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
        left-64
        top-16
        right-0
        bottom-0
        flex
        items-center
        justify-center
        p-4
        "
      >

        <div
          onClick={(e)=>e.stopPropagation()}
          className={`
          ${SIZE[size]}
          max-h-[90vh]
          overflow-hidden
          rounded-2xl
          bg-white
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