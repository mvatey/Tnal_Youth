// app/auth/forgot-password/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, KeyRound } from "lucide-react";
import TextInput from "@/components/ui/textInput";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] =
  useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();

  const identifier = phoneOrEmail.trim();

  if (!identifier) {
    setError(
      "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល",
    );
    return;
  }

  try {
    setError("");
    setLoading(true);

    const res = await fetch(
      "/api/auth/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail: identifier,
        }),
      },
    );

    const responseText = await res.text();

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

    if (!res.ok) {
      setError(
        data?.message ||
          "មិនអាចផ្ញើលេខកូដ OTP បាន",
      );
      return;
    }

    router.push(
      `/auth/verify-otp?phoneOrEmail=${encodeURIComponent(
        identifier,
      )}`,
    );
  } catch (error) {
    console.error(
      "Forgot password error:",
      error,
    );

    setError(
      "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបាន",
    );
  } finally {
    setLoading(false);
  }
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
            value={phoneOrEmail}
            onChange={(e) =>
              setPhoneOrEmail(e.target.value)
            }
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