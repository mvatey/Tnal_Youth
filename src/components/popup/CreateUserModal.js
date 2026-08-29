"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButton from "@/components/forms/FormActionButton";
import { useLanguage } from "@/context/LanguageContext";

const USERS_BASE = "/api/backend/admin/users";

const BRANCH_SCOPED_ROLES = new Set(["BRANCH_LEADER", "SECRETARY", "MEMBER"]);

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
 * Password is required when creating a standalone account — it
 * becomes the account's real password immediately and the account is
 * created ACTIVE, so it can log in right away with no OTP step. (When
 * editing, password stays optional — see EMPTY_FORM/isFormValid below
 * — leave it blank to keep the account's current password unchanged.)
 * Member-linked accounts still go through OTP-based first activation;
 * that path isn't this modal.
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
  const { t, locale } = useLanguage();
  const isEditing = Boolean(editingUser);
  const roleOptions = [
    { label: t("usersPage.admin"), value: "ADMIN" },
    { label: t("usersPage.branchLeader"), value: "BRANCH_LEADER" },
    { label: t("usersPage.secretary"), value: "SECRETARY" },
    { label: t("usersPage.member"), value: "MEMBER" },
    { label: t("usersPage.viewer"), value: "VIEWER" },
  ];
  const viewerScopeOptions = [
    { label: t("usersPage.admin"), value: "ADMIN" },
    { label: t("usersPage.branchLeader"), value: "BRANCH_LEADER" },
    { label: t("usersPage.secretary"), value: "SECRETARY" },
  ];
  const statusOptions = [
    { label: t("usersPage.active"), value: "ACTIVE" },
    { label: t("usersPage.inactive"), value: "INACTIVE" },
  ];

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
        if (!response.ok) throw new Error(body?.message || t("usersPage.loadBranchesFailed"));
        const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        setBranches(
          rows
            .map((branch) => ({
              value: String(branch?.id ?? branch?.value ?? ""),
              label:
                (locale === "en"
                  ? branch?.nameEn || branch?.name_en || branch?.labelEn || branch?.label_en || branch?.nameKm || branch?.name_km || branch?.labelKm || branch?.label_km
                  : branch?.nameKm || branch?.name_km || branch?.labelKm || branch?.label_km || branch?.nameEn || branch?.name_en || branch?.labelEn || branch?.label_en) ||
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
  }, [locale, open, t]);

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
    (isEditing
      ? form.password.trim() === "" || form.password.trim().length >= 6
      : form.password.trim().length >= 6);

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
        isEditing ? t("usersPage.updateFailed") : t("usersPage.createFailed"),
        error,
      );

      setSubmitError(
        error.message ||
          (isEditing
            ? t("usersPage.updateFailed")
            : t("usersPage.createFailed")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupCard size="lg" onClose={onClose} className="no-scrollbar">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-base font-bold leading-7 text-primary sm:text-lg">
          {isEditing ? t("usersPage.editUserAccount") : t("usersPage.createUserAccount")}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("usersPage.close")}
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

      <form onSubmit={submit} className="flex flex-col gap-5" autoComplete="off">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <BoxFill
            label={t("usersPage.nameKm")}
            name="fullNameKm"
            placeholder={t("usersPage.enterName")}
            value={form.fullNameKm}
            onChange={update("fullNameKm")}
          />

          <BoxFill
            label={t("usersPage.nameEn")}
            name="fullNameEn"
            placeholder={t("usersPage.enterName")}
            value={form.fullNameEn}
            onChange={update("fullNameEn")}
          />
        </div>

        <div className="space-y-4">
          <BoxFill
            label={t("usersPage.phone")}
            name="phone"
            placeholder="0XXXXXXXX"
            value={form.phone}
            onChange={update("phone")}
          />

          <BoxFill
            label={t("usersPage.email")}
            name="email"
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={update("email")}
            autoComplete="off"
          />

          <BoxFill
            label={t("usersPage.password")}
            name="password"
            type="password"
            placeholder={t("usersPage.passwordPlaceholder")}
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
          />

          {isEditing && (
            <FormSelect
              label={t("usersPage.accountStatus")}
              name="status"
              placeholder={t("usersPage.keepExisting")}
              options={statusOptions}
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
            label={t("usersPage.role")}
            name="role"
            placeholder={t("usersPage.selectRole")}
            options={roleOptions}
            value={form.role}
            onChange={update("role")}
            required
          />

          {isViewer && (
            <FormSelect
              label={t("usersPage.viewAs")}
              name="viewerScope"
              placeholder={t("usersPage.selectViewAs")}
              options={viewerScopeOptions}
              value={form.viewerScope}
              onChange={update("viewerScope")}
              required
            />
          )}

          {requiresBranch && (
            <FormSelect
              label={t("usersPage.branch")}
              name="branchId"
              placeholder={t("usersPage.selectBranch")}
              options={branches}
              value={form.branchId}
              onChange={update("branchId")}
              required
            />
          )}
        </div>

        {showValidationError && !isFormValid && (
          <p className="mt-1 text-xs font-medium text-error">
            {t("usersPage.requiredFields")}
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
          saveText={isEditing ? t("usersPage.update") : t("usersPage.save")}
          cancelText={t("usersPage.cancel")}
        />
      </form>
    </PopupCard>
  );
}
