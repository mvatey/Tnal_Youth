"use client";

import { useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";
import { Trash2, Calendar } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";

export default function PoliticalPage() {
  const [politicals, setPoliticals] = useState([{ id: 1 }]);

  const addPolitical = () => {
    setPoliticals([...politicals, { id: Date.now() }]);
  };

  const removePolitical = (id) => {
    if (politicals.length === 1) return;

    setPoliticals(politicals.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">

      <div className="rounded-xl border border-gray-200 bg-white p-5">

        <h2 className="text-lg font-bold text-primary">
          កិច្ចការនយោបាយ
        </h2>

        <div className="mt-5 space-y-5">

          {politicals.map((item) => (
            <PoliticalGroup
              key={item.id}
              canDelete={politicals.length > 1}
              onDelete={() => removePolitical(item.id)}
            />
          ))}

        </div>

        <div className="mt-6 flex justify-center">

          <button onClick={addPolitical} className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>

        </div>

      </div>


      <div className="flex justify-end">
        <SaveButton />
      </div>

    </div>
  );
}


function PoliticalGroup({ canDelete, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">

      <div className="grid grid-cols-4 gap-6">

        <FormInput
          label="ឈ្មោះ គណបក្ស"
          placeholder="បញ្ចូលឈ្មោះគណបក្ស"
        />

        <FormSelect
          label="ទីតាំងសកម្មភាពនយោបាយ"
          placeholder="ជ្រើសរើស"
        />

        <FormSelect
          label="ប្រភេទ"
          placeholder="ជ្រើសរើសប្រភេទ"
        />

        <FormSelect
          label="តួនាទី"
          placeholder="ជ្រើសរើសតួនាទី"
        />


        <FormInput
          label="លេខកូដ/បញ្ជីកំណត់"
          placeholder="បញ្ចូលលេខកូដ"
        />


        <DateInput
          label="ថ្ងៃចូល"
        />


        <DateInput
          label="ថ្ងៃចេញ"
        />


      </div>


      {canDelete && (
        <div className="mt-6 flex justify-end">

          <button onClick={onDelete} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700">
            <Trash2 size={17} />
            លុប
          </button>

        </div>
      )}


    </div>
  );
}


function FormInput({ label, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <input
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-600 outline-none focus:border-primary"
      />
    </div>
  );
}


function FormSelect({ label, placeholder }) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="relative">

        <select className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-500 outline-none focus:border-primary">

          <option>
            {placeholder}
          </option>

        </select>


        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">

          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">

            <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          </svg>

        </div>

      </div>

    </div>
  );
}


function DateInput({ label }) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="relative">

        <input
          placeholder="ថ្ងៃ/ខែ/ឆ្នាំ"
          className="h-11 w-full rounded-lg border border-gray-200 px-4 pr-12 text-sm text-gray-600 outline-none focus:border-primary"
        />

        <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />

      </div>

    </div>
  );
}