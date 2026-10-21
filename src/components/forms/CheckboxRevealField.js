"use client";

import BoxFill from "@/components/forms/boxFill";
import CheckboxField from "@/components/forms/CheckboxField";

/*
 * A checkbox that doubles as the label of an input: nothing shows under it
 * until it is ticked, then a text field appears below (e.g. "on the voter
 * list" -> the voter card number; "came from another party" -> the former
 * party). The parent clears the text again when the box is unticked.
 *
 * onCheckedChange receives the new boolean; onValueChange the new text.
 */
export default function CheckboxRevealField({
  label,
  name,
  checked,
  value,
  placeholder,
  onCheckedChange,
  onValueChange,
  disabled = false,
}) {
  // The checkbox sits on the row of its neighbours' labels (the top of the
  // cell), not level with their input boxes.
  return (
    <div className="min-w-0">
      <CheckboxField
        label={label}
        name={name}
        checked={checked}
        onChange={onCheckedChange}
        disabled={disabled}
      />

      {checked && (
        <div className="mt-2">
          <BoxFill
            name={`${name}_value`}
            value={value ?? ""}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            readOnly={disabled}
          />
        </div>
      )}
    </div>
  );
}
