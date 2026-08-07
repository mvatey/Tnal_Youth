"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import Link from "next/link";

export default function MemberSelectModal({ onClose, onSave, initialSelected = [] }) {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(initialSelected.map(Number));
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      setIsLoading(true);
      setError("");
      try {
        const [membersResponse, branchesResponse] = await Promise.all([
          fetch("/api/members?page=0&size=100", { cache: "no-store" }),
          fetch("/api/lookups/branches", { cache: "no-store" }),
        ]);
        const failed = [membersResponse, branchesResponse].find((response) => !response.ok);
        if (failed) {
          const problem = await failed.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load members.");
        }
        const [firstPage, branches] = await Promise.all([
          membersResponse.json(),
          branchesResponse.json(),
        ]);
        const remainingPages = await Promise.all(
          Array.from(
            { length: Math.max(0, (firstPage.totalPages || 1) - 1) },
            (_, index) => index + 1,
          ).map(async (pageNumber) => {
            const response = await fetch(
              `/api/members?page=${pageNumber}&size=100`,
              { cache: "no-store" },
            );
            const json = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(json.message || `Unable to load member page ${pageNumber + 1}.`);
            }
            return json;
          }),
        );
        const allMembers = [
          ...(firstPage.content || []),
          ...remainingPages.flatMap((page) => page.content || []),
        ];
        const branchById = new Map(
          branches.map((branch) => [String(branch.value), branch.labelKm || branch.labelEn || branch.code]),
        );
        if (!cancelled) {
          setMembers(allMembers.map((member) => ({
            id: member.id,
            name: member.full_name_km || member.full_name_en || "-",
            email: member.email || "",
            gender: member.gender?.label_km || member.gender?.label_en || member.gender?.code || "-",
            branch: member.branch?.label_km || branchById.get(String(member.branch?.id)) || "-",
            joinedDate: member.joined_on
              ? new Date(`${member.joined_on}T00:00:00`).toLocaleDateString("km-KH")
              : "-",
          })));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load members.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return members;
    return members.filter((member) =>
      [member.name, member.email, member.branch]
        .some((value) => String(value || "").toLowerCase().includes(search)),
    );
  }, [members, query]);

  const allFilteredSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) => selected.includes(member.id));

  function toggle(memberId) {
    setSelected((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  function toggleAll() {
    if (allFilteredSelected) {
      const visibleIds = new Set(filteredMembers.map((member) => member.id));
      setSelected((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }
    setSelected((current) => [...new Set([...current, ...filteredMembers.map((member) => member.id)])]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5">
      <div className="w-full max-w-5xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ស្វែងរកសមាជិក..." className="h-10 w-full rounded-lg border border-border bg-white pl-4 pr-10 text-sm outline-none focus:border-primary" />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>
          <span className="whitespace-nowrap text-sm font-semibold text-text-primary">{selected.length}/{members.length} នាក់</span>
        </div>

        {error && <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="max-h-[430px] overflow-y-auto rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-[12px] text-text-secondary">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="h-11 border-b border-border font-medium">
                <th className="w-[6%] text-center"><input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} /></th>
                <th className="w-[30%] text-left">ឈ្មោះអ្នកចូលរួម</th>
                <th className="w-[13%] text-center">ភេទ</th>
                <th className="w-[18%] text-center">សាខា</th>
                <th className="w-[18%] text-center">ថ្ងៃចូលរួម</th>
                <th className="w-[10%] text-center">ស្ថានភាព</th>
                <th className="w-[5%] text-center">មើល</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const isSelected = selected.includes(member.id);
                return (
                  <tr key={member.id} className="h-12 border-b border-border">
                    <td className="text-center"><input type="checkbox" checked={isSelected} onChange={() => toggle(member.id)} /></td>
                    <td><p className="font-medium text-text-primary">{member.name}</p><p>{member.email || "-"}</p></td>
                    <td className="text-center">{member.gender}</td>
                    <td className="text-center">{member.branch}</td>
                    <td className="text-center">{member.joinedDate}</td>
                    <td className="text-center"><span className={`rounded-full px-2 py-1 ${isSelected ? "bg-success-bg text-success" : "bg-warning-bg text-warning"}`}>{isSelected ? "បានជ្រើស" : "មិនបានជ្រើស"}</span></td>
                    <td className="text-center"><Link href={`/member/memberInfo/${member.id}`}><Eye size={16} className="mx-auto text-primary" /></Link></td>
                  </tr>
                );
              })}
              {!isLoading && filteredMembers.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center">មិនមានសមាជិកទេ</td></tr>
              )}
              {isLoading && <tr><td colSpan={7} className="py-10 text-center">Loading members...</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-5 py-2 text-sm font-semibold">បោះបង់</button>
          <button type="button" onClick={() => { onSave?.(selected); onClose(); }} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white">រក្សាទុក ({selected.length})</button>
        </div>
      </div>
    </div>
  );
}
