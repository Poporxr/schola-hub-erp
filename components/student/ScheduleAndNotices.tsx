import { notices, schedule } from "@/utils/students";
import { DotTone, ScheduleTone } from "@/utils/types";




const scheduleTone: Record<
  ScheduleTone,
  { wrap: string; title: string; meta: string; bar: string }
> = {
  indigo: {
    wrap: "bg-indigo-50",
    title: "text-indigo-900",
    meta: "text-indigo-700",
    bar: "border-indigo-500",
  },
  orange: {
    wrap: "bg-orange-50",
    title: "text-orange-900",
    meta: "text-orange-700",
    bar: "border-orange-500",
  },
  green: {
    wrap: "bg-green-50",
    title: "text-green-900",
    meta: "text-green-700",
    bar: "border-green-500",
  },
};

const dotTone: Record<DotTone, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
};

 const ScheduleAndNotices = () => {
 return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Schedule */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Today&apos;s Schedule
          </h3>
          <span className="text-sm text-slate-500">Sep 24, 2024</span>
        </div>

        <div className="gap-5">
          {schedule.map((item, idx) => {
            const t = scheduleTone[item.tone];
            return (
              <div key={`${item.time}-${idx}`} className="flex items-start mt-3">
                {/* time */}
                <div className="w-16 pt-2 text-slate-500">
                  <div className="text-base font-semibold leading-none">
                    {item.time}
                  </div>
                  <div className="mt-1 text-sm font-semibold leading-none">
                    {item.meridiem}
                  </div>
                </div>

                {/* card */}
                <div
                  className={[
                    "flex-1 rounded-xl border-l-4 p-6",
                    t.wrap,
                    t.bar,
                  ].join(" ")}
                >
                  <h4 className={["text-xl font-semibold", t.title].join(" ")}>
                    {item.title}
                  </h4>
                  <p className={["mt-2 text-sm font-medium", t.meta].join(" ")}>
                    {item.meta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notice Board */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Notice Board</h3>

        <div className="mt-6 ">
          {notices.map((n, idx) => (
            <div
              key={`${n.from}-${idx}`}
              className="rounded-xl bg-slate-50 mt-2 p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    dotTone[n.dot],
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