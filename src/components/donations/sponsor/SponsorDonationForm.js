"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, CloudUpload, FileText, X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import SaveAlert from "@/components/forms/savealert";
import sponsorOptions from "@/data/donation/sponsorOptions.json";

const {
  equipmentTypes,
  khmerDigits,
  khmerMonths,
  paymentLogos,
  paymentMethods,
  sponsorStatuses,
  sponsorTypes,
} = sponsorOptions;

async function fetchJson(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
}

const optionValue = (option) =>
  String(option && typeof option === "object" ? option.value : option);
const optionLabel = (option) =>
  String(option && typeof option === "object" ? option.label : option);

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

function TextField({
  label,
  required = false,
  className = "",
  heightClass = "h-[34px]",
  leadingIcon = null,
  ...props
}) {
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
          className={`${heightClass} w-full rounded-xl border border-[#CBD0D8] bg-white px-4 text-[13px] font-medium text-text-secondary outline-none transition placeholder:text-text-mute focus:border-secondary focus:placeholder:text-transparent disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:opacity-60 ${
            leadingIcon ? "pl-10" : ""
          }`}
        />
      </span>
    </label>
  );
}

function QuantityField({ label, value, onChange, disabled = false }) {
  const quantity = Math.max(0, Number.parseInt(value, 10) || 0);

  const changeQuantity = (nextValue) => {
    onChange(String(Math.max(0, nextValue)));
  };

  return (
    <label className="block w-[80px] shrink-0">
      <span className="mb-2 block whitespace-nowrap text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
      </span>
      <span
        className={`flex h-[34px] w-[80px] overflow-hidden rounded-xl border border-[#CBD0D8] focus-within:border-secondary ${
          disabled ? "bg-[#F3F4F6] opacity-60" : "bg-white"
        }`}
      >
        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={value || "0"}
          onChange={(event) => {
            const nextValue = event.target.value.replace(/\D/g, "");
            changeQuantity(Number.parseInt(nextValue, 10) || 0);
          }}
          className="min-w-0 flex-1 bg-transparent px-3 text-[13px] font-medium text-text-secondary outline-none disabled:cursor-not-allowed"
          aria-label={label}
        />
        <span className="flex w-7 shrink-0 flex-col border-l border-[#E5E7EB]">
          <button
            type="button"
            disabled={disabled}
            aria-label="បន្ថែមចំនួនសម្ភារៈ"
            onClick={() => changeQuantity(quantity + 1)}
            className="flex min-h-0 flex-1 items-center justify-center text-text-secondary transition hover:bg-secondary-light hover:text-secondary disabled:cursor-not-allowed"
          >
            <ChevronUp size={12} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="បន្ថយចំនួនសម្ភារៈ"
            onClick={() => changeQuantity(quantity - 1)}
            disabled={disabled || quantity === 0}
            className="flex min-h-0 flex-1 items-center justify-center border-t border-[#E5E7EB] text-text-secondary transition hover:bg-secondary-light hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronDown size={12} strokeWidth={2.5} />
          </button>
        </span>
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
            <option key={optionValue(option)} value={optionValue(option)}>
              {optionLabel(option)}
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

function MemberSelectField({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!fieldRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div ref={fieldRef} className="relative block">
      <span className="mb-2 block truncate whitespace-nowrap text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
        {required && <RequiredMark />}
      </span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-[34px] w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-[13px] font-medium outline-none transition ${
          isOpen ? "border-secondary" : "border-[#CBD0D8]"
        } ${value ? "text-text-secondary" : "text-text-mute"}`}
      >
        <span className="truncate">
          {options.find((option) => optionValue(option) === String(value))
            ? optionLabel(options.find((option) => optionValue(option) === String(value)))
            : value || placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          className={`shrink-0 text-text-primary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#CBD0D8] bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <button
              key={optionValue(option)}
              type="button"
              role="option"
              aria-selected={String(value) === optionValue(option)}
              onClick={() => {
                onChange(optionValue(option));
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-[13px] transition hover:bg-secondary-light hover:text-secondary ${
                String(value) === optionValue(option)
                  ? "bg-secondary-light text-secondary"
                  : "text-text-secondary"
              }`}
            >
              {optionLabel(option)}
            </button>
          ))}
        </div>
      )}
    </div>
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

function PaymentMethodField({ value, onChange, methods = [], className = "" }) {
  const logo = paymentLogos[value];

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
          {(methods.length ? methods : paymentMethods.map((method) => ({ value: method, label: method }))).map((method) => (
            <option key={optionValue(method)} value={method.code || optionValue(method)}>
              {optionLabel(method)}
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

function ReceiptUpload({ value, onChange }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onChange({
        name: file.name,
        type: file.type,
        dataUrl: reader.result,
      });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <label className="block max-w-[250px] cursor-pointer">
      <span className="mb-2 block truncate whitespace-nowrap text-[14px] font-semibold leading-5 text-secondary">
        វិក្កយបត្រ (Optional)
      </span>
      <span className="relative flex min-h-[86px] items-center justify-center rounded-lg border-2 border-dashed border-[#7F7DB8] bg-[#F8F9FF] px-4 py-3 text-center text-[11px] font-medium leading-5 text-text-mute transition hover:border-secondary">
        <input
          type="file"
          className="sr-only"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        {value && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onChange(null);
            }}
            className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-sm transition hover:bg-[#DC2626]"
            aria-label="Remove receipt"
          >
            <X size={12} strokeWidth={3} />
          </button>
        )}
        {value?.type?.startsWith("image/") ? (
          <img
            src={value.dataUrl}
            alt={value.name || "Receipt preview"}
            className="h-[72px] w-full rounded-md object-cover"
          />
        ) : value ? (
          <span className="flex max-w-full flex-col items-center gap-1 text-text-secondary">
            <FileText className="h-6 w-6 text-secondary" />
            <span className="max-w-full truncate">{value.name}</span>
          </span>
        ) : (
          <span>
            <CloudUpload className="mx-auto mb-1 h-6 w-6 text-text-secondary" />
            ប្រភេទ: JPG, Docx, PDF, PNG (អតិបរមា 5MB)
            <br />
            ទំហំរូបភាព: 16:9
          </span>
        )}
      </span>
    </label>
  );
}

function buildInitialForm(initialData = {}) {
  const data = initialData ?? {};

  return {
    id: data.id ?? null,
    memberId: data.memberId ?? "",
    sponsorId: data.sponsorId ?? "",
    sponsorType: data.type || "",
    sponsorName: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    equipment: data.equipment || "",
    equipmentType: data.equipmentType || "",
    equipmentCount: data.equipmentCount || "0",
    equipmentUnit: data.equipmentUnit || "",
    date: data.dateValue || "",
    paymentMethod: data.method || "ABA",
    amountRiel: data.rielAmount || "",
    amountDollar: data.dollarAmount || "",
    note: data.note || "",
    branch: String(data.branchId ?? data.branch ?? ""),
    status: String(data.activityId ?? data.status ?? ""),
    receipt: data.receipt || null,
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
  const [branchOptions, setBranchOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [activityOptions, setActivityOptions] = useState([]);
  const [backendPaymentMethods, setBackendPaymentMethods] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(buildInitialForm(initialData));
  }, [initialData]);

  useEffect(() => {
    if (!showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => setShowSaveAlert(false), 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSaveAlert]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchJson("/api/lookups/branches"),
      fetchJson("/api/backend/activities?page=0&size=1000"),
      fetchJson("/api/backend/payment-methods?activeOnly=true"),
    ])
      .then(([branchItems, activityPage, methodItems]) => {
        if (cancelled) return;
        setBranchOptions((Array.isArray(branchItems) ? branchItems : []).map((branch) => ({
          value: String(branch.value ?? branch.id),
          label: branch.labelKm || branch.labelEn || branch.label || branch.code || `#${branch.value ?? branch.id}`,
        })));
        setActivityOptions((Array.isArray(activityPage?.content) ? activityPage.content : []).map((activity) => ({
          value: String(activity.id),
          label: activity.titleKm || activity.titleEn || `#${activity.id}`,
          branchId: String(activity.branchId ?? ""),
        })));
        setBackendPaymentMethods((Array.isArray(methodItems) ? methodItems : []).map((method) => ({
          value: String(method.id),
          code: method.code,
          label: method.label_km || method.labelKm || method.label_en || method.labelEn || method.code,
        })));
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Unable to load sponsor donation options.");
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (form.sponsorType !== sponsorTypes[2] || !form.branch) {
      setMemberOptions([]);
      return undefined;
    }
    let cancelled = false;
    fetchJson(`/api/backend/donations/sponsor/lookup/members?branchId=${encodeURIComponent(form.branch)}`)
      .then((items) => {
        if (!cancelled) setMemberOptions((Array.isArray(items) ? items : []).map((member) => ({
          value: String(member.id),
          label: member.name || member.nameEn || member.memberNo || `#${member.id}`,
          ...member,
        })));
      })
      .catch((loadError) => {
        if (!cancelled) {
          setMemberOptions([]);
          setError(loadError.message || "Unable to load branch members.");
        }
      });
    return () => { cancelled = true; };
  }, [form.branch, form.sponsorType]);

  const updateField = (field) => (value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value?.target ? value.target.value : value,
    }));
  };

  const handleSponsorTypeChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      sponsorType: event.target.value,
      memberId: "",
      sponsorId: "",
      sponsorName: "",
      phone: "",
      email: "",
    }));
  };

  const handleMemberChange = (memberId) => {
    const selectedMember = memberOptions.find(
      (member) => String(member.value) === String(memberId),
    );

    setForm((currentForm) => ({
      ...currentForm,
      memberId,
      sponsorName: selectedMember?.name || selectedMember?.nameEn || selectedMember?.label || "",
      phone: selectedMember?.phone || "",
      email: selectedMember?.email || "",
      address: selectedMember?.address || "",
    }));
  };

  const handleMemberBranchChange = (branch) => {
    setForm((currentForm) => ({
      ...currentForm,
      branch,
      memberId: "",
      sponsorName: "",
      phone: "",
      email: "",
    }));
  };

  const branchMemberNames = form.branch ? memberOptions : [];

  const handleEquipmentChange = (event) => {
    const isChecked = event.target.checked;

    setForm((currentForm) => ({
      ...currentForm,
      equipment: isChecked ? "សម្ភារៈ" : "",
      paymentMethod:
        isChecked
          ? "សម្ភារៈ"
          : currentForm.paymentMethod === "សម្ភារៈ"
            ? "ABA"
            : currentForm.paymentMethod,
      ...(!isChecked && {
        equipmentType: "",
        equipmentCount: "0",
      }),
    }));
  };

  const handlePaymentMethodChange = (paymentMethod) => {
    const selectedMethod = backendPaymentMethods.find((method) => method.code === paymentMethod);
    const isEquipment =
      paymentMethod === "សម្ភារៈ" ||
      String(selectedMethod?.code || "").toUpperCase().includes("MATERIAL");

    setForm((currentForm) => ({
      ...currentForm,
      paymentMethod,
      equipment: isEquipment ? "សម្ភារៈ" : "",
      ...(!isEquipment && {
        equipmentType: "",
        equipmentCount: "0",
      }),
    }));
  };

  const handleAmountFocus = (field) => {
    setFocusedField(field);

    if (Number(form[field]) === 0) {
      updateField(field)("");
    }
  };

  const handleSave = async () => {
    const donorKind =
      form.sponsorType === sponsorTypes[2]
        ? "MEMBER"
        : form.sponsorType === sponsorTypes[1]
          ? "INSTITUTION"
          : "INDIVIDUAL";
    const method = backendPaymentMethods.find(
      (option) => option.code === form.paymentMethod || option.label === form.paymentMethod,
    ) || backendPaymentMethods[0];

    if (!form.branch || !form.date || !method) {
      setError("សូមជ្រើសរើសសាខា កាលបរិច្ឆេទ និងវិធីសាស្ត្រទូទាត់");
      return;
    }
    if (donorKind === "MEMBER" && !form.memberId) {
      setError("សូមជ្រើសរើសសមាជិកក្នុងសាខា");
      return;
    }
    if (donorKind !== "MEMBER" && !form.sponsorName.trim()) {
      setError("សូមបញ្ចូលឈ្មោះអ្នកឧបត្ថម្ភ");
      return;
    }

    const payload = {
      donorKind,
      memberId: donorKind === "MEMBER" ? Number(form.memberId) : null,
      sponsorId: form.sponsorId ? Number(form.sponsorId) : null,
      name: donorKind === "MEMBER" ? null : form.sponsorName.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      branchId: Number(form.branch),
      activityId: form.status ? Number(form.status) : null,
      amountKhr: Number(form.amountRiel || 0),
      amountUsd: Number(form.amountDollar || 0),
      paymentMethodId: Number(method.value),
      paidAt: new Date(`${form.date}T12:00:00`).toISOString(),
      receiptFileId: null,
      materialCategory: form.equipment ? form.equipmentType || null : null,
      materialQuantity: form.equipment ? Number(form.equipmentCount || 0) || null : null,
      materialQuantityType: form.equipment ? form.equipmentUnit || null : null,
      purpose: null,
      note: form.note.trim() || null,
    };

    setSaving(true);
    setError("");
    try {
      await fetchJson(
        form.id
          ? `/api/backend/donations/sponsor/${encodeURIComponent(form.id)}`
          : "/api/backend/donations/sponsor",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      setShowSaveAlert(true);
      router.push(listPath);
    } catch (saveError) {
      setError(saveError.message || "Unable to save sponsor donation.");
    } finally {
      setSaving(false);
    }
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
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <h1 className="mb-7 text-base font-semibold text-secondary">
          ការកត់ត្រាថវិការឧបត្ថម្ភ
        </h1>

        <div className="flex w-full flex-nowrap justify-between gap-10 overflow-x-auto">
          <div className="w-[466px] shrink-0 space-y-4 focus:placeholder:text-transparent">
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
                    onChange={handleSponsorTypeChange}
                    className="h-3.5 w-3.5 accent-[#1689F2]"
                  />
                  {type}
                </label>
              ))}
            </fieldset>

            {form.sponsorType === "សមាជិក" ? (
              <div className="flex items-end gap-3">
                <SelectField
                  label="សាខា"
                   required
                  value={form.branch}
                  onChange={handleMemberBranchChange}
                  options={branchOptions}
                  placeholder="ជ្រើសរើសសាខា"
                  className="min-w-0 flex-1"
                />
                <div className="min-w-0 flex-1">
                  <MemberSelectField
                    label="ឈ្មោះអ្នកឧបត្ថម្ភ"
                    required
                    value={form.memberId}
                    onChange={handleMemberChange}
                    options={branchMemberNames}
                    placeholder={
                      form.branch
                        ? "ជ្រើសរើសសមាជិក"
                        : "សូមជ្រើសរើសសាខាជាមុន"
                    }
                  />
                </div>
              </div>
            ) : (
              <TextField
                label="ឈ្មោះអ្នកឧបត្ថម្ភ"
                required
                value={form.sponsorName}
                onChange={updateField("sponsorName")}
                placeholder={sponsorNamePlaceholder}
                className="focus:placeholder-transparent"
              />
            )}
            <TextField
              label="លេខទូរស័ព្ទ"
              value={form.phone}
              onChange={updateField("phone")}
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
              className="focus:placeholder-transparent"
            />
            <TextField
              label="អ៊ីមែល"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              placeholder="បញ្ចូលអ៊ីមែល"
              className="focus:placeholder-transparent"
            />
              <TextField
                label="អាសយដ្ឋាន(Optional)"
                value={form.address}
                onChange={updateField("address")}
                placeholder="បញ្ចូលអាសយដ្ឋាន"
                className="min-w-0 flex-1 focus:placeholder-transparent"
              />
            <ReceiptUpload
              value={form.receipt}
              onChange={updateField("receipt")}
            />
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
                onChange={handlePaymentMethodChange}
                methods={backendPaymentMethods}
                className="min-w-0 flex-1"
              />
            </div>

      <div className="grid grid-cols-2 gap-4">
  <TextField
    label="ចំនួនទឹកប្រាក់ (រៀល)"
    value={form.amountRiel}
    onChange={updateField("amountRiel")}
    leadingIcon={
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-secondary">
        ៛
      </span>
    }
    onFocus={() => handleAmountFocus("amountRiel")}
    onBlur={() => setFocusedField(null)}
    placeholder={
      focusedField === "amountRiel"
        ? ""
        : "បញ្ចូលចំនួនទឹកប្រាក់"
    }
    className="min-w-0"
  />

  <TextField
    label="ចំនួនទឹកប្រាក់ (ដុល្លារ)"
    value={form.amountDollar}
    onChange={updateField("amountDollar")}
    leadingIcon={
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-secondary">
        $
      </span>
    }
    onFocus={() => handleAmountFocus("amountDollar")}
    onBlur={() => setFocusedField(null)}
    placeholder={
      focusedField === "amountDollar"
        ? ""
        : "បញ្ចូលចំនួនទឹកប្រាក់"
    }
    className="min-w-0"
  />
