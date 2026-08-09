"use client";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  use,
  useEffect,
  useState,
} from "react";

import {
  CircleDollarSign,
  CreditCard,
  HandCoins,
  InfoIcon,
  Users,
} from "lucide-react";

import { FaHandHoldingDollar } from "react-icons/fa6";
import { HiCash } from "react-icons/hi";

import MemberInfoCard from "@/components/card/memberInfoCard";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberTabNav from "@/components/navigation/MemberTabNav";
import StatCard from "@/components/dashboard/statCard";

async function fetchJson(
  path,
  signal,
) {
  const response = await fetch(
    `/api${path}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    },
  );

  const text =
    await response.text();

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
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

export default function MemberInfoLayout({
  children,
  params,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { id } = use(params);

  const [
    member,
    setMember,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

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

  useEffect(() => {
    if (!id) {
      setMember(null);
      setLoading(false);

      return undefined;
    }

    const controller =
      new AbortController();

    async function loadMember() {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchJson(
            `/members/${id}`,
            controller.signal,
          );

        console.log(
          "Member info response:",
          data,
        );

        setMember(
          data?.member || data,
        );
      } catch (fetchError) {
        if (
          fetchError.name !==
          "AbortError"
        ) {
          console.error(
            "Cannot load member:",
            fetchError,
          );

          setMember(null);

          setError(
            fetchError.message ||
              "មិនអាចទាញយកព័ត៌មានសមាជិកបានទេ",
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadMember();

    return () => {
      controller.abort();
    };
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          កំពុងទាញយកព័ត៌មានសមាជិក...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-error">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        រកមិនឃើញព័ត៌មានសមាជិក
      </div>
    );
  }

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

      {/* Leave summary cards static for now */}

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

      {/* Now receives real API member */}

      <MemberInfoCard
        member={member}
        profileUploadEndpoint={
          `/api/backend/members/${member.id}/profile-photo`
        }
      />

      {!isDetailPage && (
        <MemberTabNav
          memberId={member.id}
        />
      )}

      <div>
        {children}
      </div>
    </div>
  );
}
