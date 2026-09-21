"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

import PasswordInput from "@/components/ui/passwordInput";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";
import { getPasswordRules, isPasswordValid } from "@/lib/validatePassword";
import { getRoleHomePath } from "@/lib/navigation";

// Reached only via MustChangePasswordGate, for a member-linked account
// still on the shared default password (see
// PasswordPolicy.DEFAULT_MEMBER_PASSWORD /
// MemberServiceImpl.createActiveUserAccount). They already know that
// password from having just logged in with it, so this reuses the normal
// self-service change-password endpoint (old + new + confirm) rather than
// a separate unauthenticated flow -- the account is already fully logged
// in, just gated everywhere else until this is done.
export default function ForcePasswordChangePage() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rules = getPasswordRules(newPassword);
  const passwordsMatch =
    newPassword !== "" && newPassword === confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    if (!oldPassword) {
      setError(t("auth.currentPasswordRequired", "សូមបញ្ចូលលេខសម្ងាត់បច្ចុប្បន្ន"));
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError(t("memberPage.passwordRequirementsNotMet"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("memberPage.passwordMismatch"));
      return;
    }

    if (oldPassword === newPassword) {
      setError(t("myAccount.passwordMustBeDifferent"));
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/backend/my-account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
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
          khmerErrorMessage(message, t("myAccount.passwordChangeFailed")),
        );
      }

      const refreshedUser = await refreshUser();

      window.location.assign(getRoleHomePath(refreshedUser || user));
    } catch (submitError) {
      console.error("Force password change error:", submitError);

      setError(
        submitError?.message || t("myAccount.passwordChangeFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
        {t("auth.forcePasswordChangeTitle", "សូមកំណត់លេខសម្ងាត់ថ្មី")}
      </h2>

      <p className="mb-8 text-center text-sm leading-6 text-text-mute">
        {t(
          "auth.forcePasswordChangeDescription",
          "គណនីរបស់អ្នកកំពុងប្រើលេខសម្ងាត់ដើម។ សូមកំណត់លេខសម្ងាត់ថ្មីមុននឹងបន្ត។",
        )}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
        <PasswordInput
          label={t("myAccount.currentPassword", "លេខសម្ងាត់បច្ចុប្បន្ន")}
          placeholder={t("auth.passwordPlaceholder", "បញ្ចូលលេខសម្ងាត់")}
          autoComplete="current-password"
          value={oldPassword}
          onChange={(event) => {
            setOldPassword(event.target.value);
            setError("");
          }}
          icon={KeyRound}
        />

        <PasswordInput
          label={t("memberPage.newPassword", "លេខសម្ងាត់ថ្មី")}
          placeholder={t("auth.passwordPlaceholder", "បញ្ចូលលេខសម្ងាត់")}
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setError("");
          }}
          icon={KeyRound}
        />

        <PasswordInput
          label={t("memberPage.confirmNewPassword", "បញ្ជាក់លេខសម្ងាត់ថ្មី")}
          placeholder={t("auth.confirmPasswordPlaceholder", "បញ្ចូលលេខសម្ងាត់ម្តងទៀត")}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setError("");
          }}
          icon={KeyRound}
        />

        <div className="space-y-2 rounded-lg border border-border bg-bg-page-white p-4 text-sm">
          <PasswordRule
            valid={rules.minimumLength}
            text={t("memberPage.passwordRuleLength")}
          />
          <PasswordRule
            valid={rules.hasNumber}
            text={t("memberPage.passwordRuleNumber")}
          />
          <PasswordRule
            valid={rules.hasSymbol}
            text={t("memberPage.passwordRuleSymbol")}
          />
          <PasswordRule
            valid={passwordsMatch}
            text={t("memberPage.passwordRuleMatch")}
          />
        </div>

        {error && (
          <p className="text-center text-sm text-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShieldCheck size={18} />

          {submitting
            ? t("auth.settingPassword", "កំពុងកំណត់...")
            : t("auth.confirmPasswordButton", "បញ្ជាក់លេខសម្ងាត់")}
        </button>
      </form>
    </div>
  );
}

function PasswordRule({ valid, text }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          valid ? "bg-success" : "bg-border"
        }`}
      />
      <p className={valid ? "text-text-primary" : "text-text-mute"}>
        {text}
      </p>
    </div>
  );
}
