"use client";

import { usePathname, useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { Users, InfoIcon } from "lucide-react";
import { FaHandHoldingDollar } from "react-icons/fa6";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MemberTabNav from "@/components/navigation/MemberTabNav";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo.js";
import StatCard from "@/components/dashboard/statCard";

export default function MemberInfoLayout({ children, params }) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = use(params);
  const isDetailPage = pathname.includes("/details");

  const [member, setMember] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMember = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [memberResponse, summaryResponse, branchesResponse] =
        await Promise.all([
          fetch(`/api/members/${encodeURIComponent(id)}`, { cache: "no-store" }),
          fetch(`/api/members/${encodeURIComponent(id)}/summary`, { cache: "no-store" }),
          fetch("/api/lookups/branches", { cache: "no-store" }),
        ]);

      if (!memberResponse.ok) {
        const problem = await memberResponse.json().catch(() => ({}));
        throw new Error(problem.message || "Unable to load this member.");
      }

      const [memberData, summaryData, branches] = await Promise.all([
        memberResponse.json(),
        summaryResponse.ok ? summaryResponse.json() : null,
        branchesResponse.ok ? branchesResponse.json() : [],
      ]);
      const branch = branches.find(
        (item) => String(item.value ?? item.id) === String(memberData.branch_id),
      );

      setMember({
        ...memberData,
        fullNameKm: memberData.full_name_km,
        fullNameEn: memberData.full_name_en,
        branch: branch?.labelKm || branch?.labelEn || branch?.code || "-",
        status: memberData.status?.code || memberData.status?.label_km || "-",
        nationality:
          memberData.nationality?.label_km ||
          memberData.nationality?.label_en ||
          memberData.nationality?.name ||
          "-",
        ethnicity:
          memberData.ethnicity?.label_km ||
          memberData.ethnicity?.label_en ||
          memberData.ethnicity?.name ||
          "-",
        dateOfBirth: memberData.date_of_birth,
        joinedOn: memberData.joined_on,
      });
      setSummary(summaryData);
    } catch (loadError) {
      setMember(null);
      setError(loadError.message || "Unable to load this member.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading member data...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>{error || "Member not found."}</p>
        <button type="button" onClick={loadMember} className="mt-3 font-semibold underline">
          Retry
        </button>
      </div>
    );
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
          <StatCard icon={Users} label="ចំនួនសកម្មភាពចូលរួម" value={String(summary?.joinedActivityCount ?? 0)} growth="0" iconColor="text-primary" iconBg="bg-secondary-light" />
          <StatCard icon={InfoIcon} label="ចំនួនមិនបានចូលរួម" value={String(summary?.notJoinedActivityCount ?? 0)} growth="0" iconColor="text-error" iconBg="bg-error-bg" />
          <StatCard icon={FaHandHoldingDollar} label="ចំនួនវិភាគទាន" value={`$${Number(summary?.totalDonationUsd ?? 0).toFixed(2)}`} growth="0" iconColor="text-warning" iconBg="bg-warning-bg" />
        </div>
      )}

      <MemberInfoCard member={member} />

      {!isDetailPage && <MemberTabNav memberId={member.id} />}

      <div>{children}</div>
    </div>
  );
}
