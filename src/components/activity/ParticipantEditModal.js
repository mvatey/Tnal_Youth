"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, X } from "lucide-react";

import FilterBar from "@/components/tables/FilterBar";

const roles = ["ប្រធាន", "លេខាធិការ", "សមាជិក"];
const branches = ["ភ្នំពេញ", "កណ្ដាល"];

export default function ParticipationEditModal({
  open,
  participants = [],
  onClose,
  onSave,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");

  useEffect(() => {
    if (!open) return;

    const participatedIds = participants
      .filter((participant) => participant.isParticipated === true)
      .map((participant) => participant.id);

    setSelectedIds(participatedIds);
    setQuery("");
    setSelectedRole("all");
    setSelectedBranch("all");
  }, [open, participants]);

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return participants.filter((participant) => {
      const matchesSearch =
        !normalizedQuery ||
        participant.name?.toLowerCase().includes(normalizedQuery) ||
        participant.email?.toLowerCase().includes(normalizedQuery);

      const matchesRole =
        selectedRole === "all" ||
        participant.role === selectedRole;

      const matchesBranch =
        selectedBranch === "all" ||
        participant.branch === selectedBranch;

      return matchesSearch && matchesRole && matchesBranch;
    });
  }, [
    participants,
    query,
    selectedRole,
    selectedBranch,
  ]);

  const allFilteredSelected =
    filteredParticipants.length > 0 &&
    filteredParticipants.every((participant) =>
      selectedIds.includes(participant.id),
    );

  const toggleParticipant = (participantId) => {
    setSelectedIds((current) =>
      current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId],
    );
  };

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !filteredParticipants.some(
              (participant) => participant.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...filteredParticipants.map(
          (participant) => participant.id,
        ),
      ]),
    ]);
  };

  const handleSave = () => {
    const updatedParticipants = participants.map(
      (participant) => ({
        ...participant,
        isParticipated: selectedIds.includes(
          participant.id,
        ),
      }),
    );

    onSave(updatedParticipants);
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-secondary">
              កែប្រែការចូលរួម
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              ជ្រើសរើសសមាជិកដែលបានចូលរួមកម្មវិធីជាក់ស្តែង
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[250px] flex-1">
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="ស្វែងរកសមាជិក..."
              className="h-10 w-full rounded-lg border border-border bg-white pl-4 pr-10 text-sm outline-none focus:border-primary"
            />

            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
          </div>

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
            ]}
          />

          <span className="ml-auto whitespace-nowrap text-sm font-semibold text-text-primary">
            {selectedIds.length}/{participants.length} នាក់
          </span>
        </div>

        <div className="max-h-[430px] overflow-y-auto rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-xs text-text-secondary">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="h-11 border-b border-border">
                <th className="w-[5%] text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFiltered}
                  />
                </th>

                <th className="w-[28%] text-left">
                  ឈ្មោះអ្នកចូលរួម
                </th>

                <th className="w-[10%] text-center">
                  ភេទ
                </th>

                <th className="w-[15%] text-center">
                  តួនាទី
                </th>

                <th className="w-[17%] text-center">
                  សាខា
                </th>

                <th className="w-[25%] text-center">
                  ស្ថានភាពចូលរួម
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.map(
                (participant) => {
                  const isParticipated =
                    selectedIds.includes(
                      participant.id,
                    );

                  return (
                    <tr
                      key={participant.id}
                      className="h-14 border-b border-border"
                    >
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={isParticipated}
                          onChange={() =>
                            toggleParticipant(
                              participant.id,
                            )
                          }
                        />
                      </td>

                      <td>
                        <p className="font-semibold text-text-primary">
                          {participant.name || "-"}
                        </p>

                        <p className="text-xs text-text-secondary">
                          {participant.email || "-"}
                        </p>
                      </td>

                      <td className="text-center">
                        {participant.gender || "-"}
                      </td>

                      <td className="text-center">
                        {participant.role || "-"}
                      </td>

                      <td className="text-center">
                        {participant.branch || "-"}
                      </td>

                      <td className="text-center">
                        <span
                          className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium ${
                            isParticipated
                              ? "bg-success-bg text-success"
                              : "bg-error-bg text-error"
                          }`}
                        >
                          {isParticipated
                            ? "បានចូលរួម"
                            : "មិនបានចូលរួម"}
                        </span>
                      </td>
                    </tr>
                  );
                },
              )}

              {filteredParticipants.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-sm text-text-secondary"
                  >
                    មិនមានទិន្នន័យសមាជិកទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 min-w-[110px] items-center justify-center rounded-lg border border-border bg-white px-5 text-sm font-semibold text-text-secondary transition hover:bg-gray-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex h-10 min-w-[190px] items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <CheckCircle2 size={17} />
            រក្សាទុកការចូលរួម
          </button>
        </div>
      </div>
    </div>
  );
}