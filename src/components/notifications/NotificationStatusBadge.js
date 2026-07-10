const variantClasses = {
  system: "bg-[#D6E8FF] text-[#1673D1]",
  report: "bg-[#FFF1BF] text-[#C28A00]",
  event: "bg-[#C8F6DD] text-[#11804C]",
};

export default function NotificationStatusBadge({ label, variant = "system" }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-[4px] px-2 text-[11px] font-semibold ${
        variantClasses[variant] || variantClasses.system
      }`}
    >
      {label}
    </span>
  );
}
