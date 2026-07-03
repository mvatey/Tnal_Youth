// app/auth/verify-otp/page.jsx
"use client";
import { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const phone = params.get("phone");
  const router = useRouter();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);

  function handleChange(value, index) {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  }

  async function handleSubmit() {
    const code = otp.join("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    if (res.ok) {
      const { resetToken } = await res.json();
      router.push(`/auth/reset-password?token=${resetToken}`);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={digit}
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, i)}
          />
        ))}
      </div>
      <button onClick={handleSubmit}>ផ្ទៀងផ្ទាត់</button>
    </div>
  );
}