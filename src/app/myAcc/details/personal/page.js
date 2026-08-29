"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { UploadCloud } from "lucide-react";

import useCurrentMember from "@/hooks/useCurrentMember";

import BoxFill from "@/components/forms/boxFill.js";
import FormSelect from "@/components/forms/FormSelect";
import FormDate from "@/components/forms/FormDate.js";
import SaveButton from "@/components/forms/SaveButton";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";
import { useLanguage } from "@/context/LanguageContext";

/* =========================================================
 * EMPTY FORM
 *
 * Mirrors the Member module's personal-info tab field-for-field
 * (see /member/memberInfo/[id]/details/personal/page.js), minus
 * branch/role/status ever being editable here — those three stay
 * read-only display fields sourced from the same response.
 * ========================================================= */

const EMPTY_FORM = {
  full_name_km: "",
  full_name_en: "",
  gender: "",
  date_of_birth: "",

  email: "",
  phone: "",

  nationality_id: "",
  ethnicity_id: "",
  religion_id: "",

  member_level_id: "",
  tshirt_size: "",

  current_address: "",
  permanent_address: "",

  branch_name_km: "",
  assigned_branches: [],
  account_role: "",
  account_status: "",
  has_account: false,

  cv_file_id: null,
};

const TSHIRT_SIZE_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
];

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  BRANCH_LEADER: "ប្រធានសាខា",
  SECRETARY: "លេខាធិការ",
  MEMBER: "សមាជិក",
};

const ACCOUNT_STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  PENDING: "កំពុងរង់ចាំសកម្មភាព",
  SUSPENDED: "បានផ្អាក",
  LOCKED: "បានចាក់សោ",
};

function getRoleLabel(role) {
  const normalized = String(role || "").trim().toUpperCase();
  return ROLE_LABELS[normalized] || (role ? String(role) : "-");
}

function getStatusLabel(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return ACCOUNT_STATUS_LABELS[normalized] || (status ? String(status) : "-");
}

/* =========================================================
 * REQUEST HELPER
 * ========================================================= */

async function requestJson(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (options.body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    /*
     * body can fall back to a raw string above when the response
     * wasn't valid JSON (e.g. an HTML error page). Never surface
     * that raw markup to the user — only use it as the error
     * message when it's short, plain text.
     */
    const isUsablePlainText =
      typeof body === "string" && body.length > 0 && body.length < 300 && !/[<>]/.test(body);

    const message =
      typeof body === "object" && body !== null
        ? body?.message || body?.detail || body?.error || body?.title
        : isUsablePlainText
          ? body
          : null;

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return body;
}

/* =========================================================
 * LOOKUP NORMALIZER (same shape as the Member module's version,
 * so the same lookup endpoints behave identically here)
 * ========================================================= */

function normalizeLookup(data, { valueMode = "id" } = {}) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.content)
        ? data.content
        : [];

  return list
    .map((item) => {
      let rawValue = "";

      if (valueMode === "code") {
        rawValue = item?.code ?? item?.value ?? item?.id ?? "";
      } else if (valueMode === "value") {
        rawValue = item?.value ?? item?.code ?? item?.id ?? "";
      } else {
        rawValue = item?.id ?? item?.value ?? item?.code ?? "";
      }

      return {
        // Keep both translations. FormSelect uses localizedValue() and
        // selects labelKm in Khmer mode or labelEn in English mode.
        ...item,
        value: rawValue !== null && rawValue !== undefined ? String(rawValue) : "",
      };
    })
    .filter((option) => option.value !== "");
}

/* =========================================================
 * PERSONAL INFO NORMALIZER
 *
 * `preserve` carries fields the my-account personal-info endpoint
 * cannot return (joined date, addresses used to also come through
 * here in some builds) so a save never silently wipes them — see
 * the note above handleSave.
 * ========================================================= */

