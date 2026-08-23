"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CircleCheck,
  Info,
} from "lucide-react";

export default function PasswordForm({
  onSubmit,
  submitting = false,
}) {
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
          "មិនអាចកំណត់ពាក្យសម្ងាត់ថ្មីបានទេ។",
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
          label="ពាក្យសម្ងាត់ថ្មី"
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
          label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
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
              className="text-orange-500"
              size={22}
            />
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            គន្លឹះសុវត្ថិភាព
          </h3>
        </div>

        <div className="space-y-4">
          <PasswordRule
            valid={minimumLength}
            text="ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ"
          />

          <PasswordRule
            valid={passwordsMatch}
            text="ការបញ្ជាក់ពាក្យសម្ងាត់ត្រូវតែដូចពាក្យសម្ងាត់ថ្មី"
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
          placeholder="បញ្ចូលពាក្យសម្ងាត់"
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