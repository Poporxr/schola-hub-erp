export type SessionOption = {
  id: string;
  name: string;
};

export type TermOption = {
  id: string;
  name: string;
};

export type ClassOption = {
  id: string;
  name: string;
  promotionTrack: "NURSERY" | "PRIMARY" | "JSS" | "SSS" | "OTHER";
  promotionRank: number;
  isTerminal: boolean;
};

export type PromotionMapping = {
  id: string;
  fromClassId: string;
  toClassId: string;
};

export type RolloverOptions = {
  copyClassTeachers: boolean;
  copySubjectTeachers: boolean;
  carryClassSubjects: boolean;
  archiveGraduatingClasses: boolean;
};

export type PreviewSummary = {
  studentsToMigrate: number;
  classTeacherAssignmentsToCopy: number;
  subjectTeacherAssignmentsToCopy: number;
  classSubjectLinksToCarry: number;
  warnings: string[];
  blockers: string[];
};
