"use client";

import { useEffect, useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import useCurrentMember from "@/hooks/useCurrentMember";

import SaveButton from "@/components/forms/SaveButton";
import DeleteButton from "@/components/forms/DeleteButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import FormSelect from "@/components/forms/FormSelect";

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

export default function MyAccountWorkPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [works, setWorks] = useState([]);

  useEffect(() => {
    if (!member) {
      setWorks([]);
      return;
    }

    const history = Array.isArray(member.workHistory)
      ? member.workHistory
      : [];

    setWorks(
      history.length > 0
        ? history
        : [createEmptyWork()],
    );
  }, [member]);

  const updateWork = (id, field, value) => {
    setWorks((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const removeWork = (id) => {
    setWorks((previous) =>
      previous.length === 1
        ? previous
        : previous.filter(
            (item) => item.id !== id,
          ),
    );
  };

  const handleSave = () => {
    console.log("Member ID:", member?.id);
    console.log("Updated work history:", works);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return <NotFound />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">
          ប្រវត្តិការងារ
        </h2>

        <div className="mt-6 space-y-6">
          {works.map((work, index) => (
            <div
              key={work.id}
              className="rounded-xl border border-gray-300 p-6"
            >
              <h3 className="mb-5 text-sm font-semibold text-text-primary">
                ប្រវត្តិការងារ ទី {index + 1}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <BoxFill
                  label="ឈ្មោះ ស្ថាប័ន"
                  value={work.company || ""}
                  onChange={(event) =>
                    updateWork(
                      work.id,
                      "company",
                      event.target.value,
                    )
                  }
                  placeholder="បញ្ចូលឈ្មោះស្ថាប័ន"
                />

                <BoxFill
                  label="អាសយដ្ឋាន"
                  value={work.address || ""}
                  onChange={(event) =>
                    updateWork(
                      work.id,
                      "address",
                      event.target.value,
                    )
                  }
                  placeholder="បញ្ចូលអាសយដ្ឋាន"
                />

                <FormSelect
                  label="តួនាទី"
                  value={work.position || ""}
                  onChange={(event) =>
                    updateWork(
                      work.id,
                      "position",
                      event.target.value,
                    )
                  }
                  placeholder="ជ្រើសរើសតួនាទី"
                  options={[
                    "ពេញម៉ោង",
                    "ក្រៅម៉ោង",
                    "កិច្ចសន្យា",
                    "ស្ម័គ្រចិត្ត",
                  ]}
                />

                <FormSelect
                  label="មូលហេតុចាកចេញ"
                  value={work.appointment || ""}
                  onChange={(event) =>
                    updateWork(
                      work.id,
                      "appointment",
                      event.target.value,
                    )
                  }
                  placeholder="ជ្រើសរើសមូលហេតុ"
                  options={[
                    "បញ្ចប់កិច្ចសន្យា",
                    "ផ្លាស់ប្ដូរការងារ",
                    "បន្តការសិក្សា",
                    "ផ្សេងៗ",
                  ]}
                />

                <FormDate
                  label="ថ្ងៃចាប់ផ្ដើម"
                  name={`work-start-${work.id}`}
                  value={work.startDate || ""}
                  onChange={(event) =>
                    updateWork(
                      work.id,
                      "startDate",
                      event.target.value,
                    )
                  }
                />

                <FormDate
                  label="ថ្ងៃបញ្ចប់"
                  name={`work-end-${work.id}`}
                  value={work.endDate || ""}
                  onChange={(event) =>
                    updateWork(
                      work.id,
                      "endDate",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="mt-6 flex justify-end">
                <DeleteButton
                  canDelete={works.length > 1}
                  onClick={() =>
                    removeWork(work.id)
                  }
                />
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setWorks((previous) => [
                  ...previous,
                  createEmptyWork(),
                ])
              }
              className="inline-flex items-center gap-2 rounded-lg bg-success px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              <RiAddCircleLine size={18} />
              បន្ថែម
            </button>
          </div>
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
      <p className="text-sm text-red-500">
        រកមិនឃើញព័ត៌មានសមាជិក
      </p>
    </div>
  );
}