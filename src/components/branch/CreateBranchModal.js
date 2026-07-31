"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Mail, MapPin, Navigation, Phone, X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";

const EMPTY_FORM = {
  nameKm: "",
  nameEn: "",
  level: "",
  province: "",
  district: "",
  commune: "",
  addressLine: "",
  googleMapUrl: "",
  phone: "",
  email: "",
  status: "ACTIVE",
  branchLeaderId: "",
};

const LEVEL_OPTIONS = [
  { label: "រាជធានី/ខេត្ត", value: "PROVINCE" },
  { label: "ក្រុង/ស្រុក/ខណ្ឌ", value: "DISTRICT" },
  { label: "ឃុំ/សង្កាត់", value: "COMMUNE" },
];

const PROVINCE_OPTIONS = [
  { label: "ភ្នំពេញ", value: "PHNOM_PENH" },
  { label: "កណ្ដាល", value: "KANDAL" },
  { label: "កំពត", value: "KAMPOT" },
  { label: "កំពង់ចាម", value: "KAMPONG_CHAM" },
  { label: "កំពង់ធំ", value: "KAMPONG_THOM" },
  { label: "កំពង់ស្ពឺ", value: "KAMPONG_SPEU" },
  { label: "តាកែវ", value: "TAKEO" },
  { label: "ព្រៃវែង", value: "PREY_VENG" },
  { label: "សៀមរាប", value: "SIEM_REAP" },
  { label: "បាត់ដំបង", value: "BATTAMBANG" },
];

const DISTRICT_OPTIONS = [
  { label: "ខណ្ឌចំការមន", value: "CHAMKAR_MON" },
  { label: "ខណ្ឌដូនពេញ", value: "DAUN_PENH" },
  { label: "ខណ្ឌសែនសុខ", value: "SEN_SOK" },
];

const COMMUNE_OPTIONS = [
  { label: "សង្កាត់ទន្លេបាសាក់", value: "TONLE_BASSAC" },
  { label: "សង្កាត់បឹងកេងកងទី១", value: "BKK_1" },
  { label: "សង្កាត់ផ្សារថ្មីទី១", value: "PHSAR_THMEI_1" },
];

const STATUS_OPTIONS = [
  { label: "សកម្ម", value: "ACTIVE" },
  { label: "អសកម្ម", value: "INACTIVE" },
];

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || "";
}

function getInitialForm(branch) {
  if (!branch) {
    return EMPTY_FORM;
  }

  return {
    nameKm: branch.nameKm || branch.name || "",
    nameEn: branch.nameEn || "",
    level: branch.levelCode || "",
    province: branch.provinceCode || "",
    district: branch.districtCode || "",
    commune: branch.communeCode || "",
    addressLine: branch.addressLine || "",
    googleMapUrl: branch.googleMapUrl || "",
    phone: branch.phone || "",
    email: branch.email || "",
    status: branch.status || "ACTIVE",
    branchLeaderId: branch.leader?.id ? String(branch.leader.id) : "",
  };
}

