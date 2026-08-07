// components/ui/OtpInput.jsx
"use client";
import { useRef } from "react";

export default function OtpInput({ value, onChange, length = 6 }) {
  const inputsRef = useRef([]);

  function handleChange(digit, index) {
    if (!/^\d?$/.test(digit)) return;
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < length - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={value[i] || ""}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          maxLength={1}
          inputMode="numeric"
          className="w-12 h-12 text-center border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
      ))}
    </div>
  );
}