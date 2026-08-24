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
];

// Admin can only toggle between these two — PENDING_ACTIVATION and LOCKED
// are system-managed states with their own flows, not something to
// hand-set here.
const STATUS_OPTIONS = [
  { label: "សកម្ម (Active)", value: "ACTIVE" },
  { label: "អសកម្ម (Inactive)", value: "INACTIVE" },
];

const EMPTY_FORM = {
  fullNameKm: "",
  fullNameEn: "",
  phone: "",
  email: "",
  role: "",
  viewerScope: "",
  branchId: "",
  password: "",
  status: "",
};

/*
 * Password is optional. Leave it blank and the account is created
 * PENDING_ACTIVATION with the new user setting their own first
 * password through the existing OTP activation flow (send-otp ->
 * verify-otp -> set-password). Set one here instead, and that becomes
 * the account's real password right away — the account still requires
 * that same OTP activation before it can log in, the person just
 * already knows what to type. Email is required either way: it's the
 * OTP delivery channel.
 */
const REQUIRED_FIELDS = [
  "fullNameKm",
  "phone",
  "email",
  "role",
];

async function submitUser(payload, userId) {
  const response = await fetch(
    userId ? `${USERS_BASE}/${userId}` : USERS_BASE,
    {
      method: userId ? "PUT" : "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

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

// editingUser: pass a row from /users (see mapUser's *Raw fields) to edit
// that standalone account instead of creating a new one. Only a standalone
// account (memberId == null) can be edited here — a member-linked account
// is edited through that member's own personal-info page instead.
export default function CreateUserModal({ open, onClose, onSave, editingUser = null }) {
  const isEditing = Boolean(editingUser);

  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [showValidationError, setShowValidationError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      editingUser
        ? {
            fullNameKm: editingUser.fullNameKmRaw || "",
            fullNameEn: editingUser.fullNameEnRaw || "",
            phone: editingUser.phoneRaw || "",
            email: editingUser.emailRaw || "",
            role: editingUser.roleCode || "VIEWER",
            viewerScope: editingUser.viewerScopeRaw || "ADMIN",
            branchId: editingUser.branchId != null ? String(editingUser.branchId) : "",
            password: "",
            status: ["ACTIVE", "INACTIVE"].includes(editingUser.statusCode)
              ? editingUser.statusCode
              : "",
          }
        : EMPTY_FORM,
    );
    setShowValidationError(false);
    setSubmitError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingUser?.id]);

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
    (!requiresBranch || String(form.branchId).trim() !== "") &&
    (form.password.trim() === "" || form.password.trim().length >= 6);

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
      password: form.password.trim() || null,
      status: isEditing && form.status ? form.status : null,
    };

    try {
      const savedUser = await submitUser(
        payload,
        isEditing ? editingUser.id : null,
      );

      await onSave?.(savedUser);

      setForm(EMPTY_FORM);
      onClose?.();
    } catch (error) {
      console.error(
        isEditing ? "Cannot update user:" : "Cannot create user:",
        error,
      );

      setSubmitError(
        error.message ||
          (isEditing
            ? "មិនអាចកែប្រែគណនីអ្នកប្រើប្រាស់បានទេ។"
            : "មិនអាចបង្កើតគណនីអ្នកប្រើប្រាស់បានទេ។"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupCard size="lg" onClose={onClose} className="no-scrollbar">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">
          {isEditing ? "កែប្រែគណនីអ្នកប្រើប្រាស់" : "បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី"}
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

      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
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
            placeholder="បញ្ចូលឈ្មោះ"
            value={form.fullNameEn}
            onChange={update("fullNameEn")}
          />
        </div>

        <div className="space-y-4">
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

          <BoxFill
            label="ពាក្យសម្ងាត់"
            name="password"
            type="password"
            placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី​ (យ៉ាងតិច ៦ តួអក្សរ)"
            value={form.password}
            onChange={update("password")}
          />

          {isEditing && (
            <FormSelect
              label="ស្ថានភាពគណនី"
              name="status"
              placeholder="រក្សាទុកដដែល"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={update("status")}
            />
          )}
        </div>

        {/*
          Role starts unselected — its dependent fields (viewer-scope,
          branch) only appear once a role is actually chosen, stacked
          below it.
        */}
        <div className="space-y-4 rounded-xl border border-border bg-bg-page-gray/40 p-4">
          <FormSelect
            label="តួនាទី"
            name="role"
            placeholder="ជ្រើសរើសតួនាទី"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={update("role")}
            required
          />

          {isViewer && (
            <FormSelect
              label="មើលជា (View as)"
              name="viewerScope"
              placeholder="ជ្រើសរើសមើលជា"
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
              placeholder="ជ្រើសរើសសាខា"
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
          saveText={isEditing ? "កែប្រែ" : "រក្សាទុក"}
          cancelText="បោះបង់"
        />
      </form>
    </PopupCard>
  );
}
