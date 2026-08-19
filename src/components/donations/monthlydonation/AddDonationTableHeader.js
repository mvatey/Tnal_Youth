import tableHeaders from "@/data/donation/tableHeaders.json";

const { addDonationHeaders } = tableHeaders;
const DOB_HEADER = "ថ្ងៃខែឆ្នាំកំណើត";

// hideDob: the event-donation "សមាជិក" tab doesn't need a member's date of
// birth (see EventDonationDetailForm), but the monthly-donation table
// (AddDonationForm) still does — both share this same header/row pair, so
// this is a prop rather than removing the column outright.
export default function AddDonationTableHeader({ hideDob = false }) {
  const headers = hideDob
    ? addDonationHeaders.filter((header) => header !== DOB_HEADER)
    : addDonationHeaders;

  return (
    <thead>
      <tr className="h-11 border-b border-border bg-bg-page-gray text-center text-[12px] font-medium text-text-secondary">
        {headers.map((header) => (
          <th
            key={header}
            className={`px-3 ${header === DOB_HEADER ? "whitespace-nowrap" : ""}`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
