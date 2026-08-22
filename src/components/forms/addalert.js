import FeedbackAlert from "@/components/ui/feedback/FeedbackAlert";

export default function SuccessAlert({
  message = "ការទាញយកបានជោគជ័យ",
}) {
  return <FeedbackAlert message={message} />;
}
