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
import SearchableSelect from "@/components/forms/SearchableSelect";
import FormActionButton from "@/components/forms/FormActionButton";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useBranch } from "@/context/BranchContext";
import { getLookup } from "@/lib/lookupCache";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";

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
  username: "",
  phone: "",
  email: "",
  branchId: "",
  levelId: "",
  positionId: "",
  role: "",
  joinedOn: "",
};

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
  const { t, label } =
    useLanguage();
  const { selectedBranch: sidebarSelectedBranch } =
    useBranch();

  // A secretary only ever manages the one branch currently active in
  // their sidebar (see BranchContext's isBranchScopedRole) -- letting
  // them freely pick a different branch here would create members the
  // rest of their session can't even see. Follow that sidebar branch
  // the same way the Branch Detail page's fixedBranchId/lockBranch
  // props already lock the field for that entry point.
  const isSecretaryCreator =
    String(user?.role || "").toUpperCase() ===
    "SECRETARY";

  const effectiveLockBranch =
    lockBranch ||
    (isSecretaryCreator &&
      sidebarSelectedBranch !== "all");

  const effectiveFixedBranchId =
    fixedBranchId != null
      ? fixedBranchId
      : isSecretaryCreator &&
          sidebarSelectedBranch !== "all"
        ? sidebarSelectedBranch
        : null;

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

  // Which of phone/email to collect -- a radio choice instead of showing
  // both fields plus a small "at least one is required" hint underneath,
  // which was easy to miss and, on a narrow screen, ended up cramped
  // right against the field above it. Defaults to phone, the more common
  // choice for a new member.
  const [
    contactMethod,
    setContactMethod,
  ] = useState("phone");

  const handleContactMethodChange = (method) => {
    setContactMethod(method);

    setForm((previousForm) => ({
      ...previousForm,
      phone: method === "email" ? "" : previousForm.phone,
      email: method === "phone" ? "" : previousForm.email,
    }));
  };

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
        effectiveFixedBranchId != null
          ? String(effectiveFixedBranchId)
          : "",
    });

    setShowValidationError(
      false,
    );

    setSubmitError("");
  }, [
    open,
    effectiveFixedBranchId,
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
          await getLookup(
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

              const genderLabel =
                label(
                  gender,
                  gender?.code || "",
                );

              return {
                label: genderLabel,
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
        label,
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

              const nationalityLabel =
                label(
                  nationality,
                  nationality?.code || "",
                );

              return {
                label: nationalityLabel,

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
        label,
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

              const levelLabel =
                label(
                  level,
                  level?.code || "",
                );

              return {
                label: levelLabel,

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
      [levelLookups, label],
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

              const roleLabel =
                String(role?.code || role?.value || "").toUpperCase() === "ADMIN"
                  ? t("memberPage.roleAdmin")
                  : String(role?.code || role?.value || "").toUpperCase() === "SECRETARY"
                    ? t("memberPage.roleSecretary")
                    : String(role?.code || role?.value || "").toUpperCase() === "BRANCH_LEADER"
                      ? t("memberPage.roleBranchLeader")
                      : String(role?.code || role?.value || "").toUpperCase() === "MEMBER"
                        ? t("memberPage.roleMember")
                        : label(role, role?.code || "");

              return {
                label: roleLabel,
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
        label,
        t,
      ],
    );

  const positionOptions =
    useMemo(
      () =>
        positionLookups
          .map(
            (position) => ({
              label:
                label(position, position?.code || ""),
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
        label,
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

  const branchOptions =
  useMemo(() => {
    /*
     * Branch Detail page (explicit fixedBranchId/lockBranch props), or
     * a secretary creator (locked to their sidebar's active branch):
     * only that one branch is allowed.
     */
    if (
      effectiveLockBranch &&
      effectiveFixedBranchId != null
    ) {
      const matchedBranch =
        branchLookups.find(
          (branch) =>
            String(
              branch?.id ??
                branch?.value ??
                "",
            ) ===
            String(
              effectiveFixedBranchId,
            ),
        );

      const resolvedLabel =
        matchedBranch
          ? label(
              matchedBranch,
              matchedBranch?.branch_code ||
                matchedBranch?.branchCode ||
                "",
            )
          : "";

      return [
        {
          label:
            fixedBranchName ||
            resolvedLabel ||
            `${t("memberPage.branch")} ${effectiveFixedBranchId}`,

          value:
            String(
              effectiveFixedBranchId
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

          const branchLabel =
            label(
              branch,
              branch?.branch_code ||
                branch?.branchCode ||
                "",
            );

          return {
            label: branchLabel,

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
    effectiveFixedBranchId,
    fixedBranchName,
    effectiveLockBranch,
    label,
    t,
  ]);

  // Only info that's needed to create a usable member/login record at all
  // is required here -- nationality, date of birth, member level, join
  // date, status, and the English name are all editable any time later
  // from the member's own personal-info page, so none of them block
  // creation.
  const requiredFields = [
    "fullNameKm",
    "gender",
    "username",
    "branchId",
    "role",
  ];

  // Whichever contact method is selected must actually be filled in --
  // member-linked accounts no longer go through OTP-based activation (see
  // MemberServiceImpl.createActiveUserAccount), so nothing here actually
  // needs email specifically anymore; the choice is purely which field(s)
  // this member wants to provide.
  const phoneOrEmailRequirementMet =
    contactMethod === "phone"
      ? form.phone.trim() !== ""
      : contactMethod === "email"
        ? form.email.trim() !== ""
        : form.phone.trim() !== "" && form.email.trim() !== "";

  const isFormValid =
    requiredFields.every(
      (field) =>
        String(
          form[field] ??
            "",
        ).trim() !==
        "",
    ) && phoneOrEmailRequirementMet;

  const submit =
    async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!form.fullNameKm.trim()) {
        setSubmitError(t("memberPage.requiredNameKm"));
        return;
      }

      if (!form.gender.trim()) {
        setSubmitError(t("memberPage.requiredGender"));
        return;
      }

      if (!form.username.trim()) {
        setSubmitError(t("memberPage.requiredUsername"));
        return;
      }

      if (!phoneOrEmailRequirementMet) {
        setSubmitError(
          contactMethod === "phone"
            ? t("memberPage.requiredPhone")
            : contactMethod === "email"
              ? t("memberPage.requiredEmail")
              : t("memberPage.requiredBothPhoneAndEmail"),
        );
        return;
      }

      if (!String(form.branchId).trim()) {
        setSubmitError(t("memberPage.requiredBranch"));
        return;
      }

      if (!form.role.trim()) {
        setSubmitError(t("memberPage.requiredRole"));
        return;
      }

      setSubmitError("");

      const todayIso =
        new Date()
          .toISOString()
          .split("T")[0];

      if (
        form.dateOfBirth >
        todayIso
      ) {
        setSubmitError(
          t("memberPage.dobInFuture"),
        );

        return;
      }

      const minAgeDate =
        new Date();

      minAgeDate.setFullYear(
        minAgeDate.getFullYear() -
          12,
      );

      const minAgeIso =
        minAgeDate
          .toISOString()
          .split("T")[0];

      if (
        form.dateOfBirth >
        minAgeIso
      ) {
        setSubmitError(
          t("memberPage.dobTooRecent"),
        );

        return;
      }

      setSubmitError("");

      setIsSubmitting(
        true,
      );

      const payload = {
        full_name_km:
          form.fullNameKm.trim(),

        full_name_en:
          form.fullNameEn.trim() ||
          null,

        gender:
          form.gender,

        nationality_id:
          form.nationalityId
            ? Number(
                form.nationalityId,
              )
            : null,

        date_of_birth:
          form.dateOfBirth || null,

        username:
          form.username.trim(),

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
          form.levelId
            ? Number(
                form.levelId,
              )
            : null,

        position_id:
          form.positionId
            ? Number(
                form.positionId,
              )
            : null,

        role:
          form.role,

        joined_on:
          form.joinedOn || null,

        // Not user-selectable here anymore -- omitted so the backend
        // always defaults a new member to the seeded ACTIVE status (see
        // MemberServiceImpl.defaultMemberStatus).
        status_id: null,
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
        const leaderConflictMatch =
          typeof error?.message ===
            "string" &&
          error.message.match(
            /already has an active leader:\s*(.+?)\./,
          );

        if (leaderConflictMatch) {
          const existingLeaderName =
            leaderConflictMatch[1];

          const wantsReplace =
            window.confirm(
              t(
                "memberPage.confirmReplaceLeaderPrefix",
              ) +
                existingLeaderName +
                t(
                  "memberPage.confirmReplaceLeaderSuffix",
                ),
            );

          if (wantsReplace) {
            try {
              const createdMember =
                await createMember(
                  {
                    ...payload,
                    confirm_replace_leader: true,
                  },
                );

              await onSave?.(
                createdMember,
              );

              setForm(
                EMPTY_FORM,
              );

              onClose?.();
            } catch (retryError) {
              console.warn(
                "Cannot create member:",
                retryError,
              );

              setSubmitError(
                khmerErrorMessage(
                  retryError?.message,
                  t("memberPage.createFailed"),
                ),
              );
            } finally {
              setIsSubmitting(
                false,
              );
            }

            return;
          }

          setSubmitError(
            t(
              "memberPage.confirmReplaceLeaderPrefix",
            ) + existingLeaderName,
          );

          setIsSubmitting(
            false,
          );

          return;
        }

        // A validation/conflict error here (e.g. duplicate phone number)
        // is expected, user-correctable input -- already surfaced through
        // setSubmitError below, not a bug. console.error would trip
        // Next.js's dev-mode error overlay on top of that friendly
        // message, so this stays at warn.
        console.warn(
          "Cannot create member:",
          error,
        );

        setSubmitError(
          khmerErrorMessage(
            error?.message,
            t("memberPage.createFailed"),
          ),
        );

        setIsSubmitting(
          false,
        );

        return;
      }

      setIsSubmitting(
        false,
      );
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
              {t("memberPage.createMemberTitle")}
            </h2>

            <button
              type="button"
              onClick={
                onClose
              }
              aria-label={t("memberPage.close")}
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
                  label={t("memberPage.nameKm")}
                  name="fullNameKm"
                  placeholder={t("memberPage.enterName")}
                  value={
                    form.fullNameKm
                  }
                  onChange={update(
                    "fullNameKm",
                  )}
                  required
                />

                <BoxFill
                  label={t("memberPage.nameEn")}
                  name="fullNameEn"
                  placeholder={t("memberPage.enterName")}
                  value={
                    form.fullNameEn
                  }
                  onChange={update(
                    "fullNameEn",
                  )}
                />

                <FormSelect
                  label={t("memberPage.gender")}
                  name="gender"
                  placeholder={t("memberPage.selectGender")}
                  options={
                    genderOptions
                  }
                  value={
                    form.gender
                  }
                  onChange={update(
                    "gender",
                  )}
                  required
                />

                <BoxFill
                  label={t("memberPage.username")}
                  name="username"
                  placeholder={t("memberPage.usernamePlaceholder")}
                  value={
                    form.username
                  }
                  onChange={update(
                    "username",
                  )}
                  autoComplete="off"
                  required
                />

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    {t("memberPage.contactMethodLabel")}
                    <span className="ml-1 text-error">*</span>
                  </label>

                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {[
                      ["phone", t("memberPage.contactMethodPhone")],
                      ["email", t("memberPage.contactMethodEmail")],
                      ["both", t("memberPage.contactMethodBoth")],
                    ].map(([method, methodLabel]) => (
                      <label
                        key={method}
                        className="flex cursor-pointer items-center gap-2 text-sm text-text-primary"
                      >
                        <input
                          type="radio"
                          name="contactMethod"
                          value={method}
                          checked={contactMethod === method}
                          onChange={() => handleContactMethodChange(method)}
                          className="h-4 w-4 accent-primary"
                        />
                        {methodLabel}
                      </label>
                    ))}
                  </div>
                </div>

                {(contactMethod === "phone" || contactMethod === "both") && (
                  <BoxFill
                    label={t("memberPage.phone")}
                    name="phone"
                    type="tel"
                    placeholder={t("memberPage.phonePlaceholder")}
                    value={
                      form.phone
                    }
                    onChange={update(
                      "phone",
                    )}
                    required
                  />
                )}

                {(contactMethod === "email" || contactMethod === "both") && (
                  <BoxFill
                    label={t("memberPage.email")}
                    name="email"
                    type="email"
                    placeholder={t("memberPage.emailPlaceholder")}
                    value={
                      form.email
                    }
                    onChange={update(
                      "email",
                    )}
                    required
                  />
                )}

                <FormSelect
                  label={t("memberPage.position")}
                  name="positionId"
                  placeholder={t("memberPage.selectPosition")}
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
                  label={t("memberPage.role")}
                  name="role"
                  placeholder={t("memberPage.selectRole")}
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
                  required
                />

                <SearchableSelect
                  label={t("memberPage.branch")}
                  name="branchId"
                  placeholder={t("memberPage.selectBranch")}
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
                    effectiveLockBranch
                  }
                  required
                />

                <BoxFill
                  label={t("memberPage.dateOfBirth")}
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
                  label={t("memberPage.joinedDate")}
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
                  label={t("memberPage.memberLevel")}
                  name="levelId"
                  placeholder={t("memberPage.selectMemberLevel")}
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
                  label={t("memberPage.nationality")}
                  name="nationalityId"
                  placeholder={t("memberPage.selectNationality")}
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
                saveText={t("memberPage.save")}
                cancelText={t("memberPage.cancel")}
              />
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
