"use client";

export default function Button({
  children,
  icon,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-primary hover:bg-primary-hover text-white",

    success:
      "bg-success hover:bg-green-700 text-white",

    danger:
      "bg-error hover:bg-red-700 text-white",

    secondary:
      "bg-gray-200 hover:bg-gray-300 text-text-primary",

    outline:
      "border border-border bg-white hover:bg-gray-50 text-text-primary",
  };

  return (
    <button
      {...props}
      className={`
        inline-flex
        h-[34px]
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        text-sm
        font-semibold
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-sm
        active:translate-y-0
        disabled:opacity-50
        disabled:pointer-events-none
        ${variants[variant]}
        ${className}
      `}
    >
      {icon}

      <span className="whitespace-nowrap">
        {children}
      </span>
    </button>
  );
}