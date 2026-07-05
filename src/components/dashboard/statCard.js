// components/dashboard/StatCard.jsx
export default function StatCard({ icon: Icon, label, value, growth, iconColor, iconBg }) {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">{label}</span>
          <span className="text-xs text-success bg-success-bg px-1.5 py-0.5 rounded">
            ↑{growth}%
          </span>
        </div>
        <div className="text-xl font-bold text-text-primary">{value}</div>
      </div>
    </div>
  );
}