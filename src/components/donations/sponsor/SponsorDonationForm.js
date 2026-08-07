"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, CloudUpload, FileText, ImportIcon, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import SaveAlert from "@/components/forms/savealert";
import sponsorOptions from "@/data/donation/sponsorOptions.json";

const {
  equipmentTypes,
  khmerDigits,
  khmerMonths,
  paymentLogos,
  sponsorTypes,
} = sponsorOptions;
const MEMBER_SPONSOR_TYPE = sponsorTypes[2];
const MATERIAL_PAYMENT_CODE = "MATERIAL";
const DONOR_KIND_BY_TYPE = {
  [sponsorTypes[0]]: "INDIVIDUAL",
  [sponsorTypes[1]]: "INSTITUTION",
  [sponsorTypes[2]]: "MEMBER",
};
const TYPE_BY_DONOR_KIND = Object.fromEntries(
  Object.entries(DONOR_KIND_BY_TYPE).map(([type, kind]) => [kind, type]),
);

function unwrapApiPayload(payload) {
  return payload?.data ?? payload;
}

async function readApiResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || fallbackMessage);
  }
  return unwrapApiPayload(payload);
}

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
    <label className="block w-[100px] shrink-0">
      <span className="mb-2 block whitespace-nowrap text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
      </span>
      <span
        className={`flex h-[34px] w-[100px] overflow-hidden rounded-xl border border-[#CBD0D8] focus-within:border-secondary ${
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
            <option
              key={typeof option === "object" ? option.value : option}
              value={typeof option === "object" ? option.value : option}
            >
              {typeof option === "object" ? option.label : option}
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
  const selectedOption = options.find((option) =>
    String(typeof option === "object" ? option.value : option) === String(value),
  );

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
          {selectedOption
            ? (typeof selectedOption === "object" ? selectedOption.label : selectedOption)
            : (value || placeholder)}
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
          {options.length === 0 && (
            <div className="px-4 py-2 text-[13px] text-text-mute">
              No members found in this branch
            </div>
          )}
          {options.map((option) => (
            <button
              key={typeof option === "object" ? option.value : option}
              type="button"
              role="option"
              aria-selected={value === (typeof option === "object" ? option.value : option)}
              onClick={() => {
                onChange(typeof option === "object" ? option.value : option);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-[13px] transition hover:bg-secondary-light hover:text-secondary ${
                value === (typeof option === "object" ? option.value : option)
                  ? "bg-secondary-light text-secondary"
                  : "text-text-secondary"
              }`}
            >
              {typeof option === "object" ? option.label : option}
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

function PaymentMethodField({ value, onChange, options, className = "" }) {
  const logo = paymentLogos[value];
  const selected = options.find((option) => option.value === value);

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
          {selected?.label || value || "ABA"}
        </span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          aria-label="វិធីសាស្ត្រទូទាត់"
        >
          {options.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
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
    id: data.donationId ?? data.id ?? null,
    sponsorType: TYPE_BY_DONOR_KIND[data.donorKind] || data.type || "",
    memberId: data.memberId ? String(data.memberId) : "",
    sponsorName: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    equipment: data.materialCategory ? MATERIAL_PAYMENT_CODE : data.equipment || "",
    equipmentType: data.materialCategory || data.equipmentType || "",
    equipmentCount: String(data.materialQuantity ?? data.equipmentCount ?? "0"),
    materialUnit: data.materialQuantityType || "",
    date: data.paidAt?.slice(0, 10) || data.dateValue || "",
    paymentMethod: data.paymentMethodCode || data.method || "ABA",
    amountRiel: String(data.amountKhr ?? data.rielAmount ?? ""),
    amountDollar: String(data.amountUsd ?? data.dollarAmount ?? ""),
    note: data.note || "",
    branch: data.branchId ? String(data.branchId) : data.branch || "",
    status: data.activityId ? String(data.activityId) : data.status || "",
    receipt: data.receipt || null,
    updatedAt: data.updatedAt || null,
  };
}

