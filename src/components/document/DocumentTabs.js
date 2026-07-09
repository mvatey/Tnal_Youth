export default function DocumentTabs({ activeTab, onChangeTab }) {
  const tabs = [
    { key: "institution", label: "ឯកសារស្ថាប័ន" },
    { key: "member", label: "ឯកសារផ្ទាល់ខ្លួនរបស់សមាជិក" },
  ];

  return (
    <div className="flex shrink-0 gap-5">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChangeTab(tab.key)}
          className={`h-[64px] w-[260px] rounded-md text-sm font-medium shadow-sm transition ${
            activeTab === tab.key
              ? "border-t-4 border-[#5b2cc9] bg-[#f1edff] text-[#4b3192]"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}