"use client";

import { notFound, usePathname, useRouter } from "next/navigation";
import { use, useMemo } from "react";
import { Users, InfoIcon } from "lucide-react";
import { FaHandHoldingDollar } from "react-icons/fa6";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MemberTabNav from "@/components/navigation/MemberTabNav";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo.js";
import StatCard from "@/components/dashboard/statCard";
import users from "@/data/members.json";

export default function MemberInfoLayout({ children, params }) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = use(params);
  const isDetailPage = pathname.includes("/details");

  const member = useMemo(() => {
    return users.find((user) => String(user.id) === String(id));
  }, [id]);

  if (!member) {
    notFound();
  }

  const handleOpenDetails = () => {
    router.push(`/member/memberInfo/${id}/details/personal`);
  };

  const handleBack = () => {
    if (isDetailPage) {
      router.push(`/member/memberInfo/${id}`);
      return;
    }

    router.push("/member");
  };

  return (
    <div className="space-y-4">
      <HeaderMemberInfo
        title={isDetailPage ? "ប្រវត្តិរូបលម្អិតសមាជិក" : "ប្រវត្តិរូបសមាជិក"}
        breadcrumb={{ parent: isDetailPage ? "ប្រវត្តិរូបសមាជិក" : "បញ្ជីសមាជិក", current: isDetailPage ? "ប្រវត្តិរូបលម្អិតសមាជិក" : "ប្រវត្តិរូបសមាជិក" }}
        onBack={handleBack}
        buttonText={isDetailPage ? undefined : "ព័ត៌មានលម្អិត"}
        onButtonClick={isDetailPage ? undefined : handleOpenDetails}
      />

      {!isDetailPage && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Users} label="ចំនួនសកម្មភាពចូលរួម" value="25" growth="12" iconColor="text-primary" iconBg="bg-secondary-light" />
          <StatCard icon={InfoIcon} label="ចំនួនមិនបានចូលរួម" value="150" growth="8" iconColor="text-error" iconBg="bg-error-bg" />
          <StatCard icon={FaHandHoldingDollar} label="ចំនួនវិភាគទាន" value="12" growth="5" iconColor="text-warning" iconBg="bg-warning-bg" />
        </div>
      )}

      <MemberInfoCard member={member} />

      {!isDetailPage && <MemberTabNav memberId={member.id} />}

      <div>{children}</div>
    </div>
  );
}