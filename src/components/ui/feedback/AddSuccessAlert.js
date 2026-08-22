import FeedbackAlert from "@/components/ui/feedback/FeedbackAlert";

export default function AddSuccessAlert({
  message = "បានបន្ថែមដោយជោគជ័យ",
}) {
  return <FeedbackAlert message={message} />;
}
