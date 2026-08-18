"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Search,
} from "lucide-react";

import {
  HiSaveAs,
} from "react-icons/hi";

import FilterBar from "@/components/table-items/FilterBar";
import MemberPreviewModal from "@/components/activity/MemberPreviewModal";

function MemberAvatar({ member }) {
  return (
    <img
      src={
        member.profileImage ||
        "/profiles/default-avatar.jpg"
      }
      alt={member.name || "Member"}
      className="h-9 w-9 shrink-0 rounded-full object-cover"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src =
          "/profiles/default-avatar.jpg";
      }}
    />
  );
}

export default function MemberSelectModal({
  onClose,
  members = [],
  selectedIds = [],
  lockedIds = [],
  onSave,
  branchName = "",
  loading = false,
  error = "",
}) {
  /*
   * TEMPORARY frontend selection.
   *
   * Changing this state does NOT
   * save anything to backend.
   */
  const [selected, setSelected] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState("all");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(null);

  const [
    previewMember,
    setPreviewMember,
  ] = useState(null);

  const [saving, setSaving] =
    useState(false);

  /*
   * selectedIds = participants that
   * were already saved in backend
   * when this modal opened.
   */
  useEffect(() => {
    const initialSelected =
      Array.isArray(selectedIds)
        ? selectedIds
            .map(Number)
            .filter(Number.isFinite)
        : [];

    setSelected(initialSelected);
  }, [selectedIds]);

  /*
   * lockedIds = already persisted
   * participant IDs.
   *
   * They stay selected and cannot
   * be unchecked.
   */
  const lockedSet = useMemo(
    () =>
      new Set(
        (
          Array.isArray(lockedIds)
            ? lockedIds
            : []
        )
          .map(Number)
          .filter(Number.isFinite),
      ),
    [lockedIds],
  );

  const memberIdSet = useMemo(
    () =>
      new Set(
        members
          .map((member) =>
            Number(member.id),
          )
          .filter(Number.isFinite),
      ),
    [members],
  );

  /*
   * Counter follows the CURRENT
   * temporary checkbox state.
   *
   * Example:
   *
   * ☑ A
   * ☑ B
   *
   * -> 2/2 នាក់
   */
  const selectedCount =
    useMemo(
      () =>
        selected.filter((id) =>
          memberIdSet.has(
            Number(id),
          ),
        ).length,
      [
        selected,
        memberIdSet,
      ],
    );

  const totalMemberCount =
    members.length;

  const roles = useMemo(
    () => [
      ...new Set(
        members
          .map(
            (member) =>
              member.role,
          )
          .filter(
            (value) =>
              value &&
              value !== "-",
          ),
      ),
    ],
    [members],
  );

  const filteredMembers =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      const selectedDateValue =
        selectedDate instanceof Date
          ? selectedDate
              .toISOString()
              .slice(0, 10)
          : selectedDate || "";

      return members.filter(
        (member) => {
          const name =
            String(
              member.name || "",
            ).toLowerCase();

          const email =
            String(
              member.email || "",
            ).toLowerCase();

          const matchesSearch =
            !normalizedQuery ||
            name.includes(
              normalizedQuery,
            ) ||
            email.includes(
              normalizedQuery,
            );

          const matchesRole =
            selectedRole === "all" ||
            member.role ===
              selectedRole;

          const matchesDate =
            !selectedDateValue ||
            member.joinedDateValue ===
              selectedDateValue;

          return (
            matchesSearch &&
            matchesRole &&
            matchesDate
          );
        },
      );
    }, [
      members,
      query,
      selectedRole,
      selectedDate,
    ]);

  /*
   * Already saved participants
   * cannot be toggled.
   */
  const selectableFilteredMembers =
    useMemo(
      () =>
        filteredMembers.filter(
          (member) =>
            !lockedSet.has(
              Number(member.id),
            ),
        ),
      [
        filteredMembers,
        lockedSet,
      ],
    );

  const allFilteredSelected =
    selectableFilteredMembers.length >
      0 &&
    selectableFilteredMembers.every(
      (member) =>
        selected.includes(
          Number(member.id),
        ),
    );

  /*
   * TEMPORARY UI ONLY.
   *
   * There is NO fetch/API call here.
   */
  function toggle(id) {
    const memberId =
      Number(id);

    if (
      !Number.isFinite(memberId)
    ) {
      return;
    }

    /*
     * Already saved invitation:
     * cannot remove here.
     */
    if (
      lockedSet.has(memberId)
    ) {
      return;
    }

    setSelected((current) => {
      if (
        current.includes(
          memberId,
        )
      ) {
        return current.filter(
          (item) =>
            item !== memberId,
        );
      }

      return [
        ...current,
        memberId,
      ];
    });
  }

  /*
   * Header select-all also only
   * changes temporary UI state.
   */
  function toggleAll() {
    if (
      allFilteredSelected
    ) {
      const selectableIds =
        new Set(
          selectableFilteredMembers.map(
            (member) =>
              Number(member.id),
          ),
        );

      setSelected((current) =>
        current.filter(
          (id) =>
            lockedSet.has(
              Number(id),
            ) ||
            !selectableIds.has(
              Number(id),
            ),
        ),
      );

      return;
    }

    setSelected((current) => [
      ...new Set([
        ...current,

        ...selectableFilteredMembers.map(
          (member) =>
            Number(member.id),
        ),
      ]),
    ]);
  }

  /*
   * ONLY this function reaches
   * the parent save handler.
   *
   * Parent then POSTs to backend.
   */
