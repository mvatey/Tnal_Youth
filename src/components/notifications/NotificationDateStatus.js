import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function NotificationDateStatus({ date, read = false }) {
  const { t } = useLanguage();

  return (
    <div className="flex min-w-[74px] flex-col items-start gap-1 text-[11px] leading-[1.6] text-text-secondary">
      <span className="font-semibold text-text-primary">{date}</span>
      <span
        className={`inline-flex items-center gap-1 ${
          read ? "text-text-mute" : "text-secondary"
        }`}
      >
        {read ? (
          <Check size={12} strokeWidth={2.2} />
        ) : (
          <span className="h-2 w-2 rounded-full bg-secondary" />
        )}
        {read ? t("notificationPage.read") : t("notificationPage.unread")}
      </span>
    </div>
  );
}
