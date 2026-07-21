"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export default function QuantityInput({
  value = 0,
  onChange,
  min = 0,
}) {
  const numberValue =
    value === "" || value === null || value === undefined
      ? min
      : Number(value);

  const update = (nextValue) => {
    const number =
      nextValue === "" ? min : Number(nextValue);

    const safeValue = Math.max(min, number);

    onChange?.(safeValue);
  };

  return (
    <div className="mx-auto flex h-8 w-16 overflow-hidden rounded-md border border-border bg-white">
      <input
        type="number"
        min={min}
        value={numberValue}
        onChange={(e) => update(e.target.value)}
        className="
          w-full
          bg-transparent
          px-2
          text-center
          text-[12px]
          text-text-secondary
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
