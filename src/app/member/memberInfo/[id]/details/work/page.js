"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiAddCircleLine } from "react-icons/ri";
import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import { deleteMemberRecord, loadMemberRecords, saveMemberRecords } from "@/lib/memberRecords";
import useMemberPermissions from "@/hooks/useMemberPermissions";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
  const { canEditMemberDetails } = useMemberPermissions();
  const isReadOnly = !canEditMemberDetails;
  const params = useParams();
  const memberId = String(params?.id ?? "");
  const [member, setMember] = useState(null);
  const [works, setWorks] = useState([]);

  /*
   * True from the moment the user edits any work-history field, or
   * adds a row, until the next successful Save — NOT derived from
   * diffing `works`, since `works` is also rewritten by the initial
   * load effect and by a successful save. Fed to
   * useUnsavedFormGuard below so the tab-nav bar knows to confirm
   * before navigating away mid-edit.
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
      const rows = await saveMemberRecords(memberId, "work-history", works, (item) => ({
        organization_name: item.company,
        position_title: item.position,
        role_title: item.appointment || null,
        address: item.address || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
      }));
      setWorks(rows.map((row) => ({ id: row.id, company: row.organization_name || "", address: row.address || "", position: row.position_title || "", appointment: row.role_title || "", startDate: row.start_date || "", endDate: row.end_date || "" })));
      alert(t("memberPage.saveSuccess"));
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error("Cannot save work history:", error);
      alert(error.message || t("memberPage.saveFailed"));
      return false;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await handleSave();
  }

  /*
   * Registers this page's dirty flag + save function with the
   * shared unsaved-changes guard (see
   * member/memberInfo/[id]/layout.js), so the tab-nav bar confirms
   * before navigating away while hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(hasUnsavedChanges, handleSave);

  if (!member) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6">
        <p className="text-sm text-error">{t("memberPage.memberNotFound")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents [&_button]:hidden" : "contents"}>
      <div className="rounded-xl border border-border bg-bg-page-white p-6">
        <h2 className="text-lg font-bold text-primary">{t("memberPage.detailWork")}</h2>

        <div className="mt-6 space-y-6">
          {works.map((work, index) => (
            <div key={work.id} className="rounded-xl border border-border p-6">
              <h3 className="mb-5 text-sm font-semibold text-text-primary">{t("memberPage.workItemTitle").replace("{index}", index + 1)}</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <BoxFill label={t("memberPage.organizationName")} placeholder={t("memberPage.organizationPlaceholder")} value={work.company} onChange={(event) => handleWorkChange(work.id, "company", event.target.value)} />

                <BoxFill label={t("memberPage.address")} placeholder={t("memberPage.addressPlaceholder")} value={work.address} onChange={(event) => handleWorkChange(work.id, "address", event.target.value)} />

                <BoxFill label={t("memberPage.role")} placeholder={t("memberPage.role")} value={work.position} onChange={(event) => handleWorkChange(work.id, "position", event.target.value)}  />

                <BoxFill label={t("memberPage.appointment")} placeholder={t("memberPage.appointment")} value={work.appointment} onChange={(event) => handleWorkChange(work.id, "appointment", event.target.value)}  />

                <FormDate label={t("memberPage.startDate")} name={`startDate-${work.id}`} value={work.startDate} onChange={(event) => handleWorkChange(work.id, "startDate", event.target.value)} />

                <FormDate label={t("memberPage.endDate")} name={`endDate-${work.id}`} value={work.endDate} onChange={(event) => handleWorkChange(work.id, "endDate", event.target.value)} />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton canDelete={works.length > 1} onClick={() => removeWork(work.id)} />
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button type="button" onClick={addWork} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <RiAddCircleLine size={18} />
              {t("memberPage.add")}
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