export default function CreateBranchModal({
  open,
  onClose,
  onSave,
  initialData = null,
  leaderOptions = [],
}) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [modalRoot, setModalRoot] = useState(null);

  const showDistrict = form.level === "DISTRICT" || form.level === "COMMUNE";
  const showCommune = form.level === "COMMUNE";

  const branchLeaderOptions = useMemo(
    () => [
      {
        label: "មិនទាន់កំណត់ប្រធានសាខា",
        value: "",
      },
      ...leaderOptions,
    ],
    [leaderOptions],
  );

  useEffect(() => {
    setMounted(true);
    setModalRoot(document.getElementById("branch-modal-root"));
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setForm(getInitialForm(initialData));
    setError("");

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, initialData, onClose]);

  const updateField = (field) => (event) => {
    const value = event?.target?.value ?? event ?? "";

    setForm((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      if (field === "level") {
        if (value === "PROVINCE") {
          next.district = "";
          next.commune = "";
        }

        if (value === "DISTRICT") {
          next.commune = "";
        }
      }

      if (field === "province") {
        next.district = "";
        next.commune = "";
      }

      if (field === "district") {
        next.commune = "";
      }

      return next;
    });

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.nameKm.trim()) {
      setError("សូមបញ្ចូលឈ្មោះសាខា");
      return;
    }

    if (!form.level) {
      setError("សូមជ្រើសរើសកម្រិតសាខា");
      return;
    }

    if (!form.province) {
      setError("សូមជ្រើសរើសរាជធានី/ខេត្ត");
      return;
    }

    if (showDistrict && !form.district) {
      setError("សូមជ្រើសរើសក្រុង/ស្រុក/ខណ្ឌ");
      return;
    }

    if (showCommune && !form.commune) {
      setError("សូមជ្រើសរើសឃុំ/សង្កាត់");
      return;
    }

    const selectedLeader =
      isEditMode && form.branchLeaderId
        ? leaderOptions.find(
            (option) =>
              String(option.value) === String(form.branchLeaderId),
          )?.member || null
        : null;

    const now = Date.now();

    const branchPayload = {
      ...(initialData || {}),
      id: initialData?.id || now,
      code: initialData?.code || `BR-${String(now).slice(-4)}`,
      name: form.nameKm.trim(),
      nameKm: form.nameKm.trim(),
      nameEn: form.nameEn.trim(),
      level: getOptionLabel(LEVEL_OPTIONS, form.level),
      levelCode: form.level,
      province: getOptionLabel(PROVINCE_OPTIONS, form.province),
      provinceCode: form.province,
      district: showDistrict
        ? getOptionLabel(DISTRICT_OPTIONS, form.district)
        : "",
      districtCode: showDistrict ? form.district : "",
      commune: showCommune
        ? getOptionLabel(COMMUNE_OPTIONS, form.commune)
        : "",
      communeCode: showCommune ? form.commune : "",
      addressLine: form.addressLine.trim(),
      googleMapUrl: form.googleMapUrl.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: form.status,
      memberCount: initialData?.memberCount || 0,
      activityCount: initialData?.activityCount || 0,
      totalDonationUsd: initialData?.totalDonationUsd || 0,
      createdAt:
        initialData?.createdAt ||
        new Intl.DateTimeFormat("km-KH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date()),
      leader: isEditMode ? selectedLeader : null,
    };

    onSave(branchPayload);
    onClose();
  };

  if (!mounted || !open || !modalRoot) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-modal-title"
        className="no-scrollbar max-h-[92%] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between px-7 pb-3 pt-6">
            <h2
              id="branch-modal-title"
              className="text-xl font-bold text-secondary"
            >
              {isEditMode ? "កែប្រែព័ត៌មានសាខា" : "បង្កើតសាខា"}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-gray-100 hover:text-text-primary"
              aria-label="បិទ"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 px-7 pb-7">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BoxFill
                label="ឈ្មោះសាខា"
                name="nameKm"
                value={form.nameKm}
                onChange={updateField("nameKm")}
                placeholder="បញ្ចូលឈ្មោះសាខា"
                leadingIcon={
                  <Building2
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                }
              />

              <BoxFill
                label="ឈ្មោះជាអក្សរឡាតាំង"
                name="nameEn"
                value={form.nameEn}
                onChange={updateField("nameEn")}
                placeholder="បញ្ចូលឈ្មោះសាខា"
                leadingIcon={
                  <Building2
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormSelect
                label="កម្រិតសាខា"
                name="level"
                value={form.level}
                onChange={updateField("level")}
                placeholder="ជ្រើសរើសកម្រិត"
                options={LEVEL_OPTIONS}
              />

              <FormSelect
                label="រាជធានី/ខេត្ត"
                name="province"
                value={form.province}
                onChange={updateField("province")}
                placeholder="ជ្រើសរើសរាជធានី/ខេត្ត"
                options={PROVINCE_OPTIONS}
              />

              {showDistrict && (
                <FormSelect
                  label="ក្រុង/ស្រុក/ខណ្ឌ"
                  name="district"
                  value={form.district}
                  onChange={updateField("district")}
                  placeholder="ជ្រើសរើសក្រុង/ស្រុក/ខណ្ឌ"
                  options={DISTRICT_OPTIONS}
                />
              )}

              {showCommune && (
                <FormSelect
                  label="ឃុំ/សង្កាត់"
                  name="commune"
                  value={form.commune}
                  onChange={updateField("commune")}
                  placeholder="ជ្រើសរើសឃុំ/សង្កាត់"
                  options={COMMUNE_OPTIONS}
                />
              )}
            </div>

            <BoxFill
              label="អាសយដ្ឋានលម្អិត"
              name="addressLine"
              value={form.addressLine}
              onChange={updateField("addressLine")}
              placeholder="ឧ. អគារលេខ ផ្លូវ ភូមិ..."
              leadingIcon={
                <MapPin
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              }
            />

            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <BoxFill
                  label="តំណភ្ជាប់ទីតាំង"
                  name="googleMapUrl"
                  value={form.googleMapUrl}
                  onChange={updateField("googleMapUrl")}
                  placeholder="បញ្ចូលតំណ Google Maps"
                  leadingIcon={
                    <Navigation
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const url = form.googleMapUrl.trim();

                  if (!url) {
                    setError("សូមបញ្ចូលតំណ Google Maps");
                    return;
                  }

                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="mb-[1px] flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-success px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Navigation size={15} />
                ទីតាំង
              </button>
            </div>

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={updateField("phone")}
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
              leadingIcon={
                <Phone
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              }
            />

            <BoxFill
              label="អ៊ីម៉ែល"
              type="email"
              name="email"
              value={form.email}
              onChange={updateField("email")}
              placeholder="បញ្ចូលអ៊ីម៉ែល"
              leadingIcon={
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              }
            />

            <FormSelect
              label="ស្ថានភាព"
              name="status"
              value={form.status}
              onChange={updateField("status")}
              placeholder="ជ្រើសរើសស្ថានភាព"
              options={STATUS_OPTIONS}
            />

            {isEditMode && (
              <div className="space-y-2 rounded-xl border border-border bg-gray-50 p-4">
                <FormSelect
                  label="ប្រធានសាខា"
                  name="branchLeaderId"
                  value={form.branchLeaderId}
                  onChange={updateField("branchLeaderId")}
                  placeholder="ជ្រើសរើសប្រធានសាខា"
                  options={branchLeaderOptions}
                />

                <p className="text-xs text-text-secondary">
                  អាចជ្រើសរើសបានតែសមាជិកដែលស្ថិតនៅក្នុងសាខានេះ។
                </p>

                {leaderOptions.length === 0 && (
                  <p className="text-xs font-medium text-warning">
                    មិនទាន់មានសមាជិកក្នុងសាខានេះទេ។ សូមបង្កើតសមាជិកជាមុនសិន។
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-[110px] shrink-0 items-center justify-center rounded-lg border border-border bg-white px-5 text-sm font-semibold text-text-secondary transition hover:bg-gray-50"
              >
                បោះបង់
              </button>

              <button
                type="submit"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <HiSaveAs size={18} />
                {isEditMode ? "រក្សាទុកការកែប្រែ" : "រក្សាទុក"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    modalRoot,
  );
}