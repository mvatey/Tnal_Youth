"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ShieldCheck } from "lucide-react";

import OtpInput from "@/components/ui/otpInput";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";

function VerifyActivationOtpContent() {
  const router = useRouter();
  const params = useSearchParams();

  const identifierFromUrl =
    params.get("identifier") ||
    params.get("phoneOrEmail") ||
    "";

  const [phoneOrEmail, setPhoneOrEmail] =
    useState(identifierFromUrl);

  const [otp, setOtp] = useState(
    new Array(6).fill("")
  );

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (identifierFromUrl) {
      setPhoneOrEmail(identifierFromUrl);
      return;
    }

    const storedIdentifier =
      sessionStorage.getItem(
        "activationIdentifier"
      );

    if (storedIdentifier) {
      setPhoneOrEmail(storedIdentifier);
    }
  }, [identifierFromUrl]);

  async function parseResponse(response) {
    const responseText =
      await response.text();

    if (!responseText) {
      return {};
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        message: responseText,
      };
    }
  }

  async function handleSubmit() {
    if (loading) {
      return;
    }

    setError("");

    const normalizedIdentifier =
      phoneOrEmail.trim();

    const code = otp.join("");

    if (!normalizedIdentifier) {
      setError(
        "រកមិនឃើញលេខទូរស័ព្ទ ឬអ៊ីមែល"
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "សូមបញ្ចូលលេខកូដឲ្យគ្រប់ ៦ ខ្ទង់"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/activation/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            phoneOrEmail:
              normalizedIdentifier,
            otp: code,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log(
        "Activation OTP response:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        setError(
          khmerErrorMessage(data?.message, "លេខកូដ OTP មិនត្រឹមត្រូវ ឬផុតកំណត់")
        );
        return;
      }

      sessionStorage.setItem(
        "activationIdentifier",
        normalizedIdentifier
      );

      sessionStorage.setItem(
        "activationOtp",
        code
      );

      router.push(
        `/auth/activate-account/set-password?identifier=${encodeURIComponent(
          normalizedIdentifier
        )}`
      );
    } catch (submitError) {
      console.error(
        "Verify activation OTP error:",
        submitError
      );

      setError(
        "មិនអាចផ្ទៀងផ្ទាត់លេខកូដ OTP បានទេ"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (loading) {
      return;
    }

    const normalizedIdentifier =
      phoneOrEmail.trim();

    if (!normalizedIdentifier) {
      setError(
        "រកមិនឃើញលេខទូរស័ព្ទ ឬអ៊ីមែល"
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/activation/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            phoneOrEmail:
              normalizedIdentifier,
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        setError(
          khmerErrorMessage(data?.message, "មិនអាចផ្ញើលេខកូដ OTP ម្តងទៀតបានទេ")
        );
        return;
      }

      setOtp(new Array(6).fill(""));
    } catch (resendError) {
      console.error(
        "Resend activation OTP error:",
        resendError
      );

      setError(
        "មិនអាចផ្ញើលេខកូដ OTP ម្តងទៀតបានទេ"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
        ផ្ទៀងផ្ទាត់គណនី
      </h2>

      <p className="mb-8 text-center text-sm leading-6 text-text-mute">
        យើងបានផ្ញើលេខកូដ OTP ៦ ខ្ទង់
        ទៅកាន់អ៊ីមែល ឬលេខទូរស័ព្ទរបស់អ្នក
        <br />

        {phoneOrEmail && (
          <span className="font-medium text-text-primary">
            {phoneOrEmail}
          </span>
        )}
      </p>

      <div className="space-y-5">
        <OtpInput
          value={otp}
          onChange={setOtp}
        />

        {error && (
          <p className="text-center text-sm text-error">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShieldCheck size={18} />

          {loading
            ? "កំពុងផ្ទៀងផ្ទាត់..."
            : "ផ្ទៀងផ្ទាត់"}
        </button>

        <p className="pt-2 text-center text-sm text-text-mute">
          មិនទាន់ទទួលបានលេខកូដ?{" "}

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading}
            className="text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
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

export default function VerifyActivationOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyActivationOtpContent />
    </Suspense>
  );
}
