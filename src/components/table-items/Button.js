"use client";

export default function Button({
  children,
  icon: Icon,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const variants = {
    primary:
      "bg-primary text-white hover:opacity-90",

    success:
      "bg-success text-white hover:opacity-90",

    danger:
      "bg-error text-white hover:opacity-90",

    outline:
      "border border-border bg-white text-text-primary hover:bg-bg-page-gray",
  };


  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        inline-flex
        h-[34px]
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        text-[12px]
        font-semibold
        transition

        ${variants[variant]}

        ${className}
      `}
    >

      {Icon && (
        <Icon size={15}/>
      )}

      {children}

    </button>
  );
}