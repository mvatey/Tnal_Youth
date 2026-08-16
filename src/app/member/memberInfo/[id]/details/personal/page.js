"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams } from "next/navigation";
import { UploadCloud } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import SelectArrow from "@/components/forms/SelectArrow";
import useMemberPermissions from "@/hooks/useMemberPermissions";
import FormDate from "@/components/forms/FormDate.js";
import MultiSelect from "@/components/forms/multiselect.js";

/* =========================================================
 * EMPTY FORM
 * ========================================================= */

const EMPTY_FORM = {
  full_name_km: "",
  full_name_en: "",
  gender: "",
  date_of_birth: "",

  email: "",
  phone: "",

  nationality_id: "",
  ethnicity_id: "",
  religion_id: "",

  branch_id: "",
  assigned_branches: [],
  account_role: "",

  member_level_id: "",
  tshirt_size: "",

  current_address: "",
  permanent_address: "",

  account_status: "",

  has_account: false,
  account_id: null,

  cv_file_id: null,
};

const TSHIRT_SIZE_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
];

/*
 * The enable/disable buttons on this page only ever toggle between
 * ACTIVE and INACTIVE, so those two stay the only real actions. But
 * the backend's account status can carry other values we don't
 * actively set from here (e.g. a newly-created account still
 * PENDING activation) — if the <select>'s value doesn't match any
 * <option>, the browser silently falls back to showing nothing,
 * which reads as "the field is empty" when it isn't. We always
 * inject whatever the real current status is as an extra option so
 * it's visible instead of vanishing.
 */
const BASE_ACCOUNT_STATUS_OPTIONS = [
  { label: "សកម្ម", value: "ACTIVE" },
  { label: "អសកម្ម", value: "INACTIVE" },
];

const ACCOUNT_STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  PENDING: "កំពុងរង់ចាំសកម្មភាព",
  SUSPENDED: "បានផ្អាក",
  LOCKED: "បានចាក់សោ",
};

/*
 * The /lookups/user-roles list this page fetches is scoped to
 * whatever role the CURRENT viewer is allowed to assign (e.g. a
 * secretary can only ever assign MEMBER), not every role that
 * exists. So when the profile being viewed already holds a role
 * outside that assignable set — a secretary viewing their own
 * account, or a branch leader's account — the role <select>'s
 * value wouldn't match any <option> and would render blank even
 * though a role is very much set. Same fix as account status
 * above: always inject the real current role as an extra option.
 */
const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  BRANCH_LEADER: "ប្រធានសាខា",
  SECRETARY: "លេខាធិការ",
  MEMBER: "សមាជិក",
};

/* =========================================================
 * REQUEST HELPER
 * ========================================================= */

