"use client";

import { Trash2, X } from "lucide-react";
import PopupCard from "@/components/popup/PopupCard";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "បញ្ជាក់ការលុប",
  message = "តើអ្នកប្រាកដថាចង់លុបទិន្នន័យនេះមែនទេ?",
}) {

  if (!open) return null;


  return (
    <PopupCard
      size="sm"
      onClose={onClose}
    >

      <div className="text-center">


        {/* Icon */}

        <div
          className="
          mx-auto
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-red-100
          text-red-600
          "
        >
          <Trash2 size={24}/>
        </div>



        {/* Title */}

        <h2
          className="
          mb-2
          text-lg
          font-bold
          text-text-primary
          "
        >
          {title}
        </h2>



        {/* Message */}

        <p
          className="
          mb-6
          text-sm
          text-gray-500
          "
        >
          {message}
        </p>




        {/* Buttons */}

        <div
          className="
          flex
          gap-3
          "
        >


          <button
            type="button"
            onClick={onClose}
            className="
            flex-1
            rounded-lg
            border
            border-gray-200
            py-2.5
            text-sm
            font-medium
            text-gray-600
            hover:bg-gray-50
            "
          >
            បោះបង់
          </button>




          <button
            type="button"
            onClick={onConfirm}
            className="
            flex-1
            rounded-lg
            bg-red-600
            py-2.5
            text-sm
            font-semibold
            text-white
            hover:bg-red-700
            "
          >
            <span className="flex items-center justify-center gap-2">
              <Trash2 size={16}/>
              លុប
            </span>
          </button>


        </div>


      </div>


    </PopupCard>
  );
}