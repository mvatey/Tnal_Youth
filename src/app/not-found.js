import NotFoundPage from "@/components/errors/NotFoundPage";

export default function UnauthorizedPage() {
  return (
    <NotFoundPage
      title="មិនអនុញ្ញាតឱ្យចូលប្រើ"
      message="សូមចូលប្រព័ន្ធជាមុនសិន មុនពេលចូលប្រើទំព័រនេះ។"
    />
  );
}