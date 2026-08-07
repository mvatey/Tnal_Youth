"use client";

import AddDocumentForm from "./AddDocumentForm";
import EditDocumentForm from "./EditDocumentForm";


export default function DocumentForm({
  modalType,
  form,
  setForm,
  onSave,
  onClose,
}) {

  if (modalType === "edit") {
    return (
      <EditDocumentForm
        form={form}
        setForm={setForm}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }


  return (
    <AddDocumentForm
      form={form}
      setForm={setForm}
      onSave={onSave}
      onClose={onClose}
    />
  );
}