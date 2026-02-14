export type OptionItem = {
  id: string;
  name: string;
};

export type StudentResultHeaderData = {
  studentId: string;
  fullName: string;
  admissionNumber: string;
  image?: string | null;
  className?: string;
  termName?: string;
  sessionName?: string;
};

export type SummaryData = {
  overallAverage: number;
  totalScore: number;
  maxScore: number;
  classPosition?: number | null;
  classSize: number;
  totalSubjects: number;
  passedCount: number;
  status: string;
};

export type SubjectResultRow = {
  id: string;
  subjectName: string;
  tests: number;
  assignments: number;
  exam: number;
  totalScore: number;
  grade?: string | null;
};

export type AffectiveData = {
  punctuality?: string | null;
  neatness?: string | null;
  politeness?: string | null;
  honesty?: string | null;
  relationshipWithOthers?: string | null;
};

export type PsychomotorData = {
  handwriting?: string | null;
  sportsAndGames?: string | null;
  drawingAndPainting?: string | null;
  musicalSkills?: string | null;
  verbalFluency?: string | null;
};
