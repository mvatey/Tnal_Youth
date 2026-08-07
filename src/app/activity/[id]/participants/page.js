"use client";

import { use, useEffect, useMemo, useState } from "react";
import { ChevronRight, Eye, Pencil } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import Link from "next/link";

import SearchBar from "@/components/tables/SearchBar";
import FilterBar from "@/components/tables/FilterBar";
import Button from "@/components/tables/Button";
import Table from "@/components/tables/GenericTable";
import ParticipantStats, { ParticipantStatusBadge as StatusBadge } from "@/components/activity/ParticipantStats";
import ParticipationEditModal from "@/components/activity/ParticipantEditModal";

const roles = ["ប្រធាន", "លេខាធិការ", "សមាជិក"];

function normalizeParticipant(participant) {
  const isParticipated =
    participant.isParticipated ??
    participant.is_participated ??
    participant.status === "បានចូលរួម";

  const isInvited =
    participant.isInvited ??
    participant.is_invited ??
    true;

  return {
    ...participant,
    isInvited,
    isParticipated,
  };
}

function isCompletedActivity(activity) {
  const status = String(
    activity?.statusCode ??
    activity?.status?.code ??
    activity?.status ??
    "",
  ).toUpperCase();

  return status === "COMPLETED" || status === "បានបញ្ចប់";
}

