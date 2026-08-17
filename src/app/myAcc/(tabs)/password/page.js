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

function validatePassword(password) {
  return {
    minimumLength: password.length >= 6,
  };
}

export default function PasswordPage() {
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
      setError("សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន។");
      return;
    }

    if (!newPassword) {
      setError("សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី។");
      return;
    }

    if (!rules.minimumLength) {
      setError("ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។");
      return;
    }

    if (!passwordsMatch) {
      setError("ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នា។");
      return;
    }

    if (oldPassword === newPassword) {
      setError("ពាក្យសម្ងាត់ថ្មីត្រូវខុសពីពាក្យសម្ងាត់បច្ចុប្បន្ន។");
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
          message ||
            `Request failed with status ${response.status}`,
        );
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("បានផ្លាស់ប្ដូរពាក្យសម្ងាត់ដោយជោគជ័យ។");
    } catch (submitError) {
      console.error("Cannot change my password:", submitError);
      setError(
        submitError.message ||
          "មិនអាចផ្លាស់ប្ដូរពាក្យសម្ងាត់បានទេ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          ផ្លាស់ប្ដូរពាក្យសម្ងាត់
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន និងពាក្យសម្ងាត់ថ្មីរបស់អ្នក។
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
            label="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
            value={oldPassword}
            onChange={setOldPassword}
            show={showOld}
            setShow={setShowOld}
            autoComplete="current-password"
          />

          <BoxFill
            label="ពាក្យសម្ងាត់ថ្មី"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            setShow={setShowNew}
            autoComplete="new-password"
          />

          <BoxFill
            label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
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
                ? "កំពុងរក្សាទុក..."
                : "រក្សាទុក"}
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
              គន្លឹះសុវត្ថិភាព
            </h3>
          </div>

          <div className="space-y-4">
            <Rule valid={rules.minimumLength} />
            <Rule
              valid={passwordsMatch}
              text="ការបញ្ជាក់ពាក្យសម្ងាត់ត្រូវតែដូចពាក្យសម្ងាត់ថ្មី"
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
          placeholder="បញ្ចូលពាក្យសម្ងាត់"
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
            outline-none
            transition
            focus:border-primary
          "
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
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
  text = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ",
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
        {text}
      </p>
    </div>
  );
}
