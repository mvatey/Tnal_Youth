"use client";

import { HiSaveAs } from "react-icons/hi";

export default function SaveButton({
  onClick,
  children = "រក្សាទុក",
  disabled = false,
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
      disabled={disabled}
      className="inline-flex  h-[34px] items-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      <HiSaveAs size={17} />
      {children}
    </button>
  );
}
