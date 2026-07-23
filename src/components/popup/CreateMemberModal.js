"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const update = (field) => (event) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: event.target.value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSave?.(form);
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div className="fixed bottom-0 left-0 right-0 top-[72px] flex items-center justify-center p-4 lg:left-[365px] lg:p-6">
        <div className="flex max-h-[calc(100vh-120px)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold text-primary">បង្កើតសមាជិកថ្មី</h2>

            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-gray-700 transition hover:bg-gray-100" aria-label="បិទផ្ទាំង">
              <X size={20} />
            </button>
          </div>

          <form id="create-member-form" onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <BoxFill
                label="ឈ្មោះជាភាសាខ្មែរ"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.nameKh}
                onChange={update("nameKh")}
              />

              <BoxFill
                label="ឈ្មោះជាអក្សរឡាតាំង"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.nameEn}
                onChange={update("nameEn")}
              />

              <FormSelect
                label="ភេទ"
                type="select"
                placeholder="ជ្រើសរើសភេទ"
                options={genderOptions}
                value={form.gender}
                onChange={update("gender")}
              />

              <FormSelect
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
                type="email"
                placeholder="បញ្ចូលអ៊ីមែល"
                value={form.email}
                onChange={update("email")}
              />

              <FormSelect
                label="សាខា"
                type="select"
                placeholder="ជ្រើសរើសសាខា"
                options={branches.map((branch) => ({
                  label: branch.label ?? branch,
                  value: branch.value ?? branch,
                }))}
                value={form.branch}
                onChange={update("branch")}
              />

              <FormSelect
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

              <FormSelect
                label="កាំ"
                type="select"
                placeholder="ជ្រើសរើសកាំ"
                options={LEVEL_OPTIONS.map((level) => ({
                  label: `កាំ ${level}`,
                  value: level,
                }))}
                value={form.level}
                onChange={update("level")}
              />
            </div>
          </form>

          <div className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200">
              បោះបង់
            </button>

            <button type="submit" form="create-member-form" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
              <HiSaveAs size={17} />
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}