"use client";

import { useEffect, useState } from "react";
import useCurrentMember from "@/hooks/useCurrentMember";
import { RiAddCircleLine } from "react-icons/ri";
import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import { deleteMemberRecord, loadMemberRecords, saveMemberRecords } from "@/lib/myAccountRecords";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";

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

export default function WorkPage() {
  const isReadOnly = false;
  const { member: currentMember } = useCurrentMember();
  const memberId = String(currentMember?.id ?? "self");
  const [member, setMember] = useState(null);
  const [works, setWorks] = useState([]);

  /*
   * True from the moment the user edits any work-history field, or
   * adds a row, until the next successful Save — NOT derived from
   * diffing `works`, since `works` is also rewritten by the initial
   * load effect and by a successful save. Fed to
   * useUnsavedFormGuard below so the account tab-nav bar knows to
   * confirm before navigating away mid-edit.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    loadMemberRecords(memberId, "work-history", controller.signal)
      .then((rows) => {
        setMember({ id: memberId });
        setWorks(rows.length ? rows.map((row) => ({
          id: row.id,
          company: row.organization_name || "",
          address: row.address || "",
          position: row.position_title || "",
          appointment: row.role_title || "",
          startDate: row.start_date || "",
          endDate: row.end_date || "",
        })) : [createEmptyWork()]);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setMember(null);
      });
    return () => controller.abort();
  }, [memberId]);

  function handleWorkChange(id, field, value) {
    setHasUnsavedChanges(true);
    setWorks((previousWorks) => previousWorks.map((work) => work.id === id ? { ...work, [field]: value } : work));
  }

  function addWork() {
    setHasUnsavedChanges(true);
    setWorks((previousWorks) => [...previousWorks, createEmptyWork()]);
  }

  async function removeWork(id) {
    // This fires an immediate server DELETE (not a local-only draft
    // change), so there's nothing "unsaved" left pending afterward —
    // intentionally not flagged as a dirty change.
    await deleteMemberRecord(memberId, "work-history", id);
    setWorks((previousWorks) => {
      if (previousWorks.length === 1) return previousWorks;
      return previousWorks.filter((work) => work.id !== id);
    });
  }

  async function handleSave() {
    try {
      const current = works.filter((item) => String(item.company || "").trim());
      const rows = await saveMemberRecords(memberId, "work-history", current, (item) => ({
        organization_name: item.company.trim(),
        position_title: String(item.position || item.appointment || "").trim(),
        role_title: item.appointment || null,
        address: item.address || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
      }));
      setWorks(rows.map((row) => ({ id: row.id, company: row.organization_name || "", address: row.address || "", position: row.position_title || "", appointment: row.role_title || "", startDate: row.start_date || "", endDate: row.end_date || "" })));
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error("Cannot save work history:", error);
      alert(error.message || "មិនអាចរក្សាទុកព័ត៌មានបានទេ");
      return false;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await handleSave();
  }

  /*
   * Registers this page's dirty flag + save function with the
   * shared unsaved-changes guard (see myAcc/layout.js), so the
   * account tab-nav bar confirms before navigating away while
   * hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(hasUnsavedChanges, handleSave);

  if (!member) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6">
        <p className="text-sm text-error">រកមិនឃើញព័ត៌មានសមាជិក</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents [&_button]:hidden" : "contents"}>
      <div className="rounded-xl border border-border bg-bg-page-white p-6">
        <h2 className="text-lg font-bold text-primary">ប្រវត្តិការងារ</h2>

        <div className="mt-6 space-y-6">
          {works.map((work, index) => (
            <div key={work.id} className="rounded-xl border border-border p-6">
              <h3 className="mb-5 text-sm font-semibold text-text-primary">ប្រវត្តិការងារ ទី {index + 1}</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <BoxFill label="ឈ្មោះ ស្ថាប័ន" placeholder="បញ្ចូលឈ្មោះស្ថាប័ន" value={work.company} onChange={(event) => handleWorkChange(work.id, "company", event.target.value)} />

                <BoxFill label="អាស័យដ្ឋាន" placeholder="បញ្ចូលអាស័យដ្ឋាន" value={work.address} onChange={(event) => handleWorkChange(work.id, "address", event.target.value)} />

                <BoxFill label="តួនាទី" placeholder="តួនាទី" value={work.position} onChange={(event) => handleWorkChange(work.id, "position", event.target.value)}  />

                <BoxFill label="មុខតំណែង" placeholder="មុខតំណែង" value={work.appointment} onChange={(event) => handleWorkChange(work.id, "appointment", event.target.value)}  />

                <FormDate label="ថ្ងៃខែចាប់ផ្ដើម" name={`startDate-${work.id}`} value={work.startDate} onChange={(event) => handleWorkChange(work.id, "startDate", event.target.value)} />

                <FormDate label="ថ្ងៃខែបញ្ចប់" name={`endDate-${work.id}`} value={work.endDate} onChange={(event) => handleWorkChange(work.id, "endDate", event.target.value)} />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton canDelete={works.length > 1} onClick={() => removeWork(work.id)} />
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button type="button" onClick={addWork} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <RiAddCircleLine size={18} />
              បន្ថែម
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton />
      </div>
      </fieldset>
    </form>
  );
}
