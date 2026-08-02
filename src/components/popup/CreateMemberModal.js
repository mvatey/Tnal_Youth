"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButton from "@/components/forms/FormActionButton";

import memberOptions from "@/data/donation/memberOptions.json";
import membersData from "@/data/members.json";

const { genderOptions, statusOptions } = memberOptions;

const ROLE_LABELS = {
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

const LEVEL_OPTIONS = ["ក", "ខ", "គ", "ឃ", "ង"];
const Nationality_OPTIONS = ["ខ្មែរ", "វៀតណាម", "ចិន", "បារាំង"];

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

function normalizeRole(role) {
  const normalizedRole = String(role ?? "").trim();

  const roleMap = {
    admin: "admin",
    អ្នកគ្រប់គ្រង: "admin",

    branch_leader: "branch_leader",
    ប្រធានសាខា: "branch_leader",

    secretary: "secretary",
    លេខាធិការ: "secretary",

    member: "member",
    សមាជិក: "member",
  };

  return roleMap[normalizedRole] || normalizedRole;
}

export default function CreateMemberModal({
  open,
  onClose,
  onSave,
  branches = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showValidationError, setShowValidationError] = useState(false);

  const roleOptions = useMemo(() => {
    const roleMap = new Map();

    membersData.forEach((member) => {
      const role = normalizeRole(member.role);

      if (!role || !ROLE_LABELS[role]) {
        return;
      }

      roleMap.set(role, {
        label: ROLE_LABELS[role],
        value: role,
      });
    });

    return Array.from(roleMap.values());
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setShowValidationError(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

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
    if (!open) {
      return undefined;
    }

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  const update = (field) => (event) => {
    const value = event.target.value;

    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setShowValidationError(false);
  };

  const requiredFields = [
    "nameKh",
    "nameEn",
    "gender",
    "status",
    "phone",
    "branch",
    "role",
    "dob",
    "joinedAt",
    "level",
    "nationality",

  ];

  const isFormValid = requiredFields.every((field) => {
    return String(form[field] ?? "").trim() !== "";
  });

  const submit = async (event) => {
    event.preventDefault();

    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);

    const newMember = {
      id: crypto.randomUUID(),
      ...form,
    };

    await onSave?.(newMember);

    setForm(EMPTY_FORM);
    setShowValidationError(false);
    onClose?.();
  };

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
    <div className="no-scrollbar max-h-[calc(100vh-2rem)] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-border px-7 py-5">
        <h2 className="text-xl font-bold text-primary">បង្កើតសមាជិកថ្មី</h2>

        <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-gray-100 hover:text-text-primary" aria-label="បិទ">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={submit} className="px-7 pb-7 pt-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
          <BoxFill label="ឈ្មោះជាភាសាខ្មែរ" placeholder="បញ្ចូលឈ្មោះ" value={form.nameKh} onChange={update("nameKh")} />

          <BoxFill label="ឈ្មោះជាអក្សរឡាតាំង" placeholder="បញ្ចូលឈ្មោះ" value={form.nameEn} onChange={update("nameEn")} />

          <FormSelect label="ភេទ" name="gender" placeholder="ជ្រើសរើសភេទ" options={genderOptions} value={form.gender} onChange={update("gender")} />

          <FormSelect label="ស្ថានភាព" name="status" placeholder="ជ្រើសរើសស្ថានភាព" options={statusOptions} value={form.status} onChange={update("status")} />

          <BoxFill label="លេខទូរស័ព្ទ" type="tel" placeholder="បញ្ចូលលេខទូរស័ព្ទ" value={form.phone} onChange={update("phone")} />

          <BoxFill label="អ៊ីមែល" type="email" placeholder="បញ្ចូលអ៊ីមែល" value={form.email} onChange={update("email")} />

          <FormSelect
            label="សាខា"
            name="branch"
            placeholder="ជ្រើសរើសសាខា"
            options={branches.map((branch) => ({
              label: branch.label ?? branch.nameKm ?? branch.name ?? branch,
              value: branch.value ?? branch.id ?? branch,
            }))}
            value={form.branch}
            onChange={update("branch")}
          />

          <FormSelect label="តួនាទី" name="role" placeholder="ជ្រើសរើសតួនាទី" options={roleOptions} value={form.role} onChange={update("role")} />

          <BoxFill label="ថ្ងៃខែឆ្នាំកំណើត" type="date" value={form.dob} onChange={update("dob")} />

          <BoxFill label="ថ្ងៃខែឆ្នាំចូលរួម" type="date" value={form.joinedAt} onChange={update("joinedAt")} />

          <FormSelect
            label="កាំ"
            name="level"
            placeholder="ជ្រើសរើសកាំ"
            options={LEVEL_OPTIONS.map((level) => ({
              value: level,
            }))}
            value={form.level}
            onChange={update("level")}
          />
          <FormSelect
            label="សញ្ជាតិ"
            name="nationality"
            placeholder="ជ្រើសរើសសញ្ជាតិ"
            options={Nationality_OPTIONS.map((nationality) => ({
              value: nationality,
            }))}
            value={form.nationality}
            onChange={update("nationality")}
          />
        </div>

        {showValidationError && !isFormValid && (
          <p className="mt-4 text-xs font-medium text-red-500">សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។</p>
        )}

        <div className="mt-6">
          <FormActionButton onCancel={onClose} isValid={isFormValid} saveText="រក្សាទុក" cancelText="បោះបង់" />
        </div>
      </form>
    </div>
  </div>,
  document.body,
);
}

