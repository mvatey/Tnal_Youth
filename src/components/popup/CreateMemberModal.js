"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

import BoxFill from "@/components/forms/boxFill";
import memberOptions from "@/data/donation/memberOptions.json";

const { genderOptions, roleOptions, statusOptions } = memberOptions;

const LEVEL_OPTIONS = ["1", "2", "3", "4", "5"];

const EMPTY_FORM = {
  nameKh: "",
  nameEn: "",
  gender: "",
  status: "",
  phone: "",
  email: "",
  branch: "",
  role: "",
  dob: "",
  joinedAt: "",
  level: "",
};

export default function CreateMemberModal({
  open,
  onClose,
  onSave,
  branches = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;


  const update = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };


  const submit = (e) => {
    e.preventDefault();

    onSave?.(form);
  };


  return createPortal(

    <div
      className="
      fixed
      inset-0
      z-50
      bg-black/40
      "
      onClick={onClose}
    >

      {/* CENTER ONLY FREE CONTENT AREA */}
      <div
        className="
        fixed
        left-64
        top-16
        right-0
        bottom-0
        flex
        items-center
        justify-center
        px-4
        py-5
        overflow-y-auto
        "
      >

        <div
          onClick={(e)=>e.stopPropagation()}
          className="
          w-full
          max-w-md
          rounded-2xl
          bg-white
          p-5
          shadow-xl
          "
        >

          {/* HEADER */}

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-lg font-bold text-primary">
              បង្កើតសមាជិកថ្មី
            </h2>


            <button
              type="button"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100 p-1"
            >
              <X size={18}/>
            </button>

          </div>



          <form onSubmit={submit}>


            <div
              className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
              "
            >


              <BoxFill
                label="ឈ្មោះជាភាសាខ្មែរ"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.nameKh}
                onChange={update("nameKh")}
              />


              <BoxFill
                label="ឈ្មោះជាអក្សរឡាតាំង"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.nameEn}
                onChange={update("nameEn")}
              />



              <BoxFill
                label="ភេទ"
                type="select"
                placeholder="ជ្រើសរើសភេទ"
                options={genderOptions}
                value={form.gender}
                onChange={update("gender")}
              />


              <BoxFill
                label="ស្ថានភាព"
                type="select"
                placeholder="ជ្រើសរើសស្ថានភាព"
                options={statusOptions}
                value={form.status}
                onChange={update("status")}
              />



              <BoxFill
                label="លេខទូរស័ព្ទ"
                placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                value={form.phone}
                onChange={update("phone")}
              />


              <BoxFill
                label="អ៊ីមែល"
                placeholder="បញ្ចូលអ៊ីមែល"
                value={form.email}
                onChange={update("email")}
              />



              <BoxFill
                label="សាខា"
                type="select"
                placeholder="ជ្រើសរើសសាខា"
                options={branches.map((b)=>({
                  label:b.label ?? b,
                  value:b.value ?? b,
                }))}
                value={form.branch}
                onChange={update("branch")}
              />



              <BoxFill
                label="តួនាទី"
                type="select"
                placeholder="ជ្រើសរើសតួនាទី"
                options={roleOptions}
                value={form.role}
                onChange={update("role")}
              />



              <BoxFill
                label="ថ្ងៃខែឆ្នាំកំណើត"
                type="date"
                value={form.dob}
                onChange={update("dob")}
              />


              <BoxFill
                label="ថ្ងៃខែឆ្នាំចូលរួម"
                type="date"
                value={form.joinedAt}
                onChange={update("joinedAt")}
              />



              <BoxFill
                label="កាំ"
                type="select"
                placeholder="ជ្រើសរើសកាំ"
                options={LEVEL_OPTIONS.map((x)=>({
                  label:`កាំ ${x}`,
                  value:x,
                }))}
                value={form.level}
                onChange={update("level")}
              />


            </div>



            <div className="mt-5 flex gap-2">


              <button
                type="button"
                onClick={onClose}
                className="
                rounded-full
                bg-gray-100
                px-5
                py-2
                text-xs
                "
              >
                បោះបង់
              </button>



              <button
                type="submit"
                className="
                flex-1
                flex
                items-center
                justify-center
                gap-2
                rounded-full
                bg-primary
                py-2
                text-xs
                text-white
                "
              >
                <HiSaveAs size={16}/>
                រក្សាទុក
              </button>


            </div>


          </form>


        </div>


      </div>


    </div>,

    document.body
  );
}