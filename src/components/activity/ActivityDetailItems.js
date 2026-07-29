export function InfoIcon({ icon: Icon, label, sub }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon size={15} className="mt-0.5 shrink-0 text-text-secondary" />
      <div className="min-w-0">
        <p className="whitespace-nowrap font-semibold text-text-primary">
          {label || "-"}
        </p>
        <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-text-secondary">
          {sub || "-"}
        </p>
      </div>
    </div>
  );
}

export function StatusRow({ icon: Icon, label, last, children }) {
  return (
    <div
      className={`grid grid-cols-[1fr_140px] items-center text-sm ${
        last ? "" : "mb-4"
      }`}
    >
      <span className="flex items-center gap-2 font-medium text-text-primary">
        {Icon && <Icon size={14} className="text-text-primary" />}
        {label}
      </span>
      <div className="flex justify-center">{children}</div>
    </div>
  );
}

export function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-2">
      <span className="flex items-center gap-2 font-semibold text-text-secondary">
        {Icon && <Icon size={14} className="text-text-secondary" />}
        {label}
      </span>
      <span className="text-text-primary">{value || "-"}</span>
    </div>
  );
}

export function SummaryCard({ icon: Icon, iconClass, label, value, unit }) {
  return (
    <div className="flex min-h-[120px] flex-col items-start rounded-lg border border-border bg-white px-4 py-3 text-left shadow-sm">
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-md ${iconClass}`}
      >
        <Icon size={16} />
      </div>
      <p className="flex items-baseline gap-1 text-2xl font-bold leading-none text-text-primary">
        {value}
        {unit && <span className="text-[11px] font-semibold">{unit}</span>}
      </p>
      <p className="mt-2 text-[11px] text-text-secondary">{label}</p>
    </div>
  );
}
