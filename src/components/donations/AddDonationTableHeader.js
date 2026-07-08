const HEADERS = [
  "ល.រ",
  "សមាជិក",
  "ភេទ",
  "ថ្ងៃខែឆ្នាំកំណើត",
  "ចំនួនប្រាក់ចាស់",
  "ចំនួនប្រាក់ថ្មី",
  "វិធីសាស្ត្រទូទាត់",
  "វិក្ក័យបត្រ",
];

export default function AddDonationTableHeader() {
  return (
    <thead>
      <tr className="h-9 border-b border-gray-200 bg-white text-left text-xs text-gray-500">
        {HEADERS.map((header, index) => (
          <th
            key={header}
            className={`px-3 font-medium ${index === 3 ? "whitespace-nowrap" : ""} ${index === 7 ? "text-center" : ""}`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
