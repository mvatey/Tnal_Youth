// components/ui/TextInput.jsx
export default function textInput({ label, icon: Icon, ...props }) {
  return (
    <div>
      {label && (
        <label className="text-sm text-slate-600 mb-1 block">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          {...props}
          className={`w-full border border-slate-300 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}