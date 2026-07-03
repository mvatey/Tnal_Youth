// app/auth/login/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogIn } from "lucide-react";
import TextInput from "@/components/ui/textInput";
import PasswordInput from "@/components/ui/passwordInput";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Login failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">
        ចូលប្រើប្រាស់ប្រព័ន្ធ
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center">
        សូមបញ្ចូលព័ត៌មានគណនីរបស់អ្នក
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <TextInput
          label="លេខទូរស័ព្ទប្រើប្រាស់ ឬ អ៊ីមែល"
          icon={User}
          placeholder="បញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <PasswordInput
          label="លេខសម្ងាត់"
          placeholder="បញ្ចូលលេខសម្ងាត់"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <LogIn size={18} />
          {loading ? "..." : "ចូលប្រើប្រាស់"}
        </button>

        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="rounded border-slate-300" />
            ចងចាំខ្ញុំ
          </label>
          <a href="/auth/forgot-password" className="text-blue-700 hover:underline">
            ភ្លេចលេខសម្ងាត់?
          </a>
        </div>

        <p className="text-center text-sm text-slate-500 pt-2">
          មិនទាន់មានគណនី?{" "}
          <a href="/auth/signup" className="text-blue-700 hover:underline">
            ទាក់ទងអ្នកគ្រប់គ្រង
          </a>
        </p>
      </form>
    </div>
  );
}