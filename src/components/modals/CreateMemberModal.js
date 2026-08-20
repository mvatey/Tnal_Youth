"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ImportIcon, X } from "lucide-react";
import FormControl from "@/components/forms/FormControl";
import FormSelect from "@/components/forms/FormSelect";

const GENDER_OPTIONS = [
  {
    label: "ប្រុស",
    value: "MALE",
  },
  {
    label: "ស្រី",
    value: "FEMALE",
  },
  {
    label: "ព្រះសង្ឃ",
    value: "MONK",
  },
];

const ROLE_OPTIONS = [
  {
    label: "អ្នកគ្រប់គ្រង",
    value: "ADMIN",
  },
  {
    label: "ប្រធានសាខា",
    value: "BRANCH_LEADER",
  },
  {
    label: "លេខាធិការ",
    value: "SECRETARY",
  },
  {
    label: "សមាជិក",
    value: "MEMBER",
  },
];

const LEVEL_OPTIONS = [
  {
    label: "កាំ 1",
    value: "1",
  },
  {
    label: "កាំ 2",
    value: "2",
  },
  {
    label: "កាំ 3",
    value: "3",
  },
  {
    label: "កាំ 4",
    value: "4",
  },
  {
    label: "កាំ 5",
    value: "5",
  },
];

const EMPTY_FORM = {
  nameKh: "",
  nameEn: "",
  gender: "",
  status: "",
  phone: "",
  email: "",
  branchId: "",
  role: "",
  dateOfBirth: "",
  joinedAt: "",
  level: "",
};

function buildBranchOptions(branches) {
  return branches.map((branch) => {
    if (
      branch !== null &&
      typeof branch === "object"
    ) {
      return {
        label:
          branch.label ??
          branch.nameKm ??
          branch.name ??
          branch.branchName ??
          "មិនមានឈ្មោះសាខា",

        value: String(
          branch.value ??
            branch.id ??
            branch.nameKm ??
            branch.name
        ),
      };
    }

    return {
      label: String(branch),
      value: String(branch),
    };
  });
}

export default function CreateMemberModal({
  open,
  onClose,
  onSave,
  branches: providedBranches,
  statuses: providedStatuses,
}) {
  const [mounted, setMounted] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const statusOptions = useMemo(
    () =>
      (providedStatuses ?? [])
        .filter((status) => status?.value !== "")
        .map((status) => ({
          label: status.label ?? status.nameKm ?? status.code,
          value: String(status.value ?? status.id),
        })),
    [providedStatuses]
  );

  const branchOptions = useMemo(() => {
    const source = Array.isArray(providedBranches)
      ? providedBranches.filter((branch) => branch?.value !== "")
      : [];

    return buildBranchOptions(source);
  }, [providedBranches]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSubmitError("");
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

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  const updateField =
    (field) => (event) => {
      setForm((previousForm) => ({
        ...previousForm,
        [field]: event.target.value,
      }));
    };

  const submit = async (event) => {
    event.preventDefault();

    const normalizedMember = {
      full_name_km: form.nameKh.trim(),
      full_name_en:
        form.nameEn.trim() || null,
      gender: form.gender,
      status_id: Number(form.status),
      phone: form.phone.trim(),
      email:
        form.email.trim() || null,
      branch_id: Number(form.branchId),
      role: form.role,
      date_of_birth:
        form.dateOfBirth || null,
      joined_on:
        form.joinedAt || null,
      level_id:
        form.level ? Number(form.level) : null,
    };

    setSubmitError("");
    setSaving(true);
    try {
      await onSave?.(normalizedMember);
    } catch (error) {
      setSubmitError(error?.message || "មិនអាចបង្កើតសមាជិកបានទេ");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/40"
      onClick={onClose}
    >
      <div className="fixed bottom-0 left-0 right-0 top-[72px] flex items-center justify-center p-4 lg:left-[365px] lg:p-6">
        <div
          className="flex max-h-[calc(100vh-120px)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-bg-page-white shadow-2xl"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
         <div className="relative flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
  <h2 className="text-lg font-bold text-primary">
    បង្កើតសមាជិកថ្មី
  </h2>

  <button
    type="button"
    onClick={onClose}
    className="absolute right-6 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-bg-page-white text-text-primary hover:bg-bg-page-gray"
    aria-label="បិទផ្ទាំង"
  >
    <X size={16} strokeWidth={1} />
  </button>
</div>

          <form
            id="create-member-form"
            onSubmit={submit}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2  ">
              <FormControl
                className="h-[34px]"
                label="ឈ្មោះជាភាសាខ្មែរ"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.nameKh}
                onChange={updateField(
                  "nameKh"
                )}
                required
              />

              <FormControl
               className="h-[34px]"
                label="ឈ្មោះជាអក្សរឡាតាំង"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.nameEn}
                onChange={updateField(
                  "nameEn"
                )}
              />

              <FormSelect
                label="ភេទ"
                placeholder="ជ្រើសរើសភេទ"
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={updateField(
                  "gender"
                )}
                required
              />

              <FormSelect
                label="ស្ថានភាព"
                placeholder="ជ្រើសរើសស្ថានភាព"
                options={statusOptions}
                value={form.status}
                onChange={updateField(
                  "status"
                )}
                required
              />

              <FormControl
                label="លេខទូរស័ព្ទ"
                placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                value={form.phone}
                onChange={updateField(
                  "phone"
                )}
                required
              />

              <FormControl
                label="អ៊ីមែល"
                type="email"
                placeholder="បញ្ចូលអ៊ីមែល"
                value={form.email}
                onChange={updateField(
                  "email"
                )}
              />

              <FormSelect
                label="សាខា"
                placeholder="ជ្រើសរើសសាខា"
                options={branchOptions}
                value={form.branchId}
                onChange={updateField(
                  "branchId"
                )}
                required
              />

              <FormSelect
                label="តួនាទី"
                placeholder="ជ្រើសរើសតួនាទី"
                options={ROLE_OPTIONS}
                value={form.role}
                onChange={updateField(
                  "role"
                )}
                required
              />

              <FormControl
                label="ថ្ងៃខែឆ្នាំកំណើត"
                type="date"
                value={form.dateOfBirth}
                onChange={updateField(
                  "dateOfBirth"
                )}
              />

              <FormControl
                label="ថ្ងៃខែឆ្នាំចូលរួម"
                type="date"
                value={form.joinedAt}
                onChange={updateField(
                  "joinedAt"
                )}
                required
              />

              <FormSelect
                label="កាំ"
                placeholder="ជ្រើសរើសកាំ"
                options={LEVEL_OPTIONS}
                value={form.level}
                onChange={updateField(
                  "level"
                )}
              />
            </div>
          </form>

          <div className="flex shrink-0 items-center gap-3 border-t border-border bg-bg-page-white px-6 py-3">
  {submitError ? (
    <p className="mr-auto text-sm text-error" role="alert">
      {submitError}
    </p>
  ) : null}
  <button
    type="button"
    onClick={onClose}
    className="h-[34px] w-[96px] rounded-[8px] border border-border bg-bg-page-gray text-center text-[14px] font-semibold text-text-primary shadow-md transition hover:bg-bg-page-gray/70"
  >
    បោះបង់
  </button>

  <button
    type="submit"
    form="create-member-form"
    disabled={saving}
    className="flex h-[34px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#4B3391] text-[14px] font-semibold text-white shadow-md transition hover:bg-[#3f2b7d]"
  >
    <ImportIcon size={17} />
    {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
  </button>
</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
