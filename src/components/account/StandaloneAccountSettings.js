"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";

async function submitJson(path, body) {
  const response = await fetch(path, {
    method: "PATCH",
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

/*
 * The entire self-service page for an account with no linked member
 * record (ADMIN, or a standalone secretary/branch-leader/member account) —
 * there's no member profile to show a card or a details page for, so this
 * is just the two account columns that actually apply: password and
 * email, both on one page, no tabs.
 */
export default function StandaloneAccountSettings({ currentEmail, onEmailChanged }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <PasswordCard />
      <EmailCard currentEmail={currentEmail} onEmailChanged={onEmailChanged} />
    </div>
  );
}

function PasswordCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន។");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នា។");
      return;
    }

    if (oldPassword === newPassword) {
      setError("ពាក្យសម្ងាត់ថ្មីត្រូវខុសពីពាក្យសម្ងាត់បច្ចុប្បន្ន។");
      return;
    }

    try {
      setSubmitting(true);

      await submitJson("/api/backend/my-account/password", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("បានផ្លាស់ប្ដូរពាក្យសម្ងាត់ដោយជោគជ័យ។");
    } catch (submitError) {
      console.error("Cannot change my password:", submitError);
      setError(submitError.message || "មិនអាចផ្លាស់ប្ដូរពាក្យសម្ងាត់បានទេ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-5 rounded-xl border border-border bg-bg-page-white p-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          ផ្លាស់ប្ដូរពាក្យសម្ងាត់
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន និងពាក្យសម្ងាត់ថ្មីរបស់អ្នក។
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
          value={oldPassword}
          onChange={setOldPassword}
          show={showOld}
          setShow={setShowOld}
          autoComplete="current-password"
        />

        <PasswordInput
          label="ពាក្យសម្ងាត់ថ្មី"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          setShow={setShowNew}
          autoComplete="new-password"
        />

        <PasswordInput
          label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
          autoComplete="new-password"
        />

        {error && <p className="text-sm font-medium text-error">{error}</p>}
        {success && <p className="text-sm font-medium text-success">{success}</p>}

        <div className="flex justify-end pt-2">
          <SaveButton type="submit" disabled={submitting}>
            {submitting ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}

function EmailCard({ currentEmail, onEmailChanged }) {
  const [newEmail, setNewEmail] = useState(currentEmail || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // The field starts pre-filled with the account's current email (fetched
  // by the page above) so the admin sees what's on file and can just
  // override the parts that need to change, instead of typing a whole
  // new address blind.
  useEffect(() => {
    setNewEmail(currentEmail || "");
  }, [currentEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmed = newEmail.trim();

    if (!trimmed) {
      setError("សូមបញ្ចូលអ៊ីមែល។");
      return;
    }

    if (trimmed === currentEmail) {
      setError("អ៊ីមែលនេះដូចនឹងអ៊ីមែលបច្ចុប្បន្នរបស់អ្នករួចហើយ។");
      return;
    }

    try {
      setSubmitting(true);

      await submitJson("/api/backend/my-account/email", {
        new_email: trimmed,
      });

      setSuccess("បានផ្លាស់ប្ដូរអ៊ីមែលដោយជោគជ័យ។");
      await onEmailChanged?.();
    } catch (submitError) {
      console.error("Cannot change my email:", submitError);
      setError(submitError.message || "មិនអាចផ្លាស់ប្ដូរអ៊ីមែលបានទេ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-5 rounded-xl border border-border bg-bg-page-white p-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          ផ្លាស់ប្ដូរអ៊ីមែល
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          កែប្រែអ៊ីមែលខាងក្រោម ហើយចុចរក្សាទុកនៅពេលរួចរាល់។
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            អ៊ីមែល
          </label>

          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              size={18}
            />

            <input
              type="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              className="
                h-[34px]
                w-full
                rounded-lg
                border
                border-border
                bg-bg-page-white
                pl-11
                pr-4
                text-sm
                text-text-primary
                outline-none
                transition
                focus:border-primary
              "
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}
        {success && <p className="text-sm font-medium text-success">{success}</p>}

        <div className="flex justify-end pt-2">
          <SaveButton type="submit" disabled={submitting}>
            {submitting ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, setShow, autoComplete }) {
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
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
