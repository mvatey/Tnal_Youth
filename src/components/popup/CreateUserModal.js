"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButton from "@/components/forms/FormActionButton";

const USERS_BASE = "/api/backend/admin/users";

const ROLE_OPTIONS = [
  { label: "អ្នកគ្រប់គ្រង (Admin)", value: "ADMIN" },
  { label: "ប្រធានសាខា (Branch Leader)", value: "BRANCH_LEADER" },
  { label: "លេខាធិការ (Secretary)", value: "SECRETARY" },
  { label: "សមាជិក (Member)", value: "MEMBER" },
  { label: "អ្នកមើល (Viewer)", value: "VIEWER" },
];

const BRANCH_SCOPED_ROLES = new Set(["BRANCH_LEADER", "SECRETARY", "MEMBER"]);

const VIEWER_SCOPE_OPTIONS = [
  { label: "អ្នកគ្រប់គ្រង (Admin)", value: "ADMIN" },
  { label: "ប្រធានសាខា (Branch Leader)", value: "BRANCH_LEADER" },
  { label: "លេខាធិការ (Secretary)", value: "SECRETARY" },
  { label: "សមាជិក (Member)", value: "MEMBER" },
];

const EMPTY_FORM = {
  fullNameKm: "",
  fullNameEn: "",
  phone: "",
  email: "",
  role: "VIEWER",
  viewerScope: "ADMIN",
  branchId: "",
};

/*
 * No password field — the account is created PENDING_ACTIVATION
 * and the new user sets their own first password through the
 * existing OTP activation flow (send-otp -> verify-otp ->
 * set-password), which is why email is required: it's the OTP
 * delivery channel.
 */
const REQUIRED_FIELDS = [
  "fullNameKm",
  "phone",
  "email",
  "role",
];

async function createUser(payload) {
  const response = await fetch(USERS_BASE, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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
    const message =
      typeof body === "object"
        ? body?.message || body?.detail || body?.error
        : body;

    throw new Error(
      message || `Request failed with status ${response.status}`,
    );
  }

  return body;
}

export default function CreateUserModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [showValidationError, setShowValidationError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(EMPTY_FORM);
    setShowValidationError(false);
    setSubmitError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    fetch("/api/lookups/branches", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || "Unable to load branches");
        const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        setBranches(
          rows
            .map((branch) => ({
              value: String(branch?.id ?? branch?.value ?? ""),
              label:
                branch?.nameKm ||
                branch?.name_km ||
                branch?.labelKm ||
                branch?.label_km ||
                branch?.nameEn ||
                branch?.name_en ||
                branch?.label ||
                String(branch?.id ?? ""),
            }))
            .filter((branch) => branch.value),
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") setBranches([]);
      });

    return () => controller.abort();
  }, [open]);

  if (!open) {
    return null;
  }

  const update = (field) => (event) => {
    const value = event.target.value;

    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setShowValidationError(false);
    setSubmitError("");
  };

  const isViewer = form.role === "VIEWER";
  const requiresBranch =
    BRANCH_SCOPED_ROLES.has(form.role) ||
    (isViewer && form.viewerScope !== "ADMIN");
  const isFormValid =
    REQUIRED_FIELDS.every(
      (field) => String(form[field] ?? "").trim() !== "",
    ) &&
    (!isViewer || String(form.viewerScope).trim() !== "") &&
    (!requiresBranch || String(form.branchId).trim() !== "");

  const submit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);
    setSubmitError("");
    setIsSubmitting(true);

    const payload = {
      fullNameKm: form.fullNameKm.trim(),
      fullNameEn: form.fullNameEn.trim() || null,
      phone: form.phone.trim(),
      email: form.email.trim(),
      role: form.role,
      viewerScope: isViewer ? form.viewerScope : null,
      branchId: requiresBranch ? Number(form.branchId) : null,
    };

    try {
      const createdUser = await createUser(payload);

      await onSave?.(createdUser);

      setForm(EMPTY_FORM);
      onClose?.();
    } catch (error) {
      console.error("Cannot create user:", error);

      setSubmitError(
        error.message || "មិនអាចបង្កើតគណនីអ្នកប្រើប្រាស់បានទេ។",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupCard size="md" onClose={onClose}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">
          បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="បិទ"
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            text-text-secondary
            transition
            hover:bg-bg-page-gray
            hover:text-text-primary
          "
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <p className="text-xs text-text-secondary">
          Viewer គឺជាគណនីសម្រាប់មើលតែប៉ុណ្ណោះ។ ជ្រើស “មើលជា” ដើម្បីកំណត់ថាវាមើល UI និងទិន្នន័យតាម Admin, Branch Leader, Secretary ឬ Member។
        </p>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <BoxFill
            label="ឈ្មោះជាភាសាខ្មែរ"
            name="fullNameKm"
            placeholder="បញ្ចូលឈ្មោះ"
            value={form.fullNameKm}
            onChange={update("fullNameKm")}
          />

          <BoxFill
            label="ឈ្មោះជាអក្សរឡាតាំង"
            name="fullNameEn"
            placeholder="បញ្ចូលឈ្មោះ (ស្រេចចិត្ត)"
            value={form.fullNameEn}
            onChange={update("fullNameEn")}
          />

          <BoxFill
            label="លេខទូរស័ព្ទ"
            name="phone"
            placeholder="0XXXXXXXX"
            value={form.phone}
            onChange={update("phone")}
          />

          <BoxFill
            label="អ៊ីមែល"
            name="email"
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={update("email")}
          />

          <FormSelect
            label="តួនាទី"
            name="role"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={update("role")}
            required
          />

          {isViewer && (
            <FormSelect
              label="មើលជា (View as)"
              name="viewerScope"
              options={VIEWER_SCOPE_OPTIONS}
              value={form.viewerScope}
              onChange={update("viewerScope")}
              required
            />
          )}

          {requiresBranch && (
            <FormSelect
              label="សាខា"
              name="branchId"
              options={branches}
              value={form.branchId}
              onChange={update("branchId")}
              required
            />
          )}
        </div>

        {showValidationError && !isFormValid && (
          <p className="mt-1 text-xs font-medium text-error">
            សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។
          </p>
        )}

        {submitError && (
          <p className="mt-1 text-xs font-medium text-error">
            {submitError}
          </p>
        )}

        <FormActionButton
          onCancel={onClose}
          isValid={isFormValid && !isSubmitting}
          saving={isSubmitting}
          saveText="រក្សាទុក"
          cancelText="បោះបង់"
        />
      </form>
    </PopupCard>
  );
}
