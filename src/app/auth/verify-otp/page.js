// app/auth/verify-otp/page.jsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import OtpInput from "@/components/ui/otpInput";

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone");

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("សូមបញ្ចូលលេខកូដឲ្យគ្រប់ ៦ ខ្ទង់");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "លេខកូដមិនត្រឹមត្រូវ");
      return;
    }

    const { resetToken } = await res.json();
    router.push(`/auth/reset-password?token=${resetToken}`);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">
        ផ្ទៀងផ្ទាត់លេខកូដ
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center">
        យើងបានផ្ញើលេខកូដ ៦ ខ្ទង់ទៅកាន់អ៊ីមែល/លេខទូរស័ព្ទរបស់អ្នក
        <br />
        សូមពិនិត្យមើលសារនោះ
      </p>

      <div className="space-y-5">
        <OtpInput value={otp} onChange={setOtp} />

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShieldCheck size={18} />
          {loading ? "..." : "ផ្ទៀងផ្ទាត់"}
        </button>

        <p className="text-center text-sm text-slate-500 pt-2">
          មិនទាន់ទទួលបានលេខកូដ?{" "}
          <button className="text-blue-700 hover:underline">ផ្ញើម្តងទៀត</button>
          <br />
          ត្រឡប់ទៅ{" "}
          <a href="/auth/login" className="text-blue-700 hover:underline">
            ចូលប្រើប្រាស់
          </a>
        </p>
      </div>
    </div>
  );
}