import NotificationItem from "./NotificationItem";
import NotificationPagination from "./NotificationPagination";
import NotificationTabs from "./NotificationTabs";
import { getNotifications } from "./notificationData";

export default function NotificationPanel({ type = "system" }) {
  const notifications = getNotifications(type);

  return (
    <div className="space-y-4">
      <NotificationTabs />

      <section className="overflow-hidden rounded-md border border-border bg-[#fbfcfe] shadow-sm">
        <div className="px-8 pt-4">
          <h2 className="text-[16px] font-bold text-secondary">
            សេចក្តីជូនដំណឹងថ្មីៗ
          </h2>
        </div>

        <ul className="mt-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </ul>

        <NotificationPagination />
      </section>
    </div>
  );
}
