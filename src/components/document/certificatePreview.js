"use client";

import {
  X,
  DownloadCloud,
} from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";


export default function CertificatePreview({
  document,
  onClose,
}) {


  if (!document) return null;



  const handleDownload = async () => {

    const imageUrl =
      document.image || "/certificate.jpg";


    try {

      const response = await fetch(imageUrl);

      const blob = await response.blob();


      const url =
        window.URL.createObjectURL(blob);



      const link =
        window.document.createElement("a");


      link.href = url;


      link.download =
        `${document.memberName || "certificate"}.jpg`;



      window.document.body.appendChild(link);


      link.click();


      window.document.body.removeChild(link);


      window.URL.revokeObjectURL(url);


    } catch (error) {

      console.error(
        "Download failed:",
        error
      );

    }

  };





  return (

    <PopupCard
      size="sm"
      onClose={onClose}
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

        <X size={16}/>

      </button>





      {/* Title */}

      <h2
        className="
        mb-5
        text-lg
        font-bold
        text-primary
        "
      >

        ឯកសារ

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

        onClick={handleDownload}

        className="
        mt-5
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





    </PopupCard>

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
        truncate
        "
      >

        {value || "-"}

      </p>


    </div>

  );

}