export default function SponsorDonationForm({ initialData = null, donationId = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const listPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/sponsor"
    : "/donation/sponsor";
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [form, setForm] = useState(() => buildInitialForm(initialData));
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadFormData() {
      setError("");
      try {
        const requests = [
          fetch("/api/branches", { cache: "no-store" }),
          fetch("/api/backend/payment-methods?activeOnly=true", { cache: "no-store" }),
          fetch("/api/backend/activities?page=0&size=200", { cache: "no-store" }),
        ];
        if (donationId) {
          requests.push(fetch(`/api/backend/donations/sponsor/${encodeURIComponent(donationId)}`, { cache: "no-store" }));
        }
        const responses = await Promise.all(requests);
        const [branchRows, methodRows, activityPage, donation] = await Promise.all([
          readApiResponse(responses[0], "Unable to load branches."),
          readApiResponse(responses[1], "Unable to load payment methods."),
          readApiResponse(responses[2], "Unable to load activities."),
          responses[3] ? readApiResponse(responses[3], "Unable to load sponsor donation.") : Promise.resolve(initialData),
        ]);
        if (cancelled) return;
        setBranches((branchRows || []).map((branch) => ({
          value: String(branch.id),
          label: branch.name_km || branch.nameKm || branch.name_en || branch.nameEn || branch.branch_code,
        })));
        setPaymentMethods((methodRows || []).map((method) => ({
          value: method.code,
          id: method.id,
          label: method.labelKm || method.label_km || method.labelEn || method.label_en || method.code,
        })));
        setActivities((activityPage?.content || []).map((activity) => ({
          value: String(activity.id),
          label: activity.titleKm || activity.titleEn || `Activity ${activity.id}`,
          branchId: String(activity.branchId || ""),
        })));
        setForm(buildInitialForm(donation));
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to prepare sponsor donation.");
      }
    }
    loadFormData();
    return () => { cancelled = true; };
  }, [donationId, initialData]);

  useEffect(() => {
    if (form.sponsorType !== MEMBER_SPONSOR_TYPE || !form.branch) {
      setMembers([]);
      return undefined;
    }
    let cancelled = false;
    fetch(`/api/backend/donations/sponsor/lookup/members?branchId=${encodeURIComponent(form.branch)}`, { cache: "no-store" })
      .then((response) => readApiResponse(response, "Unable to load members for this branch."))
      .then((rows) => { if (!cancelled) setMembers(rows || []); })
      .catch((loadError) => { if (!cancelled) { setMembers([]); setError(loadError.message); } });
    return () => { cancelled = true; };
  }, [form.branch, form.sponsorType]);

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

  const handleSponsorTypeChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      sponsorType: event.target.value,
      sponsorName: "",
      memberId: "",
      phone: "",
      email: "",
    }));
  };

  const handleMemberChange = (memberId) => {
    const selectedMember = members.find((member) => String(member.id) === String(memberId));

    setForm((currentForm) => ({
      ...currentForm,
      memberId: String(memberId),
      sponsorName: selectedMember?.name || selectedMember?.nameEn || "",
      phone: selectedMember?.phone || "",
      email: selectedMember?.email || "",
      address: selectedMember?.address || "",
    }));
  };

  const handleEquipmentChange = (event) => {
    const isChecked = event.target.checked;

    setForm((currentForm) => ({
      ...currentForm,
      equipment: isChecked ? MATERIAL_PAYMENT_CODE : "",
      paymentMethod:
        isChecked
          ? MATERIAL_PAYMENT_CODE
          : currentForm.paymentMethod === MATERIAL_PAYMENT_CODE
            ? "ABA"
            : currentForm.paymentMethod,
      ...(!isChecked && {
        equipmentType: "",
        equipmentCount: "0",
        materialUnit: "",
      }),
    }));
  };

  const handlePaymentMethodChange = (paymentMethod) => {
    const isEquipment = paymentMethod === MATERIAL_PAYMENT_CODE;

    setForm((currentForm) => ({
      ...currentForm,
      paymentMethod,
      equipment: isEquipment ? MATERIAL_PAYMENT_CODE : "",
      ...(!isEquipment && {
        equipmentType: "",
        equipmentCount: "0",
        materialUnit: "",
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
    setError("");
    const donorKind = DONOR_KIND_BY_TYPE[form.sponsorType];
    const selectedPaymentMethod = paymentMethods.find((method) => method.value === form.paymentMethod);
    if (!donorKind) return setError("Please choose sponsor type.");
    if (!form.branch) return setError("Please choose a branch.");
    if (donorKind === "MEMBER" && !form.memberId) return setError("Please choose a member from the selected branch.");
    if (donorKind !== "MEMBER" && !form.sponsorName.trim()) return setError("Please enter sponsor name.");
    if (!form.date) return setError("Please choose donation date.");
    if (!selectedPaymentMethod) return setError("Please choose payment method.");
    if (form.paymentMethod === MATERIAL_PAYMENT_CODE && (!form.equipmentType.trim() || Number(form.equipmentCount) <= 0 || !form.materialUnit.trim())) {
      return setError("Please enter material type, quantity, and unit.");
    }

    const body = {
      donorKind,
      sponsorId: null,
      memberId: donorKind === "MEMBER" ? Number(form.memberId) : null,
      name: donorKind === "MEMBER" ? null : form.sponsorName.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      branchId: Number(form.branch),
      activityId: /^\d+$/.test(form.status) ? Number(form.status) : null,
      amountKhr: Number(form.amountRiel || 0),
      amountUsd: Number(form.amountDollar || 0),
      paymentMethodId: selectedPaymentMethod.id,
      paidAt: new Date(`${form.date}T12:00:00+07:00`).toISOString(),
      paymentReference: null,
      receiptFileId: null,
      materialCategory: form.equipment ? form.equipmentType.trim() : null,
      materialQuantity: form.equipment ? Number(form.equipmentCount) : null,
      materialQuantityType: form.equipment ? form.materialUnit.trim() : null,
      purpose: form.status && !/^\d+$/.test(form.status) ? form.status : null,
      note: form.note.trim() || null,
      expectedUpdatedAt: form.id ? form.updatedAt : null,
    };

    setIsSaving(true);
    try {
      const id = form.id || donationId;
      const response = await fetch(id
        ? `/api/backend/donations/sponsor/${encodeURIComponent(id)}`
        : "/api/backend/donations/sponsor", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await readApiResponse(response, "Unable to save sponsor donation.");
      window.localStorage.setItem("tnal-youth:sponsor-save-alert", "true");
      router.push(listPath);
    } catch (saveError) {
      setError(saveError.message || "Unable to save sponsor donation.");
    } finally {
      setIsSaving(false);
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

            {form.sponsorType === MEMBER_SPONSOR_TYPE && (
              <SelectField
                label="សាខា"
                required
                value={form.branch}
                onChange={(value) => setForm((current) => ({
                  ...current,
                  branch: value,
                  memberId: "",
                  sponsorName: "",
                  phone: "",
                  email: "",
                  address: "",
                }))}
                options={branches}
                placeholder="ជ្រើសរើសសាខាជាមុន"
              />
            )}

            {form.sponsorType === MEMBER_SPONSOR_TYPE ? (
              <MemberSelectField
                label="ឈ្មោះអ្នកឧបត្ថម្ភ"
                required
                value={form.memberId}
                onChange={handleMemberChange}
                options={members.map((member) => ({
                  value: String(member.id),
                  label: member.name || member.nameEn || member.memberNo,
                }))}
                placeholder="ជ្រើសរើសសមាជិក"
                className="focus:placeholder-transparent"
              />
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
                options={paymentMethods}
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

            <div className="flex items-end gap-4">
                <fieldset className="flex h-[34px] items-center text-[13px] font-medium text-text-secondary">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="equipment"
                      value={MATERIAL_PAYMENT_CODE}
                      checked={form.equipment === MATERIAL_PAYMENT_CODE}
                      onChange={handleEquipmentChange}
                      className="h-3.5 w-3.5 accent-[#1689F2]"
                    />
                    សម្ភារៈ
                  </label>
                </fieldset>
                <TextField
                  label="ប្រភេទសម្ភារៈ"
                  value={form.equipmentType}
                  onChange={updateField("equipmentType")}
                  disabled={form.equipment !== MATERIAL_PAYMENT_CODE}
                  options={equipmentTypes}
                  placeholder="បញ្ចូលនូវឈ្មោះសម្ភារៈ"
                  className="min-w-0 flex-1"
                />
                 <QuantityField
                  label="ចំនួនសម្ភារៈ"
                  value={form.equipmentCount}
                  onChange={updateField("equipmentCount")}
                  disabled={form.equipment !== MATERIAL_PAYMENT_CODE}
                />
              </div>

            {form.equipment === MATERIAL_PAYMENT_CODE && (
              <TextField
                label="ឯកតាសម្ភារៈ"
                value={form.materialUnit}
                onChange={updateField("materialUnit")}
                placeholder="ឧ. គីឡូក្រាម, ប្រអប់, ក្បាល"
              />
            )}

            <div className="flex items-end gap-4">
              {form.sponsorType !== MEMBER_SPONSOR_TYPE && <SelectField
                label="សាខា"
                required
                value={form.branch}
                onChange={updateField("branch")}
                options={branches}
                placeholder="ជ្រើសរើសសាខា"
                className="min-w-0 flex-1"
              />}
              <SelectField
                label="ឧបត្ថម្ភក្នុងកម្មវិធី(Optional)"
                value={form.status}
                onChange={updateField("status")}
                options={activities.filter((activity) => !form.branch || activity.branchId === String(form.branch))}
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
          {error && (
            <p className="max-w-md text-sm font-medium text-error" role="alert">
              {error}
            </p>
          )}
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
            disabled={isSaving}
            className="inline-flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-secondary-hover"
          >
            <ImportIcon size={16} />
            {isSaving ? "Saving..." : "រក្សាទុក"}
          </button>
        </div>
      </section>
    </>
  );
}
