"use client";

import { use, useMemo, useState } from "react";
import {
  ChevronRight,
  Eye,
} from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import Link from "next/link";

import activities from "@/data/activityRecords.json";
import participants from "@/data/participantRecords.json";

import SearchBar from "@/components/tables/SearchBar";
import FilterBar from "@/components/tables/FilterBar";
import Button from "@/components/tables/Button";
import Table from "@/components/tables/GenericTable";
import ParticipantStats, {
  ParticipantStatusBadge as StatusBadge,
} from "@/components/activity/ParticipantStats";

const roles = ["ប្រធាន", "លេខាធិការ", "សមាជិក"];
const branches = ["ភ្នំពេញ", "កណ្ដាល"];

export default function ActivityParticipantsPage({
  params,
}) {
  const { id } = use(params);

  const [searchQuery, setSearchQuery] =
    useState("");
  const [selectedRole, setSelectedRole] =
    useState("all");
  const [selectedBranch, setSelectedBranch] =
    useState("all");
  const [selectedDate, setSelectedDate] =
    useState(null);

  const activity = useMemo(() => {
    return activities.find(
      (item) => String(item.id) === String(id)
    );
  }, [id]);

  const activityParticipants = useMemo(() => {
    return participants.filter(
      (participant) =>
        String(participant.activityId) === String(id)
    );
  }, [id]);

  const filteredParticipants = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return activityParticipants.filter(
      (participant) => {
        const name =
          participant.name?.toLowerCase() ?? "";

        const email =
          participant.email?.toLowerCase() ?? "";

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
          participant.joinedDate === selectedDate;

        return (
          matchesSearch &&
          matchesRole &&
          matchesBranch &&
          matchesDate
        );
      }
    );
  }, [
    activityParticipants,
    searchQuery,
    selectedRole,
    selectedBranch,
    selectedDate,
  ]);

  const participantStats = useMemo(() => {
    const attended =
      activityParticipants.filter(
        (participant) =>
          participant.status === "បានចូលរួម"
      ).length;

    const absent =
      activityParticipants.filter(
        (participant) =>
          participant.status ===
          "មិនបានចូលរួម"
      ).length;

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
        cellClassName:
          "font-medium text-text-primary",
        render: (row) => (
          <div>
            <p className="font-semibold text-text-primary">
              {row.name}
            </p>

            <p className="text-xs text-text-secondary">
              {row.email}
            </p>
          </div>
        ),
      },
      {
        key: "gender",
        label: "ភេទ",
        width: "10%",
        align: "center",
      },
      {
        key: "role",
        label: "តួនាទី",
        width: "13%",
        align: "center",
      },
      {
        key: "branch",
        label: "សាខា",
        width: "14%",
        align: "center",
      },
      {
        key: "joinedDate",
        label: "ថ្ងៃ/ខែ/ឆ្នាំ ចូលរួម",
        width: "17%",
        align: "center",
      },
      {
        key: "status",
        label: "ស្ថានភាពចូលរួម",
        width: "14%",
        align: "center",
        render: (row) => (
          <StatusBadge status={row.status} />
        ),
      },
      {
        key: "actions",
        label: "សកម្មភាព",
        width: "7%",
        align: "center",
        render: (row) => (
          <button
            type="button"
            aria-label={`មើល ${row.name}`}
            className="mx-auto flex rounded-md p-1 text-primary transition hover:bg-primary-light"
          >
            <Eye size={17} />
          </button>
        ),
      },
    ],
    []
  );

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
          <Link
            href="/activity"
            className="hover:text-primary"
          >
            កម្មវិធី
          </Link>

          <ChevronRight size={14} />

          <Link
            href={`/activity/${activity.id}`}
            className="hover:text-primary"
          >
            ព័ត៌មានលម្អិត
          </Link>

          <ChevronRight size={14} />

          <span className="font-semibold text-primary">
            សមាសភាពចូលរួម
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">
          {activity.name}
        </h1>
      </div>

      <ParticipantStats
        total={participantStats.total}
        attended={participantStats.attended}
        absent={participantStats.absent}
      />

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

          <div className="ml-auto">
            <Button
              icon={RiDownloadCloud2Line}
            >
              ទាញយករបាយការណ៍
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredParticipants}
          rowsPerPage={10}
          emptyMessage="មិនមានសមាជិកចូលរួមទេ"
        />
      </div>
    </div>
  );
}