export default function ActivityParticipantsPage({ params }) {
  const { id } = use(params);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [activityParticipants, setActivityParticipants] = useState([]);
  const [activity, setActivity] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadParticipants() {
      setIsLoading(true);
      setError("");
      try {
        const responses = await Promise.all([
          fetch(`/api/backend/activities/${encodeURIComponent(id)}`, { cache: "no-store" }),
          fetch(`/api/backend/activities/${encodeURIComponent(id)}/attendance`, { cache: "no-store" }),
          fetch("/api/lookups/branches", { cache: "no-store" }),
        ]);
        const failed = responses.find((response) => !response.ok);
        if (failed) {
          const problem = await failed.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load participants.");
        }
        const [activityData, attendancePage, branchData] = await Promise.all(
          responses.map((response) => response.json()),
        );
        const branchById = new Map(
          branchData.map((branch) => [String(branch.value), branch.labelKm || branch.labelEn || branch.code]),
        );
        if (!cancelled) {
          setActivity({
            ...activityData,
            name: activityData.titleKm || activityData.titleEn || "-",
          });
          setActivityParticipants((attendancePage.attendance || []).map((participant) => normalizeParticipant({
            id: participant.participant_id,
            memberId: participant.member_id,
            name: participant.full_name_km || participant.full_name_en || "-",
            email: participant.email || "",
            gender: "-",
            role: "-",
            branch: branchById.get(String(participant.branch_id)) || "-",
            joinedDate: participant.registered_at
              ? new Date(participant.registered_at).toLocaleDateString("km-KH")
              : "-",
            joinedDateValue: participant.registered_at?.slice(0, 10) || "",
            attendanceStatus: participant.attendance_status,
            isParticipated: participant.attendance_status === "PRESENT",
          })));
          setBranches(branchData.map((branch) => branch.labelKm || branch.labelEn || branch.code));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load participants.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadParticipants();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const completed = isCompletedActivity(activity);

  const filteredParticipants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activityParticipants.filter((participant) => {
      const name = participant.name?.toLowerCase() ?? "";
      const email = participant.email?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query);

      const matchesRole =
        selectedRole === "all" ||
        participant.role === selectedRole;

      const matchesBranch =
        selectedBranch === "all" ||
        participant.branch === selectedBranch;

      const matchesDate =
        !selectedDate ||
        participant.joinedDate === selectedDate ||
        participant.joinedDateValue === selectedDate;

      return matchesSearch && matchesRole && matchesBranch && matchesDate;
    });
  }, [
    activityParticipants,
    searchQuery,
    selectedRole,
    selectedBranch,
    selectedDate,
  ]);

  const participantStats = useMemo(() => {
    const attended = activityParticipants.filter((participant) => participant.isParticipated === true).length;
    const absent = activityParticipants.filter((participant) => participant.isParticipated !== true).length;

    return {
      total: activityParticipants.length,
      attended,
      absent,
    };
  }, [activityParticipants]);

  const columns = useMemo(
    () => [
      {
        key: "no",
        label: "ល.រ",
        width: "5%",
        align: "center",
        render: (_row, index) => index + 1,
      },
      {
        key: "name",
        label: "ឈ្មោះអ្នកចូលរួម",
        width: "20%",
        truncate: true,
        cellClassName: "font-medium text-text-primary",
        render: (row) => (
          <div>
            <p className="font-semibold text-text-primary">{row.name || "-"}</p>
            <p className="text-xs text-text-secondary">{row.email || "-"}</p>
          </div>
        ),
      },
      {
        key: "gender",
        label: "ភេទ",
        width: "10%",
        align: "center",
        render: (row) => row.gender || "-",
      },
      {
        key: "role",
        label: "តួនាទី",
        width: "13%",
        align: "center",
        render: (row) => row.role || "-",
      },
      {
        key: "branch",
        label: "សាខា",
        width: "14%",
        align: "center",
        render: (row) => row.branch || "-",
      },
      {
        key: "joinedDate",
        label: "ថ្ងៃ/ខែ/ឆ្នាំ ចូលរួម",
        width: "17%",
        align: "center",
        render: (row) => row.joinedDate || "-",
      },
      {
        key: "isParticipated",
        label: "ស្ថានភាពចូលរួម",
        width: "14%",
        align: "center",
        render: (row) => (
          <StatusBadge status={row.isParticipated ? "បានចូលរួម" : "មិនបានចូលរួម"} />
        ),
      },
      {
        key: "actions",
        label: "សកម្មភាព",
        width: "7%",
        align: "center",
        render: (row) => (
          <Link
            href={`/member/memberInfo/${row.memberId || row.id}/documents`}
            aria-label={`មើល ${row.name || "សមាជិក"}`}
            className="mx-auto flex w-fit rounded-md p-1 text-primary transition hover:bg-primary-light"
          >
            <Eye size={17} />
          </Link>
        ),
      },
    ],
    [],
  );

  const handleSaveParticipation = async (updatedParticipants) => {
    setError("");
    try {
      const saved = await Promise.all(updatedParticipants.map(async (participant) => {
        const response = await fetch(
          `/api/backend/activities/${encodeURIComponent(id)}/attendance/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              member_id: Number(participant.memberId),
              attendance_status: participant.isParticipated ? "PRESENT" : "ABSENT",
            }),
          },
        );
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to update attendance.");
        }
        await response.json();
        return participant;
      }));
      setActivityParticipants(saved);
      setIsEditOpen(false);
    } catch (saveError) {
      setError(saveError.message || "Unable to update attendance.");
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-text-secondary">Loading participants...</div>;
  }

  if (!activity) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center text-text-secondary">
        មិនអាចរកឃើញកម្មវិធីនេះទេ
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mb-1">
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Link href="/activity" className="hover:text-primary">
            កម្មវិធី
          </Link>

          <ChevronRight size={14} />

          <Link href={`/activity/${activity.id}`} className="hover:text-primary">
            ព័ត៌មានលម្អិត
          </Link>

          <ChevronRight size={14} />

          <span className="font-semibold text-primary">
            សមាសភាពចូលរួម
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">
          {activity.name || activity.titleKm || activity.title || "-"}
        </h1>
      </div>

      <ParticipantStats
        total={participantStats.total}
        attended={participantStats.attended}
        absent={participantStats.absent}
      />

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ស្វែងរកសមាជិក..."
            width="w-[300px]"
          />

          <FilterBar
            filters={[
              {
                key: "role",
                value: selectedRole,
                onChange: setSelectedRole,
                placeholder: "តួនាទី",
                options: roles,
              },
              {
                key: "branch",
                value: selectedBranch,
                onChange: setSelectedBranch,
                placeholder: "សាខា",
                options: branches,
              },
              {
                key: "date",
                value: selectedDate,
                onChange: setSelectedDate,
                placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ",
                type: "date",
              },
            ]}
          />

          <div className="ml-auto flex items-center gap-3">
            {completed && (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-success px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Pencil size={16} />
                កែប្រែការចូលរួម
              </button>
            )}

            <Button icon={RiDownloadCloud2Line}>
              ទាញយករបាយការណ៍
            </Button>
          </div>
        </div>

        {!completed && (
          <div className="mb-4 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
            អាចកែប្រែស្ថានភាពចូលរួមបាន បន្ទាប់ពីកម្មវិធីបានបញ្ចប់។
          </div>
        )}

        <Table
          columns={columns}
          data={filteredParticipants}
          rowsPerPage={10}
          emptyMessage="មិនមានសមាជិកចូលរួមទេ"
        />
      </div>

      <ParticipationEditModal
        open={isEditOpen}
        participants={activityParticipants}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveParticipation}
      />
    </div>
  );
}
