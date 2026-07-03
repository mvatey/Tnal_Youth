// app/auth/forgot-password/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (res.ok) {
      // pass phone forward — OK here since it's not a secret,
      // the OTP itself is verified server-side
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="លេខទូរស័ព្ទ" />
      <button type="submit">ស្វែងរកលេខសម្ងាត់?</button>
    </form>
  );
}