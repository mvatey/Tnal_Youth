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
import MultiSelect from "@/components/forms/multiselect";
import FormActionButton from "@/components/forms/FormActionButton";
import { useAuth } from "@/context/AuthContext";

// Mirrors the backend's MemberServiceImpl#validateAssignableRole hierarchy:
// a SECRETARY may only create MEMBER accounts, a BRANCH_LEADER may create
// MEMBER or SECRETARY, and ADMIN may create any of the three. Anyone else
// (e.g. VIEWER) gets no assignable roles, since they can't create members.
const ASSIGNABLE_ROLES_BY_ACTOR = {
  SECRETARY: ["MEMBER"],
  BRANCH_LEADER: ["MEMBER", "SECRETARY"],
  ADMIN: ["MEMBER", "SECRETARY", "BRANCH_LEADER"],
};

const EMPTY_FORM = {
  fullNameKm: "",
  fullNameEn: "",
  gender: "",
  nationalityId: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  branchId: "",
  branchIds: [],
  levelId: "",
  positionId: "",
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
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body ===
      "object"
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
        Accept:
          "application/json",
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
    body =
      JSON.parse(text);
  } catch {
    body = text;
  }
}

/* TEMP DEBUG */
console.log(
  "CREATE MEMBER STATUS:",
  response.status,
);

console.log(
  "CREATE MEMBER RESPONSE:",
  body,
);

console.log(
  "CREATE MEMBER PAYLOAD:",
  payload,
);

