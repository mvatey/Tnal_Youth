"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CircleCheck,
  Info,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PasswordForm({
  onSubmit,
  submitting = false,
}) {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const minimumLength =
    newPassword.length >= 6;

  const passwordsMatch =
    newPassword !== "" &&
    newPassword === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!newPassword) {
      setError(
        t("memberPage.passwordRequired"),
      );
      return;
    }

    if (!minimumLength) {
      setError(
        t("memberPage.passwordMinLength"),
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        t("memberPage.confirmPasswordRequired"),
      );
      return;
    }

    if (!passwordsMatch) {
      setError(
        t("memberPage.passwordMismatch"),
      );
      return;
    }

    try {
      await onSubmit?.({
        newPassword,
        confirmPassword,
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError?.message ||
          t("memberPage.passwordSaveFailed"),
      );
    }
  };

  return (
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
        <PasswordInput
          label={t("memberPage.newPassword")}
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPassword}
          onToggle={() =>
            setShowNewPassword(
              (previous) => !previous,
            )
          }
        />

        <PasswordInput
          label={t("memberPage.confirmNewPassword")}
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          onToggle={() =>
            setShowConfirmPassword(
              (previous) => !previous,
            )
          }
        />

        {error && (
          <p className="text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="
              min-w-[120px]
              rounded-lg
              bg-[#5533a5]
              px-6
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting
              ? t("common.saving")
              : t("common.save")}
          </button>
        </div>
      </div>

      <div
        className="
          h-fit
          rounded-xl
          border
          border-orange-400
          bg-white
          p-5
        "
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-orange-100
            "
          >
            <Info
              className="text-orange-500"
              size={22}
            />
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            {t("memberPage.safetyTips")}
          </h3>
        </div>

        <div className="space-y-4">
          <PasswordRule
            valid={minimumLength}
            text={t("memberPage.passwordRuleLength")}
          />

          <PasswordRule
            valid={passwordsMatch}
            text={t("memberPage.passwordRuleMatch")}
          />
        </div>
      </div>
    </form>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
}) {
  const { t } = useLanguage();
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-900">
        {label}
      </label>

      <div className="relative">
        <Lock
          size={18}
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-500
          "
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={t("memberPage.passwordPlaceholder")}
          autoComplete="new-password"
          className="
            h-10
            w-full
            rounded-lg
            border
            border-slate-300
            bg-white
            pl-11
            pr-11
            text-sm
            outline-none
            transition
            focus:border-[#5533a5]
          "
        />

        <button
          type="button"
          onClick={onToggle}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-slate-500
          "
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

function PasswordRule({
  valid,
  text,
}) {
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
              ? "border-green-500 bg-green-50"
              : "border-orange-400"
          }
        `}
      >
        <CircleCheck
          size={14}
          className={
            valid
              ? "text-green-500"
              : "text-orange-500"
          }
        />
      </div>

      <p className="text-sm font-medium text-slate-900">
        {text}
      </p>
    </div>
  );
}
