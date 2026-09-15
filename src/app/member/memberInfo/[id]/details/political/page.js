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

function isPersistedRecordId(id) {
  return Number.isInteger(Number(id)) && !String(id).includes("-");
}

/*
 * Puts saved rows back at their original position in the full list --
 * `savedSourceRows`/`completedRows` only cover the subset that was
 * actually sent to the server (see handleSave's blank-row filter), so
 * rows matched by id get the fresh server data and every other row
 * (still-blank placeholders, mainly) is kept exactly as it was.
 */
function mergeSavedRecords(originalRows, savedSourceRows, completedRows, mapRow) {
  const completedById = new Map(
    savedSourceRows.map((row, index) => [row.id, completedRows[index]]),
  );

  return originalRows.map((row) => {
    const completed = completedById.get(row.id);
    return completed ? mapRow(completed) : row;
  });
}

export default function PoliticalPage() {
  const { t, label } = useLanguage();
  const { canEditMemberDetails } = useMemberPermissions();
  const isReadOnly = !canEditMemberDetails;
  const params = useParams();
  const memberId = String(params?.id ?? "");

  // True until the initial political-affiliation fetch settles (success
  // or failure) -- gates the render below so this page never flashes
  // the red "couldn't load" box during a normal load, only once loading
  // has actually finished and genuinely failed. The member itself is
  // already confirmed to exist by the shared layout before any tab
  // renders at all, so this page has no separate need to track it.
  const [loading, setLoading] = useState(true);
  const [politicals, setPoliticals] = useState([]);
  const [parties, setParties] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * True from the moment the user edits a political-involvement row
   * (field edit, add row) until the next successful Save — NOT
   * derived from diffing `politicals`, since that array is also
   * rewritten by the load effect and by a successful save itself.
   * Fed to useUnsavedFormGuard below so the tab-nav bar knows to
   * confirm before navigating away mid-edit.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /*
   * Guards the Save button (disabled while true) so a double-click or
   * a stray Enter-key submit can't fire a second save before the
   * first one's response comes back and turns each still-local row
   * into a persisted one -- without this, a second save would POST
   * the same unsaved row again as a brand new record.
   */
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    loadMemberRecords(memberId, "political-affiliations", controller.signal)
      .then((rows) => {
        setPoliticals(rows.length ? rows.map((row) => ({
          id: row.id,
          organization:
            row.party_id != null
              ? String(row.party_id)
              : row.partyId != null
                ? String(row.partyId)
                : "",
          workLocation: row.location || "",
          country: row.country || "",
          position: row.positionTitle || row.position_title || "",
          cardNumber: row.card_no || row.cardNo || "",
          joinedDate: row.startDate || row.start_date || "",
          leftDate: row.endDate || row.end_date || "",
        })) : [createEmptyPolitical()]);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") {
          setPoliticals([createEmptyPolitical()]);
          setError(loadError.message || t("memberPage.politicalLoadFailed"));
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
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
    setSuccess("");
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
    setSuccess("");
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
    if (loading) return false;

    if (saving) return false;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * `politicals` always carries at least one row by default (see
       * the load effect above) even when the member has no political
       * affiliation recorded yet. The backend requires party_id on
       * every row it's sent, so unconditionally saving that still-
       * untouched default row would make the WHOLE save fail -- since
       * it's a loop over all of them. Only skip a row when it's both
       * unsaved (no real server id yet) AND still has no party
       * selected; an already-persisted row is always sent so a
       * genuine edit still gets validated normally.
       */
      const rowsToSave = politicals.filter(
        (item) => isPersistedRecordId(item.id) || (item.organization || "").trim(),
      );

      const rows = await saveMemberRecords(memberId, "political-affiliations", rowsToSave, (item) => ({
        party_id: Number(item.organization) || null,
        country: item.country || null,
        location: item.workLocation || null,
        position_title: item.position || null,
        card_no: item.cardNumber || null,
        start_date: item.joinedDate || null,
        end_date: item.leftDate || null,
      }));

      setPoliticals((previous) =>
        mergeSavedRecords(previous, rowsToSave, rows, (row) => ({
          id: row.id,
          organization:
            row.party_id != null
              ? String(row.party_id)
              : row.partyId != null
                ? String(row.partyId)
                : "",
          workLocation: row.location || "",
          country: row.country || "",
          position: row.positionTitle || row.position_title || "",
          cardNumber: row.card_no || row.cardNo || "",
          joinedDate: row.startDate || row.start_date || "",
          leftDate: row.endDate || row.end_date || "",
        })),
      );
      setHasUnsavedChanges(false);
      setSuccess(t("memberPage.saveSuccess"));

      return true;
    } catch (saveError) {
      setError(saveError.message || t("memberPage.politicalSaveFailed"));

      return false;
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-text-secondary">{t("memberPage.loadingMember")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents [&_button]:hidden" : "contents"}>
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
      </fieldset>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-bg px-4 py-3">
          <p className="text-sm font-medium text-success">{success}</p>
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end">
          <SaveButton type="submit" disabled={saving}>
            {saving ? t("common.saving") : t("memberPage.save")}
          </SaveButton>
        </div>
      )}
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
