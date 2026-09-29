// app/auth/forgot-password/page.jsx
"use client";
import { LifeBuoy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/*
 * Was a phone/email + OTP self-service flow. Replaced (for now -- see
 * CreateMemberModal/CreateUserModal's "none" contact method) since an
 * account can now be created with neither a phone nor an email, which
 * OTP delivery has no way to reach. Rather than branching this page on
 * whether THIS account happens to have one (impossible to know before
 * they've identified themselves at all), every account is pointed at
 * staff instead -- simpler, and already true today for anyone whose
 * phone/email is stale or was never verified.
 */
export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">
        {t("auth.forgotTitle", "ភ្លេចលេខសម្ងាត់?")}
      </h2>

      <p className="text-sm text-text-mute mb-8 text-center">
        {t(
          "auth.forgotContactStaffDescription",
          "សម្រាប់ការកំណត់ពាក្យសម្ងាត់ឡើងវិញ សូមទាក់ទងអ្នកគ្រប់គ្រង ប្រធានសាខា ឬលេខាធិការនៃសាខារបស់អ្នក។",
        )}
      </p>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-page-gray px-4 py-4">
        <LifeBuoy size={22} className="shrink-0 text-primary" />

        <p className="text-sm text-text-primary">
          {t(
            "auth.forgotContactStaffDetail",
            "ពួកគេអាចកំណត់ពាក្យសម្ងាត់ថ្មីជូនអ្នកដោយផ្ទាល់ពីគណនីគ្រប់គ្រង។",
          )}
        </p>
      </div>

      <p className="text-center text-sm text-text-mute pt-6">
        {t("auth.backTo", "ត្រឡប់ទៅ")}{" "}
        <a href="/auth/login" className="text-blue-700 hover:underline">
          {t("auth.loginPage", "ទំព័រចូលប្រើប្រាស់")}
        </a>
      </p>
    </div>
  );
}
