"use client";

import { useEffect, useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import { getCurrentMember } from "@/lib/currentMember";
import politicalData from "@/data/political.json";
import locationData from "@/data/location.json";

import SaveButton from "@/components/forms/SaveButton";
import DeleteButton from "@/components/forms/DeleteButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import FormSelect from "@/components/forms/FormSelect";

function createEmptyPolitical() {
  return {
    id: `political-${Date.now()}-${Math.random()}`,
    organization: "",
    workLevel: "",
    country: "",
    position: "",
    appointmentNumber: "",
    startDate: "",
    endDate: "",
  };
}

export default function MyAccountPoliticalPage() {
  const member = getCurrentMember();
  const [politicals, setPoliticals] = useState([]);

  useEffect(() => {
    if (!member) {
      setPoliticals([]);
      return;
    }

    const history = Array.isArray(member.politicalHistory)
      ? member.politicalHistory
      : [];

    setPoliticals(history.length > 0 ? history : [createEmptyPolitical()]);
  }, [member]);

  const updatePolitical = (id, field, value) => {
    setPoliticals((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addPolitical = () => {
    setPoliticals((previous) => [...previous, createEmptyPolitical()]);
  };

  const removePolitical = (id) => {
    setPoliticals((previous) =>
      previous.length === 1
        ? previous
        : previous.filter((item) => item.id !== id),
    );
  };

  const handleSave = () => {
    console.log("Member ID:", member?.id);
    console.log("Updated political history:", politicals);
  };

  if (!member) {
    return <NotFound />;
  }

  const workLevels = politicalData.workLevels || [
    "ថ្នាក់ជាតិ",
    "ថ្នាក់រាជធានី/ខេត្ត",
    "ថ្នាក់ក្រុង/ស្រុក/ខណ្ឌ",
    "ថ្នាក់ឃុំ/សង្កាត់",
  ];

  const positions = politicalData.positions || [
    "ប្រធាន",
    "អនុប្រធាន",
    "លេខាធិការ",
    "សមាជិក",
    "អ្នកស្ម័គ្រចិត្ត",
  ];

  const countries = locationData.countries || [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">កិច្ចការនយោបាយ</h2>

        <div className="mt-5 space-y-5">
          {politicals.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-300 p-6"
            >
              <h3 className="mb-5 text-sm font-semibold text-text-primary">
                ប្រវត្តិកិច្ចការនយោបាយ ទី {index + 1}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <BoxFill
                  label="ឈ្មោះ ស្ថាប័ន"
                  value={item.organization || ""}
                  onChange={(event) =>
                    updatePolitical(item.id, "organization", event.target.value)
                  }
                  placeholder="បញ្ចូលឈ្មោះស្ថាប័ន"
                />

                <FormSelect
                  label="ទីកន្លែងបំពេញការងារ"
                  value={item.workLevel || ""}
                  onChange={(event) =>
                    updatePolitical(item.id, "workLevel", event.target.value)
                  }
                  placeholder="ជ្រើសរើសទីកន្លែង"
                  options={workLevels}
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
                  value={item.appointmentNumber || ""}
                  onChange={(event) =>
                    updatePolitical(
                      item.id,
                      "appointmentNumber",
                      event.target.value,
                    )
                  }
                  placeholder="បញ្ចូលលេខកាត/លិខិតតែងតាំង"
                />

                <FormDate
                  label="ថ្ងៃខែឆ្នាំចាប់ផ្ដើម"
                  name={`political-start-${item.id}`}
                  value={item.startDate || ""}
                  onChange={(event) =>
                    updatePolitical(item.id, "startDate", event.target.value)
                  }
                />

                <FormDate
                  label="ថ្ងៃខែឆ្នាំបញ្ចប់"
                  name={`political-end-${item.id}`}
                  value={item.endDate || ""}
                  onChange={(event) =>
                    updatePolitical(item.id, "endDate", event.target.value)
                  }
                />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton
                  canDelete={politicals.length > 1}
                  onClick={() => removePolitical(item.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addPolitical}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <p className="text-sm text-red-500">រកមិនឃើញព័ត៌មានសមាជិក</p>
    </div>
  );
}
