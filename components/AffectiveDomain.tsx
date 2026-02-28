import { Heart } from "lucide-react";

type AffectiveScores = {
    punctuality?: string | null;
    neatness?: string | null;
    politeness?: string | null;
    honesty?: string | null;
    relationshipWithOthers?: string | null;
};

const scoreBadge = (value?: string | null) => {
    if (!value) return "bg-slate-100 text-slate-600";
    if (value === "Excellent") return "bg-emerald-100 text-emerald-700";
    if (value === "Very Good") return "bg-blue-100 text-blue-700";
    if (value === "Good") return "bg-amber-100 text-amber-700";
    if (value === "Fair") return "bg-orange-100 text-orange-700";
    if (value === "Poor") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
};

const AffectiveDomain = ({ scores }: { scores?: AffectiveScores | null }) => {
    const rows = [
        { label: "Punctuality", value: scores?.punctuality ?? "N/A" },
        { label: "Neatness", value: scores?.neatness ?? "N/A" },
        { label: "Politeness", value: scores?.politeness ?? "N/A" },
        { label: "Honesty", value: scores?.honesty ?? "N/A" },
        { label: "Relationship with Others", value: scores?.relationshipWithOthers ?? "N/A" },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900">Affective Domain (Behaviour)</h3>
            </div>
            <div className="space-y-3">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">{row.label}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${scoreBadge(row.value)}`}>{row.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default AffectiveDomain;
