"use client";

import { X, FileText, DownloadCloud } from "lucide-react";

export default function CompanyDocumentPreview({
  document,
  onClose,
}) {

  if (!document) return null;


  const handleDownload = async () => {
    if (!document.image) {
      console.error("No file available");
      return;
    }

    const response = await fetch(document.image);

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = window.document.createElement("a");

    link.href = url;

    link.download = `${document.title}.${document.type.toLowerCase()}`;

    window.document.body.appendChild(link);

    link.click();

    window.document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };


  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      onClick={onClose}
    >

      {/* center only content area after sidebar/topbar */}

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
        p-4
        "
      >

        <div
          onClick={(e)=>e.stopPropagation()}
          className="
          relative
          w-[520px]
          rounded-2xl
          bg-white
          p-5
          shadow-xl
          "
        >


          {/* Close */}

          <button
            onClick={onClose}
            className="
            absolute
            right-4
            top-4
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            hover:bg-gray-100
            "
          >
            <X size={17}/>
          </button>



          {/* Title */}

          <h2
            className="
            mb-4
            text-lg
            font-bold
            text-primary
            "
          >
            ឯកសារ
          </h2>




          {/* Information */}

          <div
            className="
            mb-4
            grid
            grid-cols-2
            gap-x-5
            gap-y-3
            rounded-xl
            bg-gray-50
            p-4
            "
          >

            <Info
              label="ឈ្មោះឯកសារ"
              value={document.title}
            />

            <Info
              label="សាខា"
              value={document.branch}
            />

            <Info
              label="កាលបរិច្ឆេទ"
              value={document.date}
            />

            <Info
              label="ទំហំ"
              value={document.size}
            />

            <Info
              label="ប្រភេទឯកសារ"
              value={document.type}
            />

          </div>





          {/* Preview */}

          <div
            className="
            flex
            h-[260px]
            items-center
            justify-center
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            "
          >

            {
              document.image ? (

                <img
                  src={document.image}
                  alt="document preview"
                  className="
                  h-full
                  w-full
                  object-contain
                  "
                  onError={(e)=>{
                    e.currentTarget.style.display="none";
                  }}
                />

              ) : (

                <div
                  className="
                  flex
                  flex-col
                  items-center
                  gap-2
                  text-gray-400
                  "
                >

                  <FileText size={50}/>

                  <span className="text-sm">
                    មិនមាន Preview
                  </span>

                </div>

              )
            }

          </div>






          {/* Download Button */}

          <button
            type="button"
            onClick={handleDownload}
            className="
            mt-4
            flex
            h-10
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-primary
            text-sm
            font-medium
            text-white
            hover:opacity-90
            "
          >

            <DownloadCloud size={16}/>

            ទាញយក

          </button>


        </div>


      </div>


    </div>
  );
}





function Info({
  label,
  value,
}) {

  return (

    <div>

      <p
        className="
        text-[11px]
        text-gray-400
        "
      >
        {label}
      </p>


      <p
        className="
        text-sm
        font-medium
        text-gray-700
        truncate
        "
      >
        {value || "-"}
      </p>


    </div>

  );

}