function normalizePersonalInfo(data, preserve = {}) {
  return {
    ...EMPTY_FORM,

    full_name_km: data?.full_name_km || data?.fullNameKm || "",
    full_name_en: data?.full_name_en || data?.fullNameEn || "",

    gender: data?.gender ? String(data.gender) : "",

    date_of_birth: data?.date_of_birth || data?.dateOfBirth || "",

    email: data?.email || "",
    phone: data?.phone || "",

    religion_id:
      data?.religion_id != null ? String(data.religion_id) : "",

    ethnicity_id:
      data?.ethnicity_id != null ? String(data.ethnicity_id) : "",

    nationality_id:
      data?.nationality_id != null ? String(data.nationality_id) : "",

    member_level_id:
      data?.member_level_id != null ? String(data.member_level_id) : "",

    tshirt_size: data?.tshirt_size || "",

    current_address:
      data?.current_address ?? preserve.currentAddress ?? "",

    permanent_address:
      data?.permanent_address ?? preserve.permanentAddress ?? "",

    branch_name_km: data?.branch_name_km || data?.branchNameKm || "-",

    /*
     * Staff (mainly secretaries) can be assigned to more than one
     * branch via branch_staff — shown read-only alongside the
     * primary branch above.
     */
    assigned_branches: Array.isArray(data?.assigned_branches)
      ? data.assigned_branches
      : [],

    account_role: data?.account_role
      ? String(data.account_role)
      : "",

    account_status: data?.account_status
      ? String(data.account_status)
      : "",

    has_account: Boolean(data?.has_account ?? data?.hasAccount),

    cv_file_id: data?.cv_file_id ?? data?.cvFileId ?? null,
  };
}

/* =========================================================
 * PAGE
 * ========================================================= */

