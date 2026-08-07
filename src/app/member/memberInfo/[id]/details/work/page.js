"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiAddCircleLine } from "react-icons/ri";
import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";

function createEmptyWork() {
  return {
    id: `new-${crypto.randomUUID()}`,
    company: "",
    address: "",
    position: "",
    employmentSectorId: "",
    startDate: "",
    endDate: "",
  };
}

export default function WorkPage() {
  const params = useParams();
  const memberId = String(params?.id ?? "");
  const [works, setWorks] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWorks() {
      setIsLoading(true);
      setError("");
      try {
        const [response, sectorsResponse] = await Promise.all([
          fetch(`/api/backend/members/${encodeURIComponent(memberId)}/work-history`, { cache: "no-store" }),
          fetch("/api/lookups/employment-sectors", { cache: "no-store" }),
        ]);
        const failed = [response, sectorsResponse].find((item) => !item.ok);
        if (failed) {
          const problem = await failed.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load work history.");
        }
        const [records, sectors] = await Promise.all([response.json(), sectorsResponse.json()]);
        if (!cancelled) {
          setWorks(records.length ? records.map((record) => ({
            id: record.id,
            company: record.organization_name || "",
            address: record.address || "",
            position: record.position_title || "",
            employmentSectorId: record.employment_sector_id || "",
            startDate: record.start_date || "",
            endDate: record.end_date || "",
          })) : [createEmptyWork()]);
          setSectorOptions(sectors.map((sector) => ({
            value: String(sector.value),
            label: sector.labelKm || sector.labelEn || sector.code,
          })));
          setDeletedIds([]);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load work history.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWorks();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  function handleWorkChange(id, field, value) {
    setWorks((previousWorks) => previousWorks.map((work) => work.id === id ? { ...work, [field]: value } : work));
  }

  function addWork() {
    setWorks((previousWorks) => [...previousWorks, createEmptyWork()]);
  }

  function removeWork(id) {
    if (typeof id === "number") setDeletedIds((previous) => [...previous, id]);
    setWorks((previousWorks) => previousWorks.filter((work) => work.id !== id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const baseUrl = `/api/backend/members/${encodeURIComponent(memberId)}/work-history`;
      await Promise.all(deletedIds.map(async (workId) => {
        const response = await fetch(`${baseUrl}/${workId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Unable to delete a work-history record.");
      }));

      const saved = await Promise.all(works.filter((work) => work.company.trim() || work.position.trim()).map(async (work) => {
        const existing = typeof work.id === "number";
        const response = await fetch(existing ? `${baseUrl}/${work.id}` : baseUrl, {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_name: work.company.trim(),
            position_title: work.position.trim(),
            address: work.address.trim() || null,
            employment_sector_id: work.employmentSectorId ? Number(work.employmentSectorId) : null,
            start_date: work.startDate || null,
            end_date: work.endDate || null,
          }),
        });
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to save work history.");
        }
        const record = await response.json();
        return {
          id: record.id,
          company: record.organization_name || "",
          address: record.address || "",
          position: record.position_title || "",
          employmentSectorId: record.employment_sector_id || "",
          startDate: record.start_date || "",
          endDate: record.end_date || "",
        };
      }));

      setWorks(saved.length ? saved : [createEmptyWork()]);
      setDeletedIds([]);
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "Unable to save work history.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading work history...</div>;
  }

  if (error && works.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">ប្រវត្តិការងារ</h2>

        <div className="mt-6 space-y-6">
          {works.map((work, index) => (
            <div key={work.id} className="rounded-xl border border-gray-300 p-6">
              <h3 className="mb-5 text-sm font-semibold text-text-primary">ប្រវត្តិការងារ ទី {index + 1}</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <BoxFill label="ឈ្មោះ ស្ថាប័ន" placeholder="បញ្ចូលឈ្មោះស្ថាប័ន" value={work.company} onChange={(event) => handleWorkChange(work.id, "company", event.target.value)} />

                <BoxFill label="អាស័យដ្ឋាន" placeholder="បញ្ចូលអាស័យដ្ឋាន" value={work.address} onChange={(event) => handleWorkChange(work.id, "address", event.target.value)} />

                <BoxFill label="តួនាទី" placeholder="បញ្ចូលតួនាទី" value={work.position} onChange={(event) => handleWorkChange(work.id, "position", event.target.value)} />

                <FormSelect label="វិស័យការងារ" placeholder="ជ្រើសរើសវិស័យការងារ" value={String(work.employmentSectorId || "")} onChange={(event) => handleWorkChange(work.id, "employmentSectorId", event.target.value)} options={sectorOptions} />

                <FormDate label="ថ្ងៃខែចាប់ផ្ដើម" name={`startDate-${work.id}`} value={work.startDate} onChange={(event) => handleWorkChange(work.id, "startDate", event.target.value)} />

                <FormDate label="ថ្ងៃខែបញ្ចប់" name={`endDate-${work.id}`} value={work.endDate} onChange={(event) => handleWorkChange(work.id, "endDate", event.target.value)} />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton canDelete onClick={() => removeWork(work.id)} />
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button type="button" onClick={addWork} className="flex items-center gap-2 rounded-lg bg-success px-6 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <RiAddCircleLine size={18} />
              បន្ថែម
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {error && <p className="mr-4 self-center text-sm text-red-600">{error}</p>}
        <SaveButton type="submit" disabled={isSaving} />
      </div>
    </form>
  );
}
