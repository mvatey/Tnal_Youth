// app/variabl/page.js

"use client";

import { useMemo, useState } from "react";
import {
  SquarePlus,
  PlusCircle,
  Search,
  X,
  SquarePen
} from "lucide-react";

import { HiSaveAs } from "react-icons/hi";
import Button from "@/components/ui/Button";
import FormSelect from "@/components/forms/FormSelect";
import variableData from "@/data/variables.json";

const ALL_STATUS = "ALL";

const EMPTY_FORM = {
  code: "",
  nameKm: "",
  nameEn: "",
  status: "ACTIVE",
  description: "",
};

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex min-w-[68px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium ${
        isActive
          ? "bg-success-bg text-success"
          : "bg-error-bg text-error"
      }`}
    >
      {isActive ? "សកម្ម" : "អសកម្ម"}
    </span>
  );
}

export default function VariablePage() {
  const [types, setTypes] = useState(variableData.types);

  const [selectedTypeId, setSelectedTypeId] = useState(
    variableData.types[0]?.id || "",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState(ALL_STATUS);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const selectedType = useMemo(
    () =>
      types.find(
        (type) => type.id === selectedTypeId,
      ),
    [types, selectedTypeId],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (selectedType?.items || []).filter((item) => {
      const matchesSearch =
        !query ||
        item.nameKm?.toLowerCase().includes(query) ||
        item.nameEn?.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === ALL_STATUS ||
        item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [selectedType, searchQuery, selectedStatus]);

  function openCreateModal() {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

    function openEditModal(item) {
    setEditingItem(item);

    setForm({
        code: item.code || "",
        nameKm: item.nameKm || "",
        nameEn: item.nameEn || "",
        status: item.status || "ACTIVE",
        description: item.description || "",
    });

    setShowModal(true);
    }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  }

  function updateField(field) {
    return (event) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.nameKm.trim()) {
      return;
    }

    setTypes((previousTypes) =>
      previousTypes.map((type) => {
        if (type.id !== selectedTypeId) {
          return type;
        }

        if (editingItem) {
          return {
            ...type,
            items: type.items.map((item) =>
              item.id === editingItem.id
                ? {
                    ...item,
                    code: form.code.trim(),
                    nameKm: form.nameKm.trim(),
                    nameEn: form.nameEn.trim(),
                    status: form.status,
                    updatedAt:
                      new Intl.DateTimeFormat("km-KH", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date()),
                  }
                : item,
            ),
          };
        }

        const newItem = {
          id: Date.now(),
          code:
            form.code.trim() ||
            `VAR-${String(Date.now()).slice(-4)}`,
          nameKm: form.nameKm.trim(),
          nameEn: form.nameEn.trim(),
          status: form.status,
          createdAt: new Intl.DateTimeFormat("km-KH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date()),
          updatedAt: new Intl.DateTimeFormat("km-KH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date()),
        };

        return {
          ...type,
          items: [newItem, ...type.items],
        };
      }),
    );

    closeModal();
  }

  return (
    <div className="flex min-h-[calc(100vh-110px)] min-w-0 gap-5">
      {/* Left variable categories */}
      <aside className="w-[250px] shrink-0 rounded-xl border border-border bg-white p-3">
        <h2 className="px-3 py-2 text-lg font-semibold text-text-primary">
          ប្រភេទអថេរ
        </h2>

        <div className="mt-2 space-y-1">
          {types.map((type) => {
            const active =
              type.id === selectedTypeId;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedTypeId(type.id);
                  setSearchQuery("");
                  setSelectedStatus(ALL_STATUS);
                }}
                className={`flex w-full items-center justify-between rounded-lg border-l-2 px-3 py-3 text-left text-sm transition ${
                  active
                    ? "border-secondary bg-secondary-light text-secondary"
                    : "border-transparent text-text-secondary hover:bg-gray-50"
                }`}
              >
                <span className="truncate">
                  {type.label}
                </span>

                <span className="ml-3 inline-flex min-w-7 items-center justify-center rounded-md bg-primary-light px-2 py-1 text-[10px] text-primary">
                  {type.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right content */}
      <section className="min-w-0 flex-1">
        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-4">
            <h1 className="text-lg font-semibold text-text-primary">
              {selectedType?.label || "កំណត់អថេរ"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="ស្វែងរក..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <div className="w-[180px]">
                <FormSelect
                  name="variable-status-filter"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value,
                    )
                  }
                  options={[
                    {
                      label: "ប្រភេទ",
                      value: ALL_STATUS,
                    },
                    {
                      label: "សកម្ម",
                      value: "ACTIVE",
                    },
                    {
                      label: "អសកម្ម",
                      value: "INACTIVE",
                    },
                  ]}
                />
              </div>

              <Button
                type="button"
                variant="success"
                icon={<PlusCircle size={16} />}
                onClick={openCreateModal}
              >
                បង្កើតអថេរថ្មី
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-border">
                  <th className="w-[7%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                    ល.រ
                  </th>

                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-text-secondary">
                    ឈ្មោះប្រភេទ
                  </th>

                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-text-secondary">
                    ឈ្មោះជាអក្សរឡាតាំង
                  </th>

                  <th className="w-[12%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                    ស្ថានភាព
                  </th>

                  <th className="w-[14%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                    ថ្ងៃបង្កើត
                  </th>

                  <th className="w-[14%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                    ថ្ងៃកែប្រែ
                  </th>

                  <th className="w-[7%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                    សកម្មភាព
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <tr
                      key={`${selectedTypeId}-${item.id}`}
                      className="border-b border-border last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-center text-sm text-text-secondary">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 text-sm font-medium text-text-primary">
                        {item.nameKm || "-"}
                      </td>

                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {item.nameEn || "-"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status={item.status}
                        />
                      </td>

                      <td className="px-4 py-3 text-center text-xs text-text-secondary">
                        {item.createdAt || "-"}
                      </td>

                      <td className="px-4 py-3 text-center text-xs text-text-secondary">
                        {item.updatedAt || "-"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                            type="button" onClick={() => openEditModal(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-warning transition hover:bg-warning-bg"
                            aria-label="កែប្រែ">
                            <SquarePen size={19} strokeWidth={1.8} />
                            </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-text-secondary"
                    >
                      មិនមានទិន្នន័យអថេរទេ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Create/Edit modal */}
      {showModal && (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4"
            onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
                closeModal();
            }
            }}
        >
            <div className="w-full max-w-[580px] rounded-xl bg-white shadow-2xl">
            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-start justify-between px-7 pb-3 pt-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-text-secondary">
                    {editingItem
                        ? `កែប្រែប្រភេទ${selectedType?.label || "អថេរ"}`
                        : `បង្កើតប្រភេទ${selectedType?.label || "អថេរ"}`}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={closeModal}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-gray-100"
                    aria-label="បិទ"
                >
                    <X size={18} />
                </button>
                </div>

                {/* Form */}
                <div className="space-y-5 px-7 pb-7">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-text-primary">
                    ឈ្មោះប្រភេទជាភាសាខ្មែរ
                    </label>

                    <input
                    type="text"
                    value={form.nameKm}
                    onChange={updateField("nameKm")}
                    placeholder="បញ្ចូលឈ្មោះប្រភេទ"
                    className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-200
                        px-4
                        text-sm
                        leading-6
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-primary
                    "
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-text-primary">
                    ឈ្មោះជាភាសាអង់គ្លេស
                    </label>

                    <input
                    type="text"
                    value={form.nameEn}
                    onChange={updateField("nameEn")}
                    placeholder="Enter name"
                    className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-200
                        px-4
                        text-sm
                        leading-6
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-primary
                    "
                    />
                </div>

                <FormSelect
                    label="ស្ថានភាព"
                    name="variable-status"
                    value={form.status}
                    onChange={updateField("status")}
                    options={[
                    {
                        label: "សកម្ម",
                        value: "ACTIVE",
                    },
                    {
                        label: "អសកម្ម",
                        value: "INACTIVE",
                    },
                    ]}
                />

                <div>
                    <label className="mb-2 block text-sm font-semibold text-text-primary">
                    ពិពណ៌នា
                    </label>

                    <textarea
                    value={form.description}
                    onChange={updateField("description")}
                    placeholder="សរសេរពិពណ៌នាអំពីប្រភេទអថេរនេះ..."
                    rows={4}
                    className="
                        min-h-[125px]
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-gray-200
                        px-4
                        py-3
                        text-sm
                        leading-6
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-primary
                    "
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                    type="button"
                    onClick={closeModal}
                    className="
                        flex
                        h-11
                        w-[120px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-border
                        bg-gray-50
                        text-sm
                        font-semibold
                        text-text-secondary
                        transition
                        hover:bg-gray-100
                    "
                    >
                    បោះបង់
                    </button>

                    <button
                    type="submit"
                    className="
                        flex
                        h-11
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-secondary
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:opacity-90
                    "
                    >
                    {editingItem ? (
                        <HiSaveAs size={17} />
                    ) : (
                        <SquarePlus size={17}/>
                    )}

                    {editingItem
                        ? "រក្សាទុក"
                        : "បង្កើត"}
                    </button>
                </div>
                </div>
            </form>
            </div>
        </div>
        )}
    </div>
  );
}