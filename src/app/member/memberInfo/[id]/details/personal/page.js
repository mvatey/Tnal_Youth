"use client";

import {
  useContext,
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
import CvFilePreview from "@/components/forms/CvFilePreview";
import useMemberPermissions from "@/hooks/useMemberPermissions";
import FormDate from "@/components/forms/FormDate.js";
import MultiSelect from "@/components/forms/multiselect.js";
import SearchableSelect from "@/components/forms/SearchableSelect.js";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";
import { MemberProfileRefreshContext } from "../../layout";

/* =========================================================
 * EMPTY FORM
 * ========================================================= */

const EMPTY_FORM = {
  full_name_km: "",
  full_name_en: "",
  gender: "",
  date_of_birth: "",

  username: "",
  email: "",
  phone: "",

  nationality_id: "",
  ethnicity_id: "",
  religion_id: "",

  branch_id: "",
  assigned_branches: [],
  account_role: "",
  viewer_scope: "",
  positionId: "",

  member_level_id: "",
  tshirt_size: "",

  current_address: "",
  permanent_address: "",

  member_status_id: "",
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
  { label: "បានផ្អាក", value: "SUSPENDED" },
  { label: "បានលាលែង", value: "RESIGNED" },
];

const ACCOUNT_STATUS_LABELS = {
ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  SUSPENDED: "បានផ្អាក",
  RESIGNED: "បានលាលែង",
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
  VIEWER: "សមាជិកអ្នកមើល",
};

const VIEWER_SCOPE_OPTIONS = [
  { label: "ប្រធានសាខា", value: "BRANCH_LEADER" },
  { label: "លេខាធិការ", value: "SECRETARY" },
];

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

    const requestError = new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
    requestError.status = response.status;
    throw requestError;
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

      return {
        // Preserve every label field so FormSelect can react to a language
        // change instead of being locked to the Khmer label at load time.
        ...item,
        value:
          rawValue !== null &&
          rawValue !== undefined
            ? String(
                rawValue,
              )
            : "",
      };
    })
    .filter((option) => option.value !== "");
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

    username:
      data?.username || "",

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

    positionId:
      data?.position_id != null
        ? String(
            data.position_id,
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

/*
 * Flattens a { branch_id, assigned_branches } shape (the primary
 * branch plus any additional branch_staff coverage) down to a plain
 * array of string branch ids — used both to seed the branch
 * multiselect's working selection and to snapshot the
 * last-known-saved set for diffing at Save time.
 */
function computeBranchIds(source) {
  const values = new Set();

  if (source?.branch_id) {
    values.add(String(source.branch_id));
  }

  (Array.isArray(source?.assigned_branches)
    ? source.assigned_branches
    : []
  ).forEach((assignedBranch) => {
    if (assignedBranch?.id != null) {
      values.add(String(assignedBranch.id));
    }
  });

  return Array.from(values);
}

/* =========================================================
 * PAGE
 * ========================================================= */

export default function PersonalPage() {
  const { role, isAdmin, canEditMemberDetails, canManageMemberAccount } = useMemberPermissions();
  const { branches: accessibleBranches } = useBranch();
  const { t } = useLanguage();
  const isReadOnly = !canEditMemberDetails;
  const refetchMemberProfile = useContext(
    MemberProfileRefreshContext,
  );
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

  const [
    originalViewerScope,
    setOriginalViewerScope,
  ] = useState("");

  const [
    originalPositionId,
    setOriginalPositionId,
  ] = useState("");

  /*
   * Internal login-account status (users.status) -- kept in sync with
   * the visible Member status selector below (see the save handler's
   * "Member status" step), since an admin setting a member Inactive
   * expects that to also block their login, not just relabel them.
   */
  const [
    originalAccountStatus,
    setOriginalAccountStatus,
  ] = useState("");

  const [
    memberStatusOptions,
    setMemberStatusOptions,
  ] = useState([]);

  const [
    accountStatusLookups,
    setAccountStatusLookups,
  ] = useState([]);

  const [
    originalMemberStatusId,
    setOriginalMemberStatusId,
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

  /*
   * True from the moment the user edits any field (name, branch,
   * role, account status, CV, ...) until the next successful Save —
   * NOT derived from diffing `form`, since `form` also gets rewritten
   * by the load/refresh effects and would otherwise false-positive.
   * Only the handlers a person actually interacts with set this to
   * true; only a successful save resets it. Fed to
   * useUnsavedFormGuard below so the tab-nav bar knows to confirm
   * before navigating away mid-edit.
   */
  const [
    hasUnsavedChanges,
    setHasUnsavedChanges,
  ] = useState(false);

  const [
    cvFile,
    setCvFile,
  ] = useState(null);

  const [
    fileName,
    setFileName,
  ] = useState("");
  const [cvPreviewUrl, setCvPreviewUrl] = useState("");
  // Only ever trusted for deciding HOW to render the preview (image / pdf
  // / generic-file) -- see CvFilePreview's own docblock for why the
  // filename/extension alone isn't reliable for an already-saved file.
  const [cvMimeType, setCvMimeType] = useState("");

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
   * Secretary branch coverage (branch_staff) — nextValues from the
   * multiselect is stored here as the working/pending selection so
   * the checkboxes can respond instantly, WITHOUT calling the
   * assign/revoke API until the page's Save button is clicked.
   * originalBranchIds is the last-known-saved set, used at Save time
   * to diff against branchSelectionIds and figure out what actually
   * changed.
   */
  const [
    branchSelectionIds,
    setBranchSelectionIds,
  ] = useState([]);

  const [
    originalBranchIds,
    setOriginalBranchIds,
  ] = useState([]);

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
    positions,
    setPositions,
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
    const source = accountStatusLookups.length
      ? accountStatusLookups
      : BASE_ACCOUNT_STATUS_OPTIONS;

    const mapped = source.map((option) => {
      const value = String(option?.value || option?.code || "").toUpperCase();
      return {
        value,
        label:
          option?.label ||
          option?.labelKm ||
          option?.label_km ||
          option?.labelEn ||
          option?.label_en ||
          ACCOUNT_STATUS_LABELS[value] ||
          value,
        // PENDING_ACTIVATION and LOCKED are system/security states.
        // This page may display them, but its existing backend API only
        // supports the intentional ACTIVE <-> INACTIVE admin action.
        disabled: value === "PENDING_ACTIVATION" || value === "LOCKED",
      };
    }).filter((option) => option.value);

    const current = String(form.account_status || "").toUpperCase();
    if (current && !mapped.some((option) => option.value === current)) {
      mapped.push({
        value: current,
        label: ACCOUNT_STATUS_LABELS[current] || current,
        disabled: current === "PENDING_ACTIVATION" || current === "LOCKED",
      });
    }

    return mapped;
  }, [accountStatusLookups, form.account_status]);

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

            viewer_scope:
              previous.viewer_scope ||
              normalized.viewer_scope,

            account_status:
              previous.account_status ||
              normalized.account_status,

            // Member status is loaded by its own request too (see LOAD
            // MEMBER STATUS below) -- normalizePersonalInfo never sets this
            // field, so without this fallback, this setForm call blanks
            // out a status that request already filled in whenever it
            // resolves first (a real race: it's a smaller/faster request
            // than this one, so in practice it usually does).
            member_status_id:
              previous.member_status_id ||
              normalized.member_status_id,
          }),
        );

        setOriginalRole(
          (previous) =>
            previous ||
            normalized.account_role,
        );

        setOriginalPositionId(
          (previous) =>
            previous ||
            normalized.positionId,
        );

        setOriginalAccountStatus(
          (previous) =>
            previous ||
            normalized.account_status,
        );

        const loadedBranchIds =
          computeBranchIds(normalized);

        setOriginalBranchIds(loadedBranchIds);
        setBranchSelectionIds(loadedBranchIds);

        if (
          normalized.cv_file_id
        ) {
          // Placeholder until the real metadata fetch below resolves --
          // better than nothing if that fetch is slow/fails, but never
          // used to decide rendering (see cvMimeType).
          setFileName(
            `CV #${normalized.cv_file_id}`,
          );

          fetch(`/api/files/${normalized.cv_file_id}`, {
            credentials: "include",
            cache: "no-store",
          })
            .then((response) => (response.ok ? response.json() : null))
            .then((body) => {
              if (!active) return;
              const meta = body?.data ?? body;
              if (meta?.originalName) setFileName(meta.originalName);
              if (meta?.mimeType) setCvMimeType(meta.mimeType);
            })
            .catch(() => {
              // Keep the "CV #id" placeholder name; CvFilePreview falls
              // back to its generic-file card when mimeType is unknown.
            });
        } else {
          setFileName("");
          setCvMimeType("");
        }
      } catch (loadError) {
        console.error(
          "Cannot load personal info:",
          loadError,
        );

        if (active) {
          setError(
            loadError.message ||
              t("memberPage.personalLoadFailed"),
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
   * LOAD MEMBER STATUS
   * ======================================================= */

  useEffect(() => {
    if (!memberId) return;

    let active = true;

    async function loadMemberStatus() {
      try {
        const [member, statuses] = await Promise.all([
          requestJson(`/members/${memberId}`),
          requestJson(`/lookups/member-statuses`),
        ]);

        if (!active) return;

        // The shared lookup endpoint returns { value, label } options.
        // Reuse the same normalizer as the other profile lookups so this
        // selector stays consistent with the Member list status filter --
        // which only ever offers Active/Inactive, since Suspended/Resigned
        // have no supported workflow. A member already carrying one of
        // those two from before this restriction still needs to see its
        // own current status though, so it's kept as an option only when
        // it's the one already assigned.
        const currentMemberStatusId =
          member?.status?.id ??
          member?.status_id ??
          member?.statusId ??
          "";

        const normalizedId = currentMemberStatusId === ""
          ? ""
          : String(currentMemberStatusId);

        const allStatusOptions = normalizeLookup(statuses);

        setMemberStatusOptions(
          allStatusOptions.filter((option) => {
            const code = String(option?.code || "").toUpperCase();

            return (
              code === "ACTIVE" ||
              code === "INACTIVE" ||
              option.value === normalizedId
            );
          }),
        );

        setForm((previous) => ({
          ...previous,
          member_status_id: normalizedId,
        }));
        setOriginalMemberStatusId(normalizedId);
      } catch (statusError) {
        console.warn(
          "Cannot load member status:",
          statusError.message,
        );
      }
    }

    loadMemberStatus();

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

            viewer_scope:
              account?.viewer_scope ??
              account?.viewerScope ??
              previous.viewer_scope,

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

          setOriginalViewerScope(
            String(
              account?.viewer_scope ??
                account?.viewerScope ??
                "",
            ),
          );
        }

        if (
          account?.status
        ) {
          setOriginalAccountStatus(
            String(
              account.status,
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
     * Positions
     */
    loadLookup(
      "/lookups/positions",
      setPositions,
      {
        valueMode: "id",
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
   * Same "inject the current value if missing" pattern as roleOptions.
   * A position mapped to BRANCH_LEADER is a valid pick here (see
   * handlePositionChange) -- selecting one just auto-fills the Role field
   * below the same way it does at creation, and Save routes the actual
   * promotion through the account/role endpoint (with the same confirm/
   * replace-existing-leader prompt as creating a member straight into a
   * leader position) rather than the plain position field, since only
   * that endpoint knows how to demote whoever currently holds it.
   */
  const positionOptions = useMemo(() => {
    const current = form.positionId;

    if (!current || positions.some((option) => option.value === current)) {
      return positions;
    }

    const currentOption = positions.find((option) => option.value === current);

    return currentOption ? [...positions, currentOption] : positions;
  }, [positions, form.positionId]);

  /*
   * Mirrors CreateMemberModal's updatePosition: picking a position whose
   * mappedRole is set also updates the Role field to match, so admins see
   * the same "position implies role" behavior when editing as when
   * creating. Only auto-fills when a mapping exists -- most positions
   * have none, and leave Role exactly as the admin already set it. A
   * VIEWER-mapped position can also carry its own mappedViewerScope
   * (e.g. "Viewer (as Branch Leader)" vs "Viewer (as Secretary)") --
   * when it does, that auto-fills viewer_scope the same way.
   */
  const handlePositionChange = (event) => {
    if (isReadOnly && !canManageSensitiveFields) {
      return;
    }

    const value = event.target.value;

    const selectedPosition = positions.find(
      (option) => option.value === value,
    );

    const nextRole =
      selectedPosition?.mappedRole || form.account_role;

    setError("");
    setSuccess("");
    setHasUnsavedChanges(true);

    setForm((previousForm) => ({
      ...previousForm,
      positionId: value,
      account_role: nextRole,
      viewer_scope:
        nextRole === "VIEWER"
          ? selectedPosition?.mappedViewerScope || previousForm.viewer_scope
          : "",
    }));
  };

  /*
   * The branch field shows every branch this member is tied to as
   * one multiselect. For a SECRETARY this is the working/pending
   * selection (branchSelectionIds) — it updates instantly as
   * checkboxes are toggled, but nothing is sent to the server until
   * Save is clicked (see handleBranchMultiChange / handleSave). For
   * anyone else, it's simply the single primary branch.
   */
  const branchMultiValue =
    form.account_role === "SECRETARY"
      ? branchSelectionIds
      : form.branch_id
        ? [String(form.branch_id)]
        : [];

  /*
   * Same "inject the current value if it's missing" pattern as
   * roleOptions/accountStatusOptions, applied to every currently
   * assigned branch instead of just one value.
   */
  const branchOptions = useMemo(() => {
    // Assignment choices must follow the viewer's actual branch scope.
    // Admin sees all accessible branches; branch-scoped staff only see
    // branches they are allowed to operate in. Keep the member's current
    // assignments injected below so an existing value never disappears.
    const rawScopedBranches =
      accessibleBranches.length > 0
        ? accessibleBranches
        : branches;

    // rawScopedBranches can come from either accessibleBranches
    // (BranchContext — shape { id, nameKm, nameEn }) or the page's own
    // branches state (shape { value, label }). The local FormSelect below
    // (this file's own, not the shared component) reads option.value /
    // option.label directly with no fallback, so every accessibleBranches
    // entry rendered as a blank option — its name lives on .nameKm, not
    // .label. Normalizing to one shape up front fixes both that and the
    // duplicate-checkbox bug (comparing only option.value treated every
    // accessibleBranches entry as absent, since its id lives on .id).
    const scopedBranches = rawScopedBranches.map(
      (option) => ({
        ...option,
        value: String(
          option.value ?? option.id ?? "",
        ),
        // Keep both labels. FormSelect chooses the right one whenever the
        // language changes, rather than permanently displaying Khmer.
        labelKm:
          option.labelKm ??
          option.label_km ??
          option.nameKm ??
          option.name_km ??
          option.label ??
          "",
        labelEn:
          option.labelEn ??
          option.label_en ??
          option.nameEn ??
          option.name_en ??
          option.label ??
          "",
        label:
          option.label ||
          option.nameKm ||
          option.nameEn ||
          String(option.value ?? option.id ?? ""),
      }),
    );

    const missing = branchMultiValue.filter(
      (value) =>
        !scopedBranches.some(
          (option) => option.value === value,
        ),
    );

    if (missing.length === 0) {
      return scopedBranches;
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
      ...scopedBranches,
      ...missing.map((value) => ({
        labelKm:
          (value === String(form.branch_id) &&
            form.branch_name_km) ||
          labelsById.get(value) ||
          value,
        labelEn:
          labelsById.get(value) ||
          value,
        value,
      })),
    ];
  }, [
    branches,
    accessibleBranches,
    branchMultiValue,
    form.assigned_branches,
    form.branch_id,
    form.branch_name_km,
  ]);

  /*
   * Branch changes are local-state-only, same as every other field
   * on this page — nothing is sent to the server until Save is
   * clicked (handleSave diffs branchSelectionIds against
   * originalBranchIds and fires the assign/revoke requests then).
   */
  const handleBranchMultiChange = (
    nextValues,
  ) => {
    if (
      isReadOnly &&
      !canManageSensitiveFields
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setHasUnsavedChanges(true);

    /*
     * Anyone other than a secretary only ever has one (primary)
     * branch — the multiselect still applies here for a consistent
     * look, but behaves like the old single-select: whichever value
     * was just toggled on becomes the new (and only) branch, saved
     * together with the rest of the form via the page's Save
     * button, same as before this field became a multiselect.
     */
    if (form.account_role !== "SECRETARY") {
      const previousValues =
        form.branch_id
          ? [String(form.branch_id)]
          : [];

      const added = nextValues.filter(
        (value) =>
          !previousValues.includes(
            value,
          ),
      );

      const nextBranchId =
        added[0] ??
        nextValues[
          nextValues.length - 1
        ] ??
        "";

      setForm((previous) => ({
        ...previous,
        branch_id: nextBranchId,
      }));

      return;
    }

    // SECRETARY — just track the pending selection. The actual
    // assign/revoke calls (and the primary-branch bookkeeping that
    // comes back from them) happen in handleSave.
    setBranchSelectionIds(nextValues);
  };

  /* =======================================================
   * NORMAL FIELD CHANGE
   * ======================================================= */

  const handleChange =
    (field) =>
    (event) => {
      if (isReadOnly && !(
        canManageSensitiveFields &&
        ["branch_id", "account_role", "viewer_scope", "member_status_id", "positionId"].includes(field)
      )) {
        return;
      }
      const value =
        event.target.value;

      setError("");
      setSuccess("");
      setHasUnsavedChanges(true);

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
          t("memberPage.cvAllowedTypes"),
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        4 *
          1024 *
          1024
      ) {
        setError(
          t("memberPage.fileTooLarge"),
        );

        event.target.value =
          "";

        return;
      }

      setHasUnsavedChanges(true);

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

      setCvMimeType(file.type);
    };

  /* =======================================================
   * ACCOUNT STATUS
   * ======================================================= */

    /*
     * Local-state-only, same as every other field on this page — the
     * enable/disable request no longer fires on change. It's queued
     * until Save is clicked, where handleSave compares
     * form.account_status against originalAccountStatus to decide
     * whether to call the account endpoint at all.
     */
    const handleAccountStatusChange =
      (event) => {
        if (isReadOnly && !canManageSensitiveFields) {
          return;
        }

        const nextStatus =
          event.target.value;

        if (
          !memberId ||
          !form.has_account ||
          !nextStatus
        ) {
          return;
        }

        if (
          nextStatus ===
          form.account_status
        ) {
          return;
        }

        setError("");
        setSuccess("");
        setHasUnsavedChanges(true);

        setForm(
          (previous) => ({
            ...previous,
            account_status:
              nextStatus,
          }),
        );
      };

  /* =======================================================
   * SAVE PERSONAL INFO
   * ======================================================= */

  const handleSave =
    async () => {
      if (!canSavePersonalInfo) {
        return false;
      }

      if (!memberId) {
          setError(
          t("memberPage.missingMemberId"),
        );

        return false;
      }

      if (
        !form.full_name_km.trim()
      ) {
        setError(
          t("memberPage.khmerNameRequired"),
        );

        return false;
      }

      if (!form.gender) {
        setError(
          t("memberPage.genderRequired"),
        );

        return false;
      }

      const selectedSecretaryBranches =
        form.account_role === "SECRETARY"
          ? branchSelectionIds
          : [];

      if (
        form.account_role === "SECRETARY"
          ? selectedSecretaryBranches.length === 0
          : !form.branch_id
      ) {
        setError(
          t("memberPage.branchRequired"),
        );

        return false;
      }

      if (
        form.account_role === "VIEWER" &&
        !form.viewer_scope
      ) {
        setError(
          t("memberPage.selectViewerScope"),
        );

        return false;
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

          username:
            form.username.trim() ||
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
            form.account_role === "SECRETARY"
              ? (form.branch_id
                  ? Number(form.branch_id)
                  : selectedSecretaryBranches[0]
                    ? Number(selectedSecretaryBranches[0])
                    : null)
              : Number(form.branch_id),

          // A branch-leader-mapped position is never sent through this
          // generic slot -- the backend rejects it outright (see
          // MemberPersonalInfoServiceImpl#updatePosition), since becoming
          // leader has to go through the account/role call below instead
          // (step 2), the only path that knows how to demote whoever
          // currently holds it. A viewer-mapped position is excluded the
          // same way, for a different reason: a VIEWER holds no
          // branch_staff row at all (see updateAccountRole's VIEWER
          // branch) -- the position only ever serves to auto-fill
          // role=VIEWER here, never to record a staff position label.
          position_id:
            form.positionId &&
            !["BRANCH_LEADER", "VIEWER"].includes(
              positions.find(
                (option) => option.value === form.positionId,
              )?.mappedRole,
            )
              ? Number(
                  form.positionId,
                )
              : null,

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

        // Staying BRANCH_LEADER while switching which leader-mapped
        // position (e.g. canonical <-> deputy) is held is a
        // position_id change with no role change -- the generic
        // personal-info PUT above never sends a BRANCH_LEADER-mapped
        // position_id (see the comment on that payload), so without
        // this the position switch would never reach the backend.
        const leaderPositionChanged =
          selectedRole ===
            "BRANCH_LEADER" &&
          String(
            form.positionId || "",
          ) !==
            String(
              originalPositionId || "",
            );

        // Same reasoning as leaderPositionChanged, for a VIEWER
        // ("Member Viewer") switching which viewerScope
        // (BRANCH_LEADER-level <-> SECRETARY-level) they hold.
        const viewerScopeChanged =
          selectedRole ===
            "VIEWER" &&
          String(
            form.viewer_scope || "",
          ) !==
            String(
              originalViewerScope || "",
            );

        if (
          form.has_account &&
          selectedRole &&
          (selectedRole !==
            savedRole ||
            leaderPositionChanged ||
            viewerScopeChanged)
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

                    // Only meaningful for BRANCH_LEADER -- which
                    // specific leader-mapped position (e.g. "deputy")
                    // this promotion should be recorded under, instead
                    // of silently normalizing to the canonical one.
                    position_id:
                      selectedRole ===
                        "BRANCH_LEADER" &&
                      form.positionId
                        ? Number(
                            form.positionId,
                          )
                        : null,

                    // Only meaningful for VIEWER -- which
                    // branch-scoped level this member-linked viewer
                    // sees their own branch at.
                    viewer_scope:
                      selectedRole ===
                        "VIEWER" &&
                      form.viewer_scope
                        ? form.viewer_scope
                        : null,
                  }),
              },
            );

          updatedRole =
            accountResponse?.role ||
            selectedRole;

          setOriginalRole(
            updatedRole,
          );

          setOriginalPositionId(
            updatedRole ===
              "BRANCH_LEADER"
              ? form.positionId
              : "",
          );

          setOriginalViewerScope(
            updatedRole ===
              "VIEWER"
              ? form.viewer_scope
              : "",
          );
        }

        let latestBranchId = form.branch_id;
        let latestBranchNameKm = form.branch_name_km;
        let latestAssignedBranches = form.assigned_branches;
        let latestBranchSelection = originalBranchIds;

        /*
         * 3. Branch coverage (SECRETARY only)
         *
         * Send the complete selected branch set in ONE backend transaction.
         * This prevents partial saves such as add A -> success, add B ->
         * success, remove C -> failure. The backend validates every branch
         * against the current actor's scope and then synchronizes branch_staff
         * plus members.branch_id atomically.
         *
         * Only fires when the selection actually changed AND the current
         * actor is allowed to manage this target's sensitive fields --
         * PUT /personal-info/branches is ADMIN/BRANCH_LEADER-only on the
         * backend, so a SECRETARY editing a fellow SECRETARY's other,
         * unrelated fields (name, phone, religion, ...) used to always hit
         * this call regardless, and always got a flat 403 from it even
         * though the branch multiselect was never touched (it's disabled
         * for that actor/target pair in the first place).
         */
        const branchSelectionChanged =
          JSON.stringify([...branchSelectionIds].map(String).sort()) !==
          JSON.stringify([...originalBranchIds].map(String).sort());

        if (
          updatedRole === "SECRETARY" &&
          canManageSensitiveFields &&
          branchSelectionChanged
        ) {
          const selectedBranchIds = branchSelectionIds.map((id) => Number(id));

          const branchData = await requestJson(
            `/members/${memberId}/personal-info/branches`,
            {
              method: "PUT",
              body: JSON.stringify({
                branch_ids: selectedBranchIds,
              }),
            },
          );

          latestBranchId =
            branchData?.branch_id != null
              ? String(branchData.branch_id)
              : selectedBranchIds[0]
                ? String(selectedBranchIds[0])
                : latestBranchId;

          latestBranchNameKm =
            branchData?.branch_name_km ||
            latestBranchNameKm;

          latestAssignedBranches =
            Array.isArray(branchData?.assigned_branches)
              ? branchData.assigned_branches
              : latestAssignedBranches;

          latestBranchSelection = selectedBranchIds.map(String);

          setBranchSelectionIds(latestBranchSelection);
          setOriginalBranchIds(latestBranchSelection);
        }

        /*
         * 4. Member status
         *
         * This is the organizational Member status stored in
         * members.status_id. It drives the Member list/filter.
         */
        if (form.member_status_id) {
          const updatedMember = await requestJson(
            `/members/${memberId}/status`,
            {
              method: "PATCH",
              body: JSON.stringify({
                status_id: Number(form.member_status_id),
              }),
            },
          );

          const savedStatusId =
            updatedMember?.status?.id ??
            form.member_status_id;

          setOriginalMemberStatusId(String(savedStatusId));

          /*
           * 5. Keep login access (users.status) in lockstep with the
           * status just saved above -- an admin setting a member
           * Inactive here expects that to also block their login, not
           * just relabel them while they can still sign in.
           */
          if (
            form.has_account &&
            canManageSensitiveFields
          ) {
            const selectedStatusOption =
              memberStatusOptions.find(
                (option) =>
                  option.value ===
                  String(savedStatusId),
              );

            const statusCode = String(
              selectedStatusOption?.code || "",
            ).toUpperCase();

            const accountAction =
              statusCode === "ACTIVE"
                ? "enable"
                : statusCode === "INACTIVE"
                  ? "disable"
                  : null;

            if (
              accountAction &&
              originalAccountStatus !==
                "PENDING_ACTIVATION"
            ) {
              const account =
                await requestJson(
                  `/members/${memberId}/personal-info/account/${accountAction}`,
                  {
                    method: "PATCH",
                  },
                );

              const nextAccountStatus =
                account?.status ||
                (accountAction === "enable"
                  ? "ACTIVE"
                  : "INACTIVE");

              setOriginalAccountStatus(
                nextAccountStatus,
              );

              setForm(
                (previous) => ({
                  ...previous,
                  account_status:
                    nextAccountStatus,
                }),
              );
            }
          }
        }

        const latestAccountStatus = form.account_status;

        /*
         * 6. CV
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
         * 7. Normalize response
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

            viewer_scope:
              updatedRole === "VIEWER"
                ? form.viewer_scope
                : "",

            account_status:
              latestAccountStatus ||
              normalized.account_status ||
              previous.account_status,

            branch_id:
              latestBranchId ||
              normalized.branch_id ||
              previous.branch_id,

            branch_name_km:
              latestBranchNameKm ||
              normalized.branch_name_km ||
              previous.branch_name_km,

            assigned_branches:
              latestAssignedBranches ||
              normalized.assigned_branches ||
              previous.assigned_branches,
          }),
        );

        setOriginalAccountStatus(
          latestAccountStatus,
        );

        setOriginalBranchIds(
          latestBranchSelection,
        );
        setBranchSelectionIds(
          latestBranchSelection,
        );

        // fileName/cvMimeType are already correct at this point either
        // way -- set from the real upload just above if a new CV was
        // part of this save (handleFileChange already captured file.name/
        // file.type), or already holding the real metadata fetched on
        // initial load if this save didn't touch the CV at all. No need
        // to reset them back to a placeholder here.

        /*
         * 7. Refresh account state
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

                viewer_scope:
                  account?.viewer_scope ??
                  account?.viewerScope ??
                  previous.viewer_scope,

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

              setOriginalViewerScope(
                String(
                  account?.viewer_scope ??
                    account?.viewerScope ??
                    "",
                ),
              );
            }

            if (
              account?.status
            ) {
              setOriginalAccountStatus(
                account.status,
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
          t("memberPage.saveSuccess"),
        );

        setHasUnsavedChanges(false);

        /*
         * This page keeps its own local `form` state independent of the
         * parent layout's profile header/stat cards, which fetch member
         * data on their own. Without this, a saved change (name, role,
         * status, branch) only shows up there after a manual reload.
         */
        refetchMemberProfile();

        return true;
      } catch (saveError) {
        console.error(
          "Cannot save personal info:",
          saveError,
        );

        setError(
          saveError.status === 413
            ? t("common.fileTooLarge")
            : khmerErrorMessage(
                saveError.message,
                t("memberPage.saveFailed"),
              ),
        );

        return false;
      } finally {
        setSaving(false);
      }
    };

  /*
   * Registers this page's dirty flag + save function with the
   * shared unsaved-changes guard (see
   * member/memberInfo/[id]/layout.js), so the tab-nav bar confirms
   * before navigating away while hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(
    hasUnsavedChanges,
    handleSave,
  );

  /* =======================================================
   * LOADING
   * ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-text-secondary">
          {t("memberPage.loadingPersonal")}
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
          border-border
          bg-bg-page-white
          p-4
          sm:p-5
          lg:p-6
        "
      >
        <h2 className="text-lg font-bold text-primary">
          {t("memberPage.detailPersonal")}
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
              ${isReadOnly ? "member-readonly cursor-not-allowed [&_input]:pointer-events-none [&_input]:bg-bg-page-gray [&_select]:pointer-events-none [&_select]:bg-bg-page-gray" : ""}
            `}
          >
            <BoxFill
              label={t("memberPage.nameKm")}
              value={
                form.full_name_km
              }
              onChange={
                handleChange(
                  "full_name_km",
                )
              }
              placeholder={t("memberPage.nameKmPlaceholder")}
            />

            <BoxFill
              label={t("memberPage.nameEn")}
              value={
                form.full_name_en
              }
              onChange={
                handleChange(
                  "full_name_en",
                )
              }
              placeholder={t("memberPage.nameEnPlaceholder")}
            />

            <FormSelect
              label={t("memberPage.gender")}
              value={
                form.gender
              }
              onChange={
                handleChange(
                  "gender",
                )
              }
              placeholder={t("memberPage.selectGender")}
              options={
                genders
              }
            />

            <FormDate
              label={t("memberPage.dateOfBirth")}
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
              label={t("memberPage.username")}
              value={
                form.username
              }
              onChange={
                handleChange(
                  "username",
                )
              }
              placeholder={t("memberPage.usernamePlaceholder")}
              autoComplete="off"
            />

            <BoxFill
              label={t("memberPage.email")}
              type="email"
              value={
                form.email
              }
              onChange={
                handleChange(
                  "email",
                )
              }
              placeholder={t("memberPage.emailPlaceholder")}
            />

            <BoxFill
              label={t("memberPage.phone")}
              type="tel"
              value={
                form.phone
              }
              onChange={
                handleChange(
                  "phone",
                )
              }
              placeholder={t("memberPage.phonePlaceholder")}
            />

            <FormSelect
              label={t("memberPage.nationality")}
              value={
                form.nationality_id
              }
              onChange={
                handleChange(
                  "nationality_id",
                )
              }
              placeholder={t("memberPage.selectNationality")}
              options={
                nationalities
              }
            />

            <FormSelect
              label={t("memberPage.ethnicity")}
              value={
                form.ethnicity_id
              }
              onChange={
                handleChange(
                  "ethnicity_id",
                )
              }
              placeholder={t("memberPage.selectEthnicity")}
              options={
                ethnicities
              }
            />

            <FormSelect
              label={t("memberPage.religion")}
              value={
                form.religion_id
              }
              onChange={
                handleChange(
                  "religion_id",
                )
              }
              placeholder={t("memberPage.selectReligion")}
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
                label={t("memberPage.branch")}
                placeholder={t("memberPage.selectBranch")}
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
                  saving
                }
              />
            ) : (
              <SearchableSelect
                label={t("memberPage.branch")}
                value={
                  form.branch_id
                }
                onChange={handleChange(
                  "branch_id",
                )}
                placeholder={t("memberPage.selectBranch")}
                options={
                  branchOptions
                }
                disabled={
                  !canManageSensitiveFields
                }
              />
            )}

            {/* POSITION */}

            <FormSelect
              label={t("memberPage.position")}
              value={
                form.positionId
              }
              onChange={
                handlePositionChange
              }
              placeholder={t("memberPage.selectPosition")}
              options={
                positionOptions
              }
              disabled={
                !canManageSensitiveFields
              }
              selectClassName={isAdmin ? "!pointer-events-auto !cursor-pointer !bg-bg-page-white !text-text-secondary" : ""}
              adminEditable={isAdmin}
            />

            {/* ROLE */}

            <FormSelect
              label={t("memberPage.role")}
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
                  ? t("memberPage.selectRole")
                  : t("memberPage.noAccount")
              }
              options={
                roleOptions
              }
              // Role is always driven by Position (see
              // handlePositionChange) -- never editable directly here,
              // position selected or not.
              disabled
              selectClassName={isAdmin ? "!pointer-events-auto !cursor-pointer !bg-bg-page-white !text-text-secondary" : ""}
              adminEditable={isAdmin}
            />

            {/*
              VIEWER SCOPE -- only meaningful for a member-linked
              VIEWER ("Member Viewer"): which branch-scoped level
              (BRANCH_LEADER or SECRETARY) they see their own branch
              at. A branch leader actor can only ever grant
              SECRETARY-level, mirroring the same restriction already
              enforced on the backend for the role itself.
            */}
            {form.account_role === "VIEWER" && (
              <FormSelect
                label={t("memberPage.viewerScope")}
                value={form.viewer_scope}
                onChange={handleChange("viewer_scope")}
                placeholder={t("memberPage.selectViewerScope")}
                options={
                  role === "BRANCH_LEADER"
                    ? VIEWER_SCOPE_OPTIONS.filter(
                        (option) => option.value === "SECRETARY",
                      )
                    : VIEWER_SCOPE_OPTIONS
                }
                disabled={!canManageSensitiveFields || !form.has_account}
              />
            )}

            <FormSelect
              label={t("memberPage.memberLevel")}
              value={
                form.member_level_id
              }
              onChange={
                handleChange(
                  "member_level_id",
                )
              }
              placeholder={t("memberPage.selectMemberLevel")}
              options={
                levels
              }
            />

            <FormSelect
              label={t("memberPage.tshirtSize")}
              value={
                form.tshirt_size
              }
              onChange={
                handleChange(
                  "tshirt_size",
                )
              }
              placeholder={t("memberPage.selectTshirtSize")}
              options={
                tshirtSizes
              }
            />

            {/* ONE VISIBLE STATUS
                Keep one status selector in Member Detail.
                It is backed by members.status_id and is the same
                status used by Member list and linked Users rows. */}
            <FormSelect
              label={t("memberPage.status")}
              value={form.member_status_id}
              onChange={handleChange("member_status_id")}
              placeholder={t("memberPage.selectStatus")}
              options={memberStatusOptions}
              disabled={!canManageMemberAccount}
              selectClassName={isAdmin ? "!pointer-events-auto !cursor-pointer !bg-bg-page-white !text-text-secondary" : ""}
              adminEditable={isAdmin}
            />

          </div>

          {/* CV */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              {t("memberPage.uploadCv")}
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
                border-border
                bg-bg-page-gray
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
                <CvFilePreview
                  fileUrl={cvPreviewUrl || `/api/files/${form.cv_file_id}/content`}
                  fileName={fileName}
                  mimeType={cvMimeType}
                />
              )}

              {!fileName && <UploadCloud size={30} className="text-text-secondary" />}
              {!isReadOnly && <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {fileName ? t("memberPage.replaceCv") : t("memberPage.uploadFile")}
              </button>}
              <p className="mt-2 max-w-full truncate text-xs text-text-secondary" title={fileName}>
                {fileName || t("memberPage.cvHelpText")}
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
            ? t("common.saving")
            : t("memberPage.save")}
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
  const { locale } = useLanguage();

  const getOptionLabel = (option) => {
    if (typeof option !== "object" || option === null) {
      return String(option ?? "");
    }

    const khmerLabel =
      option.labelKm ??
      option.label_km ??
      option.nameKm ??
      option.name_km;

    const englishLabel =
      option.labelEn ??
      option.label_en ??
      option.nameEn ??
      option.name_en;

    return locale === "en"
      ? englishLabel ?? khmerLabel ?? option.label ?? String(option.value ?? "")
      : khmerLabel ?? englishLabel ?? option.label ?? String(option.value ?? "");
  };

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
            border-border
            bg-bg-page-white
            px-4
            pr-10
            text-sm
            text-text-secondary
            outline-none
            transition
            focus:border-primary
            disabled:cursor-not-allowed
            disabled:bg-bg-page-gray
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
                  typeof option === "object" && option !== null
                    ? option.value
                    : option,
                )}
                value={
                  typeof option === "object" && option !== null
                    ? option.value
                    : option
                }
              >
                {
                  getOptionLabel(option)
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
