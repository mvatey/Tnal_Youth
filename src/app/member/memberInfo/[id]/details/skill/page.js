"use client";

import { useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";

export default function SkillPage() {
  const [skills, setSkills] = useState([{ id: 1 }]);
  const [languages, setLanguages] = useState([{ id: 1 }]);

  const addSkill = () => {
    setSkills([...skills, { id: Date.now() }]);
  };

  const removeSkill = (id) => {
    if (skills.length === 1) return;

    setSkills(skills.filter((item) => item.id !== id));
  };

  const addLanguage = () => {
    setLanguages([...languages, { id: Date.now() }]);
  };

  const removeLanguage = (id) => {
    if (languages.length === 1) return;

    setLanguages(languages.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">ការប្រើប្រាស់ជំនាញបច្ចេកទេស</h2>

        <div className="mt-5 space-y-5">
          {skills.map((item) => (
            <SkillGroup key={item.id} canDelete={skills.length > 1} onDelete={() => removeSkill(item.id)} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={addSkill} className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <RiAddCircleLine size={17} />
            បន្ថែម
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-primary">ការប្រើប្រាស់ភាសាបរទេស</h2>

        <div className="mt-5 space-y-5">
          {languages.map((item) => (
            <LanguageGroup key={item.id} canDelete={languages.length > 1} onDelete={() => removeLanguage(item.id)} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={addLanguage} className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
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

function SkillGroup({ canDelete, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <div className="grid grid-cols-5 gap-5">
        <FormSelect label="កម្រិត" placeholder="ជ្រើសរើសកម្រិត" />
        <FormSelect label="ការប្រើប្រាស់" placeholder="ជ្រើសរើសការប្រើប្រាស់" />
        <FormSelect label="ការអាន" placeholder="ជ្រើសរើសការអាន" />
        <FormSelect label="ការសរសេរ" placeholder="ជ្រើសរើសការសរសេរ" />
        <FormSelect label="ការស្តាប់" placeholder="ជ្រើសរើសការស្តាប់" />
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

function LanguageGroup({ canDelete, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-300 p-6">
      <div className="grid grid-cols-2 gap-6">
        <FormSelect label="ភាសា" placeholder="ជ្រើសរើសភាសា" />
        <FormSelect label="កម្រិតជំនាញ" placeholder="ជ្រើសរើសកម្រិតជំនាញ" />
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

function FormSelect({ label, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>

      <div className="relative">
        <select className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-500 outline-none focus:border-primary">
          <option>{placeholder}</option>
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