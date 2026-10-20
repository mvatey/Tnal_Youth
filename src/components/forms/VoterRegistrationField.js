"use client";

import BoxFill from "@/components/forms/boxFill";
import CheckboxField from "@/components/forms/CheckboxField";

/*
 * "On the voter list" checkbox with the voter card number beside it. The
 * number field only appears while the box is ticked, and the parent drops
 * the number again when it is unticked (the backend does the same). Both
 * pieces sit in one cell, so the pair counts as a single slot in a
 * two-column form row.
 *
 * onCheckedChange receives the new boolean; onNumberChange the new text.
 */
export default function VoterRegistrationField({
  checkboxLabel,
  numberLabel,
  numberPlaceholder,
  checked,
  number,
  onCheckedChange,
  onNumberChange,
  disabled = false,
  // Line the checkbox up with the input box of the field beside it (see
  // CheckboxField); leave off when the pair has a row of its own.
  alignWithInput = false,
}) {
  return (
    <div className="flex min-w-0 items-end gap-4">
      <div className="shrink-0">
        <CheckboxField
          label={checkboxLabel}
          name="registered_voter"
          checked={checked}
          onChange={onCheckedChange}
          disabled={disabled}
          alignWithInput={alignWithInput || checked}
        />
      </div>

      {checked && (
        <div className="min-w-0 flex-1">
          <BoxFill
            label={numberLabel}
            name="voter_card_number"
            value={number ?? ""}
            onChange={(event) => onNumberChange(event.target.value)}
            placeholder={numberPlaceholder}
            readOnly={disabled}
          />
        </div>
      )}
    </div>
  );
}
