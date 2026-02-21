import AttendanceDonut from "@/components/AttendanceDonut";

type AttendanceSummary = {
  id: string;
  name: string;
  present: number;
  absent: number;
  late: number;
};

export default function ParentAttendanceSummary({ items }: { items: AttendanceSummary[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.length ? (
        items.map((att) => (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" key={att.id}>
            <h3 className="font-bold text-gray-900 mb-4">{att.name} (This Month)</h3>
            <div className="h-64 overflow-hidden">
              <AttendanceDonut present={att.present} absent={att.absent} late={att.late} />
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">No attendance records yet.</p>
        </div>
      )}
    </div>
  );
}
