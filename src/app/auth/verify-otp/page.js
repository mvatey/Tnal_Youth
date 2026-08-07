"use client";

import { Suspense, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ShieldCheck } from "lucide-react";

import OtpInput from "@/components/ui/otpInput";

function VerifyOtpContent() {
  const router = useRouter();
  const params = useSearchParams();

  const phoneOrEmail =
    params.get("phoneOrEmail") ||
    params.get("phone") ||
    params.get("email") ||
    "";

  const [otp, setOtp] = useState(
    new Array(6).fill(""),
  );

  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");

    const code = otp.join("");

    if (!phoneOrEmail) {
      setError(
        "រកមិនឃើញលេខទូរស័ព្ទ ឬអ៊ីមែល",
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "សូមបញ្ចូលលេខកូដឲ្យគ្រប់ ៦ ខ្ទង់",
      );
      return;
    }

    sessionStorage.setItem(
      "forgotPasswordData",
      JSON.stringify({
        phoneOrEmail,
        otp: code,
      }),
    );

    router.push("/auth/reset-password");
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
        ផ្ទៀងផ្ទាត់លេខកូដ
      </h2>

      <p className="mb-8 text-center text-sm text-slate-500">
        យើងបានផ្ញើលេខកូដ ៦ ខ្ទង់ទៅកាន់អ៊ីមែល
        ឬលេខទូរស័ព្ទរបស់អ្នក
        <br />
        សូមពិនិត្យមើលសារនោះ
      </p>

      <div className="space-y-5">
        <OtpInput
          value={otp}
          onChange={setOtp}
        />

        {error && (
          <p className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ShieldCheck size={18} />
          ផ្ទៀងផ្ទាត់
        </button>

        <p className="pt-2 text-center text-sm text-slate-500">
          មិនទាន់ទទួលបានលេខកូដ?{" "}
          <button
            type="button"
            className="text-blue-700 hover:underline"
          >
            ផ្ញើម្តងទៀត
          </button>

          <br />

          ត្រឡប់ទៅ{" "}
          <a
            href="/auth/login"
            className="text-blue-700 hover:underline"
          >
            ចូលប្រើប្រាស់
          </a>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  );
}