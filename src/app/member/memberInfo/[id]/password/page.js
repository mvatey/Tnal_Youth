"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  CircleCheck,
  Info,
} from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";

export default function PasswordPage() {
  const { id } = useParams();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/members/${encodeURIComponent(id)}/account/status`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load account status.");
        }
        return response.json();
      })
      .then(setAccountStatus)
      .catch((loadError) => setError(loadError.message));
  }, [id]);

  async function handleSave() {
    setError("");
    if (newPassword !== confirmPassword) {
      setError("ពាក្យសម្ងាត់បញ្ជាក់មិនត្រូវគ្នា។");
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setError("ពាក្យសម្ងាត់ថ្មីមិនទាន់បំពេញលក្ខខណ្ឌសុវត្ថិភាព។");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/backend/members/${encodeURIComponent(id)}/account/password`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword, confirmPassword }),
        },
      );
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.message || "Unable to reset this member password.");
      }
      setAccountStatus(await response.json());
      setNewPassword("");
      setConfirmPassword("");
      alert("ផ្លាស់ប្ដូរពាក្យសម្ងាត់បានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "Unable to reset this member password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          ផ្លាស់ប្ដូរពាក្យសម្ងាត់
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី ដើម្បីការពារគណនីរបស់អ្នក!!!
        </p>
        {accountStatus && (
          <p className="mt-2 text-xs text-gray-500">
            {accountStatus.email || accountStatus.phone || "-"} · {accountStatus.status || "-"}
          </p>
        )}
      </div>


      <div className="grid grid-cols-[1fr_360px] gap-8">


        <div className="space-y-5">

          <BoxFill
            label="ពាក្យសម្ងាត់ថ្មី"
            show={showNew}
            setShow={setShowNew}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />


          <BoxFill
            label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
            show={showConfirm}
            setShow={setShowConfirm}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />


          <div className="flex justify-end pt-3">
            {error && <p className="mr-4 self-center text-sm text-red-600">{error}</p>}
            <SaveButton onClick={handleSave} disabled={isSaving} />
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



function BoxFill({ label, show, setShow, value, onChange }) {

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
          value={value}
          onChange={onChange}
          placeholder="បញ្ចូលពាក្យសម្ងាត់"
          className="h-[34px] w-full rounded-lg border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-primary"
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
