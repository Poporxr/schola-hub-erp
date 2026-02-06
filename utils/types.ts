export type StudentRow = {
  id: string;
  name: string;
  studentId: string;
  image: string;
  className: string;
  age: string;
  gender: "Male" | "Female";
  status: "Active" | "Inactive";
  email: string;
  phone: string;
  address: string;

};


export type TeacherRow = {
  id: string;
  name: string;
  teacherId: string;
  image: string;
  department: string;
  age: string;
  gender: "Male" | "Female";
  status: "Active" | "Inactive";
  class: string,
  phone: string
};
export type ClassRow = {
  id: string;
  name: string;
  level: string;
  teacher: string;
  totalStudents: number;
}
export type SubjectCard = {
  id: string;
  name: string;
  schedule: string;         // e.g., "Tue, Fri • 2:00 PM"
  icon: string;             // you pick which lucide icon to use in code
  teacher: {
    name: string;
    avatar: string;
    role: string;
  };
}

export type ResultRow = {
  id: string;
  name: string;
  studentId: string;
  image: string;
  ca1: number;
  ca2: number;
  exam: number;
  project: number;
  average: number;   // computed already for UI
  grade: "A+" | "A" | "B" | "C" | "D" | "E" | "F";
  position: number;
};


export type SubjectBreakdownRow = {
  id: string;
  subject: string;
  icon: string;         // lucide icon name
  iconColor: string;    // tailwind bg + text colors (optional)
  tests: string;        // e.g. "18/20"
  assignments: string;
  exam: string;
  total: number;
  grade: string;
  teacher: string;
  performance: {
    label: string;      // Excellent | Very Good | Good | Fair | Poor
    status: string;     // perf-excellent | perf-good, etc (CSS hook)
  };
};
export type ParentRow = {
  id: string; // used for /admin/parents/${id}
  name: string;
  location: string;
  avatar?: string; // optional (if no avatar you can show initials)
  initials?: string; // optional
  phone: string;
  email: string;
  students: {
    count: number;
    summary: string; // e.g. "2 Students (JSS1, SSS2)"
    avatars: string[]; // student thumbnails
  };
  status: "Owing" | "Paid" | "Partial";
  balance: {
    amount: number; // store raw number
    label?: string; // "Due now" / "Remaining"
  };
  lastPayment: string; // "Oct 24, 2023"
};
export type FeeStructure = {
  id: string;
  name: string;
  term: string;
  total: number;
  status: "Active" | "Draft";
  createdBy: string;
  items: { name: string; amount: number; optional?: boolean }[];
};

export type ClassAssignment = {
  id: string;
  className: string;
  structureName: string;
  students: number;
  expected: number;
  collected: number;
  outstanding: number;
  progress: number; // 0-100
};

export type ScheduleTone = "indigo" | "orange" | "green";
export type DotTone = "red" | "blue" | "green";
export type ScheduleItem = {
  time: string;
  title: string;
  meta: string;
  meridiem: string;
  tone: ScheduleTone
};

export type NoticeItem = {
  from: string;
  message: string;
  dot: DotTone;
};

export type TimetableDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export type TimetableCell =
  | {
      type: "class";
      subject: string; // e.g. "Math"
      teacher: string; // e.g. "Ms. Lee"
      style: {
        container: string; // e.g. "bg-blue-50 border-blue-200"
        title: string;     // e.g. "text-blue-900"
        subtitle: string;  // e.g. "text-blue-600"
      };
    }
  | {
      type: "lunch";
      label: string; // usually "Lunch"
    }
  | null;

export type WeeklyTimetableMock = {
  times: string[]; // left column
  days: TimetableDay[];
  grid: Record<TimetableDay, TimetableCell[]>; // each day has same length as times
};

export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI";

export type TimetableTime = {
  day: Weekday;
  start: string; // "08:00"
  end: string;   // "09:00"
};

export type TimetableEntry = {
  id: string;

  // "classid[]": keep it array so a single lesson can target multiple arms if needed
  classIds: string[];     // e.g. ["cls_jss2a"]
  subjectId: string;      // e.g. "sub_math"
  teacherId: string;      // e.g. "tch_ade"
  venueId: string;        // e.g. "ven_room204"

  time: TimetableTime;

  // optional but useful later
  sessionId?: string;     // "2025/2026"
  termId?: string;        // "term_1"
  status?: "ACTIVE" | "CANCELLED";
  note?: string;
};
