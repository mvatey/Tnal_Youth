"use client";

import { useLanguage } from "@/context/LanguageContext";

const OPTIONS = [
  { key: "unanswered", value: null, labelKey: "common.notAnswered" },
  { key: "yes", value: true, labelKey: "common.answerYes" },
  { key: "no", value: false, labelKey: "common.answerNo" },
];

/*
 * A three-way answer: not answered (the default), yes or no. "Not answered"
 * keeps a fact nobody has looked at apart from a real "no". Only "yes" shows
 * the children below it (e.g. the voter card number, the map link, the
 * registration document); "no" just lets the user move on.
 *
 * value is null / true / false; onChange receives the new one. The parent
 * clears whatever the children held when the answer is no longer yes.
 */
export default function AnswerRevealField({
  label,
  name,
  value,
  onChange,
  children,
  disabled = false,
}) {
  const { t } = useLanguage();
  const current =
    value === true ? "yes" : value === false ? "no" : "unanswered";

  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm font-semibold text-text-primary">{label}</p>

      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
        {OPTIONS.map((option) => (
          <label
            key={option.key}
            className={`flex items-center gap-2 text-sm text-text-secondary ${
              disabled ? "cursor-default opacity-70" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={current === option.key}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="h-5 w-5 accent-primary"
            />

            <span>{t(option.labelKey)}</span>
          </label>
        ))}
      </div>

      {value === true && children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
