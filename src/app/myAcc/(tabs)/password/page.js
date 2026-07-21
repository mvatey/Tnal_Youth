"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CircleCheck,
  Info,
} from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";

export default function PasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          ផ្លាស់ប្ដូរពាក្យសម្ងាត់
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី ដើម្បីការពារគណនីរបស់អ្នក!!!
        </p>
      </div>


      <div className="grid grid-cols-[1fr_360px] gap-8">


        <div className="space-y-5">

          <BoxFill
            label="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
            show={showCurrent}
            setShow={setShowCurrent}
          />


          <BoxFill
            label="ពាក្យសម្ងាត់ថ្មី"
            show={showNew}
            setShow={setShowNew}
          />


          <BoxFill
            label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
            show={showConfirm}
            setShow={setShowConfirm}
          />


          <div className="flex justify-end pt-3">
            <SaveButton />
          </div>


        </div>



        <div className="h-fit rounded-xl border border-warning bg-white p-5">


          <div className="mb-5 flex items-center gap-3">


            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-bg">

              <Info
                className="text-warning"
                size={22}
              />

            </div>


            <h3 className="text-base font-semibold text-text-primary">
              គន្លឹះសុវត្ថិភាព
            </h3>


          </div>



          <div className="space-y-4">

            <Rule text="មានអក្សរយ៉ាងហោចណាស់ ៨ តួ" />

            <Rule text="មានតួអក្សរពិសេស (!@#$%^&*)" />

            <Rule text="មានលេខ (0-9)" />

            <Rule text="មានអក្សរធំ និងអក្សរតូច" />

          </div>


        </div>


      </div>


    </div>
  );
}



function BoxFill({ label, show, setShow }) {

  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>


      <div className="relative">


        <Lock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />


        <input
          type={show ? "text" : "password"}
          placeholder="បញ្ចូលពាក្យសម្ងាត់"
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-primary"
        />


        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >

          {show ? (
            <EyeOff size={18}/>
          ) : (
            <Eye size={18}/>
          )}

        </button>


      </div>


    </div>
  );

}




function Rule({ text }) {

  return (

    <div className="flex items-center gap-3">


      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-warning">

        <CircleCheck
          size={14}
          className="text-warning"
        />

      </div>


      <p className="text-sm font-medium text-text-primary">
        {text}
      </p>


    </div>

  );

}