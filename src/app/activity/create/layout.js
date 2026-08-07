import { ActivityCreateDraftProvider } from "./ActivityCreateDraftContext";

export default function ActivityCreateLayout({ children }) {
  return <ActivityCreateDraftProvider>{children}</ActivityCreateDraftProvider>;
}
