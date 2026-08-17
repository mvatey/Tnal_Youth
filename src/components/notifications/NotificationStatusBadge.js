const variantClasses = {
  system: "bg-primary-light text-primary",
  report: "bg-warning-bg text-warning",
  event: "bg-success-bg text-success",
};

export default function NotificationStatusBadge({ label, variant = "system" }) {
  return (
    <span
      className={`inline-flex min-h-5 items-center rounded-[4px] px-2 py-0.5 text-[11px] font-semibold leading-[1.5] ${
        variantClasses[variant] || variantClasses.system
      }`}
    >
      {label}
    </span>
  );
}