async function handleSave() {
  try {
    setSaving(true);

    /*
     * Save selected members to parent/backend.
     */
    await onSave?.(selected);

    /*
     * Only close popup AFTER save succeeds.
     */
    onClose?.();
  } catch (error) {
    /*
     * If backend save fails,
     * keep popup open so user can see/fix it.
     */
    console.error(
      "Failed to save invited members:",
      error,
    );
  } finally {
    setSaving(false);
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5">
      <div className="w-full max-w-5xl rounded-xl bg-bg-page-white p-5 shadow-xl">

        {/* SEARCH + FILTERS */}
        <div className="mb-4 flex items-center gap-3">

          <div className="relative flex-1">
            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="ស្វែងរកសមាជិក..."
              className="h-10 w-full rounded-lg border border-border bg-bg-page-white pl-4 pr-10 text-sm text-text-primary outline-none"
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

                value:
                  selectedRole,

                onChange:
                  setSelectedRole,

                placeholder:
                  "តួនាទី",

                options:
                  roles,
              },

              {
                key: "date",

                value:
                  selectedDate,

                onChange:
                  setSelectedDate,

                placeholder:
                  "ថ្ងៃ/ខែ/ឆ្នាំ",

                type: "date",
              },
            ]}
          />

          {/*
           * Current temporary
           * selected / total.
           */}
          <span className="ml-auto whitespace-nowrap text-sm font-semibold text-text-primary">
            {selectedCount}/
            {totalMemberCount} នាក់
          </span>
        </div>

        {/* TABLE */}
        <div className="max-h-[430px] overflow-y-auto rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-[12px] text-text-secondary">

            <thead className="sticky top-0 z-10 bg-bg-page-white">
              <tr className="h-11 border-b border-border font-medium text-text-secondary">

                <th className="w-[4%] text-center">
                  <input
                    type="checkbox"
                    checked={
                      allFilteredSelected
                    }
                    onChange={
                      toggleAll
                    }
                  />
                </th>

                <th className="w-[24%] text-left">
                  ឈ្មោះអ្នកចូលរួម
                </th>

                <th className="w-[10%] text-center">
                  ភេទ
                </th>

                <th className="w-[13%] text-center">
                  តួនាទី
                </th>

                <th className="w-[15%] text-center">
                  សាខា
                </th>

                <th className="w-[16%] text-center">
                  ថ្ងៃ/ខែ/ឆ្នាំ
                </th>

                <th className="w-[13%] text-center">
                  ស្ថានភាព
                </th>

                <th className="w-[5%] text-center">
                  សកម្មភាព
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map(
                (member) => {
                  const memberId =
                    Number(
                      member.id,
                    );

                  /*
                   * Current temporary state.
                   *
                   * This controls:
                   *
                   * checkbox
                   * status badge
                   * counter
                   */
                  const isSelected =
                    selected.includes(
                      memberId,
                    );

                  /*
                   * Backend-persisted
                   * invitation.
                   *
                   * Only controls
                   * whether checkbox
                   * can be unchecked.
                   */
                  const alreadySaved =
                    lockedSet.has(
                      memberId,
                    );

                  return (
                    <tr
                      key={member.id}
                      className="h-12 border-b border-border text-text-secondary"
                    >

                      <td className="text-center">
                        <input
                          type="checkbox"

                          checked={
                            isSelected
                          }

                          disabled={
                            alreadySaved
                          }

                          onChange={() =>
                            toggle(
                              memberId,
                            )
                          }
                        />
                      </td>

                      <td>
                        <div className="flex items-center gap-2.5">

                          <MemberAvatar
                            member={
                              member
                            }
                          />

                          <div className="min-w-0">
                            <p className="truncate font-medium text-text-primary">
                              {
                                member.name
                              }
                            </p>

                            {member.email && (
                              <p className="truncate text-[12px] text-text-secondary">
                                {
                                  member.email
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="text-center">
                        {member.gender ||
                          "-"}
                      </td>

                      <td className="text-center">
                        {member.role ||
                          "-"}
                      </td>

                      <td className="text-center">
                        {member.branch ||
                          "-"}
                      </td>

                      <td className="text-center">
                        {member.joinedDate ||
                          "-"}
                      </td>

                      <td className="text-center">
                        {/*
                         * TEMPORARY selection
                         * immediately changes
                         * visible status.
                         */}
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] ${
                            isSelected
                              ? "bg-success-bg text-success"
                              : "bg-error-bg text-error"
                          }`}
                        >
                          {isSelected
                            ? "បានអញ្ជើញ"
                            : "មិនបានអញ្ជើញ"}
                        </span>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"

                          onClick={() =>
                            setPreviewMember(
                              member,
                            )
                          }

                          className="mx-auto flex w-fit rounded-md p-1 text-primary transition hover:bg-primary-light"
                        >
                          <Eye
                            size={16}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                },
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-sm text-text-secondary"
                  >
                    កំពុងទាញយកសមាជិក...
                  </td>
                </tr>
              )}

              {!loading &&
                error && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-error"
                    >
                      {error}
                    </td>
                  </tr>
                )}

              {!loading &&
                !error &&
                filteredMembers
                  .length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-text-secondary"
                    >
                      {branchName
                        ? `មិនមានសមាជិកនៅក្នុងសាខា ${branchName} ទេ`
                        : "មិនមានសមាជិកទេ"}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex items-center justify-between">

          {/*
           * Cancel:
           *
           * no onSave call
           * -> no backend change.
           */}
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-[34px] w-[91px] rounded-lg border border-border bg-bg-page-white text-sm font-semibold text-text-secondary disabled:opacity-60"
          >
            បោះបង់
          </button>

          {/*
           * SAVE:
           *
           * this is the only action
           * that sends selected IDs
           * to parent/backend.
           */}
          <button
            type="button"

            onClick={
              handleSave
            }

            disabled={
              saving
            }

            className="flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HiSaveAs
              size={16}
            />

            {saving
              ? "កំពុងរក្សាទុក..."
              : "រក្សាទុក"}
          </button>
        </div>
      </div>

      {previewMember && (
        <MemberPreviewModal
          member={
            previewMember
          }

          onClose={() =>
            setPreviewMember(
              null,
            )
          }
        />
      )}
    </div>
  );
}