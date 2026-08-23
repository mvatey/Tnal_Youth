"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  CircleCheck,
  Info,
} from "lucide-react";

async function requestJson(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

export default function PasswordPage() {
  const params = useParams();

  const memberId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showNew, setShowNew] =
    useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const minimumLength =
    newPassword.length >= 6;

  const passwordsMatch =
    newPassword !== "" &&
    newPassword === confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!newPassword) {
      setError(
        "សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី។",
      );
      return;
    }

    if (!minimumLength) {
      setError(
        "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។",
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "សូមបញ្ជាក់ពាក្យសម្ងាត់ថ្មី។",
      );
      return;
    }

    if (!passwordsMatch) {
      setError(
        "ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នា។",
      );
      return;
    }

    if (!memberId) {
      setError(
        "រកមិនឃើញលេខសម្គាល់សមាជិក។",
      );
      return;
    }

    try {
      setSubmitting(true);

      await requestJson(
        `/members/${memberId}/account/password`,
        {
          method: "PATCH",
          body: JSON.stringify({
            new_password:
              newPassword,
            confirm_password:
              confirmPassword,
          }),
        },
      );

      setSuccess(
        "បានកំណត់ពាក្យសម្ងាត់ថ្មីដោយជោគជ័យ។",
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      console.error(
        "Reset password error:",
        submitError,
      );

      setError(
        submitError?.message ||
          "មិនអាចកំណត់ពាក្យសម្ងាត់ថ្មីបានទេ។",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          ផ្លាស់ប្ដូរពាក្យសម្ងាត់
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          បញ្ចូលពាក្យសម្ងាត់ថ្មី
          និងបញ្ជាក់ពាក្យសម្ងាត់ថ្មី
          ដើម្បីកំណត់ពាក្យសម្ងាត់សម្រាប់សមាជិក។
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
          <PasswordInput
            label="ពាក្យសម្ងាត់ថ្មី"
            value={newPassword}
            onChange={
              setNewPassword
            }
            show={showNew}
            onToggle={() =>
              setShowNew(
                (previous) =>
                  !previous,
              )
            }
          />

          <PasswordInput
            label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
            value={
              confirmPassword
            }
            onChange={
              setConfirmPassword
            }
            show={showConfirm}
            onToggle={() =>
              setShowConfirm(
                (previous) =>
                  !previous,
              )
            }
          />

          {error && (
            <div
              className="
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="
                rounded-lg
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-600
              "
            >
              {success}
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={
                submitting
              }
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
                ? "កំពុងរក្សាទុក..."
                : "រក្សាទុក"}
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
                size={22}
                className="text-orange-500"
              />
            </div>

            <h3 className="text-base font-semibold text-text-primary">
              គន្លឹះសុវត្ថិភាព
            </h3>
          </div>

          <div className="space-y-4">
            <PasswordRule
              valid={
                minimumLength
              }
              text="ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ"
            />

            <PasswordRule
              valid={
                passwordsMatch
              }
              text="ការបញ្ជាក់ពាក្យសម្ងាត់ត្រូវតែដូចពាក្យសម្ងាត់ថ្មី"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
}) {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-text-primary
        "
      >
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
            text-text-secondary
          "
        />

        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder="បញ្ចូលពាក្យសម្ងាត់"
          autoComplete="new-password"
          className="
            h-10
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
            focus:border-secondary
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
            text-text-secondary
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

      <p className="text-sm font-medium text-text-primary">
        {text}
      </p>
    </div>
  );
}