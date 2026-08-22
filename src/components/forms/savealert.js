import FeedbackAlert from "@/components/ui/feedback/FeedbackAlert";

export default function SaveAlert({
  message = "បានរក្សាទុកដោយជោគជ័យ",
}) {
  return <FeedbackAlert message={message} />;
}
