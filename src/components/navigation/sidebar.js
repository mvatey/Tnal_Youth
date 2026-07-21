"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaFileAlt,
  FaHandHoldingHeart,
  FaSignInAlt,
  FaSignOutAlt,
  FaUniversity,
  FaUser,
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";

import { NAV_ITEMS } from "@/lib/navigation";
import { useBranch } from "@/context/BranchContext";
import ChartIcon from "@/components/ui/icons/chartIcon";

const ICON_MAP = {
  dashboard: ChartIcon,
  building: FaUniversity,
  users: FaUsers,
  calendar: FaCalendarAlt,
  donation: FaHandHoldingHeart,
  file: FaFileAlt,
  profile: FaUserCircle,
};

export default function Sidebar({
  role = "secretary",
  userName = "ផាន វិទ្ធី",
  userTitle = "លេខាធិការ",
  userAvatar,
  isLoggedIn = true,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  const {
    branches = [],
    selectedBranch = "all",
    setSelectedBranch = () => {},
  } = useBranch();

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function handleLogin() {
    setProfileOpen(false);
    router.push("/login");
  }

async function handleLogout() {
  try {
    setProfileOpen(false);

    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/auth/login");
    router.refresh();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col justify-between bg-primary-sidebar text-white">
      <div>
        {/* Logo */}
        <div className="flex flex-col items-center px-6 pb-5 pt-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white">
            <Image
              src="/logo.png"
              alt="Logo"
              width={56}
              height={56}
              className="object-cover"
              priority
            />
          </div>

          <h3 className="text-sm font-bold leading-snug">
            សមាគមថ្នាលយុវជនកម្ពុជា
          </h3>

          <p className="mt-1 text-xs text-white/60">
            ការគ្រប់គ្រងប្រព័ន្ធយុវជន
          </p>
        </div>

        {/* Branch */}
        <div className="mb-2 px-3">
          <div className="relative">
            <FaUniversity
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white"
            />

            <select
              value={selectedBranch}
              onChange={(event) =>
                setSelectedBranch(event.target.value)
              }
              className="w-full appearance-none rounded-lg bg-white/10 py-2.5 pl-11 pr-8 text-sm font-medium text-white outline-none transition hover:bg-white/15"
            >
              <option value="all" className="text-black">
                ជ្រើសរើសសាខា
              </option>

              {branches.map((branch) => (
                <option
                  key={branch}
                  value={branch}
                  className="text-black"
                >
                  {branch}
                </option>
              ))}
            </select>

            <FaChevronDown
              size={12}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3">
          {visibleItems.map((item) => {
            const Icon = ICON_MAP[item.icon];

            const active =
              pathname === item.href ||
              pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {Icon && <Icon size={16} />}

                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom profile */}
      <div
        ref={profileRef}
        className="relative border-t border-white/10 px-4 py-4"
      >
        {isLoggedIn ? (
          <>
            {/* Drop-up menu */}
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
            onClick={handleLogout}
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
            <FaSignOutAlt size={15} />
            ចាកចេញ
          </button>
        </div>
      )}
            {/* Profile trigger */}
            <button
              type="button"
              onClick={() =>
                setProfileOpen((current) => !current)
              }
              aria-expanded={profileOpen}
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                  <Image
                    src={userAvatar || "/secretary.jpg"}
                    alt={userName}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 text-left">
                  <div className="truncate text-sm font-medium">
                    {userName}
                  </div>

                  <div className="truncate text-xs text-white/50">
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
                  ${profileOpen ? "rotate-180" : ""}
                `}
              />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogin}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-white/10
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-white/15
            "
          >
            <FaSignInAlt size={16} />
            ចូលប្រើប្រាស់
          </button>
        )}
      </div>
    </aside>
  );
}