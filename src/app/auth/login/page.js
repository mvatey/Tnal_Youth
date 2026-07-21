"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, User } from "lucide-react";

import TextInput from "@/components/ui/textInput";
import PasswordInput from "@/components/ui/passwordInput";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath } from "@/lib/navigation";

const REMEMBERED_LOGIN_KEY = "rememberedLogin";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedLogin = localStorage.getItem(
      REMEMBERED_LOGIN_KEY
    );

    if (rememberedLogin) {
      setPhoneOrEmail(rememberedLogin);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedLogin = phoneOrEmail.trim();

    if (!normalizedLogin || !password) {
      setError(
        "សូមបញ្ចូលលេខទូរស័ព្ទ/អ៊ីមែល និងលេខសម្ងាត់"
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneOrEmail: normalizedLogin,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "លេខទូរស័ព្ទ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ"
        );
        return;
      }

      const currentUser = data.user;

      if (!currentUser) {
        setError(
          "មិនអាចទាញយកព័ត៌មានគណនីបានទេ"
        );
        return;
      }

      if (rememberMe) {
        localStorage.setItem(
          REMEMBERED_LOGIN_KEY,
          normalizedLogin
        );
      } else {
        localStorage.removeItem(
          REMEMBERED_LOGIN_KEY
        );
      }

      setUser(currentUser);

      const homePath = getRoleHomePath(
        currentUser.role
      );

      router.replace(homePath);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "មានបញ្ហាកើតឡើង សូមព្យាយាមម្តងទៀត"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRememberMeChange(event) {
    const checked = event.target.checked;

    setRememberMe(checked);

    if (!checked) {
      localStorage.removeItem(
        REMEMBERED_LOGIN_KEY
      );
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
        ចូលប្រើប្រាស់ប្រព័ន្ធ
      </h2>

      <p className="mb-8 text-center text-sm text-slate-500">
        សូមបញ្ចូលព័ត៌មានគណនីរបស់អ្នក
      </p>

      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="w-full space-y-5"
      >
        <TextInput
          label="លេខទូរស័ព្ទប្រើប្រាស់ ឬ អ៊ីមែល"
          icon={User}
          placeholder="បញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល"
          name="username"
          autoComplete="username"
          value={phoneOrEmail}
          onChange={(event) =>
            setPhoneOrEmail(event.target.value)
          }
        />

        <PasswordInput
          label="លេខសម្ងាត់"
          placeholder="បញ្ចូលលេខសម្ងាត់"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn size={18} />

          {loading
            ? "កំពុងចូល..."
            : "ចូលប្រើប្រាស់"}
        </button>

        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              className="rounded border-slate-300"
            />

            ចងចាំខ្ញុំ
          </label>

          <a
            href="/auth/forget-password"
            className="text-blue-700 hover:underline"
          >
            ភ្លេចលេខសម្ងាត់?
          </a>
        </div>

        <p className="pt-2 text-center text-sm text-slate-500">
          មិនទាន់មានគណនី?{" "}

          <a
            href="/auth/signup"
            className="text-blue-700 hover:underline"
          >
            ទាក់ទងអ្នកគ្រប់គ្រង
          </a>
        </p>
      </form>
    </div>
  );
}