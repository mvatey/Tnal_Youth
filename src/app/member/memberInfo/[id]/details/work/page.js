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

function createEmptyWork() {
  return {
    id: `work-${Date.now()}-${Math.random()}`,
    company: "",
    address: "",
    position: "",
    appointment: "",
    startDate: "",
    endDate: "",
  };
}

export default function WorkPage() {
  const params = useParams();
  const memberId = String(params?.id ?? "");
  const [member, setMember] = useState(null);
  const [works, setWorks] = useState([]);

  useEffect(() => {
    const selectedMember = membersData.find((item) => String(item.id) === memberId);

    if (!selectedMember) {
      setMember(null);
      setWorks([]);
      return;
    }

    setMember(selectedMember);

    if (Array.isArray(selectedMember.workHistory) && selectedMember.workHistory.length > 0) {
      setWorks(selectedMember.workHistory);
    } else {
      setWorks([createEmptyWork()]);
    }
  }, [memberId]);

  function handleWorkChange(id, field, value) {
    setWorks((previousWorks) => previousWorks.map((work) => work.id === id ? { ...work, [field]: value } : work));
  }

  function addWork() {
    setWorks((previousWorks) => [...previousWorks, createEmptyWork()]);
  }

  function removeWork(id) {
    setWorks((previousWorks) => {
      if (previousWorks.length === 1) return previousWorks;
      return previousWorks.filter((work) => work.id !== id);
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const updatedMember = {
      ...member,
      workHistory: works,
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
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">ប្រវត្តិការងារ</h2>

        <div className="mt-6 space-y-6">
          {works.map((work, index) => (
            <div key={work.id} className="rounded-xl border border-gray-300 p-6">
              <h3 className="mb-5 text-sm font-semibold text-text-primary">ប្រវត្តិការងារ ទី {index + 1}</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <BoxFill label="ឈ្មោះ ស្ថាប័ន" placeholder="បញ្ចូលឈ្មោះស្ថាប័ន" value={work.company} onChange={(event) => handleWorkChange(work.id, "company", event.target.value)} />

                <BoxFill label="អាស័យដ្ឋាន" placeholder="បញ្ចូលអាស័យដ្ឋាន" value={work.address} onChange={(event) => handleWorkChange(work.id, "address", event.target.value)} />

                <FormSelect label="តួនាទី" placeholder="ជ្រើសរើសតួនាទី" value={work.position} onChange={(event) => handleWorkChange(work.id, "position", event.target.value)} options={["ពេញម៉ោង", "ក្រៅម៉ោង", "កិច្ចសន្យា", "ស្ម័គ្រចិត្ត"]} />

                <FormSelect label="ការតែងតាំងមុខតំណែង" placeholder="ជ្រើសរើសការតែងតាំង" value={work.appointment} onChange={(event) => handleWorkChange(work.id, "appointment", event.target.value)} options={["បញ្ចប់កិច្ចសន្យា", "ផ្លាស់ប្ដូរការងារ", "បន្តការសិក្សា", "ផ្សេងៗ"]} />

                <FormDate label="ថ្ងៃខែចាប់ផ្ដើម" name={`startDate-${work.id}`} value={work.startDate} onChange={(event) => handleWorkChange(work.id, "startDate", event.target.value)} />

                <FormDate label="ថ្ងៃខែបញ្ចប់" name={`endDate-${work.id}`} value={work.endDate} onChange={(event) => handleWorkChange(work.id, "endDate", event.target.value)} />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton canDelete={works.length > 1} onClick={() => removeWork(work.id)} />
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
    </form>
  );
}