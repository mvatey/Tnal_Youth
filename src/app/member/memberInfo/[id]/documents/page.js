"use client";

import {
  FileText,
  Download,
  Eye,
  BadgeCheck,
} from "lucide-react";

const documents = [
  {
    id: 1,
    name: "លិខិតតែងតាំង",
    type: "PDF",
    uploadDate: "12 មករា 2026",
    status: "មាន",
  },
  {
    id: 2,
    name: "អត្តសញ្ញាណប័ណ្ណ",
    type: "JPG",
    uploadDate: "15 មករា 2026",
    status: "មាន",
  },
  {
    id: 3,
    name: "រូបថតសមាជិក",
    type: "PNG",
    uploadDate: "15 មករា 2026",
    status: "មាន",
  },
  {
    id: 4,
    name: "វិញ្ញាបនបត្រ",
    type: "PDF",
    uploadDate: "-",
    status: "មិនមាន",
  },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">
          ឯកសាររបស់សមាជិក
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          បង្ហាញឯកសារដែលបានផ្ទុករបស់សមាជិក។
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-6 py-4 text-left">
                ល.រ
              </th>

              <th className="px-6 py-4 text-left">
                ឈ្មោះឯកសារ
              </th>

              <th className="px-6 py-4 text-left">
                ប្រភេទ
              </th>

              <th className="px-6 py-4 text-left">
                កាលបរិច្ឆេទ
              </th>

              <th className="px-6 py-4 text-left">
                ស្ថានភាព
              </th>

              <th className="px-6 py-4 text-center">
                សកម្មភាព
              </th>

            </tr>

          </thead>

          <tbody>

            {documents.map((doc, index) => (

              <tr
                key={doc.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-6 py-4">
                  {index + 1}
                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <FileText className="w-4 h-4 text-primary" />

                    {doc.name}

                  </div>

                </td>

                <td className="px-6 py-4">
                  {doc.type}
                </td>

                <td className="px-6 py-4">
                  {doc.uploadDate}
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === "មាន"
                        ? "bg-success-bg text-success"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <BadgeCheck className="w-3 h-3" />

                    {doc.status}

                  </span>

                </td>

                <td className="px-6 py-4">

                  <div className="flex justify-center gap-2">

                    <button
                      className="p-2 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white transition"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="p-2 rounded-lg bg-success-bg text-success hover:bg-success hover:text-white transition"
                    >
                      <Download size={16} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}