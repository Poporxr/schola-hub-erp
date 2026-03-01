const ResultRemarkCard = ({ remark }: { remark?: string | null }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <h3 className="font-bold text-slate-900 mb-3">Teacher / Principal Remark</h3>
      <p className="text-slate-700">{remark ?? "No remark available for this term."}</p>
    </div>
  );
};

export default ResultRemarkCard;
