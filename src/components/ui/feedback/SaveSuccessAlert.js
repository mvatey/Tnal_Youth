import FeedbackAlert from "@/components/ui/feedback/FeedbackAlert";

export default function SaveSuccessAlert({
  message = "បានរក្សាទុកដោយជោគជ័យ",
}) {
  return <FeedbackAlert message={message} />;
}
