"use client";

import Link from "next/link";
import Image from "next/image";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Menu,
  X,
} from "lucide-react";

import {
  FaBell,
  FaCalendarAlt,
  FaChevronDown,
  FaCog,
  FaFileAlt,
  FaHandHoldingHeart,
  FaSignOutAlt,
  FaUniversity,
  FaUserCircle,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";

import useCurrentMember from "@/hooks/useCurrentMember";
import useOrganizationProfile from "@/hooks/useOrganizationProfile";

import {
  getNavigationForRole,
  getEffectiveRole,
  normalizeRole,
} from "@/lib/navigation";

import ChartIcon from "@/components/ui/icons/chartIcon";

const ICON_MAP = {
  dashboard: ChartIcon,
  building: FaUniversity,
  users: FaUsers,
  userAccounts: FaUserShield,
  calendar: FaCalendarAlt,
  donation: FaHandHoldingHeart,
  file: FaFileAlt,
  profile: FaUserCircle,
  settings: FaCog,
  bell: FaBell,
};

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រងប្រព័ន្ធ",
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",
  VIEWER: "អ្នកមើល",

  admin: "អ្នកគ្រប់គ្រងប្រព័ន្ធ",
  secretary: "លេខាធិការ",
  branch_leader: "ប្រធានសាខា",
  member: "សមាជិក",
  viewer: "អ្នកមើល",

  អ្នកគ្រប់គ្រង: "អ្នកគ្រប់គ្រងប្រព័ន្ធ",
  លេខាធិការ: "លេខាធិការ",
  ប្រធានសាខា: "ប្រធានសាខា",
  សមាជិក: "សមាជិក",
};

function getMemberId(member) {
  return (
    member?.memberId ??
    member?.id ??
    member?.member_id ??
    null
  );
}

function getBranchOptionValue(
  branch,
) {
  return typeof branch ===
    "string"
    ? branch
    : branch.id;
}

function getBranchOptionLabel(
  branch,
) {
  return typeof branch ===
    "string"
    ? branch
    : branch.nameKm ||
      branch.nameEn ||
      branch.name ||
      `សាខា ${branch.id}`;
}

function getDefaultAvatar(
  member,
  user,
) {
  const value =
    member?.profile_photo ||
    member?.profileImage ||
    member?.profile_image ||
    member?.profilePhoto ||
    user?.profileImage ||
    user?.profile_photo ||
    "";

  const path = String(
    typeof value === "object"
      ? value?.url || ""
      : value,
  ).trim();

  if (!path) {
    return "/profiles/default-avatar.jpg";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/")
  ) {
    return path;
  }

  const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
    "http://localhost:8081";

  return path.startsWith("uploads/")
    ? `${backendOrigin}/${path}`
    : `${backendOrigin}/uploads/${path}`;
}

function getDisplayName(
  member,
  user,
  label,
  fallback,
) {
  return (
    (member && label(member, null)) ||
    (user && label(user, null)) ||
    fallback
  );
}

