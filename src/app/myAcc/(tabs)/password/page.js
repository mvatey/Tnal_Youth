"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CircleCheck,
  Info,
} from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";
import { useLanguage } from "@/context/LanguageContext";

function validatePassword(password) {
  return {
    minimumLength: password.length >= 6,
  };
}

export default function PasswordPage() {
  const { t } = useLanguage();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rules = validatePassword(newPassword);
  const passwordsMatch =
    newPassword !== "" &&
    newPassword === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError(t("myAccount.currentPasswordRequired"));
      return;
    }

    if (!newPassword) {
      setError(t("memberPage.passwordRequired"));
      return;
    }

    if (!rules.minimumLength) {
      setError(t("memberPage.passwordMinLength"));
      return;
    }

    if (!confirmPassword) {
      setError(t("memberPage.confirmPasswordRequired"));
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

      const response = await fetch(
        "/api/backend/my-account/password",
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
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
            ? body?.message ||
              body?.detail ||
              body?.error
            : body;

        throw new Error(
          khmerErrorMessage(message, `សំណើមិនបានសម្រេច (${response.status})`),
        );
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(t("myAccount.passwordChanged"));
    } catch (submitError) {
      console.error("Cannot change my password:", submitError);
      setError(
        khmerErrorMessage(
          submitError.message,
          t("myAccount.passwordChangeFailed"),
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          {t("memberPage.passwordTitle")}
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          {t("myAccount.passwordDescription")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="
          grid
          grid-cols-1
          gap-8
          xl:grid-cols-[1fr_360px]
        "
      >
        <div className="space-y-5">
          <BoxFill
            label={t("myAccount.currentPassword")}
            value={oldPassword}
            onChange={setOldPassword}
            show={showOld}
            setShow={setShowOld}
            autoComplete="current-password"
          />

          <BoxFill
            label={t("memberPage.newPassword")}
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            setShow={setShowNew}
            autoComplete="new-password"
          />

          <BoxFill
            label={t("memberPage.confirmNewPassword")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            setShow={setShowConfirm}
            autoComplete="new-password"
          />

          {error && (
            <p className="text-sm font-medium text-error">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm font-medium text-success">
              {success}
            </p>
          )}

          <div className="flex justify-end pt-3">
            <SaveButton
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? t("common.saving")
                : t("common.save")}
            </SaveButton>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-warning bg-bg-page-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-bg">
              <Info
                className="text-warning"
                size={22}
              />
            </div>

            <h3 className="text-base font-semibold text-text-primary">
              {t("memberPage.safetyTips")}
            </h3>
          </div>

          <div className="space-y-4">
            <Rule valid={rules.minimumLength} />
            <Rule
              valid={passwordsMatch}
              text={t("memberPage.passwordRuleMatch")}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

function BoxFill({
  label,
  value,
  onChange,
  show,
  setShow,
  autoComplete,
}) {
  const { t } = useLanguage();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <div className="relative">
        <Lock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
          size={18}
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("memberPage.passwordPlaceholder")}
          autoComplete={autoComplete}
          className="
            h-[34px]
            w-full
            rounded-lg
            border
            border-border
            bg-bg-page-white
            pl-11
            pr-11
            text-sm
            text-text-primary
            outline-none
            transition
            focus:border-primary
          "
        />

        <button
          type="button"
          onClick={() => setShow((previous) => !previous)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-label={show ? t("myAccount.hidePassword") : t("myAccount.showPassword")}
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

function Rule({
  valid,
  text,
}) {
  const { t } = useLanguage();
  const displayText = text || t("memberPage.passwordRuleLength");

  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          border
          ${
            valid
              ? "border-success bg-success-bg"
              : "border-warning"
          }
        `}
      >
        <CircleCheck
          size={14}
          className={
            valid
              ? "text-success"
              : "text-warning"
          }
        />
      </div>

      <p className="text-sm font-medium text-text-primary">
        {displayText}
      </p>
    </div>
  );
}
