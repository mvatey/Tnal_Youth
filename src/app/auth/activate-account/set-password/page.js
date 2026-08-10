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
import {
  CheckCircle2,
  KeyRound,
} from "lucide-react";

import PasswordInput from "@/components/ui/passwordInput";

function SetActivationPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();

  const identifierFromUrl =
    params.get("identifier") ||
    params.get("phoneOrEmail") ||
    "";

  const [phoneOrEmail, setPhoneOrEmail] =
    useState(identifierFromUrl);

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const storedIdentifier =
      sessionStorage.getItem(
        "activationIdentifier"
      );

    const storedOtp =
      sessionStorage.getItem(
        "activationOtp"
      );

    setPhoneOrEmail(
      identifierFromUrl ||
        storedIdentifier ||
        ""
    );

    setOtp(storedOtp || "");
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

  function validateForm() {
    if (!phoneOrEmail.trim()) {
      return "រកមិនឃើញលេខទូរស័ព្ទ ឬអ៊ីមែល";
    }

    if (!/^\d{6}$/.test(otp)) {
      return "លេខកូដ OTP មិនត្រឹមត្រូវ";
    }

    if (!newPassword) {
      return "សូមបញ្ចូលលេខសម្ងាត់ថ្មី";
    }

    if (newPassword.length < 6) {
      return "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ";
    }

    if (newPassword !== confirmPassword) {
      return "លេខសម្ងាត់ទាំងពីរមិនដូចគ្នា";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/activation/set-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            phoneOrEmail:
              phoneOrEmail.trim(),
            otp,
            newPassword,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log(
        "Set activation password response:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        setError(
          data?.message ||
            "មិនអាចកំណត់លេខសម្ងាត់បានទេ"
        );
        return;
      }

      sessionStorage.removeItem(
        "activationIdentifier"
      );

      sessionStorage.removeItem(
        "activationOtp"
      );

      router.replace(
        `/auth/login?identifier=${encodeURIComponent(
            phoneOrEmail.trim()
        )}&step=password&activated=true`
        );
    } catch (submitError) {
      console.error(
        "Set activation password error:",
        submitError
      );

      setError(
        "មានបញ្ហាកើតឡើង សូមព្យាយាមម្តងទៀត"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
        បង្កើតលេខសម្ងាត់
      </h2>

      <p className="mb-8 text-center text-sm leading-6 text-slate-500">
        សូមបង្កើតលេខសម្ងាត់សម្រាប់គណនីរបស់អ្នក
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5"
        noValidate
      >
        <PasswordInput
          label="លេខសម្ងាត់"
          placeholder="បញ្ចូលលេខសម្ងាត់"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setError("");
          }}
          icon={KeyRound}
        />

        <PasswordInput
          label="បញ្ជាក់លេខសម្ងាត់"
          placeholder="បញ្ចូលលេខសម្ងាត់ម្តងទៀត"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setError("");
          }}
          icon={KeyRound}
        />

        {error && (
          <p className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 size={18} />

          {loading
            ? "កំពុងកំណត់..."
            : "បញ្ជាក់លេខសម្ងាត់"}
        </button>

        <p className="pt-2 text-center text-sm text-slate-500">
          ត្រឡប់ទៅ{" "}

          <a
            href="/auth/login"
            className="text-blue-700 hover:underline"
          >
            ចូលប្រើប្រាស់
          </a>
        </p>
      </form>
    </div>
  );
}

export default function SetActivationPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetActivationPasswordContent />
    </Suspense>
  );
}
