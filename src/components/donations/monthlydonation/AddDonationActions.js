import FormActionButton from "@/components/ui/actions/FormActionButton";

export default function AddDonationActions({ onReset, onCancel, onSave }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <FormActionButton action="reset" onClick={onReset} />
      <div className="flex gap-3">
        <FormActionButton action="cancel" onClick={onCancel} />
        <FormActionButton action="save" onClick={onSave} />
      </div>
    </div>
  );
}
