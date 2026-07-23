"use client";

import { X, FileText, DownloadCloud } from "lucide-react";

export default function CompanyDocumentPreview({
  document,
  onClose,
}) {

  if (!document) return null;


  return (
    <div
      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-4
      "
    >

      <div
        className="
        relative
        h-[60vh]
        w-[520px]
        rounded-xl
        bg-white
        p-4
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
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          border-2
          border-primary
          "
        >
          <X size={18}/>
        </button>



        {/* Title */}

        <h2
          className="
          mb-3
          text-lg
          font-bold
          text-[#4b3192]
          "
        >
          ឯកសារ
        </h2>




        {/* Information */}

        <div
          className="
          mb-3
          grid
          grid-cols-2
          gap-x-5
          gap-y-2
          rounded-lg
          bg-gray-50
          p-3
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
          h-[220px]
          items-center
          justify-center
          overflow-hidden
          rounded-lg
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





        {/* Download */}

        <button
          className="
          mt-3
          flex
          h-9
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-[#4b3192]
          text-sm
          font-medium
          text-white
          "
        >

          <DownloadCloud size={16}/>

          ទាញយក

        </button>


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