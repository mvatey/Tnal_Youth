"use client";

import { HandHeart, CalendarDays, Receipt, DollarSign } from "lucide-react";

const donationData = [
  {
    id: 1,
    date: "12 មករា 2026",
    type: "បរិច្ចាគថវិកា",
    amount: "$50",
    receipt: "RC-0001",
    status: "បានទូទាត់",
  },
  {
    id: 2,
    date: "20 កុម្ភៈ 2026",
    type: "បរិច្ចាគសម្ភារៈ",
    amount: "$80",
    receipt: "RC-0002",
    status: "បានទូទាត់",
  },
  {
    id: 3,
    date: "18 មីនា 2026",
    type: "បរិច្ចាគថវិកា",
    amount: "$30",
    receipt: "RC-0003",
    status: "កំពុងរង់ចាំ",
  },
];

export default function DonationPage() {
  const totalDonation = donationData.reduce((sum, item) => {
    return sum + Number(item.amount.replace("$", ""));
  }, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            ប្រវត្តិការបរិច្ចាគ
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            បង្ហាញព័ត៌មានអំពីការបរិច្ចាគរបស់សមាជិក។
          </p>
        </div>

        <div className="bg-primary text-white rounded-xl px-5 py-3">
          <p className="text-xs opacity-80">
            សរុបការបរិច្ចាគ
          </p>

          <h3 className="text-2xl font-bold">
            ${totalDonation}
          </h3>
        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-6 py-4 text-left">ល.រ</th>

              <th className="px-6 py-4 text-left">កាលបរិច្ឆេទ</th>

              <th className="px-6 py-4 text-left">ប្រភេទ</th>

              <th className="px-6 py-4 text-left">ចំនួន</th>

              <th className="px-6 py-4 text-left">បង្កាន់ដៃ</th>

              <th className="px-6 py-4 text-left">ស្ថានភាព</th>

            </tr>

          </thead>

          <tbody>

            {donationData.map((item, index) => (

              <tr
                key={item.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-6 py-4">
                  {index + 1}
                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <CalendarDays className="w-4 h-4 text-primary" />

                    {item.date}

                  </div>

                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <HandHeart className="w-4 h-4 text-primary" />

                    {item.type}

                  </div>

                </td>

                <td className="px-6 py-4 font-semibold">

                  <div className="flex items-center gap-2">

                    <DollarSign className="w-4 h-4 text-success" />

                    {item.amount}

                  </div>

                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <Receipt className="w-4 h-4 text-primary" />

                    {item.receipt}

                  </div>

                </td>

                <td className="px-6 py-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "បានទូទាត់"
                        ? "bg-success-bg text-success"
                        : "bg-warning-bg text-warning"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}