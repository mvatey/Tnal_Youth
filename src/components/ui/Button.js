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

    /*
     * success/danger stay fixed (not the --color-success/--color-error
     * tokens) on purpose: those tokens are tuned to read as light text
     * on a dark badge background in dark mode, which would be nearly
     * invisible white-on-white here — a solid button needs its own
     * saturated color that pairs with white text in both themes.
     */
    success:
      "bg-green-600 hover:bg-green-700 text-white",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",

    secondary:
      "bg-border hover:opacity-80 text-text-primary",

    outline:
      "border border-border bg-bg-page-white hover:bg-bg-page-gray text-text-primary",
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