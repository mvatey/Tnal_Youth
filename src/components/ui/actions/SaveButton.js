"use client";

import { ImportIcon } from "lucide-react";

export default function SaveButton({
  onClick,
  children = "រក្សាទុក",
}) {

  const handleClick = () => {

    if (onClick) {
      onClick();
      return;
    }

    alert("រក្សាទុកបានជោគជ័យ");

  };


  return (
    <button
      onClick={handleClick}
      className="inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-hover sm:w-auto"
    >
      <ImportIcon size={17} />
      {children}
    </button>
  );
}
