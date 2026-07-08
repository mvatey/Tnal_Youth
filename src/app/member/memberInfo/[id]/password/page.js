"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function PasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">
          ផ្លាស់ប្ដូរពាក្យសម្ងាត់
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី ដើម្បីការពារគណនីរបស់សមាជិក។
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">

        <div className=" space-y-6">

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ពាក្យសម្ងាត់បច្ចុប្បន្ន
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

              <input
                type={showCurrent ? "text" : "password"}
                placeholder="********"
                className="w-full border rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3"
              >
                {showCurrent ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>
          </div>

          {/* New Password */}
          <div>

            <label className="block text-sm font-medium mb-2">
              ពាក្យសម្ងាត់ថ្មី
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

              <input
                type={showNew ? "text" : "password"}
                placeholder="********"
                className="w-full border rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3"
              >
                {showNew ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div>

            <label className="block text-sm font-medium mb-2">
              បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

              <input
                type={showConfirm ? "text" : "password"}
                placeholder="********"
                className="w-full border rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3"
              >
                {showConfirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* Password Tips */}

          <div className="rounded-lg bg-primary-light p-4">

            <div className="flex gap-3">

              <ShieldCheck className="text-primary mt-1" />

              <div>

                <p className="font-medium">
                  គន្លឹះសុវត្ថិភាព
                </p>

                <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>យ៉ាងហោចណាស់ ៨ តួអក្សរ</li>
                  <li>មានអក្សរធំ និងអក្សរតូច</li>
                  <li>មានលេខ និងនិមិត្តសញ្ញា</li>
                  <li>កុំប្រើពាក្យសម្ងាត់ចាស់</li>
                </ul>

              </div>

            </div>

          </div>

          {/* Save Button */}

          <div className="flex justify-end">

            <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90">

              <Save size={18} />

              រក្សាទុក

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}