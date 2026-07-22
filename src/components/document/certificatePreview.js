"use client";

import {
  X,
  DownloadCloud,
} from "lucide-react";


export default function CertificatePreview({
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
        w-[380px]
        rounded-xl
        bg-white
        px-6
        py-5
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
          border
          "

        >

          <X size={16}/>

        </button>








        {/* Title */}

        <h2
          className="
          mb-5
          text-lg
          font-bold
          text-[#4b3192]
          "
        >

          កែសម្រួលឯកសារ

        </h2>








        {/* Image */}

        <div
          className="
          flex
          justify-center
          "
        >

          <img

            src={
              document.image ||
              "/certificate.jpg"
            }

            alt="certificate"

            className="
            h-[180px]
            w-[280px]
            rounded-lg
            object-contain
            "
          />

        </div>








        {/* Information */}

        <div
          className="
          mt-5
          space-y-3
          "
        >


          <Info
            label="ឈ្មោះសមាជិក"
            value={document.memberName}
          />



          <Info
            label="ភេទ"
            value={document.gender}
          />



          <Info
            label="កាលបរិច្ឆេទ"
            value={document.date}
          />



          <Info
            label="ប្រភេទ"
            value={document.type}
          />



        </div>








        {/* Download */}

        <button

          className="
          mt-5
          flex
          h-10
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
  value
}) {


  return (

    <div
      className="
      grid
      grid-cols-[120px_1fr]
      items-center
      "
    >


      <p
        className="
        text-xs
        text-gray-500
        "
      >

        {label}

      </p>



      <p
        className="
        text-sm
        font-medium
        text-gray-700
        "
      >

        {value || "-"}

      </p>


    </div>

  );

}