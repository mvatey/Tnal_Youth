"use client";

import { useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import SelectArrow from "@/components/forms/SelectArrow";

export default function PoliticalPage() {
  const [politicals, setPoliticals] = useState([{ id: 1 }]);

  const addPolitical = () => {
    setPoliticals((prev) => [...prev, { id: Date.now() }]);
  };

  const removePolitical = (id) => {
    setPoliticals((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">កិច្ចការនយោបាយ</h2>

        <div className="mt-5 space-y-5">
          {politicals.map((item) => (
            <PoliticalGroup key={item.id} canDelete={politicals.length > 1} onDelete={() => removePolitical(item.id)} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button type="button" onClick={addPolitical} className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
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
        <BoxFill label="ឈ្មោះ គណបក្ស" placeholder="បញ្ចូលឈ្មោះគណបក្ស" />
        <FormSelect label="ទីតាំងសកម្មភាពនយោបាយ" placeholder="ជ្រើសរើស" options={["ថ្នាក់ជាតិ", "ថ្នាក់ខេត្ត", "ថ្នាក់ស្រុក", "ថ្នាក់ឃុំ"]} />
        <FormSelect label="ប្រភេទ" placeholder="ជ្រើសរើសប្រភេទ" options={["សមាជិក", "ថ្នាក់ដឹកនាំ", "អ្នកស្ម័គ្រចិត្ត"]} />
        <FormSelect label="តួនាទី" placeholder="ជ្រើសរើសតួនាទី" options={["ប្រធាន", "អនុប្រធាន", "លេខាធិការ", "សមាជិក"]} />
        <BoxFill label="លេខកូដ/បញ្ជីកំណត់" placeholder="បញ្ចូលលេខកូដ" />
        <FormDate label="ថ្ងៃចូល" name="joinedDate" />
        <FormDate label="ថ្ងៃចេញ" name="leftDate" />
      </div>

      {canDelete && (
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
            <Trash2 size={17} />
            លុប
          </button>
        </div>
      )}
    </div>
  );
}

function FormSelect({ label, placeholder, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>

      <div className="relative">
        <select defaultValue="" className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-500 outline-none focus:border-primary">
          <option value="" disabled>{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <SelectArrow />
      </div>
    </div>
  );
}