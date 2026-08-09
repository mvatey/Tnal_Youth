"use client";

import { useEffect, useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import useCurrentMember from "@/hooks/useCurrentMember";

import SaveButton from "@/components/forms/SaveButton";
import DeleteButton from "@/components/forms/DeleteButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import FormSelect from "@/components/forms/FormSelect";
import {
  fetchMyAccountCollection,
  saveMyAccountCollection,
} from "@/lib/myAccountCollections";

function createEmptyWork() {
  return {
    id: `work-${Date.now()}-${Math.random()}`,
    company: "",
    address: "",
    position: "",
    appointment: "",
    startDate: "",
    endDate: "",
  };
}

export default function MyAccountWorkPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [works, setWorks] = useState([]);
  const [originalWorks, setOriginalWorks] = useState([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!member) {
      setWorks([]);
      return;
    }

    let active = true;
    fetchMyAccountCollection("work-history")
      .then((rows) => {
        if (!active) return;
        setOriginalWorks(rows);
        setWorks(rows.length ? rows.map((row) => ({
          id: row.id,
          company: row.organization_name || "",
          address: row.address || "",
          position: row.position_title || "",
          appointment: "",
          startDate: row.start_date || "",
          endDate: row.end_date || "",
        })) : [createEmptyWork()]);
      })
      .catch((requestError) => setSaveError(requestError.message));
    return () => { active = false; };
  }, [member]);

  const updateWork = (id, field, value) => {
    setWorks((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  // The V1 fields call this name; keep them connected to the same state updater.
  const handleWorkChange = updateWork;

  const removeWork = (id) => {
    setWorks((previous) =>
      previous.length === 1
        ? previous
        : previous.filter(
            (item) => item.id !== id,
          ),
    );
  };

  const handleSave = async () => {
    try {
      setSaveError("");
      const current = works.filter((item) => String(item.company || "").trim());
      const rows = await saveMyAccountCollection("work-history", originalWorks, current, (item) => ({
        organization_name: item.company.trim(),
        position_title: String(item.position || item.appointment || "").trim(),
        address: item.address?.trim() || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
      }));
      setOriginalWorks(rows);
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (requestError) {
      setSaveError(requestError.message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return <NotFound />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">
          ប្រវត្តិការងារ
        </h2>

        <div className="mt-6 space-y-6">
          {works.map((work, index) => (
            <div
              key={work.id}
              className="rounded-xl border border-gray-300 p-6"
            >
              <h3 className="mb-5 text-sm font-semibold text-text-primary">
                ប្រវត្តិការងារ ទី {index + 1}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <BoxFill label="ឈ្មោះ ស្ថាប័ន" placeholder="បញ្ចូលឈ្មោះស្ថាប័ន" value={work.company} onChange={(event) => handleWorkChange(work.id, "company", event.target.value)} />
                
                                <BoxFill label="អាស័យដ្ឋាន" placeholder="បញ្ចូលអាស័យដ្ឋាន" value={work.address} onChange={(event) => handleWorkChange(work.id, "address", event.target.value)} />
                
                                <BoxFill label="តួនាទី" placeholder="តួនាទី" value={work.position} onChange={(event) => handleWorkChange(work.id, "position", event.target.value)}  />
                
                                <BoxFill label="មុខតំណែង" placeholder="មុខតំណែង" value={work.appointment} onChange={(event) => handleWorkChange(work.id, "appointment", event.target.value)}  />
                
                                <FormDate label="ថ្ងៃខែចាប់ផ្ដើម" name={`startDate-${work.id}`} value={work.startDate} onChange={(event) => handleWorkChange(work.id, "startDate", event.target.value)} />
                
                                <FormDate label="ថ្ងៃខែបញ្ចប់" name={`endDate-${work.id}`} value={work.endDate} onChange={(event) => handleWorkChange(work.id, "endDate", event.target.value)} />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton
                  canDelete={works.length > 1}
                  onClick={() =>
                    removeWork(work.id)
                  }
                />
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setWorks((previous) => [
                  ...previous,
                  createEmptyWork(),
                ])
              }
              className="inline-flex items-center gap-2 rounded-lg bg-success px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              <RiAddCircleLine size={18} />
              បន្ថែម
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {saveError && <p className="mr-4 self-center text-sm text-red-500">{saveError}</p>}
        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <p className="text-sm text-red-500">
        រកមិនឃើញព័ត៌មានសមាជិក
      </p>
    </div>
  );
}
