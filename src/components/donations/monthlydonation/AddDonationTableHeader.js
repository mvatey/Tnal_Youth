import tableHeaders from "@/data/donation/tableHeaders.json";

const { addDonationHeaders } = tableHeaders;

export default function AddDonationTableHeader() {
  return (
    <thead>
      <tr className="h-11 border-b border-[#e5eaf0] bg-white text-center text-[12px] font-medium text-slate-500">
        {addDonationHeaders.map((header, index) => (
          <th
            key={header}
            className={`px-3 ${index === 3 ? "whitespace-nowrap" : ""}`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
