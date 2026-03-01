import { AffectiveData, PsychomotorData } from "@/components/student/results/types";

type Props = {
  affective?: AffectiveData;
  psychomotor?: PsychomotorData;
};

const ResultDomainCards = ({ affective, psychomotor }: Props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Affective Domain (Behaviour)</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Punctuality</span><span>{affective?.punctuality ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Neatness</span><span>{affective?.neatness ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Politeness</span><span>{affective?.politeness ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Honesty</span><span>{affective?.honesty ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Relationship with Others</span><span>{affective?.relationshipWithOthers ?? "-"}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Psychomotor Domain (Skills)</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Handwriting</span><span>{psychomotor?.handwriting ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Sports & Games</span><span>{psychomotor?.sportsAndGames ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Drawing & Painting</span><span>{psychomotor?.drawingAndPainting ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Musical Skills</span><span>{psychomotor?.musicalSkills ?? "-"}</span></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Verbal Fluency</span><span>{psychomotor?.verbalFluency ?? "-"}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ResultDomainCards;
