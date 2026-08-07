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
  ArrowLeft,
  LogIn,
  User,
} from "lucide-react";

import TextInput from "@/components/ui/textInput";
import PasswordInput from "@/components/ui/passwordInput";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath } from "@/lib/navigation";

const LOGIN_STEP = {
  IDENTIFIER: "IDENTIFIER",
  PASSWORD: "PASSWORD",
};

const REMEMBERED_EMAIL_KEY = "tnal-auth:remembered-email";

async function parseResponse(response) {
  const responseText = await response.text();

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const identifierFromUrl =
    searchParams.get("identifier") || "";

  const stepFromUrl =
    searchParams.get("step") || "";

  const activated =
    searchParams.get("activated") === "true";

  const redirectPath =
    searchParams.get("redirect") || "";

  const [step, setStep] = useState(
    LOGIN_STEP.IDENTIFIER
  );

  const [
    phoneOrEmail,
    setPhoneOrEmail,
  ] = useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

    useEffect(() => {
  try {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);

    if (rememberedEmail) {
      setPhoneOrEmail(rememberedEmail);
      setRememberMe(true);
    }
  } catch (error) {
    console.error("Cannot load remembered email:", error);
  }
}, []);

  useEffect(() => {
    if (identifierFromUrl) {
      setPhoneOrEmail(identifierFromUrl);
    }

    if (
      stepFromUrl.toLowerCase() ===
      "password"
    ) {
      setStep(LOGIN_STEP.PASSWORD);
    }

    if (activated) {
      setError("");

      setSuccessMessage(
        "គណនីរបស់អ្នកត្រូវបានបើកដំណើរការរួចរាល់។ សូមបញ្ចូលលេខសម្ងាត់ដើម្បីចូលប្រើប្រាស់"
      );
    }
  }, [
    identifierFromUrl,
    stepFromUrl,
    activated,
  ]);

  async function sendActivationOtp(
    normalizedLogin
  ) {
    try {
      console.log(
        "=== SEND ACTIVATION OTP ==="
      );

      console.log(
        "Identifier:",
        normalizedLogin
      );

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
              normalizedLogin,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log(
        "Send OTP response:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        setError(
          data?.message ||
            data?.data?.message ||
            "មិនអាចផ្ញើលេខកូដ OTP បានទេ"
        );

        return false;
      }

      sessionStorage.setItem(
        "activationIdentifier",
        normalizedLogin
      );

      router.push(
        `/auth/activate-account/verify-otp?identifier=${encodeURIComponent(
          normalizedLogin
        )}`
      );

      return true;
    } catch (sendOtpError) {
      console.error(
        "Send activation OTP error:",
        sendOtpError
      );

      setError(
        "មិនអាចផ្ញើលេខកូដ OTP បានទេ"
      );

      return false;
    }
  }

  async function checkAccountStatus() {
    const normalizedLogin =
      phoneOrEmail.trim();

    if (!normalizedLogin) {
      setError(
        "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល"
      );

      return;
    }

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/account-status",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            phoneOrEmail:
              normalizedLogin,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log(
        "=== ACCOUNT STATUS ==="
      );

      console.log(
        "HTTP status:",
        response.status
      );

      console.log(
        "Raw response:",
        data
      );

      if (!response.ok) {
        setError(
          data?.message ||
            data?.data?.message ||
            "មិនអាចពិនិត្យស្ថានភាពគណនីបានទេ"
        );

        return;
      }

      /*
       * Supports these response formats:
       *
       * { accountExists, status, nextStep }
       *
       * { data: { accountExists, status, nextStep } }
       *
       * { data: { data: { ... } } }
       */
      const accountStatus =
        data?.data?.data ??
        data?.data ??
        data;

      const accountExists =
        accountStatus?.accountExists ??
        accountStatus?.account_exists;

      const status = String(
        accountStatus?.status || ""
      )
        .trim()
        .toUpperCase();

      const nextStep = String(
        accountStatus?.nextStep ||
          accountStatus?.next_step ||
          ""
      )
        .trim()
        .toUpperCase();

      console.log(
        "Resolved account status:",
        {
          accountStatus,
          accountExists,
          status,
          nextStep,
        }
      );

      if (
        accountExists === false ||
        nextStep ===
          "ACCOUNT_NOT_FOUND"
      ) {
        setError(
          "រកមិនឃើញគណនីដែលប្រើលេខទូរស័ព្ទ ឬអ៊ីមែលនេះទេ"
        );

        return;
      }

      /*
       * Existing activated account:
       * show the password field.
       */
      if (
        nextStep === "ENTER_PASSWORD" ||
        status === "ACTIVE"
      ) {
        setStep(LOGIN_STEP.PASSWORD);
        setPassword("");

        return;
      }

      /*
       * New account:
       * send activation OTP and move to
       * the activation verification page.
       */
      if (
        nextStep ===
          "ACTIVATE_ACCOUNT" ||
        status ===
          "PENDING_ACTIVATION"
      ) {
        await sendActivationOtp(
          normalizedLogin
        );

        return;
      }

      if (
        nextStep ===
          "ACCOUNT_INACTIVE" ||
        status === "INACTIVE"
      ) {
        setError(
          "គណនីនេះត្រូវបានបិទ។ សូមទាក់ទងអ្នកគ្រប់គ្រង"
        );

        return;
      }

      if (
        nextStep ===
          "ACCOUNT_LOCKED" ||
        status === "LOCKED"
      ) {
        setError(
          "គណនីនេះត្រូវបានចាក់សោ។ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ"
        );

        return;
      }

      console.warn(
        "Unknown account status:",
        accountStatus
      );

      setError(
        accountStatus?.message ||
          data?.message ||
          "មិនអាចកំណត់ស្ថានភាពគណនីបានទេ"
      );
    } catch (statusError) {
      console.error(
        "Account status error:",
        statusError
      );

      setError(
        "មានបញ្ហាកើតឡើង សូមព្យាយាមម្ដងទៀត"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    const normalizedLogin =
      phoneOrEmail.trim();

    if (!normalizedLogin) {
      setError(
        "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល"
      );

      return;
    }

    if (!password) {
      setError(
        "សូមបញ្ចូលលេខសម្ងាត់"
      );

      return;
    }

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            phoneOrEmail:
              normalizedLogin,
            password,
            rememberMe,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log("Login response:", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        setError(
          data?.message ||
            data?.data?.message ||
            "លេខទូរស័ព្ទ អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ"
        );

        return;
      }

      const loginData =
        data?.data?.data ??
        data?.data ??
        data;

      /*
       * Prefer the user returned by login.
       * If login only returns tokens, /api/users/me
       * will provide the authenticated user.
       */
      let authenticatedUser =
        loginData?.user || null;

      if (!authenticatedUser) {
        const meResponse = await fetch(
          "/api/users/me",
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        );

        const meData =
          await parseResponse(meResponse);

        if (!meResponse.ok) {
          setError(
            meData?.message ||
              "ចូលប្រើប្រាស់បាន ប៉ុន្តែមិនអាចទាញយកព័ត៌មានអ្នកប្រើប្រាស់បាន"
          );

          return;
        }

        authenticatedUser =
          meData?.data?.data ??
          meData?.data ??
          meData;
      }

      if (rememberMe) {
        localStorage.setItem(
          REMEMBERED_EMAIL_KEY,
          normalizedLogin,
        );
      } else {
        localStorage.removeItem(
          REMEMBERED_EMAIL_KEY,
        );
      }

      setUser(authenticatedUser);

      const role =
        authenticatedUser?.role ||
        loginData?.role;

      const destination =
        redirectPath ||
        getRoleHomePath(role);

      router.replace(destination);
      router.refresh();
    } catch (loginError) {
      console.error(
        "Login error:",
        loginError
      );

      setError(
        "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (
      step === LOGIN_STEP.IDENTIFIER
    ) {
      await checkAccountStatus();
      return;
    }

    await handleLogin();
  }

  function handleBackToIdentifier() {
    setStep(LOGIN_STEP.IDENTIFIER);
    setPassword("");
    setError("");
    setSuccessMessage("");

    /*
     * Remove activation-related query parameters
     * without navigating away from the login page.
     */
    router.replace("/auth/login");
  }

  return (
    <div className="w-full">
      <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
        ចូលប្រើប្រាស់
      </h1>

      <p className="mb-7 text-center text-sm text-slate-500">
        {step === LOGIN_STEP.IDENTIFIER
          ? "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែលរបស់អ្នក"
          : "សូមបញ្ចូលលេខសម្ងាត់របស់អ្នក"}
      </p>

      <form
          onSubmit={handleSubmit}
          className="space-y-5"
          autoComplete="on"
          noValidate
        >
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm leading-6 text-green-700">
            {successMessage}
          </div>
        )}

        <TextInput
          label="លេខទូរស័ព្ទ ឬអ៊ីមែល"
          placeholder="បញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល"
          value={phoneOrEmail}
          onChange={(event) => {
            setPhoneOrEmail(
              event.target.value
            );

            setError("");
            setSuccessMessage("");
          }}
          autoComplete="username"
          icon={User}
          disabled={
            loading ||
            step === LOGIN_STEP.PASSWORD
          }
        />

        {step === LOGIN_STEP.PASSWORD && (
          <PasswordInput
            label="លេខសម្ងាត់"
            placeholder="បញ្ចូលលេខសម្ងាត់"
            value={password}
            onChange={(event) => {
              setPassword(
                event.target.value
              );

              setError("");
            }}
            autoComplete="current-password"
          />
        )}

        {step === LOGIN_STEP.PASSWORD && (
          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => {
                  const checked = event.target.checked;

                  setRememberMe(checked);

                  if (!checked) {
                    localStorage.removeItem(
                      REMEMBERED_EMAIL_KEY,
                    );
                  }
                }}
                className="h-4 w-4 rounded border-slate-300"
              />

              ចងចាំខ្ញុំ
            </label>

            <a
              href="/auth/forget-password"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              ភ្លេចលេខសម្ងាត់?
            </a>
          </div>
        )}

        {error && (
          <p className="text-center text-sm leading-6 text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn size={18} />

          {loading
            ? "កំពុងដំណើរការ..."
            : step ===
                LOGIN_STEP.IDENTIFIER
              ? "បន្ត"
              : "ចូលប្រើប្រាស់"}
        </button>

        {step === LOGIN_STEP.PASSWORD && (
          <button
            type="button"
            onClick={
              handleBackToIdentifier
            }
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-600 transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={17} />

            ប្រើលេខទូរស័ព្ទ ឬអ៊ីមែលផ្សេង
          </button>
        )}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}