// app/auth/forgot-password/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, KeyRound } from "lucide-react";
import TextInput from "@/components/ui/textInput";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phoneOrEmail, setPhoneOrEmail] =
  useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();

  const identifier = phoneOrEmail.trim();

  if (!identifier) {
    setError(
      t("auth.identifierRequired", "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល"),
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
        khmerErrorMessage(data?.message, t("auth.otpSendFailed", "មិនអាចផ្ញើលេខកូដ OTP បាន")),
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
      t("auth.backendUnavailable", "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបាន"),
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">
        {t("auth.forgotTitle", "ភ្លេចលេខសម្ងាត់?")}
      </h2>
      <p className="text-sm text-text-mute mb-8 text-center">
        {t("auth.forgotDescription", "សូមបញ្ជូលព័ត៌មានលេខទូរស័ព្ទរបស់អ្នក ដើម្បីទទួលបានលេខកូដផ្ទៀងផ្ទាត់")}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <TextInput
            label={t("auth.phoneOrEmailUser", "លេខទូរស័ព្ទប្រើប្រាស់ ឬ អ៊ីមែល")}
            icon={User}
            placeholder={t("auth.phoneOrEmailPlaceholder", "បញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល")}
            value={phoneOrEmail}
            onChange={(e) =>
              setPhoneOrEmail(e.target.value)
            }
          />

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <KeyRound size={18} />
          {loading ? "..." : t("auth.findPassword", "ស្វែងរកលេខសម្ងាត់?")}
        </button>

        <p className="text-center text-sm text-text-mute pt-2">
          {t("auth.backTo", "ត្រឡប់ទៅ")}{" "}
          <a href="/auth/login" className="text-blue-700 hover:underline">
            {t("auth.loginPage", "ទំព័រចូលប្រើប្រាស់")}
          </a>
        </p>
      </form>
    </div>
  );
}
