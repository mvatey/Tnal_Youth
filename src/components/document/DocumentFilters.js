import { Search, Plus, ChevronDown } from "lucide-react";

export default function DocumentFilters({
  activeTab,
  query,
  setQuery,
  branchFilter,
  setBranchFilter,
  dateFilter,
  setDateFilter,
  resetPage,
  onAdd,
}) {
  const isMember = activeTab === "member";

  return (
    <div className="shrink-0 border-b border-gray-100 p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-[260px]">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="ស្វែងរក .."
            className="h-[38px] w-full rounded-md border border-gray-200 px-4 pr-10 text-sm outline-none focus:border-[#5b2cc9]"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="relative w-[180px]">
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              resetPage();
            }}
            className="h-[38px] w-full appearance-none rounded-md border border-gray-200 px-4 pr-10 text-sm outline-none focus:border-[#5b2cc9]"
          >
            <option value="">សាខា</option>
            <option value="សាខាភ្នំពេញ">សាខាភ្នំពេញ</option>
            <option value="សាខាសៀមរាប">សាខាសៀមរាប</option>
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-500" />
        </div>

        <div className="w-[240px]">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              resetPage();
            }}
            className="h-[38px] w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:border-[#5b2cc9]"
          />
        </div>

        <button
          onClick={onAdd}
          className="ml-auto flex h-[38px] items-center gap-2 rounded-md bg-[#118447] px-4 text-sm font-medium text-white hover:bg-[#0d6f3b]"
        >
          <Plus className="h-5 w-5" />
          {isMember ? "បង្កើតឯកសារ" : "បញ្ចូលឯកសារ"}
        </button>
      </div>
    </div>
  );
}