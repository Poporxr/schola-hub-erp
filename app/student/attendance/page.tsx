import AttendanceChart from "@/components/student/AttendanceChart";


const Page = () => {
  return (
 <div className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
      <h3 className="font-bold text-gray-900 mb-4">
        Monthly Attendance Overview
      </h3>

      <AttendanceChart />
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">Summary</h3>

      <div className="space-y-6">
        <div className="text-center p-4 bg-indigo-50 rounded-xl">
          <p className="text-sm text-indigo-600 font-medium mb-1">Total Present</p>
          <p className="text-3xl font-bold text-indigo-900">142</p>
          <p className="text-xs text-indigo-400">Days</p>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-xl">
          <p className="text-sm text-red-600 font-medium mb-1">Total Absent</p>
          <p className="text-3xl font-bold text-red-900">8</p>
          <p className="text-xs text-red-400">Days</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Recent Absences
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex justify-between">
              <span>Sep 12</span>
              <span className="text-red-500">Sick Leave</span>
            </li>
            <li className="flex justify-between">
              <span>Aug 24</span>
              <span className="text-red-500">Unexcused</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
export default Page
