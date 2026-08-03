"use client";

import {
  notFound,
  usePathname,
  useRouter,
} from "next/navigation";

import {
  use,
  useMemo,
} from "react";

import {
  CircleDollarSign,
  CreditCard,
  HandCoins,
  InfoIcon,
  Users,
} from "lucide-react";

import { FaHandHoldingDollar } from "react-icons/fa6";

import MemberInfoCard from "@/components/card/memberInfoCard";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberTabNav from "@/components/navigation/MemberTabNav";
import StatCard from "@/components/dashboard/statCard";

import users from "@/data/members.json";
import { RiFileTransferLine } from "react-icons/ri";
import { BiTransfer } from "react-icons/bi";
import { GiCash } from "react-icons/gi";
import { BsCashCoin } from "react-icons/bs";
import { HiCash } from "react-icons/hi";

export default function MemberInfoLayout({
  children,
  params,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { id } = use(params);

  const isDetailPage =
    pathname.includes("/details");

  const isDocuments =
    pathname.endsWith("/documents");

  const isParticipation =
    pathname.endsWith("/participation");

  const isDonation =
    pathname.endsWith("/donation");

  const isSponsor =
    pathname.endsWith("/sponsor");

  const isPassword =
    pathname.endsWith("/password");

  const showDefaultStats =
    isDocuments ||
    isParticipation ||
    isPassword;

  const member = useMemo(() => {
    return users.find(
      (user) =>
        String(user.id) === String(id),
    );
  }, [id]);

  if (!member) {
    notFound();
  }

  const handleOpenDetails = () => {
    router.push(
      `/member/memberInfo/${id}/details/personal`,
    );
  };

  const handleBack = () => {
    if (isDetailPage) {
      router.push(
        `/member/memberInfo/${id}/documents`,
      );

      return;
    }

    router.push("/member");
  };

  return (
    <div className="space-y-4">
      <HeaderMemberInfo
        title={
          isDetailPage
            ? "ប្រវត្តិរូបលម្អិតសមាជិក"
            : "ប្រវត្តិរូបសមាជិក"
        }
        breadcrumb={{
          parent: isDetailPage
            ? "ប្រវត្តិរូបសមាជិក"
            : "បញ្ជីសមាជិក",

          current: isDetailPage
            ? "ប្រវត្តិរូបលម្អិតសមាជិក"
            : "ប្រវត្តិរូបសមាជិក",
        }}
        onBack={handleBack}
        buttonText={
          isDetailPage
            ? undefined
            : "ព័ត៌មានលម្អិត"
        }
        onButtonClick={
          isDetailPage
            ? undefined
            : handleOpenDetails
        }
      />

      {/* Default StatCards:
          documents, participation, password */}

      {!isDetailPage &&
        showDefaultStats && (
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
              icon={FaHandHoldingDollar}
              label="ចំនួនធ្វើវិភាគទាន"
              value="150"
              growth="8"
              iconColor="text-warning"
              iconBg="bg-warning-bg"
            />
          </div>
        )}

      {/* Donation StatCards */}

      {!isDetailPage &&
        isDonation && (
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
              icon={FaHandHoldingDollar}
              label="ចំនួនវិភាគទាន"
              value="25"
              growth="12"
              iconColor="text-primary"
              iconBg="bg-secondary-light"
            />

            <StatCard
              icon={CircleDollarSign}
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
              icon={CreditCard}
              label="ការទូទាត់តាមធនាគារ"
              value="12"
              growth="5"
              iconColor="text-secondary"
              iconBg="bg-secondary-light"
            />
          </div>
        )}

      {/* Sponsor StatCards */}

      {!isDetailPage &&
        isSponsor && (
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
              icon={CircleDollarSign}
              label="ទឹកប្រាក់សរុប"
              value="2,000,000៛"
              growth="10"
              iconColor="text-success"
              iconBg="bg-success-bg"
            />

            <StatCard
              icon={HandCoins}
              label="ចំនួនសម្ភារៈ"
              value="500"
              growth="7"
              iconColor="text-warning"
              iconBg="bg-warning-bg"
            />
            <StatCard
              icon={CreditCard}
              label="ការទូទាត់តាម ធនាគារ"
              value="500"
              growth="7"
              iconColor="text-secondary"
              iconBg="bg-secondary-light"
            />
          </div>
        )}

      {/* Member information appears below StatCards */}

      <MemberInfoCard
        member={member}
      />

      {/* Tabs appear below MemberInfoCard */}

      {!isDetailPage && (
        <MemberTabNav
          memberId={member.id}
        />
      )}

      <div>{children}</div>
    </div>
  );
}