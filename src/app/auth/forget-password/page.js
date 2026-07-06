// app/auth/forgot-password/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, KeyRound } from "lucide-react";
import TextInput from "@/components/ui/textInput";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Something went wrong");
      return;
    }

    router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">
        ភ្លេចលេខសម្ងាត់?
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center">
        សូមបញ្ជូលព័ត៌មានលេខទូរស័ព្ទរបស់អ្នក ដើម្បីទទួលបានលេខកូដផ្ទៀងផ្ទាត់
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <TextInput
          label="លេខទូរស័ព្ទប្រើប្រាស់ ឬ អ៊ីមែល"
          icon={User}
          placeholder="បញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <KeyRound size={18} />
          {loading ? "..." : "ស្វែងរកលេខសម្ងាត់?"}
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