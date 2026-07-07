export default function DonationTabs() {
  const tabs = ["វិភាគទានប្រចាំខែ", "វិភាគទានក្នុងកម្មវិធី", "ថវិការឧបត្ថម្ភ"];

  return (
    <div className=" flex grid-cols gap-[80px] sm:grid-cols-3">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={`h-[58px] w-[224px] rounded-sm text-14 font-medium transition ${
            index === 0
              ? "border-t-4 border-secondary bg-secondary-light text-secondary"
              : "text-text-primary hover:bg-primary-lighter"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
