// src/app/auth/reset-password/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import PasswordInput from "@/components/ui/passwordInput";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("សូមបញ្ចូលលេខសម្ងាត់ថ្មី");
      return;
    }

    if (password !== confirmPassword) {
      setError("លេខសម្ងាត់មិនត្រូវគ្នា");
      return;
    }

    const phoneOrEmail = sessionStorage.getItem("resetPhoneOrEmail");
    const otp = sessionStorage.getItem("resetOtp");

    if (!phoneOrEmail || !otp) {
      setError(
        "ព័ត៌មានផ្ទៀងផ្ទាត់មិនគ្រប់គ្រាន់ សូមស្នើលេខកូដ OTP ម្តងទៀត"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          otp,
          newPassword: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || "មិនអាចប្តូរលេខសម្ងាត់បានទេ"
        );
      }

      sessionStorage.removeItem("resetPhoneOrEmail");
      sessionStorage.removeItem("resetOtp");

      router.push("/auth/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "មានបញ្ហាក្នុងការភ្ជាប់ទៅម៉ាស៊ីនមេ"
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
        សូមបញ្ចូលលេខសម្ងាត់ថ្មីរបស់អ្នក ដើម្បីបន្តប្រើប្រាស់ប្រព័ន្ធ
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <PasswordInput
          label="លេខសម្ងាត់ថ្មី"
          placeholder="បញ្ចូលលេខសម្ងាត់ថ្មី"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordInput
          label="បញ្ជាក់លេខសម្ងាត់ថ្មី"
          placeholder="បញ្ចូលលេខសម្ងាត់ថ្មីម្តងទៀត"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "កំពុងបញ្ជូន..." : "បញ្ជូន"}
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