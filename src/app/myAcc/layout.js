"use client";

import { usePathname } from "next/navigation";

import {
  CircleDollarSign,
  HandCoins,
  InfoIcon,
  Users,
} from "lucide-react";

import { FaHandHoldingDollar } from "react-icons/fa6";
import { HiCash } from "react-icons/hi";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

import HeaderUserInfo from "@/components/navigation/HeaderUserInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountProfileLayout from "@/components/navigation/MyAccountProfileLayout";
import StatCard from "@/components/dashboard/statCard";

import useCurrentMember from "@/hooks/useCurrentMember";

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",

  admin: "អ្នកគ្រប់គ្រង",
  secretary: "លេខាធិការ",
  branch_leader: "ប្រធានសាខា",
  member: "សមាជិក",
};

export default function MyAccountLayout({
  children,
}) {
  const pathname = usePathname();

  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const isDetailsPage =
    pathname.startsWith(
      "/myAcc/details",
    );

  const isDocuments =
    pathname.endsWith(
      "/documents",
    );

  const isParticipation =
    pathname.endsWith(
      "/participation",
    );

  const isDonation =
    pathname.endsWith(
      "/donation",
    );

  const isSponsor =
    pathname.endsWith(
      "/sponsor",
    );

  const isPassword =
    pathname.endsWith(
      "/password",
    );

  const showDefaultStats =
    isDocuments ||
    isParticipation ||
    isPassword;

  const displayName =
    member?.name_kh ||
    member?.fullNameKm ||
    member?.name_en ||
    member?.fullNameEn ||
    "អ្នកប្រើប្រាស់";

  const displayRole =
    member?.roleLabel ||
    ROLE_LABELS[
      member?.role
    ] ||
    member?.role ||
    "គណនី";

  const displayAvatar =
    member?.profile_photo ||
    member?.profileImage ||
    "/member.png";

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role={
          member?.role ||
          "secretary"
        }
        userName={displayName}
        userTitle={displayRole}
        userAvatar={displayAvatar}
      />

      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        <Topbar title="គណនីរបស់ខ្ញុំ" />

        <main
          className="
            no-scrollbar
            min-h-0
            flex-1
            overflow-y-auto
            p-4
            sm:p-5
          "
        >
          {loading && (
            <div className="rounded-xl border border-border bg-white p-6">
              កំពុងទាញយកព័ត៌មានគណនី...
            </div>
          )}

          {!loading &&
            error && (
              <div className="rounded-xl border border-border bg-white p-6 text-error">
                {error}
              </div>
            )}

          {!loading &&
            !error &&
            !member && (
              <div className="rounded-xl border border-border bg-white p-6">
                រកមិនឃើញព័ត៌មានគណនី
              </div>
            )}

          {!loading &&
            !error &&
            member && (
              <>
                {isDetailsPage ? (
                  children
                ) : (
                  <div className="min-w-0 space-y-4">
                    <HeaderUserInfo />

                    {/* Default StatCards:
                        documents, participation, password */}

                    {showDefaultStats && (
                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-4
                          md:grid-cols-2
                          xl:grid-cols-3
                        "
                      >
                        <StatCard
                          icon={Users}
                          label="ចំនួនសកម្មភាពចូលរួម"
                          value="25"
                          growth="12"
                          iconColor="text-primary"
                          iconBg="bg-secondary-light"
                        />

                        <StatCard
                          icon={InfoIcon}
                          label="ចំនួនមិនបានចូលរួម"
                          value="150"
                          growth="8"
                          iconColor="text-error"
                          iconBg="bg-error-bg"
                        />

                        <StatCard
                          icon={
                            FaHandHoldingDollar
                          }
                          label="ចំនួនធ្វើវិភាគទាន"
                          value="150"
                          growth="8"
                          iconColor="text-warning"
                          iconBg="bg-warning-bg"
                        />
                      </div>
                    )}

                    {/* Donation StatCards */}

                    {isDonation && (
                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-4
                          md:grid-cols-2
                          xl:grid-cols-4
                        "
                      >
                        <StatCard
                          icon={
                            FaHandHoldingDollar
                          }
                          label="ចំនួនវិភាគទាន"
                          value="25"
                          growth="12"
                          iconColor="text-primary"
                          iconBg="bg-secondary-light"
                        />

                        <StatCard
                          icon={
                            CircleDollarSign
                          }
                          label="ទឹកប្រាក់សរុប"
                          value="150"
                          growth="8"
                          iconColor="text-error"
                          iconBg="bg-error-bg"
                        />

                        <StatCard
                          icon={HiCash}
                          label="ការទូទាត់តាម Cash"
                          value="12"
                          growth="5"
                          iconColor="text-warning"
                          iconBg="bg-warning-bg"
                        />

                        <StatCard
                          icon={
                            HandCoins
                          }
                          label="ការទូទាត់តាមធនាគារ"
                          value="12"
                          growth="5"
                          iconColor="text-secondary"
                          iconBg="bg-secondary-light"
                        />
                      </div>
                    )}

                    {/* Sponsor StatCards */}

                    {isSponsor && (
                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-4
                          md:grid-cols-2
                          xl:grid-cols-4
                        "
                      >
                        <StatCard
                          icon={Users}
                          label="ចំនួនការបរិច្ចាក"
                          value="8"
                          growth="4"
                          iconColor="text-primary"
                          iconBg="bg-secondary-light"
                        />

                        <StatCard
                          icon={
                            CircleDollarSign
                          }
                          label="ទឹកប្រាក់សរុប"
                          value="2,000,000៛"
                          growth="10"
                          iconColor="text-success"
                          iconBg="bg-success-bg"
                        />

                        <StatCard
                          icon={
                            HandCoins
                          }
                          label="ចំនួនសម្ភារៈ"
                          value="500"
                          growth="7"
                          iconColor="text-warning"
                          iconBg="bg-warning-bg"
                        />

                        <StatCard
                          icon={
                            HandCoins
                          }
                          label="ការទូទាត់តាមធនាគារ"
                          value="500"
                          growth="7"
                          iconColor="text-secondary"
                          iconBg="bg-secondary-light"
                        />
                      </div>
                    )}

                    {/* Member information */}

                    <MemberInfoCard
                      member={member}
                    />

                    {/* My Account tabs + page content */}

                    <MyAccountProfileLayout>
                      {children}
                    </MyAccountProfileLayout>
                  </div>
                )}
              </>
            )}
        </main>
      </div>
    </div>
  );
}