if (!response.ok) {
    const message =
      typeof body ===
      "object"
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

function normalizeArray(
  data,
) {
  if (
    Array.isArray(data)
  ) {
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

  fixedBranchId = null,
  fixedBranchName = "",
  lockBranch = false,
}) {
  const { user } = useAuth();

  const allowedRoles =
    useMemo(
      () =>
        ASSIGNABLE_ROLES_BY_ACTOR[
          String(
            user?.role || "",
          ).toUpperCase()
        ] || [],
      [user?.role],
    );

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
    positionLookups,
    setPositionLookups,
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
  if (!open) {
      return;
    }

    setForm({
      ...EMPTY_FORM,

      branchId:
        fixedBranchId != null
          ? String(fixedBranchId)
          : "",
    });

    setShowValidationError(
      false,
    );

    setSubmitError("");
  }, [
    open,
    fixedBranchId,
  ]);

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

    loadLookup(
      "/lookups/positions",
      setPositionLookups,
    );

    return () => {
      cancelled = true;
    };
  }, [open]);

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

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      document.body.style
        .overflow =
        previousOverflow;
    };
  }, [open]);

  const update =
    (field) =>
    (event) => {
      const value =
        event.target.value;

      setForm(
        (
          previousForm,
        ) => ({
          ...previousForm,
          [field]:
            value,
        }),
      );

      setShowValidationError(
        false,
      );

      setSubmitError("");
    };

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
                value:
                  code,
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
        genderLookups,
      ],
    );

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
                nationality?.nameKm ||
                nationality?.name_km ||
                nationality?.nameEn ||
                nationality?.name_en ||
                nationality?.code ||
                "";

              return {
                label,

                value:
                  id !==
                    null &&
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
                level?.nameKm ||
                level?.name_km ||
                level?.code ||
                "";

              return {
                label,

                value:
                  id !==
                    null &&
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
                value:
                  code,
              };
            },
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "" &&
              allowedRoles.includes(
                option.value,
              ),
          ),
      [
        roleLookups,
        allowedRoles,
      ],
    );

  const positionOptions =
    useMemo(
      () =>
        positionLookups
          .map(
            (position) => ({
              label:
                position?.labelKm ||
                position?.label_km ||
                position?.labelEn ||
                position?.label_en ||
                position?.code ||
                "",
              value:
                position?.id !=
                null
                  ? String(
                      position.id,
                    )
                  : "",
              mappedRole:
                String(
                  position?.mappedRole ||
                    "MEMBER",
                ).toUpperCase(),
            }),
          )
          .filter(
            (option) =>
              option.value !==
                "" &&
              option.label !==
                "" &&
              allowedRoles.includes(
                option.mappedRole,
              ),
          ),
      [
        positionLookups,
        allowedRoles,
      ],
    );

  const updatePosition =
    (event) => {
      const value =
        event.target.value;

      const selectedPosition =
        positionLookups.find(
          (position) =>
            String(
              position?.id,
            ) === value,
        );

      setForm(
        (previousForm) => ({
          ...previousForm,
          positionId: value,
          role:
            selectedPosition?.mappedRole ||
            previousForm.role,
        }),
      );

      setShowValidationError(
        false,
      );

      setSubmitError("");
    };

  // A secretary can cover more than one branch; every other role (and a
  // page locked to a single fixed branch) stays single-branch.
  const isSecretaryRole =
    form.role === "SECRETARY" &&
    !lockBranch;

  const updateBranchIds = (
    nextValues,
  ) => {
    setForm(
      (previousForm) => ({
        ...previousForm,
        branchIds: nextValues,
      }),
    );

    setShowValidationError(
      false,
    );

    setSubmitError("");
  };

  const branchOptions =
  useMemo(() => {
    /*
     * Branch Detail page:
     * only the current branch is allowed.
     */
    if (
      lockBranch &&
      fixedBranchId != null
    ) {
      return [
        {
          label:
            fixedBranchName ||
            `Branch ${fixedBranchId}`,

          value:
            String(
              fixedBranchId
            ),
        },
      ];
    }

    /*
     * Normal Member page:
     * use accessible branch options.
     */
    return branchLookups
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
              id !== undefined
                ? String(id)
                : "",
          };
        },
      )
      .filter(
        (option) =>
          option.value !== "" &&
          option.label !== "",
      );
  }, [
    branchLookups,
    fixedBranchId,
    fixedBranchName,
    lockBranch,
  ]);

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
                  id !==
                    null &&
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

  const requiredFields = [
    "fullNameKm",
    "fullNameEn",
    "gender",
    "nationalityId",
    "dateOfBirth",
    "phone",
    "levelId",
    "role",
    "joinedOn",
    "statusId",
  ];

  const isFormValid =
    requiredFields.every(
      (field) =>
        String(
          form[field] ??
            "",
        ).trim() !==
        "",
    ) &&
    (isSecretaryRole
      ? form.branchIds.length > 0
      : String(
          form.branchId ?? "",
        ).trim() !== "");

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

      setIsSubmitting(
        true,
      );

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
          isSecretaryRole
            ? Number(
                form.branchIds[0],
              )
            : Number(
                form.branchId,
              ),

        branch_ids:
          isSecretaryRole &&
          form.branchIds.length > 1
            ? form.branchIds.map(
                Number,
              )
            : null,

        level_id:
          Number(
            form.levelId,
          ),

        position_id:
          form.positionId
            ? Number(
                form.positionId,
              )
            : null,

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
      className="
        fixed
        inset-0
        z-[9999]
        bg-black/40
      "
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
      {/* =====================================
          CENTER ONLY INSIDE MAIN CONTENT AREA
      ===================================== */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          top-0

          flex
          items-center
          justify-center

          p-3
          sm:p-4

          lg:left-72
          lg:top-16
        "
      >
        <div
          className="
            flex
            max-h-[calc(100dvh-32px)]
            w-full
            max-w-[900px]
            flex-col
            overflow-hidden
            rounded-xl
            bg-bg-page-white
            shadow-2xl
            sm:rounded-2xl

            lg:max-h-[calc(100dvh-96px)]
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
              px-4
              py-4
              sm:px-5
            "
          >
            <h2 className="text-lg font-bold text-primary">
              បង្កើតសមាជិកថ្មី
            </h2>

            <button
              type="button"
              onClick={
                onClose
              }
              aria-label="បិទ"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-text-secondary
                transition
                hover:bg-bg-page-gray
                hover:text-text-primary
              "
            >
              <X
                size={18}
              />
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
            {/* SCROLLABLE BODY */}

            <div
              className="
                no-scrollbar
                min-h-0
                flex-1
                overflow-y-auto
                px-4
                py-4
                sm:px-5
              "
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-4
                  gap-y-3
                  sm:grid-cols-2
                "
              >
                <BoxFill
                  label="ឈ្មោះជាភាសាខ្មែរ"
                  name="fullNameKm"
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
                  label="ស្ថានភាព"
                  name="statusId"
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

                <BoxFill
                  label="លេខទូរស័ព្ទ"
                  name="phone"
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
                  label="តំណែង"
                  name="positionId"
                  placeholder="ជ្រើសរើសតំណែង"
                  options={
                    positionOptions
                  }
                  value={
                    form.positionId
                  }
                  onChange={
                    updatePosition
                  }
                />

                <FormSelect
                  label="តួនាទី"
                  name="role"
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
                  disabled={Boolean(
                    form.positionId,
                  )}
                />

                {isSecretaryRole ? (
                  <MultiSelect
                    label="សាខា"
                    name="branchIds"
                    placeholder="ជ្រើសរើសសាខា"
                    options={
                      branchOptions
                    }
                    value={
                      form.branchIds
                    }
                    onChange={
                      updateBranchIds
                    }
                    disabled={
                      lockBranch
                    }
                  />
                ) : (
                  <FormSelect
                    label="សាខា"
                    name="branchId"
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
                    disabled={
                      lockBranch
                    }
                  />
                )}

                <BoxFill
                  label="ថ្ងៃខែឆ្នាំកំណើត"
                  name="dateOfBirth"
                  type="date"
                  value={
                    form.dateOfBirth
                  }
                  onChange={update(
                    "dateOfBirth",
                  )}
                />

                <BoxFill
                  label="ថ្ងៃខែឆ្នាំចូលរួម"
                  name="joinedOn"
                  type="date"
                  value={
                    form.joinedOn
                  }
                  onChange={update(
                    "joinedOn",
                  )}
                />

                <FormSelect
                  label="កម្រិតសមាជិក (កាំ)"
                  name="levelId"
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
              </div>

              {showValidationError &&
                !isFormValid && (
                  <p
                    className="
                      mt-4
                      text-xs
                      font-medium
                      text-error
                    "
                  >
                    សូមបំពេញព័ត៌មានដែលត្រូវការឱ្យបានគ្រប់គ្រាន់។
                  </p>
                )}

              {submitError && (
                <p
                  className="
                    mt-4
                    text-xs
                    font-medium
                    text-error
                  "
                >
                  {
                    submitError
                  }
                </p>
              )}
            </div>

            {/* ACTION BUTTON */}

            <div
              className="
                shrink-0
                border-t
                border-border
                bg-bg-page-white
                px-4
                py-3
                sm:px-5
                sm:py-4
                [&>div]:mt-0
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
                saving={
                  isSubmitting
                }
                saveText="រក្សាទុក"
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