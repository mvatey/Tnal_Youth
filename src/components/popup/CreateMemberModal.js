// src/components/popup/createMember
// src/components/popup/CreateMemberModal.jsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { User, Phone, Mail, Calendar, X, Save } from "lucide-react";
import SelectArrow from "@/components/forms/SelectArrow";
import { HiSaveAs } from "react-icons/hi";

const GENDER_OPTIONS = ["ស្រី", "ប្រុស"];
const STATUS_OPTIONS = ["សកម្ម", "អសកម្ម"];
const LEVEL_OPTIONS = ["1", "2", "3", "4", "5"];

const ROLE_OPTIONS = [
  { value: "admin", label: "អ្នកគ្រប់គ្រង" },
  { value: "branch_leader", label: "ប្រធានសាខា" },
  { value: "secretary", label: "លេខាធិការ" },
  { value: "member", label: "សមាជិក" },
];

const EMPTY_FORM = {
  nameKh: "",
  nameEn: "",
  gender: "",
  status: "",
  phone: "",
  email: "",
  branch: "",
  role: "",
  dob: "",
  joinedAt: "",
  level: "",
};

export default function CreateMemberModal({
  open,
  onClose,
  onSave,
  branches = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const dateInputClass =
    "w-full rounded-xl border border-gray-200 py-3 pl-3 pr-4 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset the form whenever the modal is opened fresh
  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30";
  const selectClass =
    "w-full appearance-none rounded-xl border border-gray-200 py-3 pl-4 pr-10 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelClass = "mb-2 block text-sm font-medium text-text-primary";
  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-md font-bold text-primary">បង្កើតសមាជិកថ្មី</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:bg-gray-100"
            aria-label="បិទ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Name (Khmer) */}
            <div>
              <label className={labelClass}>ឈ្មោះជាភាសាខ្មែរ</label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  type="text"
                  value={form.nameKh}
                  onChange={update("nameKh")}
                  placeholder="បញ្ចូលឈ្មោះ"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Name (English) */}
            <div>
              <label className={labelClass}>ឈ្មោះជាភាសាឡាតាំង</label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={update("nameEn")}
                  placeholder="បញ្ចូលឈ្មោះ"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className={labelClass}>ភេទ</label>
              <div className="relative">
                <select
                  value={form.gender}
                  onChange={update("gender")}
                  className={selectClass}
                  required
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>ស្ថានភាព</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={update("status")}
                  className={selectClass}
                  required
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>លេខទូរស័ព្ទ</label>
              <div className="relative">
                <Phone className={iconClass} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>អ៊ីមែល</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="បញ្ចូលអ៊ីមែល"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className={labelClass}>សាខា</label>
              <div className="relative">
                <select
                  value={form.branch}
                  onChange={update("branch")}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>
                    ជ្រើសរើសសាខា
                  </option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className={labelClass}>តួនាទី</label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={update("role")}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>
                    ជ្រើសរើសតួនាទី
                  </option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>

            {/* Date of birth */}
            <div>
              <label className={labelClass}>ថ្ងៃខែឆ្នាំកំណើត</label>

              <div className="relative">
                <input
                  type="date"
                  value={form.dob}
                  onChange={update("dob")}
                  className={`${dateInputClass} appearance-none pr-10`}
                />

                <Calendar
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              </div>
            </div>

            {/* Date joined */}
            <div>
              <label className={labelClass}>ថ្ងៃខែឆ្នាំចូលរួម</label>

              <div className="relative">
                <input
                  type="date"
                  value={form.joinedAt}
                  onChange={update("joinedAt")}
                  className={`${dateInputClass} appearance-none pr-10`}
                />

                <Calendar
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              </div>
            </div>
            {/* Level */}
            <div>
              <label className={labelClass}>កាំ</label>

              <div className="relative">
                <select
                  value={form.level}
                  onChange={update("level")}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>
                    ជ្រើសរើសកាំ
                  </option>

                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      កាំ {level}
                    </option>
                  ))}
                </select>

                <SelectArrow />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 px-8 py-3 text-sm font-medium text-text-secondary transition hover:bg-gray-200"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              <HiSaveAs className="w-4 h-4" />
              រក្សាទុក
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
