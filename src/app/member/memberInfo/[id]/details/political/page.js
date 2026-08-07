"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiAddCircleLine } from "react-icons/ri";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import DeleteButton from "@/components/forms/DeleteButton";

function createEmptyPolitical() {
  return {
    id: `new-${crypto.randomUUID()}`,
    organization: "",
    location: "",
    position: "",
    joinedDate: "",
    leftDate: "",
  };
}

export default function PoliticalPage() {
  const params = useParams();
  const memberId = String(params?.id ?? "");

  const [politicals, setPoliticals] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPoliticals() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/backend/members/${encodeURIComponent(memberId)}/political-affiliations`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load political affiliations.");
        }
        const records = await response.json();
        if (!cancelled) {
          setPoliticals(records.length ? records.map((record) => ({
            id: record.id,
            organization: record.affiliationName || "",
            location: record.location || "",
            position: record.positionTitle || "",
            joinedDate: record.startDate || "",
            leftDate: record.endDate || "",
          })) : [createEmptyPolitical()]);
          setDeletedIds([]);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load political affiliations.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPoliticals();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  function handlePoliticalChange(id, field, value) {
    setPoliticals((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addPolitical() {
    setPoliticals((previous) => [...previous, createEmptyPolitical()]);
  }

  function removePolitical(id) {
    if (typeof id === "number") setDeletedIds((previous) => [...previous, id]);
    setPoliticals((previous) => previous.filter((item) => item.id !== id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const baseUrl = `/api/backend/members/${encodeURIComponent(memberId)}/political-affiliations`;
      await Promise.all(deletedIds.map(async (recordId) => {
        const response = await fetch(`${baseUrl}/${recordId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Unable to delete a political affiliation.");
      }));

      const saved = await Promise.all(politicals.filter((item) => item.organization.trim()).map(async (item) => {
        const existing = typeof item.id === "number";
        const response = await fetch(existing ? `${baseUrl}/${item.id}` : baseUrl, {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affiliation_name: item.organization.trim(),
            position_title: item.position.trim() || null,
            location: item.location.trim() || null,
            start_date: item.joinedDate || null,
            end_date: item.leftDate || null,
          }),
        });
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to save political affiliations.");
        }
        const record = await response.json();
        return {
          id: record.id,
          organization: record.affiliationName || "",
          location: record.location || "",
          position: record.positionTitle || "",
          joinedDate: record.startDate || "",
          leftDate: record.endDate || "",
        };
      }));

      setPoliticals(saved.length ? saved : [createEmptyPolitical()]);
      setDeletedIds([]);
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "Unable to save political affiliations.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading political affiliations...</div>;
  }

  if (error && politicals.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">កិច្ចការនយោបាយ</h2>

        <div className="mt-5 space-y-5">
          {politicals.map((item, index) => (
            <PoliticalGroup
              key={item.id}
              index={index}
              item={item}
              canDelete
              onChange={(field, value) =>
                handlePoliticalChange(item.id, field, value)
              }
              onDelete={() => removePolitical(item.id)}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addPolitical}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {error && <p className="mr-4 self-center text-sm text-red-600">{error}</p>}
        <SaveButton type="submit" disabled={isSaving} />
      </div>
    </form>
  );
}

function PoliticalGroup({ index, item, canDelete, onChange, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        កិច្ចការនយោបាយ ទី {index + 1}
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <BoxFill
          label="ឈ្មោះ ស្ថាប័ន"
          placeholder="បញ្ចូលឈ្មោះស្ថាប័ន"
          value={item.organization ?? ""}
          onChange={(event) => onChange("organization", event.target.value)}
        />

        <BoxFill
          label="ទីកន្លែងបំពេញការងារ"
          placeholder="បញ្ចូលទីកន្លែងបំពេញការងារ"
          value={item.location ?? ""}
          onChange={(event) => onChange("location", event.target.value)}
        />

        <BoxFill
          label="តួនាទី"
          placeholder="បញ្ចូលឈ្មោះតួនាទី"
          value={item.position ?? ""}
          onChange={(event) => onChange("position", event.target.value)}
        />

        <FormDate
          label="ថ្ងៃខែឆ្នាំ ចាប់ផ្ដើម"
          name={`joinedDate-${item.id}`}
          value={item.joinedDate ?? ""}
          onChange={(event) => onChange("joinedDate", event.target.value)}
        />

        <FormDate
          label="ថ្ងៃខែឆ្នាំ បញ្ចប់"
          name={`leftDate-${item.id}`}
          value={item.leftDate ?? ""}
          onChange={(event) => onChange("leftDate", event.target.value)}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <DeleteButton canDelete={canDelete} onClick={onDelete} />
      </div>
    </div>
  );
}
