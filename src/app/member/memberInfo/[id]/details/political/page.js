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
import politicalData from "@/data/political.json";
import { useLanguage } from "@/context/LanguageContext";

function createEmptyPolitical() {
  return {
    id: `political-${Date.now()}-${Math.random()}`,
    ...politicalData.emptyPolitical,
  };
}

export default function PoliticalPage() {
  const { t, label } = useLanguage();
  const { canEditMemberDetails } = useMemberPermissions();
  const isReadOnly = !canEditMemberDetails;
  const params = useParams();
  const memberId = String(params?.id ?? "");

  const [member, setMember] = useState(null);
  const [politicals, setPoliticals] = useState([]);
  const [parties, setParties] = useState([]);
  const [error, setError] = useState("");

  /*
   * True from the moment the user edits a political-involvement row
   * (field edit, add row) until the next successful Save — NOT
   * derived from diffing `politicals`, since that array is also
   * rewritten by the load effect and by a successful save itself.
   * Fed to useUnsavedFormGuard below so the tab-nav bar knows to
   * confirm before navigating away mid-edit.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    loadMemberRecords(memberId, "political-affiliations", controller.signal)
      .then((rows) => {
        setMember({ id: memberId });
        setPoliticals(rows.length ? rows.map((row) => ({
          id: row.id,
          organization: row.affiliationName || row.affiliation_name || "",
          workLocation: row.location || "",
          country: "",
          position: row.positionTitle || row.position_title || "",
          cardNumber: "",
          joinedDate: row.startDate || row.start_date || "",
          leftDate: row.endDate || row.end_date || "",
        })) : [createEmptyPolitical()]);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") {
          setMember({ id: memberId });
          setPoliticals([createEmptyPolitical()]);
          setError(loadError.message || t("memberPage.politicalLoadFailed"));
        }
      });
    return () => controller.abort();
  }, [memberId]);

  // The "party" options are admin-managed lookups (see the variable
  // page's "គណបក្សនយោបាយ" category) rather than a hardcoded list, same
  // source myAcc's own political-affiliation tab already uses.
  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/lookups/political-parties", {
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((items) => {
        const rows = Array.isArray(items) ? items : [];
        setParties(rows.map((item) => ({
          value: String(item.value ?? item.id ?? ""),
          label: label(item, String(item.value ?? item.id ?? "")),
        })));
      })
      .catch((lookupError) => {
        if (lookupError.name !== "AbortError") setParties([]);
      });

    return () => controller.abort();
  }, [label]);

  function handlePoliticalChange(id, field, value) {
    setHasUnsavedChanges(true);

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
    setHasUnsavedChanges(true);
    setPoliticals((previous) => [...previous, createEmptyPolitical()]);
  }

  async function removePolitical(id) {
    await deleteMemberRecord(memberId, "political-affiliations", id);
    setPoliticals((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter((item) => item.id !== id);
    });
  }

  const handleSave = async () => {
    if (!member) return false;

    try {
      setError("");
      const rows = await saveMemberRecords(memberId, "political-affiliations", politicals, (item) => ({
        affiliation_name: item.organization,
        location: item.workLocation || null,
        position_title: item.position || null,
        start_date: item.joinedDate || null,
        end_date: item.leftDate || null,
      }));
      setPoliticals(rows.map((row) => ({
        id: row.id,
        organization: row.affiliationName || row.affiliation_name || "",
        workLocation: row.location || "",
        country: "",
        position: row.positionTitle || row.position_title || "",
        cardNumber: "",
        joinedDate: row.startDate || row.start_date || "",
        leftDate: row.endDate || row.end_date || "",
      })));
      alert(t("memberPage.saveSuccess"));

      setHasUnsavedChanges(false);

      return true;
    } catch (saveError) {
      setError(saveError.message || t("memberPage.politicalSaveFailed"));

      return false;
    }
  };

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
      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-border bg-bg-page-white p-5">
        <h2 className="text-lg font-bold text-primary">{t("memberPage.detailPolitical")}</h2>

        <div className="mt-5 space-y-5">
          {politicals.map((item, index) => (
            <PoliticalGroup
              key={item.id}
              index={index}
              item={item}
              parties={parties}
              t={t}
              canDelete={politicals.length > 1}
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
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            {t("memberPage.add")}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton type="submit" />
      </div>
      </fieldset>
    </form>
  );
}

function PoliticalGroup({ index, item, parties, canDelete, onChange, onDelete, t }) {
  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        {t("memberPage.politicalItemTitle").replace("{index}", index + 1)}
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <FormSelect
          label={t("memberPage.party")}
          placeholder={t("memberPage.selectParty")}
          value={item.organization ?? ""}
          onChange={(event) => onChange("organization", event.target.value)}
          options={parties}
        />

        <BoxFill
          label={t("memberPage.workplace")}
          placeholder={t("memberPage.workplacePlaceholder")}
          value={item.workLocation ?? ""}
          onChange={(event) => onChange("workLocation", event.target.value)}
        />

        <BoxFill
          label={t("memberPage.country")}
          placeholder={t("memberPage.countryPlaceholder")}
          value={item.country ?? ""}
          onChange={(event) => onChange("country", event.target.value)}
        />

        <BoxFill
          label={t("memberPage.role")}
          placeholder={t("memberPage.rolePlaceholder")}
          value={item.position ?? ""}
          onChange={(event) => onChange("position", event.target.value)}
        />

        <BoxFill
          label={t("memberPage.cardOrAppointmentNo")}
          placeholder={t("memberPage.cardOrAppointmentNoPlaceholder")}
          value={item.cardNumber ?? ""}
          onChange={(event) => onChange("cardNumber", event.target.value)}
        />

        <FormDate
          label={t("memberPage.startDate")}
          name={`joinedDate-${item.id}`}
          value={item.joinedDate ?? ""}
          onChange={(event) => onChange("joinedDate", event.target.value)}
        />

        <FormDate
          label={t("memberPage.endDate")}
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
