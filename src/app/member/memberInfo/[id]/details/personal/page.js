"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";

export default function PersonalPage() {

  const fileRef = useRef(null);

  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFileName(file.name);
    }
  };


  return (
    <div className="space-y-4">

      <div className="rounded-xl border border-gray-200 bg-white p-6">

        <h2 className="text-lg font-bold text-primary">
          ព័ត៌មានផ្ទាល់ខ្លួន
        </h2>


        <div className="mt-6 grid grid-cols-3 gap-6">

          {/* FORM */}
          <div className="col-span-2 grid grid-cols-2 gap-5">

            <FormSelect
              label="ភាសា"
              placeholder="ភាសាខ្មែរ"
            />

            <FormSelect
              label="ភេទ"
              placeholder="សូមជ្រើស"
            />


            <FormInput
              label="អ៊ីមែល"
              placeholder="riya.dy.@example.com"
            />


            <FormInput
              label="លេខទូរស័ព្ទ"
              placeholder="0987654321"
            />


            <div className="col-span-2">

              <FormSelect
                label="សញ្ជាតិ"
                placeholder="សញ្ជាតិ"
              />

            </div>

          </div>



          {/* CV UPLOAD */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-text-primary">
              បញ្ចូល CV
            </label>


            <div className="flex h-[165px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">


              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <UploadCloud size={22} className="text-gray-400" />
              </div>



              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />


              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="text-sm font-semibold text-primary hover:underline"
              >
                បញ្ចូលឯកសារ
              </button>


              <p className="mt-2 text-xs text-gray-400">
                JPG, DOCX, PDF, PNG (មិនលើស 5MB)
              </p>


              {
                fileName && (
                  <p className="mt-2 max-w-[200px] truncate text-xs font-medium text-primary">
                    {fileName}
                  </p>
                )
              }


            </div>


          </div>


        </div>


      </div>



      <div className="flex justify-end">
        <SaveButton />
      </div>


    </div>
  );
}





function FormInput({label, placeholder}) {

  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>


      <input
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-600 outline-none focus:border-primary"
      />

    </div>
  );

}





function FormSelect({label, placeholder}) {

  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>


      <div className="relative">

        <select
          className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-500 outline-none focus:border-primary"
        >

          <option>
            {placeholder}
          </option>

        </select>



        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">

          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
          >

            <path
              d="M5 7L10 12L15 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          </svg>

        </div>


      </div>


    </div>
  );

}