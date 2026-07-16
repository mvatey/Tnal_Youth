"use client";

import { useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";
import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import SelectArrow from "@/components/forms/SelectArrow";

export default function EducationPage() {
  const [educations, setEducations] = useState([{ id: 1 }]);

  const addEducation = () => {
    setEducations((prev) => [...prev, { id: Date.now() }]);
  };

  const removeEducation = (id) => {
    setEducations((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">ការអប់រំ/បណ្តុះបណ្តាល</h2>

        <div className="mt-5 space-y-5">
          {educations.map((item) => (
            <EducationGroup key={item.id} canDelete={educations.length > 1} onDelete={() => removeEducation(item.id)} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button type="button" onClick={addEducation} className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
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

function EducationGroup({ canDelete, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <div className="grid grid-cols-3 gap-x-6 gap-y-5">
        <BoxFill label="សាលា ឬ ស្ថាប័ន" placeholder="បញ្ចូលឈ្មោះសាលា ឬ ស្ថាប័ន" />

        <FormSelect label="កម្រិត/ថ្នាក់" placeholder="ជ្រើសរើសកម្រិត" options={["បឋមសិក្សា", "មធ្យមសិក្សា", "បរិញ្ញាបត្រ", "អនុបណ្ឌិត", "បណ្ឌិត"]} />

        <FormSelect label="កម្រិត/ជំនាញ" placeholder="ជ្រើសរើសជំនាញ" options={["វិទ្យាសាស្ត្រ", "សង្គមសាស្ត្រ", "បច្ចេកវិទ្យា", "គ្រប់គ្រង", "ផ្សេងៗ"]} />

        <FormSelect label="ជំនាញឯកទេស" placeholder="ជ្រើសរើសជំនាញ" options={["ព័ត៌មានវិទ្យា", "គណនេយ្យ", "ច្បាប់", "គ្រប់គ្រង", "អប់រំ"]} />

        <div className="flex items-end">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90">
            <Link2 size={17} />
            តំណភ្ជាប់ឯកសារ
          </button>
        </div>

        <FormDate label="ថ្ងៃចាប់ផ្តើម" name="startDate" />
        <FormDate label="ថ្ងៃបញ្ចប់" name="endDate" />
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