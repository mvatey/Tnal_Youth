"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Eye, EyeOff, Info, Lock, Mail } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import OrganizationProfileCard from "@/components/account/OrganizationProfileCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_PROFILE_IMAGE = "/profiles/default-avatar.jpg";
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",
  VIEWER: "អ្នកមើល",
};

function roleDisplayLabel(role, viewerScope) {
  const roleCode = String(role || "").toUpperCase();
  const base = ROLE_LABELS[roleCode] || role || "";

  if (roleCode !== "VIEWER" || !viewerScope) {
    return base;
  }

  const scopeCode = String(viewerScope).toUpperCase();
  return `${base} (${ROLE_LABELS[scopeCode] || viewerScope})`;
}

async function submitJson(path, body) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object"
        ? parsed?.message || parsed?.detail || parsed?.error
        : parsed;

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return parsed;
}

/*
 * The entire self-service page for an account with no member profile to
 * show a card or a details page for — either it has no linked member
 * record at all (ADMIN, or a standalone secretary/branch-leader/member
 * account), or it's a VIEWER, who only ever gets this same restricted
 * view regardless of whether their account happens to be linked to a
 * member. A small profile card (name/role/photo — the same few fields
 * captured when the account was created) sits above the account
 * settings; password and email live in one merged card on the left of
 * that, with the password's own rules on the right.
 */
export default function StandaloneAccountSettings({
  currentEmail,
  onEmailChanged,
  profile,
  onProfileChanged,
}) {
  const isAdmin = String(profile?.role || "").toUpperCase() === "ADMIN";

  return (
    <div className="min-w-0 space-y-4">
      {isAdmin && <OrganizationProfileCard canEdit />}

      <ProfileCard
        nameKm={profile?.nameKm}
        nameEn={profile?.nameEn}
        phone={profile?.phone}
        role={profile?.role}
        viewerScope={profile?.viewerScope}
        profileImage={profile?.profileImage}
        onProfileImageChanged={onProfileChanged}
      />

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <div className="min-w-0 divide-y divide-border rounded-xl border border-border bg-bg-page-white">
          <EmailSection currentEmail={currentEmail} onEmailChanged={onEmailChanged} />
          <PasswordSection />
        </div>

        <PasswordRulesCard />
      </div>
    </div>
  );
}

