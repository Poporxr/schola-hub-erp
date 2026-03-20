type ResultRemarkCardProps = {
  teacherRemark?: string | null;
  principalRemark?: string | null;
};

const ResultRemarkCard = ({ teacherRemark, principalRemark }: ResultRemarkCardProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Form Teacher&apos;s Remark</h3>
        <p className="text-slate-700">
          {teacherRemark ?? "No teacher remark available for this term."}
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Principal&apos;s Remark</h3>
        <p className="text-slate-700">
          {principalRemark ?? "No principal remark available for this term."}
        </p>
      </div>
    </div>
  );
};

export default ResultRemarkCard;