export default function Sidebar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    user,
    isLoggedIn,
    authLoading,
    logout,
  } = useAuth();

  const {
    member: currentMember,
  } = useCurrentMember();

  const {
    branches = [],
    selectedBranch = "all",
    setSelectedBranch = () => {},
  } = useBranch();

  const {
    t,
    label: localizedLabel,
  } = useLanguage();
  const { localized: organization } = useOrganizationProfile();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [mounted, setMounted] = useState(false);

  const [
    userAvatar,
    setUserAvatar,
  ] = useState(
    "/profiles/default-avatar.jpg",
  );

  const profileRef =
    useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentMemberId =
    getMemberId(
      currentMember,
    );

  const role = getEffectiveRole(user);
  const isViewer = normalizeRole(user?.role) === "viewer";

  const canSelectBranch =
    role === "secretary" ||
    role === "branch_leader";

  const visibleItems =
    getNavigationForRole(user);

  const userName =
    getDisplayName(
      currentMember,
      user,
      localizedLabel,
      t("common.user"),
    );

  const userTitle =
    isViewer
      ? `អ្នកមើល · ${ROLE_LABELS[String(user?.viewerScope || "ADMIN").toUpperCase()] || user?.viewerScope || "Admin"}`
      : t(`roles.${String(currentMember?.role || user?.role || role || "").toUpperCase()}`, ROLE_LABELS[currentMember?.role] || ROLE_LABELS[user?.role] || ROLE_LABELS[role] || role || "");

  const defaultUserAvatar =
    getDefaultAvatar(
      currentMember,
      user,
    );

  /*
   * Load the profile image saved
   * for the current logged-in member.
   *
   * This keeps Sidebar, My Account,
   * MemberInfoCard and ID Card synchronized.
   */
  useEffect(() => {
    setUserAvatar(
      defaultUserAvatar,
    );

    const handleProfileImageChange = (
      event,
    ) => {
      const changedMemberId =
        event.detail?.memberId;

      if (
        String(
          changedMemberId,
        ) !==
        String(
          currentMemberId,
        )
      ) {
        return;
      }

      setUserAvatar(
        event.detail?.imageData ||
          defaultUserAvatar,
      );
    };

    window.addEventListener(
      "tnal-profile-image-change",
      handleProfileImageChange,
    );

    return () => {
      window.removeEventListener(
        "tnal-profile-image-change",
        handleProfileImageChange,
      );
    };
  }, [
    currentMemberId,
    defaultUserAvatar,
  ]);

  /*
   * Close the profile menu
   * when clicking outside it.
   */
  useEffect(() => {
    function handleOutsideClick(
      event,
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target,
        )
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  async function handleLogout() {
    setProfileOpen(false);

    await logout();

    router.replace(
      "/auth/login",
    );

    router.refresh();
  }

  if (!mounted || authLoading) {
    return (
      <aside
        className="flex h-screen w-72 shrink-0 items-center justify-center bg-primary-sidebar text-white"
      >
        <span className="text-sm text-white/60">
          {t("common.loading", "កំពុងដំណើរការ...")}
        </span>
      </aside>
    );
  }

  if (
    !isLoggedIn ||
    !user
  ) {
    return null;
  }

  return (
    <>
      {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
          aria-label={t("common.openMenu", "បើកម៉ឺនុយ")}
          className="fixed left-4 top-4 z-[80] flex h-10 w-10 items-center justify-center rounded-xl bg-primary-sidebar text-white shadow-lg transition hover:bg-primary lg:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
          aria-label={t("common.closeMenu", "បិទម៉ឺនុយ")}
          className="fixed inset-0 z-[60] bg-black/35 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed
        inset-y-0
        left-0
        z-[70]
        flex
        h-screen
        w-72
        shrink-0
        flex-col
        justify-between
        bg-primary-sidebar
        text-white
        shadow-2xl
        transition-transform
        duration-200
        lg:relative
        lg:z-auto
        lg:translate-x-0
        lg:shadow-none
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Logo */}

        <div
          className="
            relative
            flex
            flex-col
            items-center
            px-6
            pb-5
            pt-6
            text-center
          "
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={t("common.closeMenu", "បិទម៉ឺនុយ")}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>

          <div
            className="
              mb-3
              flex
              h-14
              w-14
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-white
            "
          >
            <Image
              src={organization.logoUrl || "/logo.png"}
              alt={organization.name || "Logo"}
              width={56}
              height={56}
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          <h3 className="text-sm font-bold leading-snug">
            {organization.name || "សមាគមថ្នាលយុវជនកម្ពុជា"}
          </h3>

          <p className="mt-1 text-xs text-white/60">
            {organization.tagline || t("sidebar.subtitle", "ការគ្រប់គ្រងប្រព័ន្ធយុវជន")}
          </p>
        </div>

        {/* Branch selector */}

        {canSelectBranch &&
          branches.length > 0 && (
          <div className="mb-2 px-3">
            <div className="relative">
              <FaUniversity
                size={16}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-white
                "
              />

              {branches.length > 1 ? (
                <>
                                <select
                value={selectedBranch}
                onChange={(event) =>
                  setSelectedBranch(event.target.value)
                }
                className="
                  h-[40px]
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-white/10
                  bg-white/10
                  pl-11
                  pr-8
                  text-sm
                  font-medium
                  text-white
                  outline-none
                  transition-all
                  hover:bg-white/20
                  focus:border-white/30
                  focus:bg-white/15
                "
              >
                    {/*
                      No "all" option here -- a secretary/branch leader
                      responsible for more than one branch always has
                      exactly one branch active at a time (see
                      BranchContext's role-aware default selection);
                      this dropdown only switches which single branch
                      that is, never an aggregate "all branches" view.
                    */}
                    {branches.map(
                      (branch) => {
                        const branchValue =
                          getBranchOptionValue(
                            branch,
                          );

                        const branchLabel =
                          getBranchOptionLabel(
                            branch,
                          );

                        return (
                          <option
                            key={
                              branchValue
                            }
                            value={
                              branchValue
                            }
                            className="text-black"
                          >
                            {localizedLabel(branch, branchLabel)}
                          </option>
                        );
                      },
                    )}
                  </select>

                  <FaChevronDown
                    size={12}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-white/60
                    "
                  />
                </>
              ) : (
                /*
                 * Only one branch to be responsible for — there is
                 * no real choice to make ("all branches" and "this
                 * branch" are the same data), so just show its name
                 * instead of a dropdown with a single, pointless
                 * option.
                 */
                <div
                  className="
                    flex
                    h-[40px]
                    w-full
                    items-center
                    rounded-xl
                    border
                    border-white/10
                    bg-white/10
                    pl-11
                    pr-4
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  <span className="truncate">
                    {localizedLabel(
                      branches[0],
                      getBranchOptionLabel(branches[0]),
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}

        <nav className="space-y-1 px-3">
          {visibleItems.map(
            (item) => {
              const Icon =
                ICON_MAP[
                  item.icon
                ];

              const active =
                pathname ===
                  item.href ||
                pathname?.startsWith(
                  `${item.href}/`,
                );

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    transition
                    ${
                      active
                        ? `
                          bg-white/15
                          text-white
                        `
                        : `
                          text-white/70
                          hover:bg-white/5
                          hover:text-white
                        `
                    }
                  `}
                >
                  {Icon && (
                    <Icon
                      size={16}
                    />
                  )}

                  <span>
                    {t(item.labelKey, item.label)}
                  </span>
                </Link>
              );
            },
          )}
        </nav>
      </div>

      {/* Profile */}

      <div
        ref={profileRef}
        className="
          relative
          shrink-0
          border-t
          border-white/10
          px-4
          py-4
        "
      >
        {profileOpen && (
          <div
            className="
              absolute
              bottom-full
              left-4
              mb-2
              w-[calc(100%-2rem)]
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-primary-sidebar
              py-1.5
              shadow-xl
            "
          >
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                text-sm
                text-red-300
                transition
                hover:bg-white/10
                hover:text-red-200
              "
            >
              <FaSignOutAlt
                size={15}
              />

              {t("sidebar.logout", "ចាកចេញ")}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setProfileOpen(
              (current) =>
                !current,
            )
          }
          aria-expanded={
            profileOpen
          }
          className="
            flex
            w-full
            items-center
            justify-between
            gap-2
            rounded-lg
            px-2
            py-2
            transition
            hover:bg-white/10
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                relative
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-white/10
              "
            >
              {/* Authenticated image URLs must load in the browser so the
                  access-token cookie is included. Next/Image optimization
                  fetches them server-side and receives 401. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userAvatar}
                alt={userName}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/profiles/default-avatar.jpg";
                  setUserAvatar(
                    "/profiles/default-avatar.jpg",
                  );
                }}
              />
            </div>

            <div className="min-w-0 text-left">
              <div
                className="
                  truncate
                  text-sm
                  font-medium
                "
                title={userName}
              >
                {userName}
              </div>

              <div
                className="
                  truncate
                  text-xs
                  text-white/50
                "
                title={userTitle}
              >
                {userTitle}
              </div>
            </div>
          </div>

          <FaChevronDown
            size={12}
            className={`
              shrink-0
              text-white/50
              transition-transform
              duration-200
              ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>
      </div>
      </aside>
    </>
  );
}
