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
  const response = await fetch(
    `/api${path}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  const text =
    await response.text();

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
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

async function createMember(
  payload,
) {
  const response = await fetch(
    "/api/members",
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          payload,
        ),
    },
  );

  const text =
    await response.text();

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
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

function normalizeArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.data,
    )
  ) {
    return data.data;
  }

  if (
    Array.isArray(
      data?.content,
    )
  ) {
    return data.content;
  }

  return [];
}

export default function CreateMemberModal({
  open,
  onClose,
  onSave,
}) {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM,
  );

  const [
    branchLookups,
    setBranchLookups,
  ] = useState([]);

  const [
    statusLookups,
    setStatusLookups,
  ] = useState([]);

  const [
    genderLookups,
    setGenderLookups,
  ] = useState([]);

  const [
    nationalityLookups,
    setNationalityLookups,
  ] = useState([]);

  const [
    levelLookups,
    setLevelLookups,
  ] = useState([]);

  const [
    roleLookups,
    setRoleLookups,
  ] = useState([]);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    showValidationError,
    setShowValidationError,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  /*
   * =========================================
   * MOUNT
   * =========================================
   */

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * =========================================
   * RESET WHEN MODAL OPENS
   * =========================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      EMPTY_FORM,
    );

    setShowValidationError(
      false,
    );

    setSubmitError("");
  }, [open]);

  /*
   * =========================================
   * LOAD LOOKUPS
   * =========================================
   */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let cancelled =
      false;

    async function loadLookup(
      path,
      setter,
    ) {
      try {
        const data =
          await fetchJson(
            path,
          );

        if (cancelled) {
          return;
        }

        setter(
          normalizeArray(
            data,
          ),
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            `Cannot load ${path}:`,
            error,
          );

          setter([]);
        }
      }
    }

    /*
     * Load independently.
     *
     * One failed lookup should not
     * make every dropdown empty.
     */

    loadLookup(
      "/lookups/branches",
      setBranchLookups,
    );

    loadLookup(
      "/lookups/member-statuses",
      setStatusLookups,
    );

    loadLookup(
      "/lookups/genders",
      setGenderLookups,
    );

    loadLookup(
      "/lookups/nationalities",
      setNationalityLookups,
    );

    loadLookup(
      "/lookups/member-levels",
      setLevelLookups,
    );

    loadLookup(
      "/lookups/user-roles",
      setRoleLookups,
    );

    return () => {
      cancelled = true;
    };
  }, [open]);

  /*
   * =========================================
   * ESCAPE
   * =========================================
   */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
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
  }, [
    open,
    onClose,
  ]);

  /*
   * =========================================
   * LOCK PAGE SCROLL
   * =========================================
   */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow = "hidden";

    return () => {
      document.body.style
        .overflow =
        previousOverflow;
    };
  }, [open]);

  /*
   * =========================================
   * FORM CHANGE
   * =========================================
   */

  const update =
    (field) => (event) => {
      const value =
        event.target.value;

      setForm(
        (previousForm) => ({
          ...previousForm,
          [field]: value,
        }),
      );

      setShowValidationError(
        false,
      );

      setSubmitError("");
    };

  /*
   * =========================================
   * GENDER OPTIONS
   * =========================================
   */

  const genderOptions =
    useMemo(
      () =>
        genderLookups
          .map(
            (gender) => {
              const code =
                String(
                  gender?.code ??
                    gender?.value ??
                    "",
                ).toUpperCase();

              const label =
                gender?.labelKm ||
                gender?.label_km ||
                gender?.labelEn ||
                gender?.label_en ||
                gender?.code ||
                "";

              return {
                label,
                value: code,
              };
            },
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "",
          ),
      [genderLookups],
    );

  /*
   * =========================================
   * NATIONALITY OPTIONS
   * =========================================
   */

  const nationalityOptions =
    useMemo(
      () =>
        nationalityLookups
          .map(
            (
              nationality,
            ) => {
              const id =
                nationality?.id ??
                nationality?.value ??
                "";

              const label =
                nationality?.labelKm ||
                nationality?.label_km ||
                nationality?.labelEn ||
                nationality?.label_en ||
                nationality?.code ||
                "";

              return {
                label,

                value:
                  id !== null &&
                  id !==
                    undefined
                    ? String(
                        id,
                      )
                    : "",
              };
            },
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "",
          ),
      [
        nationalityLookups,
      ],
    );

  /*
   * =========================================
   * MEMBER LEVEL OPTIONS
   * =========================================
   */

  const levelOptions =
    useMemo(
      () =>
        levelLookups
          .map(
            (level) => {
              const id =
                level?.id ??
                level?.value ??
                "";

              const label =
                level?.labelKm ||
                level?.label_km ||
                level?.labelEn ||
                level?.label_en ||
                level?.code ||
                "";

              return {
                label,

                value:
                  id !== null &&
                  id !==
                    undefined
                    ? String(
                        id,
                      )
                    : "",
              };
            },
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "",
          ),
      [levelLookups],
    );

  /*
   * =========================================
   * ROLE OPTIONS
   * =========================================
   */

  const roleOptions =
    useMemo(
      () =>
        roleLookups
          .map(
            (role) => {
              const code =
                String(
                  role?.code ??
                    role?.value ??
                    "",
                ).toUpperCase();

              const label =
                role?.labelKm ||
                role?.label_km ||
                role?.labelEn ||
                role?.label_en ||
                role?.code ||
                "";

              return {
                label,
                value: code,
              };
            },
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "",
          ),
      [roleLookups],
    );

  /*
   * =========================================
   * BRANCH OPTIONS
   * =========================================
   */

  const branchOptions =
    useMemo(
      () =>
        branchLookups
          .map(
            (branch) => {
              const id =
                branch?.id ??
                branch?.value ??
                "";

              const label =
                branch?.label_km ||
                branch?.labelKm ||
                branch?.name_km ||
                branch?.nameKm ||
                branch?.name_en ||
                branch?.nameEn ||
                branch?.branch_code ||
                branch?.branchCode ||
                "";

              return {
                label,

                value:
                  id !== null &&
                  id !==
                    undefined
                    ? String(
                        id,
                      )
                    : "",
              };
            },
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "",
          ),
      [branchLookups],
    );

  /*
   * =========================================
   * STATUS OPTIONS
   * =========================================
   */

  const statusOptions =
    useMemo(
      () =>
        statusLookups
          .map(
            (status) => {
              const id =
                status?.id ??
                status?.value ??
                "";

              const label =
                status?.labelKm ||
                status?.label_km ||
                status?.labelEn ||
                status?.label_en ||
                status?.code ||
                "";

              return {
                label,

                value:
                  id !== null &&
                  id !==
                    undefined
                    ? String(
                        id,
                      )
                    : "",
              };
            },
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "",
          ),
      [statusLookups],
    );

  /*
   * =========================================
   * VALIDATION
   * =========================================
   */

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
    requiredFields.every(
      (field) =>
        String(
          form[field] ?? "",
        ).trim() !== "",
    );

  /*
   * =========================================
   * SUBMIT
   * =========================================
   */

  const submit =
    async (event) => {
      event.preventDefault();

      if (
        !isFormValid ||
        isSubmitting
      ) {
        setShowValidationError(
          true,
        );

        return;
      }

      setShowValidationError(
        false,
      );

      setSubmitError("");

      setIsSubmitting(true);

      const payload = {
        full_name_km:
          form.fullNameKm.trim(),

        full_name_en:
          form.fullNameEn.trim(),

        gender:
          form.gender,

        nationality_id:
          Number(
            form.nationalityId,
          ),

        date_of_birth:
          form.dateOfBirth,

        phone:
          form.phone.trim(),

        email:
          form.email.trim() ||
          null,

        branch_id:
          Number(
            form.branchId,
          ),

        level_id:
          Number(
            form.levelId,
          ),

        role:
          form.role,

        joined_on:
          form.joinedOn,

        status_id:
          Number(
            form.statusId,
          ),
      };

      try {
        const createdMember =
          await createMember(
            payload,
          );

        await onSave?.(
          createdMember,
        );

        setForm(
          EMPTY_FORM,
        );

        onClose?.();
      } catch (error) {
        console.error(
          "Cannot create member:",
          error,
        );

        setSubmitError(
          error.message ||
            "មិនអាចបង្កើតសមាជិកបានទេ។",
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    };

  if (
    !open ||
    !mounted
  ) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/40"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div
        className="
          absolute
          inset-0
          flex
          items-start
          justify-center
          overflow-y-auto
          p-3
          pt-5
          sm:p-4
          sm:pt-6
          p-4
        "
      >
        <div
          className="
            flex
            max-h-[calc(100dvh-2rem)]
            w-full
            max-w-[1020px]
            flex-col
            overflow-hidden
            rounded-xl
            bg-white
            shadow-2xl
            sm:rounded-2xl
          "
          onMouseDown={(
            event,
          ) =>
            event.stopPropagation()
          }
        >
          {/* HEADER */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-border
              px-7
              py-7
            "
          >
            <h2 className="text-xl font-bold text-primary">
              បង្កើតសមាជិកថ្មី
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="បិទ"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-text-secondary
                transition
                hover:bg-gray-100
                hover:text-text-primary
              "
            >
              <X size={18} />
            </button>
          </div>

          {/* FORM */}

          <form
            onSubmit={
              submit
            }
            className="
              flex
              min-h-0
              flex-1
              flex-col
            "
          >
            <div
              className="
                no-scrollbar
                min-h-0
                flex-1
                overflow-y-auto
                px-7
                py-6
              "
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-6
                  gap-y-4
                  sm:grid-cols-2
                  [&_input]:!h-[52px]
                  [&_select]:!h-[52px]
                "
              >
                <BoxFill
                  label="ឈ្មោះជាភាសាខ្មែរ"
                  name="fullNameKm"
                  className="sm:order-1"
                  placeholder="បញ្ចូលឈ្មោះ"
                  value={
                    form.fullNameKm
                  }
                  onChange={update(
                    "fullNameKm",
                  )}
                />

                <BoxFill
                  label="ឈ្មោះជាអក្សរឡាតាំង"
                  name="fullNameEn"
                  className="sm:order-2"
                  placeholder="បញ្ចូលឈ្មោះ"
                  value={
                    form.fullNameEn
                  }
                  onChange={update(
                    "fullNameEn",
                  )}
                />

                <FormSelect
                  label="ភេទ"
                  name="gender"
                  className="sm:order-3"
                  placeholder="ជ្រើសរើសភេទ"
                  options={
                    genderOptions
                  }
                  value={
                    form.gender
                  }
                  onChange={update(
                    "gender",
                  )}
                />

                <FormSelect
                  label="សញ្ជាតិ"
                  name="nationalityId"
                  className="sm:order-4"
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

                <BoxFill
                  label="ថ្ងៃខែឆ្នាំកំណើត"
                  name="dateOfBirth"
                  className="sm:order-9"
                  type="date"
                  value={
                    form.dateOfBirth
                  }
                  onChange={update(
                    "dateOfBirth",
                  )}
                />

                <BoxFill
                  label="លេខទូរស័ព្ទ"
                  name="phone"
                  className="sm:order-5"
                  type="tel"
                  placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                  value={
                    form.phone
                  }
                  onChange={update(
                    "phone",
                  )}
                />

                <BoxFill
                  label="អ៊ីមែល"
                  name="email"
                  className="sm:order-6"
                  type="email"
                  placeholder="បញ្ចូលអ៊ីមែល"
                  value={
                    form.email
                  }
                  onChange={update(
                    "email",
                  )}
                />

                <FormSelect
                  label="សាខា"
                  name="branchId"
                  className="sm:order-7"
                  placeholder="ជ្រើសរើសសាខា"
                  options={
                    branchOptions
                  }
                  value={
                    form.branchId
                  }
                  onChange={update(
                    "branchId",
                  )}
                />

                <FormSelect
                  label="កម្រិតសមាជិក (កាំ)"
                  name="levelId"
                  className="sm:order-11"
                  placeholder="ជ្រើសរើសកម្រិតសមាជិក"
                  options={
                    levelOptions
                  }
                  value={
                    form.levelId
                  }
                  onChange={update(
                    "levelId",
                  )}
                />

                <FormSelect
                  label="តួនាទី"
                  name="role"
                  className="sm:order-8"
                  placeholder="ជ្រើសរើសតួនាទី"
                  options={
                    roleOptions
                  }
                  value={
                    form.role
                  }
                  onChange={update(
                    "role",
                  )}
                />

                <BoxFill
                  label="ថ្ងៃខែឆ្នាំចូលរួម"
                  name="joinedOn"
                  className="sm:order-10"
                  type="date"
                  value={
                    form.joinedOn
                  }
                  onChange={update(
                    "joinedOn",
                  )}
                />

                <FormSelect
                  label="ស្ថានភាព"
                  name="statusId"
                  className="sm:order-12"
                  placeholder="ជ្រើសរើសស្ថានភាព"
                  options={
                    statusOptions
                  }
                  value={
                    form.statusId
                  }
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

            {/* ACTIONS */}

            <div
              className="
                shrink-0
                border-t
                border-border
                bg-white
                px-7
                py-6
                [&>div]:mt-0
                [&_button]:!h-[52px]
                [&_button]:!text-base
                sm:[&>div]:!grid-cols-[252px_1fr]
              "
            >
              <FormActionButton
                onCancel={
                  onClose
                }
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