export default function MyAccountPersonalPage() {
  const { t } = useLanguage();
  const fileRef = useRef(null);

  /*
   * useCurrentMember() still backs the page header/sidebar in
   * layout.js. Here it is only used for `member.joinedAt` — the
   * my-account personal-info endpoint accepts a joined_on field on
   * save but never returns one on read (the Member module's own
   * personal-info tab does not expose a joined-date field either,
   * so there is nothing to show/edit here) — without threading the
   * value through from this broader endpoint, every save would
   * silently blank out the member's joined date.
   */
  const { member } = useCurrentMember();

  const [form, setForm] = useState(EMPTY_FORM);

  /*
   * True once the user edits a field or picks a CV, until the next
   * successful Save — fed to useUnsavedFormGuard below so the
   * account tab-nav bar confirms before navigating away mid-edit.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [cvFile, setCvFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [cvPreviewUrl, setCvPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [genders, setGenders] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [ethnicities, setEthnicities] = useState([]);
  const [religions, setReligions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [tshirtSizes, setTshirtSizes] = useState(TSHIRT_SIZE_OPTIONS);

  /* =======================================================
   * LOAD PERSONAL INFO — a dedicated fetch/refetch, not routed
   * through useCurrentMember(), which has no refetch() at all
   * (calling one here used to throw after every save and made
   * every save look like it failed even when it had succeeded).
   * ======================================================= */

  const loadPersonalInfo = async () => {
    try {
      setError("");

      const data = await requestJson("/backend/my-account/personal-info");

      const normalized = normalizePersonalInfo(data, {
        currentAddress: member?.currentAddress,
        permanentAddress: member?.permanentAddress,
      });

      setForm(normalized);

      if (normalized.cv_file_id) {
        setFileName(`CV #${normalized.cv_file_id}`);
      } else {
        setFileName("");
      }
    } catch (loadError) {
      console.error("Cannot load my-account personal info:", loadError);
      setError(loadError.message || t("memberPage.personalLoadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadPersonalInfo();
    // Only re-run when the linked member's address snapshot first
    // becomes available, so the initial load can preserve it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.currentAddress, member?.permanentAddress]);

  /* =======================================================
   * LOAD LOOKUPS
   * ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadLookup(path, setter, options) {
      try {
        const data = await requestJson(path);
        if (!active) return;

        const normalized = normalizeLookup(data, options);
        setter(normalized.length > 0 ? normalized : options?.fallback || []);
      } catch (lookupError) {
        console.error(`Cannot load lookup ${path}:`, lookupError);
        if (active) setter(options?.fallback || []);
      }
    }

    loadLookup("/lookups/genders", setGenders, { valueMode: "code" });
    loadLookup("/lookups/nationalities", setNationalities, { valueMode: "id" });
    loadLookup("/lookups/ethnicities", setEthnicities, { valueMode: "id" });
    loadLookup("/lookups/religions", setReligions, { valueMode: "id" });
    loadLookup("/lookups/member-levels", setLevels, { valueMode: "id" });
    loadLookup("/lookups/tshirt-sizes", setTshirtSizes, {
      valueMode: "value",
      fallback: TSHIRT_SIZE_OPTIONS,
    });

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
   * FIELD CHANGE
   * ======================================================= */

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setError("");
    setSuccess("");
    setHasUnsavedChanges(true);

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
   * CV FILE
   * ======================================================= */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const allowedExtensions = ["pdf", "docx", "jpg", "jpeg", "png"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError(t("memberPage.cvAllowedTypes"));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("memberPage.fileTooLarge"));
      event.target.value = "";
      return;
    }

    setHasUnsavedChanges(true);
    setCvFile(file);

    setCvPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });

    setFileName(file.name);
  };

  /* =======================================================
   * SAVE PERSONAL INFO
   * ======================================================= */

  const handleSave = async () => {
    if (!form.full_name_km.trim()) {
      setError(t("memberPage.khmerNameRequired"));
      return false;
    }

    if (!form.gender) {
      setError(t("memberPage.genderRequired"));
      return false;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        full_name_km: form.full_name_km.trim(),
        full_name_en: form.full_name_en.trim() || null,
        gender: form.gender,
        date_of_birth: form.date_of_birth || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        religion_id: form.religion_id ? Number(form.religion_id) : null,
        ethnicity_id: form.ethnicity_id ? Number(form.ethnicity_id) : null,
        nationality_id: form.nationality_id ? Number(form.nationality_id) : null,
        member_level_id: form.member_level_id ? Number(form.member_level_id) : null,
        tshirt_size: form.tshirt_size || null,
        current_address: form.current_address.trim() || null,
        permanent_address: form.permanent_address.trim() || null,

        /*
         * Not shown as a field on this tab (the Member module's own
         * personal-info tab does not expose one either), but the
         * backend always overwrites joined_on with whatever is sent
         * here — passing the value straight through from the wider
         * member profile keeps it from being silently cleared.
         */
        joined_on:
          member?.joinedAt && member.joinedAt !== "-" ? member.joinedAt : null,
      };

      const updated = await requestJson("/backend/my-account/personal-info", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (cvFile) {
        const formData = new FormData();
        formData.append("file", cvFile);

        const cvResponse = await requestJson("/backend/my-account/personal-info/cv", {
          method: "PUT",
          body: formData,
        });

        setCvFile(null);
        if (fileRef.current) fileRef.current.value = "";

        const normalized = normalizePersonalInfo(cvResponse, {
          currentAddress: member?.currentAddress,
          permanentAddress: member?.permanentAddress,
        });
        setForm(normalized);
        if (normalized.cv_file_id) setFileName(`CV #${normalized.cv_file_id}`);
      } else {
        const normalized = normalizePersonalInfo(updated, {
          currentAddress: member?.currentAddress,
          permanentAddress: member?.permanentAddress,
        });
        setForm(normalized);
      }

      setSuccess(t("memberPage.saveSuccess"));
      setHasUnsavedChanges(false);

      return true;
    } catch (saveError) {
      console.error("Cannot save my-account personal info:", saveError);
      setError(saveError.message || t("memberPage.saveFailed"));

      return false;
    } finally {
      setSaving(false);
    }
  };

  /*
   * Registers this page's dirty flag + save function with the
   * shared unsaved-changes guard (see myAcc/layout.js), so the
   * account tab-nav bar confirms before navigating away while
   * hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(hasUnsavedChanges, handleSave);

  /* =======================================================
   * LOADING
   * ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-text-secondary">{t("memberPage.loadingPersonal")}</p>
      </div>
    );
  }

  /*
   * Every branch this account is tied to — the primary branch plus
   * any additional branch_staff coverage — deduped into one list of
   * names for the read-only chips below.
   */
  const branchDisplayList = Array.from(
    new Set(
      [
        form.branch_name_km && form.branch_name_km !== "-"
          ? form.branch_name_km
          : null,
        ...form.assigned_branches.map(
          (assignedBranch) =>
            assignedBranch.name_km || assignedBranch.name_en || null,
        ),
      ].filter(Boolean),
    ),
  );

  /* =======================================================
   * UI
   * ======================================================= */

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-bg-page-white p-4 sm:p-5 lg:p-6">
        <h2 className="text-lg font-bold text-primary">{t("memberPage.detailPersonal")}</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          {/* FORM */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <BoxFill
              label={t("memberPage.nameKm")}
              value={form.full_name_km}
              onChange={handleChange("full_name_km")}
              placeholder={t("memberPage.nameKmPlaceholder")}
            />

            <BoxFill
              label={t("memberPage.nameEn")}
              value={form.full_name_en}
              onChange={handleChange("full_name_en")}
              placeholder={t("memberPage.nameEnPlaceholder")}
            />

            <FormSelect
              label={t("memberPage.gender")}
              value={form.gender}
              onChange={handleChange("gender")}
              placeholder={t("memberPage.selectGender")}
              options={genders}
            />

            <FormDate
              label={t("memberPage.dateOfBirth")}
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange("date_of_birth")}
            />

            <BoxFill
              label={t("memberPage.email")}
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder={t("memberPage.emailPlaceholder")}
            />

            <BoxFill
              label={t("memberPage.phone")}
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder={t("memberPage.phonePlaceholder")}
            />

            <FormSelect
              label={t("memberPage.nationality")}
              value={form.nationality_id}
              onChange={handleChange("nationality_id")}
              placeholder={t("memberPage.selectNationality")}
              options={nationalities}
            />

            <FormSelect
              label={t("memberPage.ethnicity")}
              value={form.ethnicity_id}
              onChange={handleChange("ethnicity_id")}
              placeholder={t("memberPage.selectEthnicity")}
              options={ethnicities}
            />

            <FormSelect
              label={t("memberPage.religion")}
              value={form.religion_id}
              onChange={handleChange("religion_id")}
              placeholder={t("memberPage.selectReligion")}
              options={religions}
            />

            {/*
              BRANCH — read-only; only staff can move a member
              between branches. Shows every branch this account is
              tied to (primary + any additional branch_staff
              coverage) as chips in one field instead of a separate
              "additional branches" row.
            */}
            <div className="min-w-0">
              <p className="mb-2 text-sm font-semibold text-text-primary">
                {t("memberPage.branch")}
              </p>

              <div className="flex min-h-[34px] flex-wrap items-center gap-2 rounded-lg border border-border bg-bg-page-gray px-3 py-1.5">
                {branchDisplayList.length > 0 ? (
                  branchDisplayList.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center rounded-full border border-border bg-bg-page-white px-2.5 py-0.5 text-sm text-text-secondary"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-mute">-</span>
                )}
              </div>
            </div>

            {/* ROLE — read-only; only staff can change an account's role */}
            <BoxFill
              label={t("memberPage.role")}
              value={form.has_account ? getRoleLabel(form.account_role) : "-"}
              readOnly
            />

            <FormSelect
              label={t("memberPage.memberLevel")}
              value={form.member_level_id}
              onChange={handleChange("member_level_id")}
              placeholder={t("memberPage.selectMemberLevel")}
              options={levels}
            />

            <FormSelect
              label={t("memberPage.tshirtSize")}
              value={form.tshirt_size}
              onChange={handleChange("tshirt_size")}
              placeholder={t("memberPage.selectTshirtSize")}
              options={tshirtSizes}
            />

            {/* ACCOUNT STATUS — read-only; only staff can enable/disable an account */}
            <BoxFill
              label={t("memberPage.status")}
              value={form.has_account ? getStatusLabel(form.account_status) : "-"}
              readOnly
            />
          </div>

          {/* CV */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              {t("memberPage.uploadCv")}
            </label>

            <div className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg-page-gray px-4 text-center">
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />

              {fileName && (
                <div className="h-[260px] w-full overflow-hidden rounded-lg border border-border bg-bg-page-white">
                  {/\.(png|jpe?g)$/i.test(fileName) ? (
                    <img
                      src={cvPreviewUrl || `/api/files/${form.cv_file_id}/content`}
                      alt={fileName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={`${cvPreviewUrl || `/api/files/${form.cv_file_id}/content`}#toolbar=0&view=FitH`}
                      title={fileName}
                      className="h-full w-full border-0"
                    />
                  )}
                </div>
              )}

              {!fileName && <UploadCloud size={30} className="text-text-secondary" />}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {fileName ? t("memberPage.replaceCv") : t("memberPage.uploadFile")}
              </button>

              <p className="mt-2 max-w-full truncate text-xs text-text-secondary" title={fileName}>
                {fileName || t("memberPage.cvHelpText")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-error-bg px-4 py-3">
          <p className="text-sm font-medium text-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-bg px-4 py-3">
          <p className="text-sm font-medium text-success">{success}</p>
        </div>
      )}

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} disabled={saving}>
          {saving ? t("common.saving") : t("common.save")}
        </SaveButton>
      </div>
    </div>
  );
}
