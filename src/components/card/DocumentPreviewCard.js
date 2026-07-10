"use client";

import { RiDownloadCloud2Line } from "react-icons/ri";


function downloadCsv(data, filename) {
  if (!data || data.length === 0) return;


  const headers = Object.keys(data[0]);

  const rows = data.map((row) =>
    headers.map((h) => row[h])
  );


  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) =>
          `"${String(cell ?? "").replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");


  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );


  const url = URL.createObjectURL(blob);


  const link = document.createElement("a");

  link.href = url;
  link.download = filename || "document.csv";


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);


  URL.revokeObjectURL(url);
}



export default function DocumentPreviewCard({
  title,
  children,
  data = [],
  filename = "document.csv",
  previewClass = "",
}) {


  return (
    <div
      className="
        w-[380px]
        rounded-xl
        border
        border-gray-200
        bg-[#f8f9fc]
        p-3
        shadow-sm
      "
    >


      {/* TITLE */}
      <h2
        className="
          text-base
          font-bold
          text-primary
        "
      >
        {title}
      </h2>



      {/* DOCUMENT PREVIEW */}
      <div
        className="
          mt-3
          flex
          h-[190px]
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-lg
          bg-white
          p-2
        "
      >

        <div
          className={`
            flex
            items-center
            justify-center
            ${previewClass}
          `}
        >
          {children}
        </div>

      </div>




      {/* INFORMATION */}
      <div
        className="
          mt-3
          space-y-2
          text-xs
        "
      >

        <div className="flex justify-between">
          <span className="text-text-secondary">
            ប្រភេទ
          </span>

          <span className="font-semibold">
            ឯកសារ
          </span>
        </div>



        <div className="flex justify-between">
          <span className="text-text-secondary">
            លេខ
          </span>

          <span className="font-semibold">
            00009
          </span>
        </div>



        <div className="flex justify-between">
          <span className="text-text-secondary">
            កាលបរិច្ឆេទ
          </span>

          <span className="font-semibold">
            30 មិថុនា 2026
          </span>
        </div>


      </div>





      {/* DOWNLOAD BUTTON */}
      <button
        onClick={() => downloadCsv(data, filename)}
        className="
          mt-4
          flex
          h-9
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-secondary
          text-xs
          font-semibold
          text-white
          transition
          hover:bg-secondary-hover
        "
      >

        <RiDownloadCloud2Line size={15}/>

        ទាញយក

      </button>



    </div>
  );
}