async function requestJson(
  path,
  options = {},
) {
  const isFormData =
    options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  /*
   * Only add JSON content type
   * when we actually send a JSON body.
   *
   * This is important for PATCH
   * /enable and /disable because
   * those requests do not need a body.
   */
  if (
    options.body &&
    !isFormData
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  const response = await fetch(
    `/api${path}`,
    {
      ...options,
      headers,
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
    /*
     * body can fall back to a raw string above when the
     * response wasn't valid JSON (e.g. an HTML error page
     * from a missing proxy route or a dead backend). Never
     * surface that raw markup to the user — only use it as
     * the error message when it's short, plain text.
     */
    const isUsablePlainText =
      typeof body === "string" &&
      body.length > 0 &&
      body.length < 300 &&
      !/[<>]/.test(body);

    const message =
      typeof body === "object" && body !== null
        ? body?.message ||
          body?.detail ||
          body?.error ||
          body?.title
        : isUsablePlainText
          ? body
          : null;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

/* =========================================================
 * LOOKUP NORMALIZER
 * ========================================================= */

function normalizeLookup(
  data,
  {
    valueMode = "id",
  } = {},
) {
  const list =
    Array.isArray(data)
      ? data
      : Array.isArray(
            data?.data,
          )
        ? data.data
        : Array.isArray(
              data?.content,
            )
          ? data.content
          : [];

  return list
    .map((item) => {
      let rawValue = "";

      if (
        valueMode === "code"
      ) {
        rawValue =
          item?.code ??
          item?.value ??
          item?.id ??
          "";
      } else if (
        valueMode === "value"
      ) {
        rawValue =
          item?.value ??
          item?.code ??
          item?.id ??
          "";
      } else {
        rawValue =
          item?.id ??
          item?.value ??
          item?.code ??
          "";
      }

      const label =
        item?.labelKm ||
        item?.label_km ||
        item?.nameKm ||
        item?.name_km ||
        item?.labelEn ||
        item?.label_en ||
        item?.nameEn ||
        item?.name_en ||
        item?.branchCode ||
        item?.branch_code ||
        item?.code ||
        "";

      return {
        label,

        value:
          rawValue !== null &&
          rawValue !== undefined
            ? String(
                rawValue,
              )
            : "",
      };
    })
    .filter(
      (option) =>
        option.value !== "" &&
        option.label !== "",
    );
}

/* =========================================================
 * PERSONAL INFO NORMALIZER
 * ========================================================= */

function normalizePersonalInfo(
  data,
) {
  return {
    ...EMPTY_FORM,

    full_name_km:
      data?.full_name_km ||
      data?.fullNameKm ||
      "",

    full_name_en:
      data?.full_name_en ||
      data?.fullNameEn ||
      "",

    gender:
      data?.gender
        ? String(
            data.gender,
          )
        : "",

    date_of_birth:
      data?.date_of_birth ||
      data?.dateOfBirth ||
      "",

    email:
      data?.email || "",

    phone:
      data?.phone || "",

    religion_id:
      data?.religion_id != null
        ? String(
            data.religion_id,
          )
        : "",

    ethnicity_id:
      data?.ethnicity_id != null
        ? String(
            data.ethnicity_id,
          )
        : "",

    nationality_id:
      data?.nationality_id != null
        ? String(
            data.nationality_id,
          )
        : "",

    member_level_id:
      data?.member_level_id != null
        ? String(
            data.member_level_id,
          )
        : "",

    branch_id:
      data?.branch_id != null
        ? String(
            data.branch_id,
          )
        : "",

    /*
     * Staff (mainly secretaries) can be assigned to more than one
     * branch via branch_staff — this carries the full list so it
     * can be shown read-only next to the (single, editable)
     * primary branch above.
     */
    assigned_branches:
      Array.isArray(data?.assigned_branches)
        ? data.assigned_branches
        : [],

    tshirt_size:
      data?.tshirt_size || "",

    current_address:
      data?.current_address ||
      "",

    permanent_address:
      data?.permanent_address ||
      "",

    cv_file_id:
      data?.cv_file_id ??
      null,

    account_id:
      data?.account_id ??
      null,

    has_account:
      Boolean(
        data?.has_account,
      ),

    account_role:
      data?.account_role
        ? String(
            data.account_role,
          )
        : "",

    account_status:
      data?.account_status
        ? String(
            data.account_status,
          )
        : "",
  };
}

/* =========================================================
 * PAGE
 * ========================================================= */

export default function PersonalPage() {
  const { role, isAdmin, canEditMemberDetails, canManageMemberAccount } = useMemberPermissions();
  const isReadOnly = !canEditMemberDetails;
  const params =
    useParams();

  const memberId =
    Array.isArray(params?.id)
      ? params.id[0]
      : params?.id;

  const fileRef =
    useRef(null);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM,
  );

  const [
    originalRole,
    setOriginalRole,
  ] = useState("");

  const normalizedTargetRole = String(originalRole || form.account_role || "MEMBER")
    .replace(/^ROLE_/i, "")
    .toUpperCase();
  const canManageSensitiveFields =
    isAdmin
      ? true
      : role === "BRANCH_LEADER"
      ? ["MEMBER", "SECRETARY"].includes(normalizedTargetRole)
      : role === "SECRETARY"
        ? normalizedTargetRole === "MEMBER"
        : false;
  const canSavePersonalInfo = canEditMemberDetails ||
    (canManageMemberAccount && canManageSensitiveFields);

  const [
    cvFile,
    setCvFile,
  ] = useState(null);

  const [
    fileName,
    setFileName,
  ] = useState("");
  const [cvPreviewUrl, setCvPreviewUrl] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    changingStatus,
    setChangingStatus,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
   * Additional-branch assignment (assign/remove) fires immediately
   * on toggle, separate from the page's batched Save — this just
   * tracks whether that in-flight request should block further
   * clicks on the branch field.
   */
  const [
    branchAssignmentPending,
    setBranchAssignmentPending,
  ] = useState(false);

  /* =======================================================
   * LOOKUP STATE
   * ======================================================= */

  const [
    genders,
    setGenders,
  ] = useState([]);

  const [
    nationalities,
    setNationalities,
  ] = useState([]);

  const [
    ethnicities,
    setEthnicities,
  ] = useState([]);

  const [
    religions,
    setReligions,
  ] = useState([]);

  const [
    branches,
    setBranches,
  ] = useState([]);

  const [
    roles,
    setRoles,
  ] = useState([]);

  const [
    levels,
    setLevels,
  ] = useState([]);

  const [
    tshirtSizes,
    setTshirtSizes,
  ] = useState(TSHIRT_SIZE_OPTIONS);

  const accountStatusOptions = useMemo(() => {
    const current = form.account_status;

    if (
      !current ||
      BASE_ACCOUNT_STATUS_OPTIONS.some(
        (option) => option.value === current,
      )
    ) {
      return BASE_ACCOUNT_STATUS_OPTIONS;
    }

    return [
      ...BASE_ACCOUNT_STATUS_OPTIONS,
      {
        label: ACCOUNT_STATUS_LABELS[current] || current,
        value: current,
      },
    ];
  }, [form.account_status]);

  /* =======================================================
   * LOAD PERSONAL INFO
   * ======================================================= */

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadPersonalInfo() {
      try {
        setLoading(true);
        setError("");

        const data =
          await requestJson(
            `/members/${memberId}/personal-info`,
          );

        if (!active) {
          return;
        }

        const normalized =
          normalizePersonalInfo(
            data,
          );

        setForm(
          (previous) => ({
            ...normalized,

            // Account information is loaded by a separate request. Preserve
            // it if that request finishes before the personal-info request.
            has_account:
              previous.has_account ||
              normalized.has_account,

            account_id:
              previous.account_id ??
              normalized.account_id,

            account_role:
              previous.account_role ||
              normalized.account_role,

            account_status:
              previous.account_status ||
              normalized.account_status,
          }),
        );

        setOriginalRole(
          (previous) =>
            previous ||
            normalized.account_role,
        );

        if (
          normalized.cv_file_id
        ) {
          setFileName(
            `CV #${normalized.cv_file_id}`,
          );
        } else {
          setFileName("");
        }
      } catch (loadError) {
        console.error(
          "Cannot load personal info:",
          loadError,
        );

        if (active) {
          setError(
            loadError.message ||
              "មិនអាចទាញយកព័ត៌មានផ្ទាល់ខ្លួនបានទេ។",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPersonalInfo();

    return () => {
      active = false;
    };
  }, [memberId]);

  /* =======================================================
   * LOAD ACCOUNT INFORMATION
   *
   * This refreshes role/status directly
   * from the account endpoint.
   * ======================================================= */

  useEffect(() => {
    if (!memberId) {
      return;
    }

    let active = true;

    async function loadAccount() {
      try {
        const account =
          await requestJson(
            `/members/${memberId}/account/status`,
          );

        if (
          !active ||
          !account
        ) {
          return;
        }

        setForm(
          (previous) => ({
            ...previous,

            has_account:
              account?.has_account ??
              account?.hasAccount ??
              true,

            account_id:
              account?.user_id ??
              account?.userId ??
              previous.account_id,

            account_role:
              account?.role ||
              previous.account_role,

            account_status:
              account?.status ||
              previous.account_status,
          }),
        );

        if (
          account?.role
        ) {
          setOriginalRole(
            String(
              account.role,
            ),
          );
        }
      } catch (accountError) {
        /*
         * Personal-info response already
         * contains account information,
         * so this extra request should not
         * destroy the page if unavailable.
         */
        console.warn(
          "Cannot load account information:",
          accountError.message,
        );
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [memberId]);

  /* =======================================================
   * LOAD LOOKUPS
   * ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadLookup(
      path,
      setter,
      options,
    ) {
      try {
        const data =
          await requestJson(
            path,
          );

        if (!active) {
          return;
        }

        const normalized =
          normalizeLookup(
            data,
            options,
          );

        setter(
          normalized.length > 0
            ? normalized
            : options?.fallback || [],
        );
      } catch (lookupError) {
        console.error(
          `Cannot load lookup ${path}:`,
          lookupError,
        );

        if (active) {
          setter(
            options?.fallback || [],
          );
        }
      }
    }

    /*
     * Gender
     */
    loadLookup(
      "/lookups/genders",
      setGenders,
      {
        valueMode: "code",
      },
    );

    /*
     * Nationality
     */
    loadLookup(
      "/lookups/nationalities",
      setNationalities,
      {
        valueMode: "id",
      },
    );

    /*
     * Ethnicity
     */
    loadLookup(
      "/lookups/ethnicities",
      setEthnicities,
      {
        valueMode: "id",
      },
    );

    /*
     * Religion
     */
    loadLookup(
      "/lookups/religions",
      setReligions,
      {
        valueMode: "id",
      },
    );

    /*
     * IMPORTANT:
     *
     * Your backend controller is:
     *
     * @RequestMapping("/api/lookups")
     * @GetMapping("/branches")
     *
     * Therefore this is the correct
     * frontend endpoint.
     */
    loadLookup(
      "/lookups/branches",
      setBranches,
      {
        valueMode: "id",
      },
    );

    /*
     * Roles
     */
    loadLookup(
      "/lookups/user-roles",
      setRoles,
      {
        valueMode: "code",
      },
    );

    /*
     * Member levels
     */
    loadLookup(
      "/lookups/member-levels",
      setLevels,
      {
        valueMode: "id",
      },
    );

    /*
     * T-shirt sizes
     *
     * Backend:
     * value = "2XL"
     * code  = "TWO_XL"
     *
     * Personal info expects "2XL".
     */
    loadLookup(
      "/lookups/tshirt-sizes",
      setTshirtSizes,
      {
        valueMode: "value",
        fallback: TSHIRT_SIZE_OPTIONS,
      },
    );

    return () => {
      active = false;
    };
  }, []);

  /*
   * accountStatusOptions is defined further below (needs `form` to
   * exist first); roleOptions follows the exact same shape and
   * sits here so it's grouped with the other lookup-derived memos.
   */
  const roleOptions = useMemo(() => {
    const current = form.account_role;

    if (!current || roles.some((option) => option.value === current)) {
      return roles;
    }

    return [
      ...roles,
      {
        label: ROLE_LABELS[current] || current,
        value: current,
      },
    ];
  }, [roles, form.account_role]);

  /*
   * The branch field shows every branch this member is tied to as
   * one multiselect — the primary branch (members.branch_id, via
   * form.branch_id) plus any additional branch_staff assignments
   * (form.assigned_branches) — as a flat list of string IDs.
   */
  const branchMultiValue = useMemo(() => {
    const values = new Set();

    if (form.branch_id) {
      values.add(String(form.branch_id));
    }

    form.assigned_branches.forEach((assignedBranch) => {
      if (assignedBranch?.id != null) {
        values.add(String(assignedBranch.id));
      }
    });

    return Array.from(values);
  }, [form.branch_id, form.assigned_branches]);

  /*
   * Same "inject the current value if it's missing" pattern as
   * roleOptions/accountStatusOptions, applied to every currently
   * assigned branch instead of just one value.
   */
  const branchOptions = useMemo(() => {
    const missing = branchMultiValue.filter(
      (value) =>
        !branches.some(
          (option) => option.value === value,
        ),
    );

    if (missing.length === 0) {
      return branches;
    }

    const labelsById = new Map(
      form.assigned_branches.map(
        (assignedBranch) => [
          String(assignedBranch.id),
          assignedBranch.name_km ||
            assignedBranch.name_en ||
            String(assignedBranch.id),
        ],
      ),
    );

    return [
      ...branches,
      ...missing.map((value) => ({
        label:
          (value === String(form.branch_id) &&
            form.branch_name_km) ||
          labelsById.get(value) ||
          value,
        value,
      })),
    ];
  }, [
    branches,
    branchMultiValue,
    form.assigned_branches,
    form.branch_id,
    form.branch_name_km,
  ]);

  /*
   * Unlike every other field here, adding/removing a branch fires
   * immediately instead of waiting for the page's Save button —
   * assigning/terminating a secretary's branch coverage is its own
   * action, not a draft edit. MultiSelect is a controlled component,
   * so a failed request simply leaves `form` (and the checkbox)
   * unchanged.
   */
  const handleBranchMultiChange = async (
    nextValues,
  ) => {
    if (
      isReadOnly &&
      !canManageSensitiveFields
    ) {
      return;
    }

    const previousValues =
      branchMultiValue;

    const added = nextValues.filter(
      (value) =>
        !previousValues.includes(
          value,
        ),
    );

    /*
     * Anyone other than a secretary only ever has one (primary)
     * branch — the multiselect still applies here for a consistent
     * look, but behaves like the old single-select: whichever value
     * was just toggled on becomes the new (and only) branch, saved
     * together with the rest of the form via the page's Save
     * button, same as before this field became a multiselect.
     */
    if (form.account_role !== "SECRETARY") {
      const nextBranchId =
        added[0] ??
        nextValues[
          nextValues.length - 1
        ] ??
        "";

      setError("");
      setSuccess("");

      setForm((previous) => ({
        ...previous,
        branch_id: nextBranchId,
      }));

      return;
    }

    if (branchAssignmentPending) {
      return;
    }

    const removed = previousValues.filter(
      (value) =>
        !nextValues.includes(value),
    );

    const branchId =
      added[0] || removed[0];

    if (!branchId) {
      return;
    }

    setError("");
    setSuccess("");
    setBranchAssignmentPending(true);

    try {
      const data = added.length
        ? await requestJson(
            `/members/${memberId}/personal-info/branches`,
            {
              method: "POST",
              body: JSON.stringify({
                branch_id: Number(
                  branchId,
                ),
              }),
            },
          )
        : await requestJson(
            `/members/${memberId}/personal-info/branches/${branchId}`,
            {
              method: "DELETE",
            },
          );

      setForm((previous) => ({
        ...previous,
        branch_id:
          data?.branch_id != null
            ? String(data.branch_id)
            : previous.branch_id,
        branch_name_km:
          data?.branch_name_km ||
          previous.branch_name_km,
        assigned_branches:
          Array.isArray(
            data?.assigned_branches,
          )
            ? data.assigned_branches
            : previous.assigned_branches,
      }));
    } catch (branchError) {
      setError(
        branchError.message ||
          "មិនអាចកែប្រែសាខាទទួលបន្ទុកបានទេ។",
      );
    } finally {
      setBranchAssignmentPending(false);
    }
  };

  /* =======================================================
   * NORMAL FIELD CHANGE
   * ======================================================= */

  const handleChange =
    (field) =>
    (event) => {
      if (isReadOnly && !(
        canManageSensitiveFields &&
        ["branch_id", "account_role"].includes(field)
      )) {
        return;
      }
      const value =
        event.target.value;

      setError("");
      setSuccess("");

      setForm(
        (previous) => ({
          ...previous,
          [field]:
            value,
        }),
      );
    };

  /* =======================================================
   * CV FILE
   * ======================================================= */

  const handleFileChange =
    (event) => {
      if (isReadOnly) {
        return;
      }

      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setError("");
      setSuccess("");

      const allowedExtensions = [
        "pdf",
        "docx",
        "jpg",
        "jpeg",
        "png",
      ];

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      if (
        !allowedExtensions.includes(
          extension,
        )
      ) {
        setError(
          "អនុញ្ញាតតែ PDF, DOCX, JPG, JPEG និង PNG ប៉ុណ្ណោះ។",
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        5 *
          1024 *
          1024
      ) {
        setError(
          "ទំហំឯកសារមិនត្រូវលើស 5MB។",
        );

        event.target.value =
          "";

        return;
      }

      setCvFile(
        file,
      );

      setCvPreviewUrl((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return URL.createObjectURL(file);
      });

      setFileName(
        file.name,
      );
    };

  /* =======================================================
   * ACCOUNT STATUS
   * ======================================================= */

    const handleAccountStatusChange =
      async (event) => {
        if (isReadOnly && !canManageSensitiveFields) {
          return;
        }

        const nextStatus =
          event.target.value;

        if (
          !memberId ||
          !form.has_account ||
          !nextStatus ||
          changingStatus
        ) {
          return;
        }

        if (
          nextStatus ===
          form.account_status
        ) {
          return;
        }

        const previousStatus =
          form.account_status;

        setError("");
        setSuccess("");

        try {
          setChangingStatus(true);

          const action =
            nextStatus === "ACTIVE"
              ? "enable"
              : "disable";

          const response =
            await requestJson(
              `/members/${memberId}/personal-info/account/${action}`,
              {
                method: "PATCH",
              },
            );

          const confirmedStatus =
            response?.status ||
            nextStatus;

          setForm(
            (previous) => ({
              ...previous,
              account_status:
                confirmedStatus,
            }),
          );

          setSuccess(
            confirmedStatus === "ACTIVE"
              ? "បានបើកដំណើរការគណនីដោយជោគជ័យ។"
              : "បានបិទដំណើរការគណនីដោយជោគជ័យ។",
          );
        } catch (statusError) {
          console.error(
            "Cannot change account status:",
            statusError,
          );

          setForm(
            (previous) => ({
              ...previous,
              account_status:
                previousStatus,
            }),
          );

          setError(
            statusError.message ||
              "អ្នកមិនមានសិទ្ធិផ្លាស់ប្ដូរស្ថានភាពគណនីនេះទេ។",
          );
        } finally {
          setChangingStatus(false);
        }
      };

  /* =======================================================
   * SAVE PERSONAL INFO
   * ======================================================= */

  const handleSave =
    async () => {
      if (!canSavePersonalInfo) {
        return;
      }

      if (!memberId) {
        setError(
          "រកមិនឃើញលេខសម្គាល់សមាជិក។",
        );

        return;
      }

      if (
        !form.full_name_km.trim()
      ) {
        setError(
          "សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ។",
        );

        return;
      }

      if (!form.gender) {
        setError(
          "សូមជ្រើសរើសភេទ។",
        );

        return;
      }

      if (!form.branch_id) {
        setError(
          "សូមជ្រើសរើសសាខា។",
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const payload = {
          full_name_km:
            form.full_name_km.trim(),

          full_name_en:
            form.full_name_en.trim() ||
            null,

          gender:
            form.gender,

          date_of_birth:
            form.date_of_birth ||
            null,

          email:
            form.email.trim() ||
            null,

          phone:
            form.phone.trim() ||
            null,

          religion_id:
            form.religion_id
              ? Number(
                  form.religion_id,
                )
              : null,

          ethnicity_id:
            form.ethnicity_id
              ? Number(
                  form.ethnicity_id,
                )
              : null,

          nationality_id:
            form.nationality_id
              ? Number(
                  form.nationality_id,
                )
              : null,

          member_level_id:
            form.member_level_id
              ? Number(
                  form.member_level_id,
                )
              : null,

          branch_id:
            Number(
              form.branch_id,
            ),

          tshirt_size:
            form.tshirt_size ||
            null,

          current_address:
            form.current_address.trim() ||
            null,

          permanent_address:
            form.permanent_address.trim() ||
            null,
        };

        /*
         * 1. Personal information
         */
        const updatedPersonalInfo =
          await requestJson(
            `/members/${memberId}/personal-info`,
            {
              method:
                "PUT",

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        /*
         * 2. Role
         */
        const selectedRole =
          String(
            form.account_role || "",
          )
            .trim()
            .toUpperCase();

        const savedRole =
          String(
            originalRole || "",
          )
            .trim()
            .toUpperCase();

        let updatedRole =
          selectedRole;

        if (
          form.has_account &&
          selectedRole &&
          selectedRole !==
            savedRole
        ) {
          const accountResponse =
            await requestJson(
              `/members/${memberId}/account/role`,
              {
                method:
                  "PATCH",

                body:
                  JSON.stringify({
                    role:
                      selectedRole,
                  }),
              },
            );

          updatedRole =
            accountResponse?.role ||
            selectedRole;

          setOriginalRole(
            updatedRole,
          );
        }

        /*
         * 3. CV
         */
        let cvResponse =
          null;

        if (cvFile) {
          const formData =
            new FormData();

          formData.append(
            "file",
            cvFile,
          );

          cvResponse =
            await requestJson(
              `/members/${memberId}/personal-info/cv`,
              {
                method:
                  "PUT",

                body:
                  formData,
              },
            );

          setCvFile(
            null,
          );

          if (
            fileRef.current
          ) {
            fileRef.current.value =
              "";
          }
        }

        /*
         * 4. Normalize response
         */
        const latest =
          cvResponse ||
          updatedPersonalInfo;

        const normalized =
          normalizePersonalInfo(
            latest,
          );

        setForm(
          (previous) => ({
            ...previous,
            ...normalized,

            account_role:
              updatedRole,

            account_status:
              normalized.account_status ||
              previous.account_status,
          }),
        );

        if (
          normalized.cv_file_id
        ) {
          setFileName(
            `CV #${normalized.cv_file_id}`,
          );
        }

        /*
         * 5. Refresh account state
         */
        if (
          form.has_account
        ) {
          try {
            const account =
              await requestJson(
                `/members/${memberId}/account/status`,
              );

            setForm(
              (previous) => ({
                ...previous,

                account_role:
                  account?.role ||
                  previous.account_role,

                account_status:
                  account?.status ||
                  previous.account_status,

                has_account:
                  account?.has_account ??
                  account?.hasAccount ??
                  previous.has_account,
              }),
            );

            if (
              account?.role
            ) {
              setOriginalRole(
                account.role,
              );
            }
          } catch (
            accountRefreshError
          ) {
            console.warn(
              "Could not refresh account:",
              accountRefreshError.message,
            );
          }
        }

        setSuccess(
          "រក្សាទុកព័ត៌មានបានជោគជ័យ។",
        );
      } catch (saveError) {
        console.error(
          "Cannot save personal info:",
          saveError,
        );

        setError(
          saveError.message ||
            "មិនអាចរក្សាទុកព័ត៌មានបានទេ។",
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
   * LOADING
   * ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          កំពុងទាញយកព័ត៌មានផ្ទាល់ខ្លួន...
        </p>
      </div>
    );
  }

  /* =======================================================
   * UI
   * ======================================================= */

  return (
    <div className="space-y-4">
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
          sm:p-5
          lg:p-6
        "
      >
        <h2 className="text-lg font-bold text-primary">
          ព័ត៌មានផ្ទាល់ខ្លួន
        </h2>

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-6
            xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]
          "
        >
          {/* FORM */}

          <div
            className={`
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              ${isReadOnly ? "member-readonly cursor-not-allowed [&_input]:pointer-events-none [&_input]:bg-gray-50 [&_select]:pointer-events-none [&_select]:bg-gray-50" : ""}
            `}
          >
            <BoxFill
              label="ឈ្មោះជាភាសាខ្មែរ"
              value={
                form.full_name_km
              }
              onChange={
                handleChange(
                  "full_name_km",
                )
              }
              placeholder="បញ្ចូលឈ្មោះជាភាសាខ្មែរ"
            />

            <BoxFill
              label="ឈ្មោះជាអក្សរឡាតាំង"
              value={
                form.full_name_en
              }
              onChange={
                handleChange(
                  "full_name_en",
                )
              }
              placeholder="បញ្ចូលឈ្មោះជាអក្សរឡាតាំង"
            />

            <FormSelect
              label="ភេទ"
              value={
                form.gender
              }
              onChange={
                handleChange(
                  "gender",
                )
              }
              placeholder="ជ្រើសរើសភេទ"
              options={
                genders
              }
            />

            <FormDate
              label="ថ្ងៃខែឆ្នាំកំណើត"
              name="date_of_birth"
              value={
                form.date_of_birth
              }
              onChange={
                handleChange(
                  "date_of_birth",
                )
              }
            />

            <BoxFill
              label="អ៊ីមែល"
              type="email"
              value={
                form.email
              }
              onChange={
                handleChange(
                  "email",
                )
              }
              placeholder="បញ្ចូលអ៊ីមែល"
            />

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              value={
                form.phone
              }
              onChange={
                handleChange(
                  "phone",
                )
              }
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
            />

            <FormSelect
              label="សញ្ជាតិ"
              value={
                form.nationality_id
              }
              onChange={
                handleChange(
                  "nationality_id",
                )
              }
              placeholder="ជ្រើសរើសសញ្ជាតិ"
              options={
                nationalities
              }
            />

            <FormSelect
              label="ជនជាតិ"
              value={
                form.ethnicity_id
              }
              onChange={
                handleChange(
                  "ethnicity_id",
                )
              }
              placeholder="ជ្រើសរើសជនជាតិ"
              options={
                ethnicities
              }
            />

            <FormSelect
              label="សាសនា"
              value={
                form.religion_id
              }
              onChange={
                handleChange(
                  "religion_id",
                )
              }
              placeholder="ជ្រើសរើសសាសនា"
              options={
                religions
              }
            />

            {/*
              BRANCH — only a SECRETARY account can cover more than
              one branch (branch_staff), so only secretaries get the
              multiselect. A branch leader (or any other role) can
              only ever be tied to a single branch, so they keep the
              plain single-select they always had — a checkbox list
              would just be misleading for a role that can't actually
              have more than one branch checked.
            */}

            {form.account_role ===
            "SECRETARY" ? (
              <MultiSelect
                label="សាខា"
                placeholder="ជ្រើសរើសសាខា"
                options={
                  branchOptions
                }
                value={
                  branchMultiValue
                }
                onChange={
                  handleBranchMultiChange
                }
                disabled={
                  !canManageSensitiveFields ||
                  branchAssignmentPending
                }
              />
            ) : (
              <FormSelect
                label="សាខា"
                value={
                  form.branch_id
                }
                onChange={handleChange(
                  "branch_id",
                )}
                placeholder="ជ្រើសរើសសាខា"
                options={
                  branchOptions
                }
                disabled={
                  !canManageSensitiveFields
                }
                selectClassName={isAdmin ? "!pointer-events-auto !cursor-pointer !bg-white !text-gray-600" : ""}
                adminEditable={isAdmin}
              />
            )}

            {/* ROLE */}

            <FormSelect
              label="តួនាទី"
              value={
                form.account_role
              }
              onChange={
                handleChange(
                  "account_role",
                )
              }
              placeholder={
                form.has_account
                  ? "ជ្រើសរើសតួនាទី"
                  : "មិនមានគណនី"
              }
              options={
                roleOptions
              }
              disabled={
                !canManageSensitiveFields || !form.has_account
              }
              selectClassName={isAdmin ? "!pointer-events-auto !cursor-pointer !bg-white !text-gray-600" : ""}
              adminEditable={isAdmin}
            />

            <FormSelect
              label="កម្រិតសមាជិក(កាំ)"
              value={
                form.member_level_id
              }
              onChange={
                handleChange(
                  "member_level_id",
                )
              }
              placeholder="ជ្រើសរើសកម្រិតសមាជិក"
              options={
                levels
              }
            />

            <FormSelect
              label="ទំហំអាវ"
              value={
                form.tshirt_size
              }
              onChange={
                handleChange(
                  "tshirt_size",
                )
              }
              placeholder="ជ្រើសរើសទំហំអាវ"
              options={
                tshirtSizes
              }
            />

            {/* ACCOUNT STATUS */}

            <FormSelect
              label="ស្ថានភាព"
              value={
                form.account_status
              }
              onChange={
                handleAccountStatusChange
              }
              placeholder={
                changingStatus
                  ? "កំពុងផ្លាស់ប្ដូរ..."
                  : form.has_account
                    ? "ជ្រើសរើសស្ថានភាព"
                    : "មិនមានគណនី"
              }
              options={
                accountStatusOptions
              }
              disabled={
                !canManageSensitiveFields ||
                !form.has_account ||
                changingStatus
              }
              selectClassName={isAdmin ? "!pointer-events-auto !cursor-pointer !bg-white !text-gray-600" : ""}
              adminEditable={isAdmin}
            />

          </div>

          {/* CV */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              បញ្ចូល CV
            </label>

            <div
              className="
                flex
                min-h-[190px]
                w-full
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-gray-200
                bg-gray-50
                px-4
                text-center
              "
            >
              <input
                ref={
                  fileRef
                }
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.docx"
                className="hidden"
                onChange={
                  handleFileChange
                }
              />

              {fileName && (
                <div className="h-[260px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {/\.(png|jpe?g)$/i.test(fileName) ? (
                    <img
                      src={cvPreviewUrl || `/api/files/${form.cv_file_id}/content`}
                      alt={fileName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={`${cvPreviewUrl || `/api/files/${form.cv_file_id}/content`}#toolbar=0&view=FitH`}
                      title={fileName}
                      className="h-full w-full border-0"
                    />
                  )}
                </div>
              )}

              {!fileName && <UploadCloud size={30} className="text-gray-400" />}
              {!isReadOnly && <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {fileName ? "ជំនួស CV" : "បញ្ចូលឯកសារ"}
              </button>}
              <p className="mt-2 max-w-full truncate text-xs text-gray-500" title={fileName}>
                {fileName || "JPG, JPEG, DOCX, PDF, PNG (មិនលើស 5MB)"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg bg-error-bg px-4 py-3">
          <p className="text-sm font-medium text-error">
            {error}
          </p>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="rounded-lg bg-success-bg px-4 py-3">
          <p className="text-sm font-medium text-success">
            {success}
          </p>
        </div>
      )}

      {/* SAVE */}

      {canSavePersonalInfo && <div className="flex justify-end">
        <SaveButton
          onClick={
            handleSave
          }
          disabled={
            !canSavePersonalInfo ||
            saving ||
            changingStatus
          }
        >
          {saving
            ? "កំពុងរក្សាទុក..."
            : "រក្សាទុក"}
        </SaveButton>
      </div>}
    </div>
  );
}

/* =========================================================
 * SELECT COMPONENT
 * ========================================================= */

function FormSelect({
  label,
  value,
  onChange,
  placeholder,
  options = [],
  disabled = false,
  selectClassName = "",
  adminEditable = false,
}) {
  return (
    <div className={`min-w-0 ${adminEditable ? "admin-editable [&_label]:!text-text-primary" : ""}`}>
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="relative">
        <select
          value={
            value ?? ""
          }
          onChange={
            onChange
          }
          disabled={
            disabled
          }
          className={`
            h-11
            w-full
            appearance-none
            rounded-lg
            border
            border-gray-200
            bg-white
            px-4
            pr-10
            text-sm
            text-gray-600
            outline-none
            transition
            focus:border-primary
            disabled:cursor-not-allowed
            disabled:bg-gray-100
            disabled:opacity-60
            ${selectClassName}
          `}
        >
          <option value="">
            {
              placeholder
            }
          </option>

          {options.map(
            (
              option,
            ) => (
              <option
                key={String(
                  option.value,
                )}
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </option>
            ),
          )}
        </select>

        <SelectArrow />
      </div>
    </div>
  );
}
