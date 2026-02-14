"use client";

type AttendanceProgressProps = {
  present: number;
  absent: number;
  late: number;
};

export default function AttendanceRateCards({
  present,
  absent,
  late,
}: AttendanceProgressProps) {
  const attended = present + late;
  const total = attended + absent;

  const rate = total === 0 ? 0 : Math.round((attended / total) * 100);

  const getMeta = (rate: number) => {
    if (rate >= 90)
      return {
        bar: "bg-green-500",
        text: "text-green-600",
        label: "Excellent",
      };
    if (rate >= 75)
      return {
        bar: "bg-yellow-500",
        text: "text-yellow-600",
        label: "Good",
      };
    if (rate >= 50)
      return {
        bar: "bg-orange-500",
        text: "text-orange-600",
        label: "Average",
      };
    return {
      bar: "bg-red-500",
      text: "text-red-600",
      label: "Poor",
    };
  };

  const { bar, text, label } = getMeta(rate);

  return (
    <div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {rate}%
        </span>
        <span className={`text-sm mb-1 ${text}`}>
          {label}
        </span>
      </div>

      <div className="w-full bg-gray-100 h-2 rounded-full mt-3">
        <div
          className={`${bar} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}