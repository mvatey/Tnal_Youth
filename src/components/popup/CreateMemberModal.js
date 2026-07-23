"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { User, Phone, Mail, Calendar, X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";
import BoxFill from "@/components/forms/boxFill";

import SelectArrow from "@/components/forms/SelectArrow";
import memberOptions from "@/data/donation/memberOptions.json";

const { genderOptions, roleOptions, statusOptions } = memberOptions;

const LEVEL_OPTIONS = ["1", "2", "3", "4", "5"];

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

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const esc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", esc);

    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = old;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const update = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  const submit = (e) => {
    e.preventDefault();
    onSave?.(form);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-primary">បង្កើតសមាជិកថ្មី</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <BoxFill
              label="ឈ្មោះជាភាសាខ្មែរ"
              placeholder="បញ្ចូលឈ្មោះជាភាសាខ្មែរ"
              value={form.nameKh}
              onChange={update("nameKh")}
            />

            <BoxFill
              label="ឈ្មោះជាអក្សរឡាតាំង"
              placeholder="បញ្ចូលឈ្មោះជាអក្សរឡាតាំង"
              value={form.nameEn}
              onChange={update("nameEn")}
            />

            <BoxFill
              label="ភេទ"
              type="select"
              placeholder="ជ្រើសរើសភេទ"
              options={genderOptions}
              value={form.gender}
              onChange={update("gender")}
            />

            <BoxFill
              label="ស្ថានភាព"
              type="select"
              placeholder="ជ្រើសរើសស្ថានភាព"
              options={statusOptions}
              value={form.status}
              onChange={update("status")}
            />

            <BoxFill
              label="លេខទូរស័ព្ទ"
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
              value={form.phone}
              onChange={update("phone")}
            />

            <BoxFill
              label="អ៊ីមែល"
              placeholder="បញ្ចូលអ៊ីមែល"
              value={form.email}
              onChange={update("email")}
            />

            <BoxFill
              label="សាខា"
              type="select"
              placeholder="ជ្រើសរើសសាខា"
              options={branches.map((b) => ({
                label: b.label ?? b,
                value: b.value ?? b,
              }))}
              value={form.branch}
              onChange={update("branch")}
            />

            <BoxFill
              label="តួនាទី"
              type="select"
              placeholder="ជ្រើសរើសតួនាទី"
              options={roleOptions}
              value={form.role}
              onChange={update("role")}
            />

            <BoxFill
              label="ថ្ងៃខែឆ្នាំកំណើត"
              type="date"
              value={form.dob}
              onChange={update("dob")}
            />

            <BoxFill
              label="ថ្ងៃខែឆ្នាំចូលរួម"
              type="date"
              value={form.joinedAt}
              onChange={update("joinedAt")}
            />

            <BoxFill
              label="កាំ"
              type="select"
              placeholder="ជ្រើសរើសកាំ"
              options={LEVEL_OPTIONS.map((x) => ({
                label: `កាំ ${x}`,
                value: x,
              }))}
              value={form.level}
              onChange={update("level")}
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 px-8 py-3 text-sm"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-white"
            >
              <HiSaveAs />
              រក្សាទុក
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function InputField({ label, icon, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>

        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
          w-full
          rounded-xl
          border
          border-gray-200
          py-3
          pl-11
          pr-4
          text-sm
          text-text-primary
          placeholder:text-text-secondary
          focus:outline-none
          focus:ring-2
          focus:ring-primary/30
          "
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-gray-200 py-3 px-4 pr-10 text-sm"
        >
          <option value="">ជ្រើសរើស</option>

          {options.map((item) => (
            <option key={item.value ?? item} value={item.value ?? item}>
              {item.label ?? item}
            </option>
          ))}
        </select>

        <SelectArrow />
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

        <input
          type="date"
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm"
        />
      </div>
    </div>
  );
}
