"use client";

import { notFound } from "next/navigation";
import { useMemo, use } from "react";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MemberTabNav from "@/components/navigation/MemberTabNav";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import StatCard from "@/components/dashboard/statCard";
import {
  Users,
  UserCheck,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Eye,
  InfoIcon,
} from "lucide-react";

import users from "@/data/members.json";

import { ClipboardList, HeartHandshake, FileText, GroupIcon, User } from "lucide-react";
import { info } from "autoprefixer";
import { FaHandHolding } from "react-icons/fa";
import { FaHandHoldingDollar } from "react-icons/fa6";

export default function MemberInfoLayout({ children, params }) {
  const { id } = use(params);

  const member = useMemo(() => {
    return users.find((user) => String(user.id) === String(id));
  }, [id]);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderMemberInfo
        title="ព័ត៌មានលម្អិតសមាជិក"
        breadcrumb={{
          parent: "បញ្ជីសមាជិក",
          current: "ព័ត៌មានលម្អិតសមាជិក",
        }}
        buttonText="ព័ត៌មានលម្អិត"
        onButtonClick={() => {
          console.log("View Details:", id);
        }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
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
          label="ចំនួនវិភាគទាន"
          value="12"
          growth="5"
          iconColor="text-warning"
          iconBg="bg-warning-bg"
        />
      </div>
      {/* Profile */}
      <MemberInfoCard member={member} />

      {/* Navigation Tabs */}
      <MemberTabNav memberId={member.id} />

      {/* Current Page */}
      <div>{children}</div>
    </div>
  );
}