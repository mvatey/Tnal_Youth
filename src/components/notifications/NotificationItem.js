import NotificationAction from "./NotificationAction";
import NotificationDateStatus from "./NotificationDateStatus";
import NotificationStatusBadge from "./NotificationStatusBadge";

export default function NotificationItem({ notification }) {
  return (
    <li className="grid min-h-[62px] grid-cols-[minmax(0,1fr)_120px_86px] items-center gap-5 border-b border-border px-8 py-3 last:border-b-0">
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-bold text-text-primary">
          {notification.title}
        </h3>
        <p className="mt-1 truncate text-[12px] font-medium leading-5 text-text-secondary">
          {notification.description}
        </p>
        <div className="mt-1">
          <NotificationStatusBadge
            label={notification.badge}
            variant={notification.variant}
          />
        </div>
      </div>

      <NotificationAction />
      <NotificationDateStatus
        date={notification.date}
        read={notification.read}
      />
    </li>
  );
}
