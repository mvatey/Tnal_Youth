"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import useCurrentMember from "@/hooks/useCurrentMember";

export default function EmailPage() {
  const { member, refetch } = useCurrentMember();

  const [newEmail, setNewEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmed = newEmail.trim();

    if (!trimmed) {
      setError("សូមបញ្ចូលអ៊ីមែលថ្មី។");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/backend/my-account/email", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_email: trimmed }),
      });

      if (!response.ok) {
        const text = await response.text();
        let body = null;

        if (text) {
          try {
            body = JSON.parse(text);
          } catch {
            body = text;
          }
        }

        const message =
          typeof body === "object"
            ? body?.message || body?.detail || body?.error
            : body;

        throw new Error(message || `Request failed with status ${response.status}`);
      }

      setNewEmail("");
      setSuccess("បានផ្លាស់ប្ដូរអ៊ីមែលដោយជោគជ័យ។");
      await refetch?.();
    } catch (submitError) {
      console.error("Cannot change my email:", submitError);
      setError(submitError.message || "មិនអាចផ្លាស់ប្ដូរអ៊ីមែលបានទេ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          ផ្លាស់ប្ដូរអ៊ីមែល
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          អ៊ីមែលបច្ចុប្បន្ន៖ {member?.email && member.email !== "-" ? member.email : "-"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            អ៊ីមែលថ្មី
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
                outline-none
                transition
                focus:border-primary
              "
            />
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium text-error">{error}</p>
        )}

        {success && (
          <p className="text-sm font-medium text-success">{success}</p>
        )}

        <div className="flex justify-end pt-3">
          <SaveButton type="submit" disabled={submitting}>
            {submitting ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}
