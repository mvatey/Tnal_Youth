// app/auth/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogIn } from "lucide-react";

import TextInput from "@/components/ui/textInput";
import PasswordInput from "@/components/ui/passwordInput";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath } from "@/lib/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!phoneOrEmail.trim() || !password) {
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
          phoneOrEmail: phoneOrEmail.trim(),
          password,
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

      const currentUser = await refreshUser();

      router.replace(getRoleHomePath(currentUser.role));
      router.refresh();

      if (!currentUser) {
        setError(
          "ចូលប្រើប្រាស់បាន ប៉ុន្តែមិនអាចទាញយកព័ត៌មានគណនីបាន"
        );
        return;
      }

      const homePath = getRoleHomePath(currentUser.role);

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

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
        ចូលប្រើប្រាស់ប្រព័ន្ធ
      </h2>

      <p className="mb-8 text-center text-sm text-slate-500">
        សូមបញ្ចូលព័ត៌មានគណនីរបស់អ្នក
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <TextInput
          label="លេខទូរស័ព្ទប្រើប្រាស់ ឬ អ៊ីមែល"
          icon={User}
          placeholder="បញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល"
          value={phoneOrEmail}
          onChange={(event) =>
            setPhoneOrEmail(event.target.value)
          }
        />

        <PasswordInput
          label="លេខសម្ងាត់"
          placeholder="បញ្ចូលលេខសម្ងាត់"
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

          {loading ? "កំពុងចូល..." : "ចូលប្រើប្រាស់"}
        </button>

        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
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