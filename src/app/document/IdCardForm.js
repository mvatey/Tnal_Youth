"use client";

import { FolderPlus } from "lucide-react";

import IdCard from "@/components/card/idCard";
import FormSelect from "@/components/forms/FormSelect";
import BoxFill from "@/components/forms/boxFill";

import users from "@/data/users.json";

const USER_OPTIONS = users.map((user) => ({
  label: user.name_kh,
  value: String(user.id),
}));

export default function IdCardForm({
  form,
  setForm,
  onSave,
  onClose,
}) {
  const selectedUser = users.find(
    (user) => String(user.id) === String(form.userId),
  );

  const handleUserChange = (event) => {
    const selectedId = event.target.value;

    const user = users.find(
      (item) => String(item.id) === String(selectedId),
    );

    if (!user) {
      setForm((previous) => ({
        ...previous,
        userId: "",
        member: "",
        gender: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        branch: "",
        role: "member",
        profilePhoto: "/member.png",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      userId: String(user.id),
      member: user.name_kh || "",
      memberNameEn: user.name_en || "",
      gender: user.gender || "",
      email: user.email || "",
      phone: user.phone || "",
      dateOfBirth: user.date_of_birth || "",
      branch: user.branch || "",
      role: user.role || "member",
      profilePhoto: user.profile_photo || "/member.png",
    }));
  };

  const handleSave = () => {
  if (!form.userId) {
    alert("សូមជ្រើសរើសសមាជិក");
    return;
  }

  alert("✅ បង្កើតប័ណ្ណសមាជិកដោយជោគជ័យ!");

  onSave?.({
    ...form,
    selectedUser,
  });
};

  const cardUser = selectedUser
    ? {
        id: selectedUser.id,
        name_kh: selectedUser.name_kh,
        name_en: selectedUser.name_en,
        gender: selectedUser.gender,
        email: selectedUser.email,
        phone: selectedUser.phone,
        date_of_birth: selectedUser.date_of_birth,
        branch: selectedUser.branch,
        role: selectedUser.role,
        profile_photo:
          selectedUser.profile_photo || "/profile.png",
      }
    : {
        id: "",
        name_kh: "ឈ្មោះសមាជិក",
        name_en: "",
        gender: "-",
        email: "-",
        phone: "-",
        date_of_birth: "-",
        branch: "-",
        role: "member",
        profile_photo: "/member.png",
      };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* LEFT FORM */}
        <div className="space-y-4">
          <FormSelect
            label="ឈ្មោះសមាជិក"
            name="userId"
            value={form.userId || ""}
            onChange={handleUserChange}
            placeholder="ជ្រើសរើសសមាជិក"
            options={USER_OPTIONS}
          />

          <BoxFill
            label="ភេទ"
            name="gender"
            value={form.gender || ""}
            placeholder="ភេទ"
            readOnly
          />

          <BoxFill
            label="អ៊ីមែល"
            name="email"
            type="email"
            value={form.email || ""}
            placeholder="អ៊ីមែល"
            readOnly
          />

          <BoxFill
            label="លេខទូរស័ព្ទ"
            name="phone"
            value={form.phone || ""}
            placeholder="លេខទូរស័ព្ទ"
            readOnly
          />

          <BoxFill
            label="ថ្ងៃខែឆ្នាំកំណើត"
            name="dateOfBirth"
            value={form.dateOfBirth || ""}
            placeholder="ថ្ងៃខែឆ្នាំកំណើត"
            readOnly
          />

          <BoxFill
            label="សាខា"
            name="branch"
            value={form.branch || ""}
            placeholder="សាខា"
            readOnly
          />
        </div>

        {/* RIGHT CARD PREVIEW */}
        <div className="min-w-0">
          <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-5">
            <IdCard user={cardUser} />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
                h-10
                w-[120px]
                rounded-lg
                border
                border-gray-200
                bg-white
                text-sm
                transition
                hover:bg-gray-50
              "
            >
              បោះបង់
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!form.userId}
              className="
                flex
                h-10
                w-[180px]
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-primary
                text-sm
                font-medium
                text-white
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FolderPlus size={18} />
              បង្កើតប័ណ្ណ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}