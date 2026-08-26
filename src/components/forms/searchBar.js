import { Search } from "lucide-react";

export default function DonationSearchInput({ value, onChange, showLabel = true }) {
  return (
    <label className="block w-full min-w-0 sm:ml-auto sm:w-[260px]">
      {showLabel && (
        <span className="mb-1 block text-[12px] font-medium text-text-secondary">ស្វែងរក</span>
      )}
      <span className="flex h-[34px] min-w-0 items-center rounded-lg border border-border bg-bg-page-white px-3">
        <input
        className="min-w-0 flex-1 bg-transparent pr-2 text-[12px] font-medium outline-none focus:placeholder-transparent"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ស្វែងរកតាមឈ្មោះសមាជិក..."
        />
        <Search size={16} className="text-text-secondary" />
      </span>
    </label>
  );
}
