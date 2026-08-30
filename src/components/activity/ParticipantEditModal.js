"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

import FilterBar from "@/components/tables/FilterBar";
import { useLanguage } from "@/context/LanguageContext";

export default function ParticipationEditModal({
  open,
  participants = [],
  onClose,
  onSave,
}) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!open) return;

    const participatedIds = participants
      .filter((participant) => participant.isParticipated === true)
      .map((participant) => participant.id);

    setSelectedIds(participatedIds);
    setQuery("");
    setSelectedRole("all");
    setSelectedBranch("all");
    setSaveError("");
  }, [open, participants]);

  const roles = useMemo(
    () => [...new Set(participants.map((item) => item.role).filter((value) => value && value !== "-"))],
    [participants],
  );
  const branches = useMemo(
    () => [...new Set(participants.map((item) => item.branch).filter((value) => value && value !== "-"))],
    [participants],
  );

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

  const handleSave = async () => {
    const updatedParticipants = participants.map(
      (participant) => ({
        ...participant,
        isParticipated: selectedIds.includes(
          participant.id,
        ),
      }),
    );

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(updatedParticipants);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : t("activityPage.genericError"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-5xl rounded-2xl bg-bg-page-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-secondary">
              {t("activityPage.editParticipation")}
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              {t("activityPage.selectActualParticipants")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-page-gray"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative w-full min-w-0 flex-1 lg:min-w-[250px]">
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder={t("activityPage.memberSearchPlaceholder")}
              className="h-10 w-full rounded-lg border border-border bg-bg-page-white pl-4 pr-10 text-sm outline-none focus:border-primary"
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
                placeholder: t("memberPage.role"),
                options: roles,
              },
              {
                key: "branch",
                value: selectedBranch,
                onChange: setSelectedBranch,
                placeholder: t("memberPage.branch"),
                options: branches,
              },
            ]}
          />

          <span className="whitespace-nowrap text-sm font-semibold text-text-primary lg:ml-auto">
            {selectedIds.length}/{participants.length} {t("activityPage.memberUnit")}
          </span>
        </div>

        <div className="max-h-[430px] overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[760px] table-fixed border-collapse text-xs text-text-secondary">
            <thead className="sticky top-0 z-10 bg-bg-page-white">
              <tr className="h-11 border-b border-border">
                <th className="w-[5%] text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFiltered}
                  />
                </th>

                <th className="w-[28%] text-left">
                  {t("activityPage.participantName")}
                </th>

                <th className="w-[10%] text-center">
                  {t("memberPage.gender")}
                </th>

                <th className="w-[15%] text-center">
                  {t("memberPage.role")}
                </th>

                <th className="w-[17%] text-center">
                  {t("memberPage.branch")}
                </th>

                <th className="w-[25%] text-center">
                  {t("activityPage.participationStatus")}
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
                            ? t("activityPage.participated")
                            : t("activityPage.notParticipated")}
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
                    {t("activityPage.noMemberData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {saveError && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
            {saveError}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-full items-center justify-center rounded-lg border border-border bg-bg-page-white px-5 text-sm font-semibold text-text-secondary transition hover:bg-bg-page-gray sm:min-w-[110px] sm:w-auto"
          >
            {t("memberPage.cancel")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition hover:opacity-90 sm:min-w-[190px] sm:w-auto"
          >
            <HiSaveAs size={17} />
            {isSaving ? t("common.saving") : t("activityPage.saveParticipation")}
          </button>
        </div>
      </div>
    </div>
  );
}
