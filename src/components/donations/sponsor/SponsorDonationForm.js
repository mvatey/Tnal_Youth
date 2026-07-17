"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, CloudUpload, DollarSign as Dollar, ImportIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import SaveAlert from "@/components/forms/savealert";
import sponsorOptions from "@/data/donation/sponsorOptions.json";

const SPONSOR_CREATED_ROWS_KEY = "tnal-youth:sponsor-donation-created-rows";
const {
  khmerDigits,
  khmerMonths,
  sponsorBranches,
  sponsorPaymentLogos,
  sponsorPaymentMethods,
  sponsorStatuses,
  sponsorTypes,
} = sponsorOptions;

function toKhmerNumber(value) {
  return String(value).replace(/\d/g, (digit) => khmerDigits[Number(digit)]);
}

function formatKhmerDate(value) {
  if (!value) return "dd/mm/yyyy";

  const [year, month, day] = value.split("-");
  const monthName = khmerMonths[Number(month) - 1];

  if (!year || !monthName || !day) return "dd/mm/yyyy";

  return `${toKhmerNumber(day)} ${monthName} ${toKhmerNumber(year)}`;
}

function RequiredMark() {
  return <span className="text-error"> *</span>;
}

function TextField({ label, required = false, className = "", leadingIcon = null, ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block truncate whitespace-nowrap text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
        {required && <RequiredMark />}
      </span>
      <span className="relative block">
        {leadingIcon}
        <input
          {...props}
          className={`h-[34px] w-full rounded-xl border border-[#CBD0D8] bg-white px-4 text-[13px] font-medium text-text-secondary outline-none transition placeholder:text-text-mute focus:border-secondary ${
            leadingIcon ? "pl-10" : ""
          }`}
        />
      </span>
    </label>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block truncate whitespace-nowrap text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
        {required && <RequiredMark />}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[34px] w-full appearance-none rounded-xl border border-[#CBD0D8] bg-white px-4 pr-10 text-[13px] font-medium text-text-secondary outline-none transition focus:border-secondary"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-primary"
        />
      </span>
    </label>
  );
}

function DateField({ label, value, onChange, required = false, className = "" }) {
  const inputRef = useRef(null);
  const hasSelectedDate = Boolean(value);

  const openDatePicker = () => {
    const input = inputRef.current;

    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
    input.focus();
  };

  return (
    <div className={`relative block ${className}`}>
      <span className="mb-2 block truncate whitespace-nowrap text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
        {required && <RequiredMark />}
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
        aria-label={label}
      />
      <button
        type="button"
        onClick={openDatePicker}
        className={`flex h-[34px] w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-[13px] font-medium text-text-secondary transition hover:border-secondary focus:border-secondary focus:outline-none ${
          hasSelectedDate ? "border-secondary" : "border-[#CBD0D8]"
        }`}
      >
        <span>{formatKhmerDate(value)}</span>
        <CalendarDays
          size={18}
          strokeWidth={2.2}
          className={hasSelectedDate ? "text-secondary" : "text-text-secondary"}
        />
      </button>
    </div>
  );
}

function PaymentMethodField({ value, onChange, className = "" }) {
  const logo = sponsorPaymentLogos[value];

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block truncate whitespace-nowrap text-[13px] font-semibold leading-5 text-text-secondary">
        វិធីសាស្ត្រទូទាត់
        <RequiredMark />
      </span>
      <div className="relative flex h-[34px] items-center rounded-xl border border-[#CBD0D8] bg-white px-4 transition focus-within:border-secondary">
        <span className="pointer-events-none inline-flex h-7 min-w-[76px] items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-text-secondary">
          {logo ? (
            <Image
              src={logo}
              alt={`${value} logo`}
              width={22}
              height={22}
              className="h-5 w-5 rounded object-contain"
            />
          ) : null}
          {value || "ABA"}
        </span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          aria-label="វិធីសាស្ត្រទូទាត់"
        >
          {sponsorPaymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-primary"
        />
      </div>
    </label>
  );
}

function ReceiptUpload() {
  return (
    <label className="block max-w-[250px] cursor-pointer">
      <span className="mb-2 block truncate whitespace-nowrap text-[14px] font-semibold leading-5 text-secondary">
        វិក្កយបត្រ (Optional)
      </span>
      <span className="flex h-[86px] items-center justify-center rounded-lg border-2 border-dashed border-[#7F7DB8] bg-[#F8F9FF] px-4 text-center text-[11px] font-medium leading-5 text-text-mute transition hover:border-secondary">
        <input type="file" className="sr-only" accept="image/*,.pdf" />
        <span>
          <CloudUpload className="mx-auto mb-1 h-6 w-6 text-text-secondary" />
          ប្រភេទ: JPG, Docx, PDF, PNG (អតិបរមា 5MB)
          <br />
          ទំហំរូបភាព: 16:9
        </span>
      </span>
    </label>
  );
}

function buildInitialForm(initialData = {}) {
  const data = initialData ?? {};

  return {
    id: data.id ?? null,
    sponsorType: data.type || "",
    sponsorName: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    date: data.dateValue || "",
    paymentMethod: data.method || "ABA",
    amount: data.amount || "",
    note: data.note || "",
    branch: data.branch || "",
    status: data.status || "",
  };
}

export default function SponsorDonationForm({ initialData = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const listPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/sponsor"
    : "/donation/sponsor";
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [form, setForm] = useState(() => buildInitialForm(initialData));

  useEffect(() => {
    const initialForm = buildInitialForm(initialData);

    if (!initialForm.id) {
      setForm(initialForm);
      return;
    }

    const savedValue = window.localStorage.getItem(
      "tnal-youth:sponsor-donation-edits",
    );
    let savedEdits = {};

    try {
      savedEdits = savedValue ? JSON.parse(savedValue) : {};
    } catch {
      savedEdits = {};
    }

    setForm(buildInitialForm(savedEdits[initialForm.id] || initialData));
  }, [initialData]);

  useEffect(() => {
    if (!showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => setShowSaveAlert(false), 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSaveAlert]);

  const updateField = (field) => (value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value?.target ? value.target.value : value,
    }));
  };

  const handleAmountFocus = () => {
    setFocusedField("amount");

    if (Number(form.amount) === 0) {
      updateField("amount")("");
    }
  };

  const handleSave = () => {
    const rowId = form.id ?? Date.now();
    const savedRow = {
      id: rowId,
      name: form.sponsorName,
      type: form.sponsorType,
      phone: form.phone,
      email: form.email,
      address: form.address,
      date: formatKhmerDate(form.date),
      dateValue: form.date,
      amount: form.amount,
      method: form.paymentMethod,
      note: form.note,
      branch: form.branch,
      status: form.status,
    };

    if (form.id) {
      const savedValue = window.localStorage.getItem(
        "tnal-youth:sponsor-donation-edits",
      );
      let savedEdits = {};

      try {
        savedEdits = savedValue ? JSON.parse(savedValue) : {};
      } catch {
        savedEdits = {};
      }

      window.localStorage.setItem(
        "tnal-youth:sponsor-donation-edits",
        JSON.stringify({
          ...savedEdits,
          [form.id]: savedRow,
        }),
      );
    } else {
      const savedValue = window.localStorage.getItem(SPONSOR_CREATED_ROWS_KEY);
      let savedRows = [];

      try {
        savedRows = savedValue ? JSON.parse(savedValue) : [];
      } catch {
        savedRows = [];
      }

      window.localStorage.setItem(
        SPONSOR_CREATED_ROWS_KEY,
        JSON.stringify([savedRow, ...savedRows]),
      );
    }

    window.localStorage.setItem(
      form.id
        ? `tnal-youth:sponsor-donation-edit:${form.id}`
        : "tnal-youth:sponsor-donation-draft",
      JSON.stringify(form),
    );

    window.localStorage.setItem("tnal-youth:sponsor-save-alert", "true");
    router.push(listPath);
  };

  const sponsorNamePlaceholder =
    form.sponsorType === sponsorTypes[0]
      ? "បញ្ចូលឈ្មោះបុគ្គល"
      : form.sponsorType === sponsorTypes[1]
        ? "បញ្ចូលឈ្មោះស្ថាប័ន"
        : "បញ្ចូលឈ្មោះបុគ្គលឬស្ថាប័ន";

  return (
    <>
      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <SaveAlert message="អបអរសាទរ ! ថវិការឧបត្ថម្ភត្រូវបានបន្ថែមដោយជោគជ័យ" />
        </div>
      )}

      <section className="min-h-[650px] rounded-md border border-border bg-[#fbfcfe] px-7 py-4 shadow-sm">
        <h1 className="mb-7 text-base font-semibold text-secondary">
          ការកត់ត្រាថវិការឧបត្ថម្ភ
        </h1>

        <div className="flex w-full flex-nowrap justify-between gap-10 overflow-x-auto">
          <div className="w-[466px] shrink-0 space-y-4">
            <h2 className="text-[15px] font-semibold text-secondary">
              ១. ព័ត៌មានអ្នកឧបត្ថម្ភ
            </h2>

            <fieldset className="flex gap-8 text-[13px] font-medium text-text-secondary">
              {sponsorTypes.map((type) => (
                <label key={type} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="sponsorType"
                    value={type}
                    checked={form.sponsorType === type}
                    onChange={updateField("sponsorType")}
                    className="h-3.5 w-3.5 accent-[#1689F2]"
                  />
                  {type}
                </label>
              ))}
            </fieldset>

            <TextField
              label="ឈ្មោះអ្នកឧបត្ថម្ភ"
              required
              value={form.sponsorName}
              onChange={updateField("sponsorName")}
              placeholder={sponsorNamePlaceholder}
            />
            <TextField
              label="លេខទូរស័ព្ទ"
              required
              value={form.phone}
              onChange={updateField("phone")}
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
            />
            <TextField
              label="អ៊ីមែល"
              required
              type="email"
              value={form.email}
              onChange={updateField("email")}
              placeholder="បញ្ចូលអ៊ីមែល"
            />
            <TextField
              label="អាសយដ្ឋាន(Optional)"
              value={form.address}
              onChange={updateField("address")}
              placeholder="បញ្ចូលអាសយដ្ឋាន"
            />

            <ReceiptUpload />
          </div>

          <div className="w-[455px] shrink-0 space-y-4">
            <h2 className="text-[15px] font-semibold text-secondary">
              ២. ព័ត៌មានវិភាគទានឧបត្ថម្ភ
            </h2>

            <div className="h-5" aria-hidden="true" />

            <div className="flex items-end gap-4">
              <DateField
                label="កាលបរិច្ឆេទនៃការឧបត្ថម្ភ"
                value={form.date}
                onChange={updateField("date")}
                required
                className="min-w-0 flex-1"
              />
              <PaymentMethodField
                value={form.paymentMethod}
                onChange={updateField("paymentMethod")}
                className="min-w-0 flex-1"
              />
            </div>

            <TextField
              label="ចំនួនទឹកប្រាក់ (ដុល្លារ)"
              required
              value={form.amount}
              onChange={updateField("amount")}
              onFocus={handleAmountFocus}
              onBlur={() => setFocusedField(null)}
              placeholder={
                focusedField === "amount" ? "" : "បញ្ចូលចំនួនទឹកប្រាក់"
              }
              leadingIcon={
                <Dollar
                  size={16}
                  strokeWidth={2.2}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              }
              
            />
            <TextField
              label="Note (Optional)"
              value={form.note}
              onChange={updateField("note")}
              placeholder="សរសេរ Note"
            />

            <div className="flex items-end gap-4">
              <SelectField
                label="សាខា(Optional)"
                value={form.branch}
                onChange={updateField("branch")}
                options={sponsorBranches}
                placeholder="ជ្រើសរើសសាខា"
                className="min-w-0 flex-1"
              />
              <SelectField
                label="ឧបត្ថម្ភក្នុងកម្មវិធី(Optional)"
                value={form.status}
                onChange={updateField("status")}
                options={sponsorStatuses}
                placeholder="ជ្រើសរើសកម្មវិធី"
                className="min-w-0 flex-1"
              />
            </div>
          </div>
        </div>

        <div className="mt-28 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push(listPath)}
            className="inline-flex h-[34px] w-[196px] items-center justify-center rounded-lg border border-[#CBD0D8] bg-[#F3F5FC] px-3 text-[14px] font-semibold text-text-primary shadow-sm transition hover:bg-bg-page-gray"
          >
            បោះបង់
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-secondary-hover"
          >
            <ImportIcon size={16} />
            រក្សាទុក
          </button>
        </div>
      </section>
    </>
  );
}
