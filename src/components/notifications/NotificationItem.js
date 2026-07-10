import NotificationAction from "./NotificationAction";
import NotificationDateStatus from "./NotificationDateStatus";
import NotificationStatusBadge from "./NotificationStatusBadge";

export default function NotificationItem({ notification }) {
  return (
    <li className="grid h-[74px] grid-cols-[minmax(0,1fr)_120px_86px] items-start gap-5 border-b border-border px-8 last:border-b-0">
      <div className="min-w-0 pt-[2px] pb-[10px]">
        <h3 className="truncate text-[14px] font-bold leading-none text-text-primary">
          {notification.title}
        </h3>
        <p className="mt-1 truncate text-[12px] font-medium leading-3 text-text-secondary">
          {notification.description}
        </p>
        <div className="mt-[10px]">
          <NotificationStatusBadge
            label={notification.badge}
            variant={notification.variant}
          />
        </div>
      </div>

      <div className="self-center">
        <NotificationAction />
      </div>
      <div className="self-center">
        <NotificationDateStatus
          date={notification.date}
          read={notification.read}
        />
      </div>
    </li>
  );
}
