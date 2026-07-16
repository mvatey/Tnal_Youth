"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";
import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import SelectArrow from "@/components/forms/SelectArrow";

export default function WorkPage() {
  const [works, setWorks] = useState([{ id: 1, company: "", position: "", type: "", reason: "", startDate: "", endDate: "" }]);

  const addWork = () => {
    setWorks((prev) => [...prev, { id: Date.now(), company: "", position: "", type: "", reason: "", startDate: "", endDate: "" }]);
  };

  const removeWork = (id) => {
    setWorks((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">ប្រវត្តិការងារ</h2>

        <div className="mt-6 space-y-6">
          {works.map((work, index) => (
            <div key={work.id} className="rounded-xl border border-gray-300 p-6">
              <div className="grid grid-cols-3 gap-6">
                <BoxFill label="ឈ្មោះ ស្ថាប័ន" placeholder="បញ្ចូលឈ្មោះស្ថាប័ន" />
                <BoxFill label="មុខតំណែង" placeholder="បញ្ចូលមុខតំណែង" />
                <FormSelect label="ប្រភេទ" placeholder="ជ្រើសរើសប្រភេទ" options={["ពេញម៉ោង", "ក្រៅម៉ោង", "កិច្ចសន្យា", "ស្ម័គ្រចិត្ត"]} />
                <FormSelect label="មូលហេតុចាកចេញ" placeholder="ជ្រើសរើស" options={["បញ្ចប់កិច្ចសន្យា", "ផ្លាស់ប្ដូរការងារ", "បន្តការសិក្សា", "ផ្សេងៗ"]} />
                <FormDate label="ចូលធ្វើការ" name={`startDate-${work.id}`} />
                <FormDate label="ចាកចេញ" name={`endDate-${work.id}`} />
              </div>

              <div className="mt-6 flex justify-end">
                <button type="button" disabled={index === 0} onClick={() => removeWork(work.id)} className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white ${index === 0 ? "cursor-not-allowed bg-gray-300" : "bg-red-600 hover:bg-red-700"}`}>
                  <Trash2 size={16} />
                  លុប
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button type="button" onClick={addWork} className="flex items-center gap-2 rounded-lg bg-success px-6 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <RiAddCircleLine size={18} />
              បន្ថែម
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  );
}

function FormSelect({ label, placeholder, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>

      <div className="relative">
        <select defaultValue="" className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-500 outline-none focus:border-primary">
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