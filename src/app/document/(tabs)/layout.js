import DocumentTabs from "@/components/document/DocumentTabs";

export default function DocumentTabsLayout({ children }) {
  return (
    <div className="space-y-4">
      <DocumentTabs />
      {children}
    </div>
  );
}