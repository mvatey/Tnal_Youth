const HEADERS = [
  "ល.រ",
  "សមាជិក",
  "ភេទ",
  "ថ្ងៃខែឆ្នាំកំណើត",
  "ចំនួនប្រាក់រៀល",
  "ចំនួនប្រាក់ដុល្លារ",
  "វិធីសាស្ត្រទូទាត់",
  "វិក្ក័យបត្រ",
];

export default function AddDonationTableHeader() {
  return (
    <thead>
      <tr className="h-11 border-b border-[#e5eaf0] bg-white text-center text-[12px] font-medium text-slate-500">
        {HEADERS.map((header, index) => (
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
