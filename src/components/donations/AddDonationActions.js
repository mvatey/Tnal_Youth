import Button from "../forms/button";

export default function AddDonationActions({ onReset, onCancel, onSave }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <Button action="reset" onClick={onReset} />
      <div className="flex gap-3">
        <Button action="cancel" onClick={onCancel} />
        <Button action="save" onClick={onSave} />
      </div>
    </div>
  );
}
