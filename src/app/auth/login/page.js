// app/auth/login/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    router.push("/dashboard"); // cookie/session is set server-side
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="លេខទូរស័ព្ទ ឬ អ៊ីមែល"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="លេខសម្ងាត់"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)}>
          👁
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "..." : "ចូលប្រើប្រាស់"}
      </button>
    </form>
  );
}