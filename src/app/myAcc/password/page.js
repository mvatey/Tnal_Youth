"use client";

import { useState } from "react";
import {
  CircleCheck,
  Eye,
  EyeOff,
  Info,
  Lock,
} from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";

export default function MyAccountPasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visible, setVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const setValue = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleVisible = (field) => {
    setVisible((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.currentPassword) {
      alert("សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន");
      return;
    }

    if (form.newPassword.length < 8) {
      alert("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួ");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      alert("ការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រឹមត្រូវ");
      return;
    }

    console.log("My account password form:", form);

    alert("បានផ្លាស់ប្ដូរពាក្យសម្ងាត់ដោយជោគជ័យ");

    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          ផ្លាស់ប្ដូរពាក្យសម្ងាត់
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី ដើម្បីការពារគណនីរបស់អ្នក
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <PasswordInput
            label="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
            placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
            value={form.currentPassword}
            onChange={(value) =>
              setValue("currentPassword", value)
            }
            show={visible.current}
            onToggle={() =>
              toggleVisible("current")
            }
          />

          <PasswordInput
            label="ពាក្យសម្ងាត់ថ្មី"
            placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
            value={form.newPassword}
            onChange={(value) =>
              setValue("newPassword", value)
            }
            show={visible.new}
            onToggle={() =>
              toggleVisible("new")
            }
          />

          <PasswordInput
            label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
            placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្ដងទៀត"
            value={form.confirmPassword}
            onChange={(value) =>
              setValue("confirmPassword", value)
            }
            show={visible.confirm}
            onToggle={() =>
              toggleVisible("confirm")
            }
          />

          <div className="flex justify-end pt-3">
            <SaveButton type="submit" />
          </div>
        </div>

        <div className="h-fit rounded-xl border border-warning bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-bg">
              <Info
                className="text-warning"
                size={22}
              />
            </div>

            <h3 className="text-base font-semibold text-text-primary">
              គន្លឹះសុវត្ថិភាព
            </h3>
          </div>

          <div className="space-y-4">
            <Rule text="មានអក្សរយ៉ាងហោចណាស់ ៨ តួ" />
            <Rule text="មានតួអក្សរពិសេស (!@#$%^&*)" />
            <Rule text="មានលេខ (0-9)" />
            <Rule text="មានអក្សរធំ និងអក្សរតូច" />
          </div>
        </div>
      </div>
    </form>
  );
}

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <div className="relative">
        <Lock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-primary"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-primary"
          aria-label={
            show
              ? "លាក់ពាក្យសម្ងាត់"
              : "បង្ហាញពាក្យសម្ងាត់"
          }
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

function Rule({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-warning">
        <CircleCheck
          size={14}
          className="text-warning"
        />
      </div>

      <p className="text-sm font-medium text-text-primary">
        {text}
      </p>
    </div>
  );
}