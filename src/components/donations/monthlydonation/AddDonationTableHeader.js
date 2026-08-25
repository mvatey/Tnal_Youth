import tableHeaders from "@/data/donation/tableHeaders.json";
import { useLanguage } from "@/context/LanguageContext";

const { addDonationHeaders } = tableHeaders;
const DOB_HEADER = "ថ្ងៃខែឆ្នាំកំណើត";
const ACTION_HEADER = "សកម្មភាព";

// hideDob: the event-donation "សមាជិក" tab doesn't need a member's date of
// birth (see EventDonationDetailForm), but the monthly-donation table
// (AddDonationForm) still does — both share this same header/row pair, so
// this is a prop rather than removing the column outright.
//
// hideAction: the whole list is directly editable at once now (see
// isRowLocked/rowEditMode on table.js) — the Action column only ever had
// content in per-row rowEditMode (the pencil/check/cancel icons), so an
// empty header with nothing under it is dropped whenever that mode is off.
export default function AddDonationTableHeader({ hideDob = false, hideAction = false }) {
  const { t } = useLanguage();
  const headerLabels = {
    "ល.រ": t("donationPage.no"),
    "សមាជិក": t("donationPage.member"),
    "ភេទ": t("donationPage.gender"),
    "ថ្ងៃខែឆ្នាំកំណើត": t("donationPage.dateOfBirth"),
    "ចំនួនប្រាក់រៀល": t("donationPage.amountKhrPlain"),
    "ចំនួនប្រាក់ដុល្លារ": t("donationPage.amountUsdPlain"),
    "វិធីសាស្ត្រទូទាត់": t("donationPage.paymentMethod"),
    "វិក័យប័ត្រ": t("donationPage.receipt"),
    "សកម្មភាព": t("donationPage.action"),
  };
  const headers = addDonationHeaders.filter((header) => {
    if (hideDob && header === DOB_HEADER) return false;
    if (hideAction && header === ACTION_HEADER) return false;
    return true;
  });

  return (
    <thead>
      <tr className="h-11 border-b border-border bg-bg-page-gray text-center text-[12px] font-medium text-text-secondary">
        {headers.map((header) => (
          <th
            key={header}
            className={`px-3 ${header === DOB_HEADER ? "whitespace-nowrap" : ""}`}
          >
            {headerLabels[header] || header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
