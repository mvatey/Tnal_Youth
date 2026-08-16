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
import politicalData from "@/data/political.json";

function createEmptyPolitical() {
  return {
    id: `political-${Date.now()}-${Math.random()}`,
    ...politicalData.emptyPolitical,
  };
}

export default function PoliticalPage() {
  const isReadOnly = false;
  const { member: currentMember } = useCurrentMember();
  const memberId = String(currentMember?.id ?? "self");

  const [member, setMember] = useState(null);
  const [politicals, setPoliticals] = useState([]);
  const [parties, setParties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    loadMemberRecords(memberId, "political-affiliations", controller.signal)
      .then((rows) => {
        setMember({ id: memberId });
        setPoliticals(rows.length ? rows.map((row) => ({
          id: row.id,
          organization: String(row.party_id ?? row.partyId ?? ""),
          workLocation: row.location || "",
          country: row.country || "",
          position: row.position_title || row.positionTitle || "",
          cardNumber: row.card_no || row.cardNo || "",
          joinedDate: row.start_date || row.startDate || "",
          leftDate: row.end_date || row.endDate || "",
        })) : [createEmptyPolitical()]);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") {
          setMember({ id: memberId });
          setPoliticals([createEmptyPolitical()]);
          setError(loadError.message || "មិនអាចទាញយកព័ត៌មាននយោបាយបានទេ។");
        }
      });
    return () => controller.abort();
  }, [memberId]);

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
          label:
            item.labelKm ||
            item.label_km ||
            item.nameKm ||
            item.name_km ||
            item.labelEn ||
            item.label_en ||
            item.nameEn ||
            item.name_en ||
            item.code ||
            String(item.value ?? item.id ?? ""),
        })));
      })
      .catch((lookupError) => {
        if (lookupError.name !== "AbortError") setParties([]);
      });

    return () => controller.abort();
  }, []);

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

  async function removePolitical(id) {
    await deleteMemberRecord(memberId, "political-affiliations", id);
    setPoliticals((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter((item) => item.id !== id);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!member) return;

    try {
      setError("");
      const current = politicals.filter((item) => String(item.organization || "").trim());
      const rows = await saveMemberRecords(memberId, "political-affiliations", current, (item) => ({
        party_id: Number(item.organization),
        country: item.country?.trim() || null,
        location: item.workLocation?.trim() || null,
        position_title: item.position?.trim() || null,
        card_no: item.cardNumber?.trim() || null,
        start_date: item.joinedDate || null,
        end_date: item.leftDate || null,
        is_current: !item.leftDate,
        note: null,
      }));
      setPoliticals(rows.map((row) => ({
        id: row.id,
        organization: String(row.party_id ?? row.partyId ?? ""),
        workLocation: row.location || "",
        country: row.country || "",
        position: row.position_title || row.positionTitle || "",
        cardNumber: row.card_no || row.cardNo || "",
        joinedDate: row.start_date || row.startDate || "",
        leftDate: row.end_date || row.endDate || "",
      })));
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "មិនអាចរក្សាទុកព័ត៌មាននយោបាយបានទេ។");
    }
  }

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
      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-border bg-bg-page-white p-5">
        <h2 className="text-lg font-bold text-primary">កិច្ចការនយោបាយ</h2>

        <div className="mt-5 space-y-5">
          {politicals.map((item, index) => (
            <PoliticalGroup
              key={item.id}
              index={index}
              item={item}
              parties={parties}
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
            បន្ថែម
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

function PoliticalGroup({ index, item, parties, canDelete, onChange, onDelete }) {
  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        កិច្ចការនយោបាយ ទី {index + 1}
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <FormSelect
          label="បក្ស"
          placeholder="ជ្រើសរើសបក្ស"
          value={item.organization ?? ""}
          onChange={(event) => onChange("organization", event.target.value)}
          options={parties}
        />

        <BoxFill
          label="ទីកន្លែងបំពេញការងារ"
          placeholder="បញ្ចូលទីកន្លែងបំពេញការងារ"
          value={item.workLocation ?? ""}
          onChange={(event) => onChange("workLocation", event.target.value)}
        />

        <BoxFill
          label="ប្រទេស"
          placeholder="បញ្ចូលឈ្មោះប្រទេស"
          value={item.country ?? ""}
          onChange={(event) => onChange("country", event.target.value)}
        />

        <BoxFill
          label="តួនាទី"
          placeholder="បញ្ចូលឈ្មោះតួនាទី"
          value={item.position ?? ""}
          onChange={(event) => onChange("position", event.target.value)}
        />

        <BoxFill
          label="លេខកាត/លិខិតតែងតាំង"
          placeholder="បញ្ចូលលេខកាត/លិខិតតែងតាំង"
          value={item.cardNumber ?? ""}
          onChange={(event) => onChange("cardNumber", event.target.value)}
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
