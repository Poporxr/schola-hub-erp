const ResultRemarkCard = ({ remark }: { remark?: string | null }) => {
  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mb-6">
      <h3 className="font-bold text-slate-900 mb-3">Teacher / Principal Remark</h3>
      <p className="text-slate-700">{remark ?? "No remark available for this term."}</p>
    </div>
  );
};

export default ResultRemarkCard;
