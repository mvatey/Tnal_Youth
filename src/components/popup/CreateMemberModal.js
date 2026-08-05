"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButton from "@/components/forms/FormActionButton";

const EMPTY_FORM = {
  fullNameKm: "",
  fullNameEn: "",
  gender: "",
  nationalityId: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  branchId: "",
  levelId: "",
  role: "",
  joinedOn: "",
  statusId: "",
};

async function fetchJson(path) {
  const response = await fetch(`/api${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();

  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object"
        ? body?.message || body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

async function createMember(payload) {
  const response = await fetch("/api/members", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object"
        ? body?.message || body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

export default function CreateMemberModal({
  open,
  onClose,
  onSave,
}) {
  const [mounted, setMounted] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [branchLookups, setBranchLookups] =
  useState([]);

  const [statusLookups, setStatusLookups] =
    useState([]);

  const [genderLookups, setGenderLookups] =
    useState([]);

  const [
    nationalityLookups,
    setNationalityLookups,
  ] = useState([]);

  const [levelLookups, setLevelLookups] =
    useState([]);

  const [roleLookups, setRoleLookups] =
    useState([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    showValidationError,
    setShowValidationError,
  ] = useState(false);

  const [submitError, setSubmitError] =
    useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(EMPTY_FORM);

    setShowValidationError(false);

    setSubmitError("");
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadLookups() {
      try {
        const [
        branches,
        statuses,
        genders,
        nationalities,
        levels,
        roles,
      ] = await Promise.all([
        fetchJson("/lookups/branches"),

        fetchJson(
          "/lookups/member-statuses",
        ),

        fetchJson("/lookups/genders"),

        fetchJson(
          "/lookups/nationalities",
        ),

        fetchJson(
          "/lookups/member-levels",
        ),

        fetchJson(
          "/lookups/user-roles",
        ),
      ]);

        if (cancelled) {
          return;
        }

        const branchData =
          Array.isArray(branches)
            ? branches
            : Array.isArray(branches?.data)
              ? branches.data
              : Array.isArray(branches?.content)
                ? branches.content
                : [];

        setBranchLookups(branchData);

          setStatusLookups(
            Array.isArray(statuses)
              ? statuses
              : [],
          );

        setGenderLookups(
          Array.isArray(genders)
            ? genders
            : [],
        );

        setNationalityLookups(
          Array.isArray(nationalities)
            ? nationalities
            : [],
        );

        setLevelLookups(
          Array.isArray(levels)
            ? levels
            : [],
        );

        setRoleLookups(
          Array.isArray(roles)
            ? roles
            : [],
        );
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "Failed to load create-member lookups:",
            error.message,
          );

          setSubmitError(
            "មិនអាចទាញយកទិន្នន័យសម្រាប់បង្កើតសមាជិកបានទេ។",
          );
        }
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
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
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
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

  const update =
    (field) => (event) => {
      const value =
        event.target.value;

      setForm((previousForm) => ({
        ...previousForm,
        [field]: value,
      }));

      setShowValidationError(false);

      setSubmitError("");
    };

  const genderOptions = useMemo(
    () =>
      genderLookups.map((gender) => ({
        label:
          gender.labelKm ||
          gender.label_km ||
          gender.labelEn ||
          gender.code,

        value: gender.code,
      })),
    [genderLookups],
  );

  const nationalityOptions = useMemo(
    () =>
      nationalityLookups.map(
        (nationality) => ({
          label:
            nationality.labelKm ||
            nationality.label_km ||
            nationality.labelEn ||
            nationality.code,

          value: String(
            nationality.id,
          ),
        }),
      ),
    [nationalityLookups],
  );

  const levelOptions = useMemo(
    () =>
      levelLookups.map((level) => ({
        label:
          level.labelKm ||
          level.label_km ||
          level.labelEn ||
          level.code,

        value: String(level.id),
      })),
    [levelLookups],
  );

  const roleOptions = useMemo(
    () =>
      roleLookups.map((role) => ({
        label:
          role.labelKm ||
          role.label_km ||
          role.labelEn ||
          role.code,

        value: role.code,
      })),
    [roleLookups],
  );

  const branchOptions = useMemo(
    () =>
        branchLookups
          .map((branch) => ({
            label:
              branch?.label_km ||
              branch?.labelKm ||
              branch?.name_km ||
              branch?.nameKm ||
              branch?.name_en ||
              branch?.nameEn ||
              branch?.branch_code ||
              branch?.branchCode ||
              "",

            value: String(
              branch?.id ??
              branch?.value ??
              "",
            ),
          }))
          .filter(
            (branch) =>
              branch.value !== "" &&
              branch.label !== "",
          ),
      [branchLookups],
    );``

  const statusOptions = useMemo(
    () =>
      statusLookups.map((status) => ({
        label:
          status?.labelKm ||
          status?.label_km ||
          status?.labelEn ||
          status?.label_en ||
          status?.code ||
          "-",

        value: String(
          status?.id ?? "",
        ),
      })),
    [statusLookups],
  );

  const requiredFields = [
    "fullNameKm",
    "fullNameEn",
    "gender",
    "nationalityId",
    "dateOfBirth",
    "phone",
    "branchId",
    "levelId",
    "role",
    "joinedOn",
    "statusId",
  ];

  const isFormValid =
    requiredFields.every((field) => {
      return (
        String(form[field] ?? "").trim() !==
        ""
      );
    });

  const submit = async (event) => {
    event.preventDefault();

    if (
      !isFormValid ||
      isSubmitting
    ) {
      setShowValidationError(true);

      return;
    }

    setShowValidationError(false);

    setSubmitError("");

    setIsSubmitting(true);

    const payload = {
      full_name_km:
        form.fullNameKm.trim(),

      full_name_en:
        form.fullNameEn.trim(),

      gender: form.gender,

      nationality_id: Number(
        form.nationalityId,
      ),

      date_of_birth:
        form.dateOfBirth,

      phone: form.phone.trim(),

      email:
        form.email.trim() || null,

      branch_id: Number(
        form.branchId,
      ),

      level_id: Number(
        form.levelId,
      ),

      role: form.role,

      joined_on: form.joinedOn,

      status_id: Number(
        form.statusId,
      ),
    };

    try {
      const createdMember =
        await createMember(payload);

      await onSave?.(createdMember);

      setForm(EMPTY_FORM);

      onClose?.();
    } catch (error) {
      console.warn(
        "Cannot create member:",
        error.message,
      );

      setSubmitError(
        error.message ||
          "មិនអាចបង្កើតសមាជិកបានទេ។",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/40"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
        <div className="absolute inset-0 flex items-start justify-center overflow-y-auto p-3 pt-5 sm:p-4 sm:pt-6 lg:bottom-0 lg:left-72 lg:right-0 lg:top-16 lg:items-start lg:pt-5">        <div
          className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[680px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl lg:max-h-[calc(100dvh-5rem)]"
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="text-lg font-bold text-primary">
              បង្កើតសមាជិកថ្មី
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="បិទ"
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-gray-100 hover:text-text-primary"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={submit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                {/* 1. full_name_km */}

                <BoxFill
                  label="ឈ្មោះជាភាសាខ្មែរ"
                  name="fullNameKm"
                  placeholder="បញ្ចូលឈ្មោះ"
                  value={form.fullNameKm}
                  onChange={update(
                    "fullNameKm",
                  )}
                />

                {/* 2. full_name_en */}

                <BoxFill
                  label="ឈ្មោះជាអក្សរឡាតាំង"
                  name="fullNameEn"
                  placeholder="បញ្ចូលឈ្មោះ"
                  value={form.fullNameEn}
                  onChange={update(
                    "fullNameEn",
                  )}
                />

                {/* 3. gender */}

                <FormSelect
                  label="ភេទ"
                  name="gender"
                  placeholder="ជ្រើសរើសភេទ"
                  options={genderOptions}
                  value={form.gender}
                  onChange={update(
                    "gender",
                  )}
                />

                {/* 4. nationality_id */}

                <FormSelect
                  label="សញ្ជាតិ"
                  name="nationalityId"
                  placeholder="ជ្រើសរើសសញ្ជាតិ"
                  options={
                    nationalityOptions
                  }
                  value={
                    form.nationalityId
                  }
                  onChange={update(
                    "nationalityId",
                  )}
                />

                {/* 5. date_of_birth */}

                <BoxFill
                  label="ថ្ងៃខែឆ្នាំកំណើត"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={update(
                    "dateOfBirth",
                  )}
                />

                {/* 6. phone */}

                <BoxFill
                  label="លេខទូរស័ព្ទ"
                  name="phone"
                  type="tel"
                  placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                  value={form.phone}
                  onChange={update("phone")}
                />

                {/* 7. email */}

                <BoxFill
                  label="អ៊ីមែល"
                  name="email"
                  type="email"
                  placeholder="បញ្ចូលអ៊ីមែល"
                  value={form.email}
                  onChange={update("email")}
                />

                {/* 8. branch_id */}

                <FormSelect
                  label="សាខា"
                  name="branchId"
                  placeholder="ជ្រើសរើសសាខា"
                  options={branchOptions}
                  value={form.branchId}
                  onChange={update(
                    "branchId",
                  )}
                />

                {/* 9. level_id */}

                <FormSelect
                  label="កាំ"
                  name="levelId"
                  placeholder="ជ្រើសរើសកាំ"
                  options={levelOptions}
                  value={form.levelId}
                  onChange={update(
                    "levelId",
                  )}
                />

                {/* 10. role */}

                <FormSelect
                  label="តួនាទី"
                  name="role"
                  placeholder="ជ្រើសរើសតួនាទី"
                  options={roleOptions}
                  value={form.role}
                  onChange={update("role")}
                />

                {/* 11. joined_on */}

                <BoxFill
                  label="ថ្ងៃខែឆ្នាំចូលរួម"
                  name="joinedOn"
                  type="date"
                  value={form.joinedOn}
                  onChange={update(
                    "joinedOn",
                  )}
                />

                {/* 12. status_id */}

                <FormSelect
                  label="ស្ថានភាព"
                  name="statusId"
                  placeholder="ជ្រើសរើសស្ថានភាព"
                  options={statusOptions}
                  value={form.statusId}
                  onChange={update(
                    "statusId",
                  )}
                />
              </div>

              {showValidationError &&
                !isFormValid && (
                  <p className="mt-4 text-xs font-medium text-red-500">
                    សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។
                  </p>
                )}

              {submitError && (
                <p className="mt-4 text-xs font-medium text-red-500">
                  {submitError}
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-border bg-white px-4 py-3 sm:px-5 sm:py-4">
              <FormActionButton
                onCancel={onClose}
                isValid={
                  isFormValid &&
                  !isSubmitting
                }
                saveText={
                  isSubmitting
                    ? "កំពុងរក្សាទុក..."
                    : "រក្សាទុក"
                }
                cancelText="បោះបង់"
              />
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}