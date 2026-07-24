"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiAddCircleLine } from "react-icons/ri";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";

import membersData from "@/data/members.json";
import locationData from "@/data/location.json";
import politicalData from "@/data/political.json";

function createEmptyPolitical() {
  return {
    id: `political-${Date.now()}-${Math.random()}`,
    ...politicalData.emptyPolitical,
  };
}

export default function PoliticalPage() {
  const params = useParams();
  const memberId = String(params?.id ?? "");

  const [member, setMember] = useState(null);
  const [politicals, setPoliticals] = useState([]);

  useEffect(() => {
    const selectedMember = membersData.find(
      (item) => String(item.id) === memberId,
    );

    if (!selectedMember) {
      setMember(null);
      setPoliticals([]);
      return;
    }

    setMember(selectedMember);

    const politicalHistory = Array.isArray(selectedMember.politicalHistory)
      ? selectedMember.politicalHistory
      : [];

    setPoliticals(
      politicalHistory.length > 0 ? politicalHistory : [createEmptyPolitical()],
    );
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
    setPoliticals((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter((item) => item.id !== id);
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!member) return;

    const updatedMember = {
      ...member,
      politicalHistory: politicals,
    };

    console.log("Updated member:", updatedMember);
    alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">រកមិនឃើញព័ត៌មានសមាជិក</p>
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
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton type="submit" />
      </div>
    </form>
  );
}

function PoliticalGroup({ index, item, canDelete, onChange, onDelete }) {
  const countries = Array.isArray(locationData.countries)
    ? locationData.countries
    : [];

  const workLocations = Array.isArray(politicalData.workLocations)
    ? politicalData.workLocations
    : [];

  const roles = Array.isArray(politicalData.roles) ? politicalData.roles : [];

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

        <FormSelect
          label="ទីកន្លែងបំពេញការងារ"
          placeholder="ជ្រើសរើសទីកន្លែងបំពេញការងារ"
          value={item.workLocation ?? ""}
          onChange={(event) => onChange("workLocation", event.target.value)}
          options={workLocations}
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
