// app/auth/reset-password/page.jsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";

import PasswordInput from "@/components/ui/passwordInput";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();

  const phoneOrEmail = params.get("phoneOrEmail");
  const otp = params.get("otp");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!phoneOrEmail || !otp) {
      setError(
        "រកមិនឃើញព័ត៌មានសម្រាប់កំណត់លេខសម្ងាត់ឡើងវិញ",
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError("សូមបញ្ចូលលេខសម្ងាត់ថ្មី");
      return;
    }

    if (password !== confirmPassword) {
      setError("លេខសម្ងាត់មិនត្រូវគ្នា");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneOrEmail,
            otp,
            newPassword: password,
          }),
        },
      );

      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            message: responseText,
          };
        }
      }

      if (!response.ok) {
        setError(
          data?.message ||
            data?.error ||
            "មិនអាចកំណត់លេខសម្ងាត់ថ្មីបាន",
        );
        return;
      }

      router.replace("/auth/login");
    } catch (submitError) {
      console.error(
        "Reset password error:",
        submitError,
      );

      setError(
        "មិនអាចកំណត់លេខសម្ងាត់ថ្មីបាន",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
        កំណត់លេខសម្ងាត់ថ្មី
      </h2>

      <p className="mb-8 text-center text-sm text-slate-500">
        សូមបញ្ចូលលេខសម្ងាត់ថ្មីរបស់អ្នក
        ដើម្បីបន្តប្រើប្រាស់ប្រព័ន្ធ
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5"
      >
        <PasswordInput
          label="លេខសម្ងាត់ថ្មី"
          placeholder="បញ្ចូលលេខសម្ងាត់ថ្មី"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
        />

        <PasswordInput
          label="បញ្ជាក់លេខសម្ងាត់ថ្មី"
          placeholder="បញ្ចូលលេខសម្ងាត់ថ្មីម្តងទៀត"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <KeyRound size={18} />

          {loading ? "..." : "បញ្ជូន"}
        </button>

        <p className="pt-2 text-center text-sm text-slate-500">
          ត្រឡប់ទៅ{" "}
          <a
            href="/auth/login"
            className="text-blue-700 hover:underline"
          >
            ទំព័រចូលប្រើប្រាស់
          </a>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}