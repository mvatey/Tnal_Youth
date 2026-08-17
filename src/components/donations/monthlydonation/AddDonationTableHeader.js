import tableHeaders from "@/data/donation/tableHeaders.json";

const { addDonationHeaders } = tableHeaders;

export default function AddDonationTableHeader() {
  return (
    <thead>
      <tr className="h-11 border-b border-border bg-bg-page-gray text-center text-[12px] font-medium text-text-secondary">
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
