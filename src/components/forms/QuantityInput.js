"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

const KHR_PER_USD = 4000;

export default function QuantityInput({ value = 1, onChange, min = 1 }) {
  const numberValue = Number(value) || min;

  const update = (nextValue) => {
    const safeValue = Math.max(min, Number(nextValue) || min);
    onChange?.(safeValue);
  };

  return (
    <div className="mx-auto flex h-8 w-16 overflow-hidden rounded-md border border-border bg-white">
  <input
    type="number"
    value={numberValue}
    onChange={(e) => update(e.target.value)}
    className="
      w-full
      bg-transparent
      px-2
      text-center
      text-sm
      outline-none
      [appearance:textfield]
      [&::-webkit-inner-spin-button]:appearance-none
      [&::-webkit-outer-spin-button]:appearance-none
    "
  />

  <div className="flex w-5 flex-col border-l border-border bg-bg-page-gray">
    <button
      type="button"
      onClick={() => update(numberValue + 1)}
      className="flex flex-1 items-center justify-center hover:bg-primary-light"
    >
      <ChevronUp size={10} strokeWidth={2.3} />
    </button>

    <button
      type="button"
      onClick={() => update(numberValue - 1)}
      className="flex flex-1 items-center justify-center border-t border-border hover:bg-primary-light"
    >
      <ChevronDown size={10} strokeWidth={2.3} />
    </button>
  </div>
</div>

  );
}