</div>
     <fieldset className="flex h-[34px] items-center text-[13px] font-medium text-text-secondary">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="equipment"
                      value="សម្ភារៈ"
                      checked={form.equipment === "សម្ភារៈ"}
                      onChange={handleEquipmentChange}
                      className="h-3.5 w-3.5 accent-[#1689F2]"
                    />
                    សម្ភារៈ
                  </label>
                </fieldset>

            <div className="flex items-end gap-4">
          
                <TextField
                  label="ប្រភេទសម្ភារៈ"
                  value={form.equipmentUnit}
                  onChange={updateField("equipmentUnit")}
                  disabled={form.equipment !== "សម្ភារៈ"}
                  options={equipmentTypes}
                  placeholder="បញ្ចូលនូវឈ្មោះសម្ភារៈ"
                  className="min-w-0 flex-1"
                />
                <QuantityField
                  label="ចំនួនសម្ភារៈ"
                  value={form.equipmentCount}
                  onChange={updateField("equipmentCount")}
                  disabled={form.equipment !== "សម្ភារៈ"}
                />
                <TextField
                  label="ឯកតាសម្ភារៈ"
                  value={form.equipmentType}
                  onChange={updateField("equipmentType")}
                  disabled={form.equipment !== "សម្ភារៈ"}
                  options={equipmentTypes}
                  placeholder="ឯកតាសម្ភារៈ"
                  className="w-[100px] shrink-0"
                />
              </div>

            <div className="flex items-end gap-4">
              <SelectField
                label="សាខា(Optional)"
                value={form.branch}
                onChange={updateField("branch")}
                options={branchOptions}
                placeholder="ជ្រើសរើសសាខា"
                className="min-w-0 flex-1"
              />
              <SelectField
                label="ឧបត្ថម្ភក្នុងកម្មវិធី(Optional)"
                value={form.status}
                onChange={updateField("status")}
                options={activityOptions.filter((activity) => !form.branch || activity.branchId === String(form.branch))}
                placeholder="ជ្រើសរើសកម្មវិធី"
                className="min-w-0 flex-1"
              />
              </div>

              <TextField
                label="Note (Optional)"
                value={form.note}
                onChange={updateField("note")}
                placeholder="សរសេរ Note"
                heightClass="h-[86px]"
              />

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
            disabled={saving}
            className="inline-flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HiSaveAs size={16} />
            រក្សាទុក
          </button>
        </div>
      </section>
    </>
  );
}
