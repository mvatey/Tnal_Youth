import Button from "../../forms/button";

export default function AddDonationActions({ onReset, onCancel, onSave, readOnly = false, onEdit }) {
  if (readOnly) {
    return (
      <div className="mt-3 flex justify-end">
        <Button action="edit" onClick={onEdit} />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button action="reset" onClick={onReset} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button action="cancel" onClick={onCancel} />
        <Button action="save" onClick={onSave} />
      </div>
    </div>
  );
}
