// app/auth/reset-password/page.jsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import PasswordInput from "@/components/ui/passwordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("លេខសម្ងាត់មិនត្រូវគ្នា");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Something went wrong");
      return;
    }

    router.push("/auth/login");
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">
        កំណត់លេខសម្ងាត់ថ្មី
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center">
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <KeyRound size={18} />
          {loading ? "..." : "បញ្ជូន"}
        </button>

        <p className="text-center text-sm text-slate-500 pt-2">
          ត្រឡប់ទៅ{" "}
          <a href="/auth/login" className="text-blue-700 hover:underline">
            ទំព័រចូលប្រើប្រាស់
          </a>
        </p>
      </form>
    </div>
  );
}