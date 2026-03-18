type NoticeItem = {
  id: string;
  from: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
};

const dotToneByPriority: Record<NoticeItem["priority"], string> = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-green-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

type ScheduleItem = {
  id: string;
  weekday: string;
  startTime: string;
  endTime: string;
  subject: { id: string; name: string };
  teacher: { id: string; user: { firstName: string; lastName: string } };};

const ScheduleAndNotices = ({ schedule, notices }: { schedule: ScheduleItem[]; notices: NoticeItem[] }) => {
  const weekdayByIndex = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
  const todayWeekday = weekdayByIndex[new Date().getDay()];
  const todaySchedule = schedule.filter((item) => item.weekday === todayWeekday);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Schedule */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Today&apos;s Schedule
          </h3>
          <span className="text-sm text-slate-500">{todayWeekday}</span>
        </div>

        <div className="gap-5">
          {todaySchedule.length ? (
            todaySchedule.map((item) => {
              const teacherName = `${item.teacher.user.firstName} ${item.teacher.user.lastName}`;
              return (
                <div key={item.id} className="flex items-start mt-3">
                  {/* time */}
                  <div className="w-16 pt-2 text-slate-500">
                    <div className="text-base font-semibold leading-none">
                      {item.startTime}
                    </div>
                    <div className="mt-1 text-sm font-semibold leading-none">
                      {item.endTime}
                    </div>
                  </div>

                  {/* card */}
                  <div className="flex-1 rounded-xl border-l-4 p-6 bg-indigo-50 border-indigo-500">
                    <h4 className="text-xl font-semibold text-indigo-900">
                      {item.subject.name}
                    </h4>
                    <p className="mt-2 text-sm font-medium text-indigo-700">
                      {teacherName}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="mt-3 text-md text-slate-500">Your Schedule is Empty</p>
          )}
        </div>
      </div>

      {/* Notice Board */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Notice Board</h3>

        <div className="mt-6 ">
          {notices.map((n) => (
            <div
              key={n.id}
              className="rounded-xl bg-slate-50 mt-2 p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    dotToneByPriority[n.priority],
                  ].join(" ")}
                />
                <span className="text-sm font-medium text-slate-500">
                  {n.from}
                </span>
              </div>

              <p className="text-base font-semibold leading-snug text-slate-900">
                {n.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default ScheduleAndNotices;