function ProfileCard({
  nameKm,
  nameEn,
  phone,
  role,
  viewerScope,
  profileImage,
  onProfileImageChanged,
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(profileImage || DEFAULT_PROFILE_IMAGE);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(profileImage || DEFAULT_PROFILE_IMAGE);
  }, [profileImage]);

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(t("memberPage.imageOnly"));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setError(t("memberPage.imageTooLarge"));
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch("/api/backend/my-account/profile-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || body?.error || t("memberPage.uploadProfileFailed"));
      }

      setPreview(body?.profileImage || body?.profile_image || DEFAULT_PROFILE_IMAGE);
      await onProfileImageChanged?.();
    } catch (uploadError) {
      console.error("Cannot upload my profile image:", uploadError);
      setError(uploadError.message || t("memberPage.uploadProfileFailed"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const displayName = nameKm && nameKm !== "-" ? nameKm : t("common.user");
  const displayNameEn = nameEn && nameEn !== "-" ? nameEn : "";
  const displayPhone = phone && phone !== "-" ? phone : "";
  const roleLabel = role ? roleDisplayLabel(role, viewerScope) : "";

  return (
    <div className="min-w-0 rounded-xl border border-border bg-bg-page-white p-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="group relative h-20 w-20 shrink-0">
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-bg-page-gray">
            <Image
              src={preview}
              alt={displayName}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
              onError={() => setPreview(DEFAULT_PROFILE_IMAGE)}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />

          <button
            type="button"
            disabled={uploading}
            onClick={handleChooseImage}
            aria-label={t("memberPage.changeProfilePhoto")}
            title={t("memberPage.changeProfilePhoto")}
            className="
              absolute
              -bottom-1
              -right-1
              z-10
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              border-2
              border-secondary
              bg-secondary
              text-white
              shadow-md
              transition
              hover:scale-105
              hover:bg-secondary-hover
              focus:outline-none
              focus:ring-2
              focus:ring-white/70
            "
          >
            <Camera size={14} />
          </button>
        </div>

        <div className="min-w-0 space-y-1">
          <p className="truncate text-base font-semibold text-text-primary">
            {displayName}
          </p>

          {displayNameEn && (
            <p className="truncate text-sm text-text-secondary">{displayNameEn}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {roleLabel && (
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                {roleLabel}
              </span>
            )}

            {displayPhone && (
              <span className="text-xs text-text-secondary">{displayPhone}</span>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-error">{error}</p>}
    </div>
  );
}

function PasswordRulesCard() {
  const { t } = useLanguage();
  const rules = [
    t("memberPage.passwordRuleLength"),
    t("myAccount.passwordRuleDifferent"),
    t("myAccount.passwordRuleSame"),
  ];

  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-warning/30 bg-bg-page-white p-5">
      <div className="flex items-center gap-2">
        <Info size={18} className="text-warning" />
        <h2 className="text-base font-semibold text-warning">
          {t("myAccount.passwordRequirements")}
        </h2>
      </div>

      <ul className="space-y-2 text-sm text-warning">
        {rules.map((rule) => (
          <li key={rule} className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PasswordSection() {
  const { t } = useLanguage();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError(t("myAccount.currentPasswordRequired"));
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError(t("memberPage.passwordMinLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("memberPage.passwordMismatch"));
      return;
    }

    if (oldPassword === newPassword) {
      setError(t("myAccount.passwordMustBeDifferent"));
      return;
    }

    try {
      setSubmitting(true);

      await submitJson("/api/backend/my-account/password", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(t("myAccount.passwordChanged"));
    } catch (submitError) {
      console.error("Cannot change my password:", submitError);
      setError(submitError.message || t("myAccount.passwordChangeFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-5 p-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          {t("memberPage.passwordTitle")}
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          {t("myAccount.passwordDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label={t("myAccount.currentPassword")}
          value={oldPassword}
          onChange={setOldPassword}
          show={showOld}
          setShow={setShowOld}
          autoComplete="current-password"
        />

        <PasswordInput
          label={t("memberPage.newPassword")}
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          setShow={setShowNew}
          autoComplete="new-password"
        />

        <PasswordInput
          label={t("memberPage.confirmNewPassword")}
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
          autoComplete="new-password"
        />

        {error && <p className="text-sm font-medium text-error">{error}</p>}
        {success && <p className="text-sm font-medium text-success">{success}</p>}

        <div className="flex justify-end pt-2">
          <SaveButton type="submit" disabled={submitting}>
            {submitting ? t("common.saving") : t("common.save")}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}

function EmailSection({ currentEmail, onEmailChanged }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { logout } = useAuth();
  const [newEmail, setNewEmail] = useState(currentEmail || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // The field starts pre-filled with the account's current email (fetched
  // by the page above) so the admin sees what's on file and can just
  // override the parts that need to change, instead of typing a whole
  // new address blind.
  useEffect(() => {
    setNewEmail(currentEmail || "");
  }, [currentEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmed = newEmail.trim();

    if (!trimmed) {
      setError(t("myAccount.emailRequired"));
      return;
    }

    if (trimmed === currentEmail) {
      setError(t("myAccount.sameEmail"));
      return;
    }

    try {
      setSubmitting(true);

      await submitJson("/api/backend/my-account/email", {
        new_email: trimmed,
      });

      /*
       * The login session's token is bound to the email used to sign in
       * (see CustomUserDetailsService#loadUserByUsername) -- once the
       * email actually changes in the database, that token stops
       * resolving to any account, and every request after this one would
       * silently start failing with 403, including a plain page reload.
       * Sending the account through a clean logout + redirect to login
       * turns that into an explicit "sign in with your new email" step
       * instead of a confusing dead session.
       */
      setSuccess(t("myAccount.emailChangedLoginAgain"));

      // The account's own session is about to be logged out below, so a
      // refetch failing here (its token is already stale) isn't a real
      // error -- only a genuinely failed PATCH above should show one.
      try {
        await onEmailChanged?.();
      } catch {
        // ignore
      }

      window.setTimeout(async () => {
        await logout();
        router.push("/auth/login");
      }, 1500);
    } catch (submitError) {
      console.error("Cannot change my email:", submitError);
      setError(submitError.message || t("myAccount.emailChangeFailed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-5 p-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          {t("myAccount.changeEmail")}
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          {t("myAccount.emailDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            {t("memberPage.email")}
          </label>

          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              size={18}
            />

            <input
              type="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              className="
                h-[34px]
                w-full
                rounded-lg
                border
                border-border
                bg-bg-page-white
                pl-11
                pr-4
                text-sm
                text-text-primary
                outline-none
                transition
                focus:border-primary
              "
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}
        {success && <p className="text-sm font-medium text-success">{success}</p>}

        <div className="flex justify-end pt-2">
          <SaveButton type="submit" disabled={submitting}>
            {submitting ? t("common.saving") : t("common.save")}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, setShow, autoComplete }) {
  const { t } = useLanguage();
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <div className="relative">
        <Lock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
          size={18}
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("memberPage.passwordPlaceholder")}
          autoComplete={autoComplete}
          className="
            h-[34px]
            w-full
            rounded-lg
            border
            border-border
            bg-bg-page-white
            pl-11
            pr-11
            text-sm
            text-text-primary
            outline-none
            transition
            focus:border-primary
          "
        />

        <button
          type="button"
          onClick={() => setShow((previous) => !previous)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-label={show ? t("myAccount.hidePassword") : t("myAccount.showPassword")}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
