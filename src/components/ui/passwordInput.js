// components/ui/PasswordInput.jsx
"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ label, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      {label && (
        <label className="text-sm text-text-secondary mb-1 block">{label}</label>
      )}
      <div className="relative">
        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute" />
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute"
        >
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>
  );
}