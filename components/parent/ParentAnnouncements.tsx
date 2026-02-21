import { AlertCircle, CalendarDays, Megaphone } from "lucide-react";
import { relativeDaysLabel } from "@/lib/settings";

type AnnouncementItem = {
  id: string;
  title: string | null;
  message: string;
  publishedAt: Date | null;
  createdAt: Date;
};

const iconStyles = [
  { icon: Megaphone, wrapper: "bg-purple-50 text-purple-600" },
  { icon: CalendarDays, wrapper: "bg-blue-50 text-blue-600" },
  { icon: AlertCircle, wrapper: "bg-amber-50 text-amber-600" },
];

export default function ParentAnnouncements({ announcements }: { announcements: AnnouncementItem[] }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">Recent Announcements</h3>
        <button className="text-sm text-purple-600 font-medium hover:underline">View All</button>
      </div>
      {announcements.length ? (
        <div className="space-y-4">
          {announcements.map((notice, index) => {
            const style = iconStyles[index % iconStyles.length];
            const Icon = style.icon;
            return (
              <div key={notice.id} className={`flex gap-4 ${index < announcements.length - 1 ? "pb-4 border-b border-gray-100" : ""}`}>
                <div className={`p-2 ${style.wrapper} rounded-lg h-fit`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{notice.title ?? "Announcement"}</h4>
                    <span className="text-xs text-gray-500">
                      {relativeDaysLabel(notice.publishedAt ?? notice.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notice.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No announcements yet.</p>
      )}
    </div>
  );
}
