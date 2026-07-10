import { Search } from "lucide-react";

export default function DonationSearchInput({ value, onChange, showLabel = true }) {
  return (
    <label className="ml-auto block w-[260px]">
      {showLabel && (
        <span className="mb-1 block text-[12px] font-medium text-text-secondary">ស្វែងរក</span>
      )}
      <span className="flex h-[34px] items-center rounded-lg border border-border bg-white px-3">
        <input
          className="w-full flex-1 bg-transparent pr-2 text-[12px] font-medium outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ស្វែងរកតាមឈ្មោះសមាជិក..."
        />
        <Search size={16} className="text-text-secondary" />
      </span>
    </label>
  );
}
