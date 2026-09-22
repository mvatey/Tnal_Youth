"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Pencil } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";
import { getPasswordRules } from "@/lib/validatePassword";

async function submitJson(path, method, body) {
  const response = await fetch(path, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object"
        ? parsed?.message || parsed?.detail || parsed?.error
        : parsed;

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return parsed;
}

const MODE_HIDDEN = "hidden";
const MODE_CONFIRM_REVEAL = "confirm_reveal";
const MODE_REVEALED = "revealed";
const MODE_CONFIRM_EDIT = "confirm_edit";

/*
 * ADMIN-only card for the shared default password every new member-linked
 * account starts with (see backend SystemSettingsService, which replaced
 * the old hardcoded PasswordPolicy.DEFAULT_MEMBER_PASSWORD constant).
 *
 * Both revealing and changing it require the ADMIN'S OWN current login
 * password, not the default value itself -- confirming with a system
 * setting nobody actually memorizes would risk an unrecoverable lockout
 * if forgotten. Re-proving your own identity works the same regardless
 * of how many admin accounts exist, since it's never a shared secret.
 */
export default function DefaultPasswordCard() {
  const { t } = useLanguage();

  const [mode, setMode] = useState(MODE_HIDDEN);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newDefaultPassword, setNewDefaultPassword] = useState("");
  const [revealedValue, setRevealedValue] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const rules = getPasswordRules(newDefaultPassword);

  function resetToHidden() {
    setMode(MODE_HIDDEN);
    setCurrentPassword("");
    setNewDefaultPassword("");
    setRevealedValue("");
    setError("");
  }

  function openReveal() {
    setSuccessMessage("");
    setError("");
    setMode(MODE_CONFIRM_REVEAL);
  }

  function openEdit() {
    setSuccessMessage("");
    setError("");
    setMode(MODE_CONFIRM_EDIT);
  }

  async function handleReveal(event) {
    event.preventDefault();
    if (submitting) return;

    setError("");

    if (!currentPassword) {
      setError(t("myAccount.currentPasswordRequired"));
      return;
    }

    try {
      setSubmitting(true);

      const body = await submitJson(
        "/api/backend/admin/settings/default-member-password/reveal",
        "POST",
        { current_password: currentPassword },
      );

      setRevealedValue(body?.default_password || "");
      setCurrentPassword("");
      setMode(MODE_REVEALED);
    } catch (submitError) {
      setError(
        khmerErrorMessage(submitError.message, t("myAccount.passwordChangeFailed")),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (submitting) return;

    setError("");

    if (!currentPassword) {
      setError(t("myAccount.currentPasswordRequired"));
      return;
    }

    if (!rules.minimumLength) {
      setError(t("memberPage.passwordMinLength"));
      return;
    }

    if (!rules.hasNumber || !rules.hasSymbol) {
      setError(t("memberPage.passwordRequiresNumberAndSymbol"));
      return;
    }

    try {
      setSubmitting(true);

      await submitJson(
        "/api/backend/admin/settings/default-member-password",
        "PATCH",
        {
          current_password: currentPassword,
          new_default_password: newDefaultPassword,
        },
      );

      setSuccessMessage(t("myAccount.defaultPasswordUpdated"));
      resetToHidden();
    } catch (submitError) {
      setError(
        khmerErrorMessage(submitError.message, t("myAccount.passwordChangeFailed")),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-bg-page-white p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light">
          <KeyRound size={20} className="text-primary" />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-primary">
            {t("myAccount.defaultPasswordTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            {t("myAccount.defaultPasswordDescription")}
          </p>
        </div>
      </div>

      {mode === MODE_HIDDEN && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-page-gray px-4 py-2.5">
          <span className="font-mono text-sm tracking-widest text-text-secondary">
            ••••••••
          </span>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openReveal}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-page-white px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-bg-page-gray"
            >
              <Eye size={14} />
              {t("myAccount.reveal")}
            </button>

            <button
              type="button"
              onClick={openEdit}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-secondary-hover"
            >
              <Pencil size={14} />
              {t("myAccount.edit")}
            </button>
          </div>
        </div>
      )}

      {mode === MODE_REVEALED && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-page-gray px-4 py-2.5">
          <span className="font-mono text-sm font-semibold text-text-primary">
            {revealedValue}
          </span>

          <button
            type="button"
            onClick={resetToHidden}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-bg-page-white px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-bg-page-gray"
          >
            <EyeOff size={14} />
            {t("myAccount.hide")}
          </button>
        </div>
      )}

      {mode === MODE_CONFIRM_REVEAL && (
        <form onSubmit={handleReveal} className="space-y-3">
          <PasswordField
            label={t("myAccount.currentPassword")}
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword((value) => !value)}
          />

          {error && <p className="text-xs font-medium text-error">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("common.saving") : t("myAccount.reveal")}
            </button>

            <button
              type="button"
              onClick={resetToHidden}
              disabled={submitting}
              className="flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-text-secondary transition hover:bg-bg-page-gray disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("memberPage.cancel")}
            </button>
          </div>
        </form>
      )}

      {mode === MODE_CONFIRM_EDIT && (
        <form onSubmit={handleUpdate} className="space-y-3">
          <PasswordField
            label={t("myAccount.currentPassword")}
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword((value) => !value)}
          />

          <PasswordField
            label={t("myAccount.newDefaultPassword")}
            value={newDefaultPassword}
            onChange={setNewDefaultPassword}
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword((value) => !value)}
            autoComplete="new-password"
          />

          {error && <p className="text-xs font-medium text-error">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("common.saving") : t("common.save")}
            </button>

            <button
              type="button"
              onClick={resetToHidden}
              disabled={submitting}
              className="flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-text-secondary transition hover:bg-bg-page-gray disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("memberPage.cancel")}
            </button>
          </div>
        </form>
      )}

      {successMessage && mode === MODE_HIDDEN && (
        <p className="mt-3 text-xs font-medium text-success">{successMessage}</p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete = "current-password",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-primary">
        {label}
      </span>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="h-9 w-full rounded-lg border border-border bg-bg-page-white px-3 pr-9 text-sm text-text-primary outline-none transition focus:border-primary"
        />

        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </label>
  );
}
