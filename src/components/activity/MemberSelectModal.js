"use client";

import { useMemo, useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import FilterBar from "@/components/table-items/FilterBar";

const members = [
  { id: 1, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 2, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 3, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 4, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 5, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 6, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 7, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 8, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 9, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 10, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 11, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 12, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 13, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 14, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 15, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 16, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 17, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 18, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 19, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 20, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 21, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 22, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 23, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 24, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 25, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 26, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 27, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 28, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 29, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 30, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 31, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 32, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 33, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 34, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 35, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 36, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 37, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 38, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 39, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 40, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 41, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 42, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 43, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 44, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 45, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 46, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 47, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 48, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" }
];


const roles = ["ប្រធាន", "លេខាធិការ", "សមាជិក"];

export default function MemberSelectModal({ onClose }) {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedDateValue = selectedDate ? selectedDate.toISOString().split("T")[0] : "";

    return members.filter((member) => {
      const matchesSearch = !q || member.name?.toLowerCase().includes(q) || member.email?.toLowerCase().includes(q);
      const matchesRole = selectedRole === "all" || member.role === selectedRole;
      const matchesDate = !selectedDate || member.joinedDateValue === selectedDateValue;

      return matchesSearch && matchesRole && matchesDate;
    });
  }, [query, selectedRole, selectedDate]);

  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every((member) => selected.includes(member.id));

  const toggle = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((current) => current.filter((id) => !filteredMembers.some((member) => member.id === id)));
    } else {
      setSelected((current) => [...new Set([...current, ...filteredMembers.map((member) => member.id)])]);
    }
  };

  const handleSave = () => {
    localStorage.setItem("activity-selected-members", JSON.stringify(selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5">
      <div className="w-full max-w-5xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={query ? "" : "ស្វែងរកសមាជិក..."} className="h-10 w-full rounded-lg border border-border bg-white pl-4 pr-10 text-sm outline-none" />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>

          <FilterBar filters={[{ key: "role", value: selectedRole, onChange: setSelectedRole, placeholder: "តួនាទី", options: roles }, { key: "date", value: selectedDate, onChange: setSelectedDate, placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ", type: "date" }]} />

          <span className="ml-auto whitespace-nowrap text-sm font-semibold text-text-primary">{selected.length}/{members.length} នាក់</span>
        </div>

        <div className="max-h-[430px] overflow-y-auto rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-[12px] text-text-secondary">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="h-11 border-b border-border font-medium text-text-secondary">
                <th className="w-[4%] text-center">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} />
                </th>
                <th className="w-[24%] text-left">ឈ្មោះអ្នកចូលរួម</th>
                <th className="w-[10%] text-center">ភេទ</th>
                <th className="w-[13%] text-center">តួនាទី</th>
                <th className="w-[15%] text-center">សាខា</th>
                <th className="w-[16%] text-center">ថ្ងៃ/ខែ/ឆ្នាំ</th>
                <th className="w-[13%] text-center">ស្ថានភាព</th>
                <th className="w-[5%] text-center">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => {
                const isSelected = selected.includes(member.id);

                return (
                  <tr key={member.id} className="h-12 border-b border-border text-text-secondary">
                    <td className="text-center">
                      <input type="checkbox" checked={isSelected} onChange={() => toggle(member.id)} />
                    </td>

                    <td>
                      <p className="font-medium text-text-primary">{member.name}</p>
                      <p className="text-[12px] text-text-secondary">{member.email}</p>
                    </td>

                    <td className="text-center">{member.gender}</td>
                    <td className="text-center">{member.role}</td>
                    <td className="text-center">{member.branch}</td>
                    <td className="text-center">{member.joinedDate}</td>

                    <td className="text-center">
                      <span className={`rounded-full px-3 py-1 text-[11px] ${isSelected ? "bg-success-bg text-success" : "bg-warning-bg text-warning"}`}>
                        {isSelected ? "បានចូលរួម" : "មិនបានចូលរួម"}
                      </span>
                    </td>

                    <td className="text-center">
                      <Eye size={16} className="mx-auto cursor-pointer text-primary" />
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-text-secondary">មិនមានទិន្នន័យសមាជិកទេ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={onClose} className="h-[34px] w-[91px] rounded-lg border border-border bg-white text-sm font-semibold text-text-secondary">បោះបង់</button>

          <button type="button" onClick={handleSave} className="flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-white">
            <Download size={16} />
            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}
