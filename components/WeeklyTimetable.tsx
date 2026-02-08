export type TimetableEntryItem = {
    weekday: "MON" | "TUE" | "WED" | "THU" | "FRI";
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
};

const dayLabels: Record<TimetableEntryItem["weekday"], string> = {
    MON: "Mon",
    TUE: "Tue",
    WED: "Wed",
    THU: "Thu",
    FRI: "Fri",
};

const WeeklyTimetable = ({ entries }: { entries: TimetableEntryItem[] }) => {
    const days: TimetableEntryItem["weekday"][] = ["MON", "TUE", "WED", "THU", "FRI"];
    const times = Array.from(
        new Set(entries.map((e) => `${e.startTime} - ${e.endTime}`))
    ).sort();

    const grid: Record<TimetableEntryItem["weekday"], (TimetableEntryItem | null)[]> = {
        MON: Array(times.length).fill(null),
        TUE: Array(times.length).fill(null),
        WED: Array(times.length).fill(null),
        THU: Array(times.length).fill(null),
        FRI: Array(times.length).fill(null),
    };

    for (const entry of entries) {
        const timeKey = `${entry.startTime} - ${entry.endTime}`;
        const idx = times.indexOf(timeKey);
        if (idx >= 0) {
            grid[entry.weekday][idx] = entry;
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Weekly Timetable
                </h2>
                <p className="text-sm text-gray-500">
                    Class schedule for the current week
                </p>
            </div>

            <div className="overflow-x-auto">
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-6 gap-3 sm:gap-4 min-w-max">
                        {/* Time Column */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="h-10 sm:h-12 flex items-center justify-center font-semibold text-xs sm:text-sm text-gray-900">
                                Time
                            </div>

                            {times.map((t) => (
                                <div
                                    key={t}
                                    className="h-16 sm:h-20 flex items-center justify-center text-xs text-gray-500 font-medium"
                                >
                                    {t}
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {days.map((day) => (
                            <div key={day} className="space-y-3 sm:space-y-4">
                                <div className="h-10 sm:h-12 flex items-center justify-center font-semibold text-xs sm:text-sm text-gray-900 bg-gray-50 rounded-lg">
                                    {dayLabels[day]}
                                </div>

                                {grid[day].map((cell, idx) => {
                                    const timeKey = times[idx] ?? `slot-${idx}`;
                                    const key = `${day}-${timeKey}`;

                                    // Empty slot
                                    if (!cell) {
                                        return <div key={key} className="h-16 sm:h-20" />;
                                    }
                                    // Class slot
                                    return (
                                        <div
                                            key={key}
                                            className="h-16 sm:h-20 bg-indigo-50 border border-indigo-100 rounded-lg p-2 sm:p-3 flex flex-col justify-center"
                                        >
                                            <p
                                                className="text-xs font-semibold text-indigo-700 truncate"
                                            >
                                                {cell.subject}
                                            </p>
                                            <p
                                                className="text-xs text-indigo-600 truncate hidden sm:block"
                                            >
                                                {cell.teacher}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyTimetable;
