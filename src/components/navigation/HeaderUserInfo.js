"use client";

import { useRouter } from "next/navigation";

export default function HeaderUserInfo({
  title = "ប្រវត្តិរូបរបស់ខ្ញុំ",
  buttonText = "ព័ត៌មានលម្អិត",
  onButtonClick,
}) {
  const router = useRouter();

  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
      return;
    }

    router.push("/myAcc/details/personal");
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-secondary">
        {title}
      </h1>

      {buttonText && (
        <button
          type="button"
          onClick={handleClick}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}