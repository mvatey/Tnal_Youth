"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Pencil } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
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
const MODE_REVEALED = "revealed";

const POPUP_REVEAL = "reveal";
const POPUP_EDIT_PASSWORD = "edit_password";
const POPUP_EDIT_NEW = "edit_new";

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
 *
 * The "confirm your own password" step always runs in a popup, and
 * changing the default is a two-step popup (current password, then the
 * new value) rather than one combined form -- mirrors how revealing
 * already asked for the password on its own, so both actions read the
 * same way to an admin instead of edit asking for everything at once.
 */
export default function DefaultPasswordCard() {
  const { t } = useLanguage();

  const [mode, setMode] = useState(MODE_HIDDEN);
  const [popup, setPopup] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newDefaultPassword, setNewDefaultPassword] = useState("");
  const [confirmNewDefaultPassword, setConfirmNewDefaultPassword] = useState("");
  const [revealedValue, setRevealedValue] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const rules = getPasswordRules(newDefaultPassword);

  function closePopup() {
    setPopup(null);
    setCurrentPassword("");
    setNewDefaultPassword("");
    setConfirmNewDefaultPassword("");
    setError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  function openReveal() {
    setSuccessMessage("");
    setError("");
    setPopup(POPUP_REVEAL);
  }

  function openEdit() {
    setSuccessMessage("");
    setError("");
    setPopup(POPUP_EDIT_PASSWORD);
  }

  function resetToHidden() {
    setMode(MODE_HIDDEN);
    setRevealedValue("");
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
      setMode(MODE_REVEALED);
      closePopup();
    } catch (submitError) {
      setError(
        khmerErrorMessage(submitError.message, t("myAccount.passwordChangeFailed")),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinueToNewPassword(event) {
    event.preventDefault();

    setError("");

    if (!currentPassword) {
      setError(t("myAccount.currentPasswordRequired"));
      return;
    }

    setPopup(POPUP_EDIT_NEW);
  }

  async function handleSaveNewPassword(event) {
    event.preventDefault();
    if (submitting) return;

    setError("");

    if (!rules.minimumLength) {
      setError(t("memberPage.passwordMinLength"));
      return;
    }

    if (!rules.hasNumber || !rules.hasSymbol) {
      setError(t("memberPage.passwordRequiresNumberAndSymbol"));
      return;
    }

    if (!confirmNewDefaultPassword) {
      setError(t("memberPage.confirmPasswordRequired"));
      return;
    }

    if (newDefaultPassword !== confirmNewDefaultPassword) {
      setError(t("memberPage.passwordMismatch"));
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
      closePopup();
    } catch (submitError) {
      // Almost every failure at this point is the current password being
      // wrong -- the new value was already validated client-side above --
      // so send them back to that step rather than showing a password
      // error next to fields that aren't the ones at fault.
      setPopup(POPUP_EDIT_PASSWORD);
      setNewDefaultPassword("");
      setConfirmNewDefaultPassword("");
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

      {successMessage && mode === MODE_HIDDEN && (
        <p className="mt-3 text-xs font-medium text-success">{successMessage}</p>
      )}

      {popup === POPUP_REVEAL && (
        <PopupCard size="sm" onClose={closePopup}>
          <form onSubmit={handleReveal} className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {t("myAccount.confirmIdentityTitle")}
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                {t("myAccount.confirmIdentitySubtitle")}
              </p>
            </div>

            <PasswordField
              label={t("myAccount.currentPassword")}
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrentPassword}
              onToggleShow={() => setShowCurrentPassword((value) => !value)}
              autoFocus
            />

            {error && <p className="text-xs font-medium text-error">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closePopup}
                disabled={submitting}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium text-text-secondary transition hover:bg-bg-page-gray disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("memberPage.cancel")}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-9 flex-1 items-center justify-center rounded-lg bg-secondary text-sm font-medium text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? t("common.saving") : t("myAccount.reveal")}
              </button>
            </div>
          </form>
        </PopupCard>
      )}

      {popup === POPUP_EDIT_PASSWORD && (
        <PopupCard size="sm" onClose={closePopup}>
          <form onSubmit={handleContinueToNewPassword} className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {t("myAccount.confirmIdentityTitle")}
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                {t("myAccount.confirmIdentitySubtitle")}
              </p>
            </div>

            <PasswordField
              label={t("myAccount.currentPassword")}
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrentPassword}
              onToggleShow={() => setShowCurrentPassword((value) => !value)}
              autoFocus
            />

            {error && <p className="text-xs font-medium text-error">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closePopup}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium text-text-secondary transition hover:bg-bg-page-gray"
              >
                {t("memberPage.cancel")}
              </button>

              <button
                type="submit"
                className="flex h-9 flex-1 items-center justify-center rounded-lg bg-secondary text-sm font-medium text-white transition hover:bg-secondary-hover"
              >
                {t("common.next")}
              </button>
            </div>
          </form>
        </PopupCard>
      )}

      {popup === POPUP_EDIT_NEW && (
        <PopupCard size="sm" onClose={closePopup}>
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {t("myAccount.setNewDefaultPasswordTitle")}
              </h2>
            </div>

            <PasswordField
              label={t("myAccount.newDefaultPassword")}
              value={newDefaultPassword}
              onChange={setNewDefaultPassword}
              show={showNewPassword}
              onToggleShow={() => setShowNewPassword((value) => !value)}
              autoComplete="new-password"
              autoFocus
            />

            <PasswordField
              label={t("myAccount.confirmNewDefaultPassword")}
              value={confirmNewDefaultPassword}
              onChange={setConfirmNewDefaultPassword}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword((value) => !value)}
              autoComplete="new-password"
            />

            {error && <p className="text-xs font-medium text-error">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setPopup(POPUP_EDIT_PASSWORD);
                }}
                disabled={submitting}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium text-text-secondary transition hover:bg-bg-page-gray disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("myAccount.back")}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-9 flex-1 items-center justify-center rounded-lg bg-secondary text-sm font-medium text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </form>
        </PopupCard>
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
  autoFocus = false,
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
          autoFocus={autoFocus}
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
