import { Eye, PencilLine, Trash2 } from "lucide-react";

export default function DocumentTable({
  activeTab,
  documents,
  currentPage,
  pageSize,
  onView,
  onEdit,
  onDelete,
}) {
  const isMember = activeTab === "member";

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full min-w-[980px] table-fixed border-collapse text-sm">
        <colgroup>
          {isMember ? (
            <>
              <col className="w-[6%]" />
              <col className="w-[10%]" />
              <col className="w-[16%]" />
              <col className="w-[11%]" />
              <col className="w-[8%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[12%]" />
              <col className="w-[7%]" />
            </>
          ) : (
            <>
              <col className="w-[6%]" />
              <col className="w-[10%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[14%]" />
              <col className="w-[7%]" />
              <col className="w-[18%]" />
            </>
          )}
        </colgroup>

        <thead className="sticky top-0 z-10 bg-[#f7f8fa] text-gray-500">
          <tr className="h-[42px] border-b border-gray-100">
            <th className="px-4 text-left font-medium">ល.រ</th>
            <th className="px-4 text-center font-medium">
              {isMember ? "រូបភាព" : "ឯកសារ"}
            </th>
            <th className="px-4 text-left font-medium">ឈ្មោះឯកសារ</th>

            {isMember ? (
              <>
                <th className="px-4 text-left font-medium">សមាជិក</th>
                <th className="px-4 text-left font-medium">ភេទ</th>
                <th className="px-4 text-left font-medium">សាខា</th>
                <th className="px-4 text-left font-medium">ថ្ងៃបញ្ចូល</th>
                <th className="px-4 text-left font-medium">ទំហំឯកសារ</th>
                <th className="px-4 text-center font-medium">ប្រភេទឯកសារ</th>
                <th className="px-4 text-center font-medium">សកម្មភាព</th>
              </>
            ) : (
              <>
                <th className="px-4 text-left font-medium">សាខា</th>
                <th className="px-4 text-left font-medium">ថ្ងៃបញ្ចូល</th>
                <th className="px-4 text-left font-medium">ទំហំឯកសារ</th>
                <th className="px-4 text-center font-medium">ប្រភេទ</th>
                <th className="px-4 text-center font-medium">សកម្មភាព</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {documents.map((doc, index) => (
            <tr
              key={doc.id}
              className="h-[42px] border-b border-gray-100 text-gray-600 hover:bg-gray-50"
            >
              <td className="px-4">
                {(currentPage - 1) * pageSize + index + 1}
              </td>

              <td className="px-4">
                <div
                  className={`mx-auto overflow-hidden border bg-white ${
                    isMember ? "h-[30px] w-[48px] rounded" : "h-[32px] w-[24px]"
                  }`}
                >
                  <img
                    src={doc.image}
                    alt={isMember ? "certificate" : "document"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </td>

              <td className="truncate px-4 text-gray-700">{doc.title}</td>

              {isMember ? (
                <>
                  <td className="truncate px-4">{doc.memberName}</td>
                  <td className="px-4">{doc.gender}</td>
                  <td className="truncate px-4">{doc.branch}</td>
                  <td className="px-4">{doc.date}</td>
                  <td className="px-4">{doc.size}</td>

                  <td className="px-4 text-center">
                    <span className="inline-flex h-[24px] min-w-[46px] items-center justify-center rounded bg-red-100 px-3 text-[11px] font-medium text-red-500">
                      {doc.type}
                    </span>
                  </td>

                  <td className="px-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => onView(doc)}
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="truncate px-4">{doc.branch}</td>
                  <td className="px-4">{doc.date}</td>
                  <td className="px-4">{doc.size}</td>

                  <td className="px-4 text-center">
                    <span className="inline-flex h-[24px] min-w-[46px] items-center justify-center rounded bg-red-100 px-3 text-[11px] font-medium text-red-500">
                      {doc.type}
                    </span>
                  </td>

                  <td className="px-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onView(doc)}
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onEdit(doc)}
                        className="text-yellow-500"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDelete(doc)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}

          {documents.length === 0 && (
            <tr>
              <td
                colSpan={isMember ? 10 : 8}
                className="py-10 text-center text-gray-500"
              >
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}