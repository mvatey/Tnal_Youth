"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import SearchableSelect from "@/components/forms/SearchableSelect";
import MultiSelect from "@/components/forms/multiselect";
import FormActionButton from "@/components/forms/FormActionButton";
import { useLanguage } from "@/context/LanguageContext";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";
import { isPasswordValid } from "@/lib/validatePassword";

async function fetchJson(path, options) {
  const response = await fetch(path, { cache: "no-store", credentials: "include", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
}

const USERS_BASE = "/api/backend/admin/users";

const BRANCH_SCOPED_ROLES = new Set(["BRANCH_LEADER", "SECRETARY", "MEMBER"]);

const EMPTY_FORM = {
  fullNameKm: "",
  fullNameEn: "",
  username: "",
  phone: "",
  email: "",
  role: "",
  positionId: "",
  viewerScope: "",
  branchId: "",
  password: "",
  status: "",
};

/*
 * Password is required when creating a standalone account — it
 * becomes the account's real password immediately and the account is
 * created ACTIVE, so it can log in right away with no OTP step. (When
 * editing, password stays optional — see EMPTY_FORM/isFormValid below
 * — leave it blank to keep the account's current password unchanged.)
 * Member-linked accounts still go through OTP-based first activation;
 * that path isn't this modal.
 *
 * phone/email aren't in this list — see phoneOrEmailRequirementMet
 * below, since the rule differs between standalone and member-linked.
 */
const REQUIRED_FIELDS = [
  "fullNameKm",
  "role",
];

async function submitUser(payload, userId) {
  const response = await fetch(
    userId ? `${USERS_BASE}/${userId}` : USERS_BASE,
    {
      method: userId ? "PUT" : "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

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
        ? body?.message || body?.detail || body?.error
        : body;

    throw new Error(
      message || `Request failed with status ${response.status}`,
    );
  }

  return body;
}

// editingUser: pass a row from /users (see mapUser's *Raw fields) to edit
// that account. Creating a new account is always a standalone one (POST
// /admin/users); editing a MEMBER-LINKED account (editingUser.memberId set)
// takes a different save path -- see submit() below -- that calls the same
// member-scoped endpoints the Member Detail personal-info page already
// uses (personal-info, account/role, personal-info/branches, status +
// derived enable/disable, account/password), instead of PUT
// /admin/users/{id} (which only ever accepts standalone accounts, and
// rejects a member-linked one with a 409 -- see UserManagementServiceImpl).
// This keeps the proven branch_staff/role-validation logic for
// member-linked accounts intact rather than bypassing it.
export default function CreateUserModal({ open, onClose, onSave, editingUser = null }) {
  const { t, locale } = useLanguage();
  const isEditing = Boolean(editingUser);
  const isMemberLinked = Boolean(editingUser?.memberId);
  const roleOptions = [
    { label: t("usersPage.admin"), value: "ADMIN" },
    { label: t("usersPage.branchLeader"), value: "BRANCH_LEADER" },
    { label: t("usersPage.secretary"), value: "SECRETARY" },
    { label: t("usersPage.member"), value: "MEMBER" },
    { label: t("usersPage.viewer"), value: "VIEWER" },
  ];
  // A member-linked account can never be ADMIN or VIEWER -- the backend
  // (MemberPasswordServiceImpl#validateRoleChange) rejects ADMIN outright
  // ("cannot be assigned from the member page") and only lets an admin
  // actor assign MEMBER/SECRETARY/BRANCH_LEADER through this path, so
  // offering the other two here would just produce a save that fails.
  const memberLinkedRoleOptions = [
    { label: t("usersPage.branchLeader"), value: "BRANCH_LEADER" },
    { label: t("usersPage.secretary"), value: "SECRETARY" },
    { label: t("usersPage.member"), value: "MEMBER" },
  ];
  const viewerScopeOptions = [
    { label: t("usersPage.admin"), value: "ADMIN" },
    { label: t("usersPage.branchLeader"), value: "BRANCH_LEADER" },
    { label: t("usersPage.secretary"), value: "SECRETARY" },
  ];
  const statusOptions = [
    { label: t("usersPage.active"), value: "ACTIVE" },
    { label: t("usersPage.inactive"), value: "INACTIVE" },
  ];

  const [form, setForm] = useState(EMPTY_FORM);
  // Which of phone/email to collect for a standalone account -- a radio
  // choice instead of showing both fields plus a small "at least one is
  // required" hint underneath, which was easy to miss and cramped on a
  // narrow screen. Not used for a member-linked account, which always
  // requires both. Defaults to phone; re-derived from the existing record
  // when editing (see the load effect below).
  const [contactMethod, setContactMethod] = useState("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [showValidationError, setShowValidationError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Member-linked-only state. `personalInfoBase` holds every OTHER
  // personal-info field (gender, DOB, religion, ...) exactly as loaded,
  // so submit() can send the full PUT /personal-info payload the backend
  // expects without this modal needing to expose (or risk clobbering)
  // fields it was never meant to touch.
  const [personalInfoBase, setPersonalInfoBase] = useState(null);
  const [memberStatusOptions, setMemberStatusOptions] = useState([]);
  const [memberStatusId, setMemberStatusId] = useState("");
  const [originalMemberStatusId, setOriginalMemberStatusId] = useState("");
  const [originalRole, setOriginalRole] = useState("");
  const [positions, setPositions] = useState([]);
  const [originalPositionId, setOriginalPositionId] = useState("");
  const [branchSelectionIds, setBranchSelectionIds] = useState([]);
  const [originalBranchIds, setOriginalBranchIds] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingMemberInfo, setLoadingMemberInfo] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!editingUser) {
      setForm(EMPTY_FORM);
      setPersonalInfoBase(null);
      setConfirmPassword("");
      setContactMethod("phone");
      setShowValidationError(false);
      setSubmitError("");
      return;
    }

    if (!isMemberLinked) {
      const phoneRaw = editingUser.phoneRaw || "";
      const emailRaw = editingUser.emailRaw || "";

      setForm({
        fullNameKm: editingUser.fullNameKmRaw || "",
        fullNameEn: editingUser.fullNameEnRaw || "",
        username: editingUser.usernameRaw || "",
        phone: phoneRaw,
        email: emailRaw,
        role: editingUser.roleCode || "VIEWER",
        viewerScope: editingUser.viewerScopeRaw || "ADMIN",
        branchId: editingUser.branchId != null ? String(editingUser.branchId) : "",
        password: "",
        status: ["ACTIVE", "INACTIVE"].includes(editingUser.statusCode)
          ? editingUser.statusCode
          : "",
      });
      setContactMethod(
        phoneRaw && emailRaw ? "both" : emailRaw ? "email" : "phone",
      );
      setShowValidationError(false);
      setSubmitError("");
      return;
    }

    // Member-linked: load the full personal-info record (needed to
    // rebuild the complete PUT payload on save) plus the member's own
    // status id/options -- mirrors the Member Detail personal-info
    // page's own load effects.
    let cancelled = false;
    setLoadingMemberInfo(true);
    setSubmitError("");

    Promise.all([
      fetchJson(`/api/backend/members/${editingUser.memberId}/personal-info`),
      fetchJson(`/api/backend/members/${editingUser.memberId}`),
      fetchJson(`/api/lookups/member-statuses`),
    ])
      .then(([personalInfo, member, statuses]) => {
        if (cancelled) return;

        setPersonalInfoBase(personalInfo);

        const role = String(
          personalInfo?.account_role || personalInfo?.accountRole || editingUser.roleCode || "MEMBER",
        ).toUpperCase();

        const assignedBranches = Array.isArray(personalInfo?.assigned_branches)
          ? personalInfo.assigned_branches
          : Array.isArray(personalInfo?.assignedBranches)
            ? personalInfo.assignedBranches
            : [];

        const secretaryBranchIds = assignedBranches
          .map((branch) => String(branch?.id ?? branch?.branch_id ?? branch?.branchId ?? ""))
          .filter(Boolean);

        const primaryBranchId =
          personalInfo?.branch_id ?? personalInfo?.branchId ?? editingUser.branchId ?? "";

        const memberPhone = personalInfo?.phone || "";
        const memberEmail = personalInfo?.email || "";

        const positionId =
          personalInfo?.position_id != null
            ? String(personalInfo.position_id)
            : "";

        setForm({
          fullNameKm: personalInfo?.full_name_km || personalInfo?.fullNameKm || "",
          fullNameEn: personalInfo?.full_name_en || personalInfo?.fullNameEn || "",
          username: personalInfo?.username || "",
          phone: memberPhone,
          email: memberEmail,
          role,
          positionId,
          viewerScope: "",
          branchId: primaryBranchId != null ? String(primaryBranchId) : "",
          password: "",
          status: "",
        });
        setContactMethod(
          memberPhone && memberEmail ? "both" : memberEmail ? "email" : "phone",
        );

        setOriginalRole(role);
        setOriginalPositionId(positionId);

        const branchSelection =
          role === "SECRETARY"
            ? (secretaryBranchIds.length ? secretaryBranchIds : primaryBranchId != null ? [String(primaryBranchId)] : [])
            : [];

        setBranchSelectionIds(branchSelection);
        setOriginalBranchIds(branchSelection);

        const currentStatusId = String(member?.status?.id ?? member?.statusId ?? member?.status_id ?? "");
        const allStatusOptions = Array.isArray(statuses) ? statuses : Array.isArray(statuses?.data) ? statuses.data : [];

        // Same restriction as the personal-info page: only ACTIVE/
        // INACTIVE are ever offered, plus whatever this member's current
        // status already is if it's something else (RESIGNED, etc.) so
        // that value still shows up rather than silently disappearing.
        setMemberStatusOptions(
          allStatusOptions
            .map((option) => ({
              value: String(option?.value ?? option?.id ?? ""),
              label:
                (locale === "en" ? option?.labelEn || option?.label_en : option?.labelKm || option?.label_km) ||
                option?.label ||
                String(option?.value ?? option?.id ?? ""),
              code: String(option?.code || "").toUpperCase(),
            }))
            .filter(
              (option) =>
                option.code === "ACTIVE" || option.code === "INACTIVE" || option.value === currentStatusId,
            ),
        );

        setMemberStatusId(currentStatusId);
        setOriginalMemberStatusId(currentStatusId);
      })
      .catch((error) => {
        if (!cancelled) setSubmitError(error.message || t("usersPage.loadMemberInfoFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoadingMemberInfo(false);
      });

    setConfirmPassword("");
    setShowValidationError(false);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingUser?.id, isMemberLinked]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    fetch("/api/lookups/branches", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || t("usersPage.loadBranchesFailed"));
        const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        setBranches(
          rows
            .map((branch) => ({
              value: String(branch?.id ?? branch?.value ?? ""),
              label:
                (locale === "en"
                  ? branch?.nameEn || branch?.name_en || branch?.labelEn || branch?.label_en || branch?.nameKm || branch?.name_km || branch?.labelKm || branch?.label_km
                  : branch?.nameKm || branch?.name_km || branch?.labelKm || branch?.label_km || branch?.nameEn || branch?.name_en || branch?.labelEn || branch?.label_en) ||
                branch?.label ||
                String(branch?.id ?? ""),
            }))
            .filter((branch) => branch.value),
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") setBranches([]);
      });

    return () => controller.abort();
  }, [locale, open, t]);

  useEffect(() => {
    if (!open || !isMemberLinked) return;

    const controller = new AbortController();

    fetch("/api/lookups/positions", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || t("usersPage.loadPositionsFailed", "Cannot load positions"));
        const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        setPositions(
          rows
            .map((position) => ({
              value: String(position?.id ?? position?.value ?? ""),
              label:
                (locale === "en"
                  ? position?.labelEn || position?.label_en || position?.labelKm || position?.label_km
                  : position?.labelKm || position?.label_km || position?.labelEn || position?.label_en) ||
                position?.label ||
                String(position?.id ?? ""),
              mappedRole: String(
                position?.mappedRole || position?.mapped_role || "",
              ).toUpperCase(),
            }))
            .filter((position) => position.value),
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") setPositions([]);
      });

    return () => controller.abort();
  }, [locale, open, isMemberLinked, t]);

  const positionOptions = (() => {
    const current = form.positionId;

    if (!current || positions.some((option) => option.value === current)) {
      return positions;
    }

    const currentOption = positions.find((option) => option.value === current);

    return currentOption ? [...positions, currentOption] : positions;
  })();

  /*
   * Mirrors CreateMemberModal's updatePosition and the personal-info
   * page's handlePositionChange: picking a position whose mappedRole is
   * set also updates Role to match, locking Role (see the FormSelect
   * below) so it can't independently disagree with the position.
   */
  const handlePositionChange = (event) => {
    const value = event.target.value;

    const selectedPosition = positions.find(
      (option) => option.value === value,
    );

    setForm((previousForm) => ({
      ...previousForm,
      positionId: value,
      role: selectedPosition?.mappedRole || previousForm.role,
    }));

    setShowValidationError(false);
    setSubmitError("");
  };

  if (!open) {
    return null;
  }

  const update = (field) => (event) => {
    const value = event.target.value;

    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setShowValidationError(false);
    setSubmitError("");
  };

  const handleContactMethodChange = (method) => {
    setContactMethod(method);

    setForm((previousForm) => ({
      ...previousForm,
      phone: method === "email" ? "" : previousForm.phone,
      email: method === "phone" ? "" : previousForm.email,
    }));

    setShowValidationError(false);
    setSubmitError("");
  };

  const isViewer = form.role === "VIEWER";
  const isSecretary = form.role === "SECRETARY";
  const requiresBranch =
    BRANCH_SCOPED_ROLES.has(form.role) ||
    (isViewer && form.viewerScope !== "ADMIN");
  // Member-linked SECRETARY uses the multi-branch selector instead of the
  // single branchId field -- everyone else (including a member-linked
  // BRANCH_LEADER/MEMBER) still just needs the one branchId.
  const branchRequirementMet = !requiresBranch
    || (isMemberLinked && isSecretary
      ? branchSelectionIds.length > 0
      : String(form.branchId).trim() !== "");
  const passwordValid = isMemberLinked
    ? form.password.trim() === ""
      || (isPasswordValid(form.password.trim()) && form.password.trim() === confirmPassword.trim())
    : isEditing
      ? form.password.trim() === "" || isPasswordValid(form.password.trim())
      : isPasswordValid(form.password.trim());
  // Required on both the standalone and member-linked forms -- checked
  // separately rather than added to REQUIRED_FIELDS since it's still
  // loading (personalInfoBase not ready yet) when the member-linked path
  // first mounts.
  const usernameRequirementMet =
    form.username.trim() !== "";
  // Neither a standalone nor a member-linked account goes through
  // OTP-based activation anymore, so both paths follow the same
  // contactMethod choice -- whichever field(s) it names just need to
  // actually be filled in.
  const phoneOrEmailRequirementMet =
    contactMethod === "phone"
      ? form.phone.trim() !== ""
      : contactMethod === "email"
        ? form.email.trim() !== ""
        : form.phone.trim() !== "" && form.email.trim() !== "";
  const isFormValid =
    REQUIRED_FIELDS.every(
      (field) => String(form[field] ?? "").trim() !== "",
    ) &&
    usernameRequirementMet &&
    phoneOrEmailRequirementMet &&
    (!isViewer || isMemberLinked || String(form.viewerScope).trim() !== "") &&
    branchRequirementMet &&
    passwordValid &&
    !loadingMemberInfo;

  // Sequenced the same way the Member Detail personal-info page's own
  // handleSave does -- personal info first, then role, then branch
  // coverage (SECRETARY only), then member status (+ the derived
  // login enable/disable), then password last. Each step only fires if
  // that piece actually changed, same as the proven original.
  const submitMemberLinked = async () => {
    const memberId = editingUser.memberId;

    const personalInfoPayload = {
      full_name_km: form.fullNameKm.trim(),
      full_name_en: form.fullNameEn.trim() || null,
      gender: personalInfoBase?.gender || null,
      date_of_birth: personalInfoBase?.date_of_birth || personalInfoBase?.dateOfBirth || null,
      username: form.username.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      religion_id: personalInfoBase?.religion_id ?? personalInfoBase?.religionId ?? null,
      ethnicity_id: personalInfoBase?.ethnicity_id ?? personalInfoBase?.ethnicityId ?? null,
      nationality_id: personalInfoBase?.nationality_id ?? personalInfoBase?.nationalityId ?? null,
      member_level_id: personalInfoBase?.member_level_id ?? personalInfoBase?.memberLevelId ?? null,
      branch_id: isSecretary
        ? (form.branchId ? Number(form.branchId) : branchSelectionIds[0] ? Number(branchSelectionIds[0]) : null)
        : (form.branchId ? Number(form.branchId) : null),
      // A branch-leader-mapped position is never sent through this
      // generic slot -- the backend rejects it outright, since becoming
      // leader has to go through the account/role call below instead,
      // the only path that knows how to demote whoever currently holds
      // it (see MemberPersonalInfoServiceImpl#updatePosition).
      position_id:
        form.positionId &&
        positions.find((option) => option.value === form.positionId)?.mappedRole !== "BRANCH_LEADER"
          ? Number(form.positionId)
          : null,
      tshirt_size: personalInfoBase?.tshirt_size || personalInfoBase?.tshirtSize || null,
      current_address: personalInfoBase?.current_address || personalInfoBase?.currentAddress || null,
      permanent_address: personalInfoBase?.permanent_address || personalInfoBase?.permanentAddress || null,
    };

    await fetchJson(`/api/backend/members/${memberId}/personal-info`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personalInfoPayload),
    });

    let updatedRole = originalRole;
    if (form.role && form.role !== originalRole) {
      const roleResponse = await fetchJson(`/api/backend/members/${memberId}/account/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          // Only meaningful for BRANCH_LEADER -- which specific
          // leader-mapped position (e.g. "deputy") this promotion
          // should be recorded under, instead of silently
          // normalizing to the canonical one.
          position_id:
            form.role === "BRANCH_LEADER" && form.positionId
              ? Number(form.positionId)
              : null,
        }),
      });

      updatedRole = roleResponse?.role || form.role;
    }

    const branchSelectionChanged =
      JSON.stringify([...branchSelectionIds].map(String).sort()) !==
      JSON.stringify([...originalBranchIds].map(String).sort());

    if (updatedRole === "SECRETARY" && branchSelectionChanged) {
      await fetchJson(`/api/backend/members/${memberId}/personal-info/branches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_ids: branchSelectionIds.map((id) => Number(id)) }),
      });
    }

    if (memberStatusId && memberStatusId !== originalMemberStatusId) {
      await fetchJson(`/api/backend/members/${memberId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_id: Number(memberStatusId) }),
      });

      const selectedStatusOption = memberStatusOptions.find((option) => option.value === memberStatusId);
      const action =
        selectedStatusOption?.code === "ACTIVE"
          ? "enable"
          : selectedStatusOption?.code === "INACTIVE"
            ? "disable"
            : null;

      if (action) {
        await fetchJson(`/api/backend/members/${memberId}/personal-info/account/${action}`, {
          method: "PATCH",
        });
      }
    }

    if (form.password.trim()) {
      await fetchJson(`/api/backend/members/${memberId}/account/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_password: form.password.trim(),
          confirm_password: confirmPassword.trim(),
        }),
      });
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!form.fullNameKm.trim()) {
      setSubmitError(t("usersPage.requiredNameKm"));
      return;
    }

    if (!usernameRequirementMet) {
      setSubmitError(t("usersPage.requiredUsername"));
      return;
    }

    if (!form.role.trim()) {
      setSubmitError(t("usersPage.requiredRole"));
      return;
    }

    if (!phoneOrEmailRequirementMet) {
      setSubmitError(
        contactMethod === "both"
          ? t("usersPage.requiredBothPhoneAndEmail")
          : contactMethod === "phone"
            ? t("usersPage.requiredPhone")
            : t("usersPage.requiredEmail"),
      );
      return;
    }

    if (!passwordValid) {
      const passwordEntered = form.password.trim() !== "";

      if (!passwordEntered) {
        setSubmitError(t("usersPage.requiredPassword"));
      } else if (!isPasswordValid(form.password.trim())) {
        setSubmitError(t("memberPage.passwordRequirementsNotMet"));
      } else {
        setSubmitError(t("memberPage.passwordMismatch"));
      }

      return;
    }

    if (!branchRequirementMet) {
      setSubmitError(t("usersPage.requiredBranch"));
      return;
    }

    if (isViewer && !isMemberLinked && !String(form.viewerScope).trim()) {
      setSubmitError(t("usersPage.requiredViewAs"));
      return;
    }

    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (isMemberLinked) {
        await submitMemberLinked();
        await onSave?.();
        onClose?.();
        return;
      }

      const payload = {
        fullNameKm: form.fullNameKm.trim(),
        fullNameEn: form.fullNameEn.trim() || null,
        username: form.username.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        role: form.role,
        viewerScope: isViewer ? form.viewerScope : null,
        branchId: requiresBranch ? Number(form.branchId) : null,
        password: form.password.trim() || null,
        status: isEditing && form.status ? form.status : null,
      };

      const savedUser = await submitUser(
        payload,
        isEditing ? editingUser.id : null,
      );

      await onSave?.(savedUser);

      setForm(EMPTY_FORM);
      onClose?.();
    } catch (error) {
      console.error(
        isEditing ? t("usersPage.updateFailed") : t("usersPage.createFailed"),
        error,
      );

      setSubmitError(
        khmerErrorMessage(
          error.message,
          isEditing
            ? t("usersPage.updateFailed")
            : t("usersPage.createFailed"),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupCard size="lg" onClose={onClose} className="no-scrollbar">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-base font-bold leading-7 text-primary sm:text-lg">
          {isEditing ? t("usersPage.editUserAccount") : t("usersPage.createUserAccount")}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("usersPage.close")}
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
          <X size={18} />
        </button>
      </div>

      {loadingMemberInfo ? (
        <div className="py-10 text-center text-sm text-text-secondary">
          {t("common.loading")}
        </div>
      ) : (
      <form onSubmit={submit} className="flex flex-col gap-5" autoComplete="off">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <BoxFill
            label={t("usersPage.nameKm")}
            name="fullNameKm"
            placeholder={t("usersPage.enterName")}
            value={form.fullNameKm}
            onChange={update("fullNameKm")}
            required
          />

          <BoxFill
            label={t("usersPage.nameEn")}
            name="fullNameEn"
            placeholder={t("usersPage.enterName")}
            value={form.fullNameEn}
            onChange={update("fullNameEn")}
          />
        </div>

        <div className="space-y-4">
          <BoxFill
            label={t("usersPage.username")}
            name="username"
            placeholder={t("usersPage.usernamePlaceholder")}
            value={form.username}
            onChange={update("username")}
            autoComplete="off"
            required
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              {t("usersPage.contactMethodLabel")}
              <span className="ml-1 text-error">*</span>
            </label>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                ["phone", t("usersPage.contactMethodPhone")],
                ["email", t("usersPage.contactMethodEmail")],
                ["both", t("usersPage.contactMethodBoth")],
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
              label={t("usersPage.phone")}
              name="phone"
              placeholder="0XXXXXXXX"
              value={form.phone}
              onChange={update("phone")}
              required
            />
          )}

          {(contactMethod === "email" || contactMethod === "both") && (
            <BoxFill
              label={t("usersPage.email")}
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={update("email")}
              autoComplete="off"
              required
            />
          )}

          <BoxFill
            label={t("usersPage.password")}
            name="password"
            type="password"
            placeholder={t("usersPage.passwordPlaceholder")}
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
            required={!isEditing && !isMemberLinked}
          />

          {isMemberLinked && (
            <BoxFill
              label={t("usersPage.confirmPassword")}
              name="confirmPassword"
              type="password"
              placeholder={t("usersPage.passwordPlaceholder")}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setShowValidationError(false);
                setSubmitError("");
              }}
              autoComplete="new-password"
            />
          )}

          {isEditing && !isMemberLinked && (
            <FormSelect
              label={t("usersPage.accountStatus")}
              name="status"
              placeholder={t("usersPage.keepExisting")}
              options={statusOptions}
              value={form.status}
              onChange={update("status")}
            />
          )}

          {isMemberLinked && (
            <FormSelect
              label={t("usersPage.accountStatus")}
              name="memberStatusId"
              placeholder={t("usersPage.selectStatus")}
              options={memberStatusOptions}
              value={memberStatusId}
              onChange={(event) => {
                setMemberStatusId(event.target.value);
                setShowValidationError(false);
                setSubmitError("");
              }}
            />
          )}
        </div>

        {/*
          Role starts unselected — its dependent fields (viewer-scope,
          branch) only appear once a role is actually chosen, stacked
          below it.
        */}
        <div className="space-y-4 rounded-xl border border-border bg-bg-page-gray/40 p-4">
          {isMemberLinked && (
            <FormSelect
              label={t("memberPage.position")}
              name="positionId"
              placeholder={t("memberPage.selectPosition")}
              options={positionOptions}
              value={form.positionId}
              onChange={handlePositionChange}
            />
          )}

          <FormSelect
            label={t("usersPage.role")}
            name="role"
            placeholder={t("usersPage.selectRole")}
            options={isMemberLinked ? memberLinkedRoleOptions : roleOptions}
            value={form.role}
            onChange={update("role")}
            disabled={isMemberLinked && Boolean(form.positionId)}
            required
          />

          {isViewer && !isMemberLinked && (
            <FormSelect
              label={t("usersPage.viewAs")}
              name="viewerScope"
              placeholder={t("usersPage.selectViewAs")}
              options={viewerScopeOptions}
              value={form.viewerScope}
              onChange={update("viewerScope")}
              required
            />
          )}

          {requiresBranch && isMemberLinked && isSecretary ? (
            <MultiSelect
              label={t("usersPage.branch")}
              name="branchSelectionIds"
              placeholder={t("usersPage.selectBranch")}
              options={branches}
              value={branchSelectionIds}
              onChange={(nextValues) => {
                setBranchSelectionIds(nextValues);
                setShowValidationError(false);
                setSubmitError("");
              }}
              required
            />
          ) : (
            requiresBranch && (
              <SearchableSelect
                label={t("usersPage.branch")}
                name="branchId"
                placeholder={t("usersPage.selectBranch")}
                options={branches}
                value={form.branchId}
                onChange={update("branchId")}
                required
              />
            )
          )}
        </div>

        {showValidationError && !isFormValid && (
          <p className="mt-1 text-xs font-medium text-error">
            {t("usersPage.requiredFields")}
          </p>
        )}

        {submitError && (
          <p className="mt-1 text-xs font-medium text-error">
            {submitError}
          </p>
        )}

        <FormActionButton
          onCancel={onClose}
          isValid={isFormValid && !isSubmitting}
          saving={isSubmitting}
          saveText={isEditing ? t("usersPage.update") : t("usersPage.save")}
          cancelText={t("usersPage.cancel")}
        />
      </form>
      )}
    </PopupCard>
  );
}
