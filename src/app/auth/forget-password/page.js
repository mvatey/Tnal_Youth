"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, KeyRound } from "lucide-react";
import TextInput from "@/components/ui/textInput";




export default function ForgotPasswordPage() {
  const router = useRouter();

  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
function normalizePhoneOrEmail(value) {
  let input = value.trim();

  if (input.includes("@")) {
    return input;
  }

  input = input.replace(/[\s()-]/g, "");

  if (input.startsWith("0")) {
    return "+855" + input.substring(1);
  }

  if (input.startsWith("855")) {
    return "+" + input;
  }

  return input;
}
  async function handleSubmit(e) {
  e.preventDefault();

  setError("");

  let identifier = phoneOrEmail.trim();

  if (!identifier) {
    setError("សូមបញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល");
    return;
  }

  // Normalize phone number
  if (!identifier.includes("@")) {
    // Remove spaces, hyphens and parentheses
    identifier = identifier.replace(/[\s()-]/g, "");

    // 097xxxxxxx -> +85597xxxxxxx
    if (identifier.startsWith("0")) {
      identifier = "+855" + identifier.substring(1);
    }
    // 85597xxxxxxx -> +85597xxxxxxx
    else if (identifier.startsWith("855")) {
      identifier = "+" + identifier;
    }
  }

  console.log("Sending:", identifier);

  try {
    setLoading(true);

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneOrEmail: identifier,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    router.push(
      `/auth/verify-otp?phoneOrEmail=${encodeURIComponent(identifier)}`
    );
  } catch (err) {
    setError(err.message || "Something went wrong");
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
        សូមបញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែលរបស់អ្នក
        ដើម្បីទទួលបានលេខកូដផ្ទៀងផ្ទាត់
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <TextInput
          label="លេខទូរស័ព្ទ ឬ អ៊ីមែល"
          icon={User}
          placeholder="បញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល"
          value={phoneOrEmail}
          onChange={(e) => setPhoneOrEmail(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <KeyRound size={18} />
          {loading ? "..." : "ផ្ញើលេខកូដ"}
        </button>

        <p className="text-center text-sm text-slate-500 pt-2">
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