"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButton from "@/components/forms/FormActionButton";


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
  nationality: "",
  profileFile: null,
  profilePreview: "",
};

export default function CreateMemberModal({
  open,
  onClose,
  onSave,
  branches = [],
  lookupGenderOptions = [],
  lookupStatusOptions = [],
  lookupRoleOptions = [],
  lookupLevelOptions = [],
  nationalityOptions = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showValidationError, setShowValidationError] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setShowValidationError(false);
      setSaveError("");
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

  const selectProfileImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setSaveError("Profile image must be JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Profile image must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({
      ...current,
      profileFile: file,
      profilePreview: String(reader.result || ""),
    }));
    reader.readAsDataURL(file);
    setSaveError("");
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

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave?.(form);
      setForm(EMPTY_FORM);
      setShowValidationError(false);
      onClose?.();
    } catch (error) {
      setSaveError(error.message || "Unable to save member.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/40
      "
      onClick={onClose}
    >
      <div
        className="
          fixed
          bottom-0
          left-64
          right-0
          top-16
          flex
          items-center
          justify-center
          overflow-y-auto
          px-4
          py-5
        "
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className="
            w-full
            max-w-md
            rounded-2xl
            bg-white
            p-5
            shadow-xl
          "
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">បង្កើតសមាជិកថ្មី</h2>

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-full
                p-1
                transition
                hover:bg-gray-100
              "
              aria-label="បិទ"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-gray-50 p-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white">
                {form.profilePreview ? (
                  <img src={form.profilePreview} alt="Member profile preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="text-text-secondary" size={26} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">រូបថតសមាជិក</p>
                <p className="mt-1 text-xs text-text-secondary">JPG, PNG ឬ WebP — អតិបរមា 5 MB</p>
                <label className="mt-2 inline-flex cursor-pointer rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
                  ជ្រើសរើសរូបថត
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={selectProfileImage} />
                </label>
                {form.profileFile && <p className="mt-1 max-w-[250px] truncate text-xs text-text-secondary">{form.profileFile.name}</p>}
              </div>
            </div>
            <div
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >
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
                options={lookupGenderOptions}
                value={form.gender}
                onChange={update("gender")}
              />

              <FormSelect
                label="ស្ថានភាព"
                type="select"
                placeholder="ជ្រើសរើសស្ថានភាព"
                options={lookupStatusOptions}
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
                options={lookupRoleOptions}
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
                label="សញ្ជាតិ"
                type="select"
                placeholder="ជ្រើសរើសសញ្ជាតិ"
                options={nationalityOptions}
                value={form.nationality}
                onChange={update("nationality")}
              />

              <FormSelect
                label="កាំ"
                type="select"
                placeholder="ជ្រើសរើសកាំ"
                options={lookupLevelOptions}
                value={form.level}
                onChange={update("level")}
              />
            </div>

            {showValidationError && !isFormValid && (
              <p className="mt-4 text-xs font-medium text-red-500">
                សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។
              </p>
            )}
            {saveError && (
              <p className="mt-4 text-xs font-medium text-red-500">{saveError}</p>
            )}
            <FormActionButton
              onCancel={onClose}
              isValid={isFormValid && !isSaving}
              saveText="រក្សាទុក"
              cancelText="បោះបង់"
            />
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
