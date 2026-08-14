"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";
import FilterBar from "@/components/table-items/FilterBar";
import MemberPreviewModal from "@/components/activity/MemberPreviewModal";

function MemberAvatar({ member }) {
  return (
    <img
      src={member.profileImage || "/profiles/default-avatar.jpg"}
      alt={member.name || "Member"}
      className="h-9 w-9 shrink-0 rounded-full object-cover"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = "/profiles/default-avatar.jpg";
      }}
    />
  );
}

export default function MemberSelectModal({
  onClose,
  members = [],
  selectedIds = [],
  onSave,
  branchName = "",
  loading = false,
  error = "",
}) {
  const [selected, setSelected] = useState(selectedIds);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [previewMember, setPreviewMember] = useState(null);
  const [saving, setSaving] = useState(false);

  const roles = useMemo(
    () => [...new Set(members.map((member) => member.role).filter(Boolean))],
    [members],
  );

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedDateValue = selectedDate ? selectedDate.toISOString().split("T")[0] : "";

    return members.filter((member) => {
      const matchesSearch = !q || member.name?.toLowerCase().includes(q) || member.email?.toLowerCase().includes(q);
      const matchesRole = selectedRole === "all" || member.role === selectedRole;
      const matchesDate = !selectedDate || member.joinedDateValue === selectedDateValue;

      return matchesSearch && matchesRole && matchesDate;
    });
  }, [query, selectedRole, selectedDate]);

  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every((member) => selected.includes(member.id));

  const toggle = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((current) => current.filter((id) => !filteredMembers.some((member) => member.id === id)));
    } else {
      setSelected((current) => [...new Set([...current, ...filteredMembers.map((member) => member.id)])]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave?.(selected);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5">
      <div className="w-full max-w-5xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={query ? "" : "ស្វែងរកសមាជិក..."} className="h-10 w-full rounded-lg border border-border bg-white pl-4 pr-10 text-sm outline-none" />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>

          <FilterBar filters={[{ key: "role", value: selectedRole, onChange: setSelectedRole, placeholder: "តួនាទី", options: roles }, { key: "date", value: selectedDate, onChange: setSelectedDate, placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ", type: "date" }]} />

          <span className="ml-auto whitespace-nowrap text-sm font-semibold text-text-primary">{selected.length}/{members.length} នាក់</span>
        </div>

        <div className="max-h-[430px] overflow-y-auto rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-[12px] text-text-secondary">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="h-11 border-b border-border font-medium text-text-secondary">
                <th className="w-[4%] text-center">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} />
                </th>
                <th className="w-[24%] text-left">ឈ្មោះអ្នកចូលរួម</th>
                <th className="w-[10%] text-center">ភេទ</th>
                <th className="w-[13%] text-center">តួនាទី</th>
                <th className="w-[15%] text-center">សាខា</th>
                <th className="w-[16%] text-center">ថ្ងៃ/ខែ/ឆ្នាំ</th>
                <th className="w-[13%] text-center">ស្ថានភាព</th>
                <th className="w-[5%] text-center">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => {
                const isSelected = selected.includes(member.id);

                return (
                  <tr key={member.id} className="h-12 border-b border-border text-text-secondary">
                    <td className="text-center">
                      <input type="checkbox" checked={isSelected} onChange={() => toggle(member.id)} />
                    </td>

                    <td>
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar member={member} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-text-primary">{member.name}</p>
                          {member.email ? (
                            <p className="truncate text-[12px] text-text-secondary">{member.email}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="text-center">{member.gender}</td>
                    <td className="text-center">{member.role}</td>
                    <td className="text-center">{member.branch}</td>
                    <td className="text-center">{member.joinedDate}</td>

                    <td className="text-center">
                      <span className={`rounded-full px-3 py-1 text-[11px] ${isSelected ? "bg-success-bg text-success" : "bg-warning-bg text-warning"}`}>
                        {isSelected ? "បានអញ្ជើញ" : "មិនបានអញ្ជើញ"}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => setPreviewMember(member)}
                        aria-label={`មើលព័ត៌មាន ${member.name || "សមាជិក"}`}
                        className="mx-auto flex w-fit rounded-md p-1 text-primary transition hover:bg-primary-light"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {loading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-text-secondary">
                    កំពុងទាញយកសមាជិក...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-danger">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-text-secondary">
                    {branchName
                      ? `មិនមានសមាជិកនៅក្នុងសាខា ${branchName} ទេ`
                      : "សូមជ្រើសរើសសាខាជាមុនសិន"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={onClose} className="h-[34px] w-[91px] rounded-lg border border-border bg-white text-sm font-semibold text-text-secondary">បោះបង់</button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HiSaveAs size={16} />
            {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </button>
        </div>
      </div>

      {previewMember && (
        <MemberPreviewModal
          member={previewMember}
          onClose={() => setPreviewMember(null)}
        />
      )}
    </div>
  );
}
