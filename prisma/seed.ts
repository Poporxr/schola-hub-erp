import {
  AttendanceStatus,
  FeeStatus,
  Gender,
  Grade,
  LevelType,
  NoticePriority,
  PaymentStatus,
  PrismaClient,
  TermType,
  TimetableStatus,
  UserRole,
  Status,
  Weekday,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function scoreToGrade(total: number): Grade {
  if (total >= 90) return Grade.A_PLUS;
  if (total >= 80) return Grade.A;
  if (total >= 70) return Grade.B;
  if (total >= 60) return Grade.C;
  if (total >= 50) return Grade.D;
  if (total >= 40) return Grade.E;
  return Grade.F;
}

function pick<T>(arr: T[], idx: number) {
  return arr[idx % arr.length];
}

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0");
}

async function main() {
  // ------------------------------------------------------------
  // DANGER: destructive seed (clears tables). Good for dev/staging.
  // ------------------------------------------------------------
  await prisma.paymentItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.classFeeAssignment.deleteMany();
  await prisma.feeStructureItem.deleteMany();
  await prisma.feeStructure.deleteMany();

  await prisma.attendance.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.notice.deleteMany();

  await prisma.affectiveDomainScore.deleteMany();
  await prisma.psychomotorDomainScore.deleteMany();
  await prisma.result.deleteMany();

  await prisma.subjectTeacher.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.classSubject.deleteMany();

  await prisma.studentClassHistory.deleteMany();
  await prisma.parentStudent.deleteMany();

  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  await prisma.venue.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.level.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicSession.deleteMany();

  // ------------------------------------------------------------
  // Sessions + terms (2 past + 1 current)
  // ------------------------------------------------------------
  const sessionsData = [
    {
      name: "2023/2024",
      startDate: new Date("2023-09-04T00:00:00.000Z"),
      endDate: new Date("2024-07-26T23:59:59.000Z"),
      isCurrent: false,
    },
    {
      name: "2024/2025",
      startDate: new Date("2024-09-02T00:00:00.000Z"),
      endDate: new Date("2025-07-25T23:59:59.000Z"),
      isCurrent: false,
    },
    {
      name: "2025/2026",
      startDate: new Date("2025-09-01T00:00:00.000Z"),
      endDate: new Date("2026-07-31T23:59:59.000Z"),
      isCurrent: true,
    },
  ] as const;

  const sessions = [];
  for (const s of sessionsData) {
    sessions.push(
      await prisma.academicSession.create({
        data: s,
      })
    );
  }

  const [s2023, s2024, s2025] = sessions;

  // Helper to create terms for a session
  async function createTermsForSession(sessionId: string, sessionName: string, isCurrentSession: boolean) {
    // crude but consistent: FIRST starts Sept, SECOND starts Jan, THIRD starts Apr
    // Adjust dates per sessionName year.
    const startYear = Number(sessionName.split("/")[0]); // e.g. 2025
    const endYear = Number(sessionName.split("/")[1]); // e.g. 2026

    const first = await prisma.term.create({
      data: {
        sessionId,
        type: TermType.FIRST,
        name: "1st Term",
        startDate: new Date(`${startYear}-09-01T00:00:00.000Z`),
        endDate: new Date(`${startYear}-12-15T23:59:59.000Z`),
        isCurrent: isCurrentSession, // current term = FIRST of current session
      },
    });

    const second = await prisma.term.create({
      data: {
        sessionId,
        type: TermType.SECOND,
        name: "2nd Term",
        startDate: new Date(`${endYear}-01-05T00:00:00.000Z`),
        endDate: new Date(`${endYear}-03-31T23:59:59.000Z`),
        isCurrent: false,
      },
    });

    const third = await prisma.term.create({
      data: {
        sessionId,
        type: TermType.THIRD,
        name: "3rd Term",
        startDate: new Date(`${endYear}-04-20T00:00:00.000Z`),
        endDate: new Date(`${endYear}-07-31T23:59:59.000Z`),
        isCurrent: false,
      },
    });

    return { first, second, third };
  }

  const t2023 = await createTermsForSession(s2023.id, s2023.name, false);
  const t2024 = await createTermsForSession(s2024.id, s2024.name, false);
  const t2025 = await createTermsForSession(s2025.id, s2025.name, true);

  const currentSession = s2025;
  const currentTerm = t2025.first;

  // ------------------------------------------------------------
  // Levels + Classes (KG -> Grade 6 A/B, JSS1 -> SSS3 A-D)
  // ------------------------------------------------------------
  const levelPrimary = await prisma.level.create({
    data: { name: "Primary Level", type: LevelType.PRIMARY },
  });

  const levelSecondary = await prisma.level.create({
    data: { name: "Secondary Level", type: LevelType.SECONDARY },
  });

  const primaryBaseNames = ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
  const primaryArms = ["A", "B"];

  const secondaryBaseNames = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
  const secondaryArms = ["A", "B", "C", "D"];

  const classes: { id: string; name: string; levelType: "PRIMARY" | "SECONDARY" }[] = [];

  // Create primary classes
  for (const base of primaryBaseNames) {
    for (const arm of primaryArms) {
      const c = await prisma.class.create({
        data: {
          levelId: levelPrimary.id,
          name: `${base} ${arm}`,
          capacity: 35,
        },
      });
      classes.push({ id: c.id, name: c.name, levelType: "PRIMARY" });
    }
  }

  // Create secondary classes
  for (const base of secondaryBaseNames) {
    for (const arm of secondaryArms) {
      const c = await prisma.class.create({
        data: {
          levelId: levelSecondary.id,
          name: `${base}${arm}`, // e.g. "JSS 1A"
          capacity: 40,
        },
      });
      classes.push({ id: c.id, name: c.name, levelType: "SECONDARY" });
    }
  }

  // ------------------------------------------------------------
  // Subjects (15)
  // ------------------------------------------------------------
  const subjectsData = [
    { name: "Mathematics", code: "MATH" },
    { name: "English Language", code: "ENG" },
    { name: "Basic Science", code: "BSC" },
    { name: "Social Studies", code: "SOS" },
    { name: "Civic Education", code: "CIV" },
    { name: "Computer Studies", code: "CST" },
    { name: "Agricultural Science", code: "AGR" },
    { name: "Basic Technology", code: "BTE" },
    { name: "Business Studies", code: "BUS" },
    { name: "Fine Arts", code: "ART" },
    { name: "Physical & Health Education", code: "PHE" },
    { name: "Home Economics", code: "HEC" },
    { name: "Religious Studies", code: "REL" },
    { name: "French", code: "FRE" },
    { name: "Yoruba", code: "YOR" },
  ] as const;

  const subjects = [];
  for (const s of subjectsData) {
    subjects.push(await prisma.subject.create({ data: s }));
  }

  // ------------------------------------------------------------
  // Venues (enough to schedule timetables)
  // ------------------------------------------------------------
  const venueNames = [
    "Room 101",
    "Room 102",
    "Room 103",
    "Room 201",
    "Room 202",
    "Room 203",
    "Room 204",
    "Science Lab",
    "Computer Lab",
    "Library",
    "Multipurpose Hall",
  ];

  const venues = [];
  for (const name of venueNames) {
    venues.push(await prisma.venue.create({ data: { name } }));
  }

  // ------------------------------------------------------------
  // ClassSubject mapping (Primary: core + some, Secondary: broader)
  // ------------------------------------------------------------
  const primarySubjectCodes = ["MATH", "ENG", "BSC", "SOS", "CIV", "CST", "PHE", "ART"];
  const secondarySubjectCodes = ["MATH", "ENG", "BSC", "CIV", "CST", "AGR", "BTE", "BUS", "ART", "PHE", "HEC", "REL", "FRE", "YOR"];

  const subjectByCode = new Map(subjects.map((s) => [s.code ?? "", s]));

  const classSubjectRows: { classId: string; subjectId: string }[] = [];
  for (const c of classes) {
    const codes = c.levelType === "PRIMARY" ? primarySubjectCodes : secondarySubjectCodes;
    for (const code of codes) {
      const subj = subjectByCode.get(code);
      if (!subj) continue;
      classSubjectRows.push({ classId: c.id, subjectId: subj.id });
    }
  }

  // bulk insert
  await prisma.classSubject.createMany({ data: classSubjectRows });

  // ------------------------------------------------------------
  // Users: 1 admin + 20 teachers + 15 parents + 20 students
  // ------------------------------------------------------------
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@schola.local",
      passwordHash: "dev_only_change_me",
      role: UserRole.ADMIN,
      firstName: "System",
      lastName: "Admin",
      phone: "+2348000000000",
      status: Status.ACTIVE,
      admin: { create: { staffId: "ADM-001" } },
    },
    include: { admin: true },
  });

  // Teachers (20)
  const teacherFirstNames = [
    "Michael",
    "Aisha",
    "Chinedu",
    "Blessing",
    "Samuel",
    "Maryam",
    "Ibrahim",
    "Grace",
    "Daniel",
    "Zainab",
    "Joseph",
    "Esther",
    "Paul",
    "Favour",
    "John",
    "Hauwa",
    "Peter",
    "Ada",
    "Sola",
    "Fatima",
  ];
  const teacherLastNames = [
    "Thompson",
    "Okafor",
    "Abdullahi",
    "Okonkwo",
    "Balogun",
    "Ibrahim",
    "Adeyemi",
    "Eze",
    "Mohammed",
    "Ogunleye",
    "Ojo",
    "Nwankwo",
    "Yusuf",
    "Umar",
    "Adebayo",
    "Onyeka",
    "Aliyu",
    "Ahmed",
    "Ibe",
    "Lawal",
  ];
  const departments = [
    "Mathematics",
    "Languages",
    "Sciences",
    "Social Sciences",
    "Vocational",
    "Arts",
    "ICT",
    "Administration",
  ];

  const teachers = [];
  if (classes.length === 0) {
    throw new Error("Seed invariant failed: no classes available to link teachers");
  }
  for (let i = 1; i <= 20; i++) {
    const firstName = teacherFirstNames[i - 1];
    const lastName = teacherLastNames[i - 1];
    const dept = pick(departments, i);
    const classId = classes[(i - 1) % classes.length].id;

    const u = await prisma.user.create({
      data: {
        email: `teacher${i}@schola.local`,
        passwordHash: "dev_only_change_me",
        role: UserRole.TEACHER,
        firstName,
        lastName,
        phone: `+2348000001${pad(i, 3)}`,
        status: Status.ACTIVE,
        teacher: {
          create: {
            teacherId: `TCH-${pad(i, 3)}`,
            department: dept,
            class: { connect: { id: classId } },
          },
        },
      },
      include: { teacher: true },
    });

    if (!u.teacher) throw new Error("Seed invariant failed: missing teacher record");
    teachers.push(u.teacher);
  }

  // Assign a homeroom teacher to each class (round-robin)
  for (let i = 0; i < classes.length; i++) {
    const classId = classes[i].id;
    const teacherId = teachers[i % teachers.length].id;
    await prisma.class.update({
      where: { id: classId },
      data: { teacherId },
    });
  }

  // Parents (15)
  const parentFirstNames = [
    "David",
    "Amaka",
    "Bola",
    "Hassan",
    "Ngozi",
    "Emeka",
    "Kemi",
    "Uche",
    "Hadiza",
    "Kunle",
    "Sani",
    "Peace",
    "Musa",
    "Rita",
    "Tunde",
  ];
  const parentLastNames = [
    "Okonkwo",
    "Eze",
    "Adebayo",
    "Abubakar",
    "Nwosu",
    "Okafor",
    "Ogunleye",
    "Ibe",
    "Bello",
    "Ojo",
    "Yusuf",
    "Umar",
    "Aliyu",
    "Onyeka",
    "Balogun",
  ];

  const parents = [];
  for (let i = 1; i <= 15; i++) {
    const firstName = parentFirstNames[i - 1];
    const lastName = parentLastNames[i - 1];

    const u = await prisma.user.create({
      data: {
        email: `parent${i}@schola.local`,
        passwordHash: "dev_only_change_me",
        role: UserRole.PARENT,
        firstName,
        lastName,
        phone: `+2348000002${pad(i, 3)}`,
        status: Status.ACTIVE,
        parent: { create: {} },
      },
      include: { parent: true },
    });

    if (!u.parent) throw new Error("Seed invariant failed: missing parent record");
    parents.push(u.parent);
  }

  // Students (20)
  const studentFirstNames = [
    "Adeyemi",
    "Fatima",
    "Chisom",
    "Seyi",
    "Amina",
    "Oluwaseun",
    "Ifeanyi",
    "Hannah",
    "Zarah",
    "Emmanuel",
    "Blessing",
    "Kelechi",
    "Ridwan",
    "Adaeze",
    "Jude",
    "Mary",
    "Tomi",
    "Sani",
    "Femi",
    "Halima",
  ];
  const studentLastNames = [
    "Oluwaseun",
    "Bello",
    "Okeke",
    "Adebayo",
    "Yusuf",
    "Adekunle",
    "Eze",
    "Okafor",
    "Ibrahim",
    "Nwankwo",
    "Umar",
    "Ojo",
    "Aliyu",
    "Onyeka",
    "Balogun",
    "Ahmed",
    "Ibe",
    "Lawal",
    "Mohammed",
    "Okonkwo",
  ];
  const addresses = ["Ikeja, Lagos", "Gwarinpa, Abuja", "Wuse 2, Abuja", "Lekki, Lagos", "Makurdi, Benue", "Enugu, Enugu", "Ibadan, Oyo", "Kaduna, Kaduna"];

  const students = [];
  for (let i = 1; i <= 20; i++) {
    const firstName = studentFirstNames[i - 1];
    const lastName = studentLastNames[i - 1];
    const gender = i % 2 === 0 ? Gender.FEMALE : Gender.MALE;

    const u = await prisma.user.create({
      data: {
        email: `student${i}@schola.local`,
        passwordHash: "dev_only_change_me",
        role: UserRole.STUDENT,
        firstName,
        lastName,
        phone: `+2348000003${pad(i, 3)}`,
        status: Status.ACTIVE,
        student: {
          create: {
            admissionNumber: `ADM/${currentSession.name}/${pad(i, 3)}`,
            gender,
            address: pick(addresses, i),
            dateOfBirth: new Date(`201${(i % 6) + 1}-0${(i % 9) + 1}-15T00:00:00.000Z`),
          },
        },
      },
      include: { student: true },
    });

    if (!u.student) throw new Error("Seed invariant failed: missing student record");
    students.push(u.student);
  }

  // ------------------------------------------------------------
  // Link Parents <-> Students (15 parents, 20 students)
  // - First 10 parents: 2 kids each = 20 students
  // - Remaining 5 parents: no students (still useful to test empty states)
  // ------------------------------------------------------------
  const parentStudentRows: { parentId: string; studentId: string; relation: string; isPrimary: boolean }[] = [];
  for (let p = 0; p < 10; p++) {
    const parent = parents[p];
    const s1 = students[p * 2];
    const s2 = students[p * 2 + 1];

    parentStudentRows.push(
      { parentId: parent.id, studentId: s1.id, relation: "Father", isPrimary: true },
      { parentId: parent.id, studentId: s2.id, relation: "Father", isPrimary: false }
    );
  }
  await prisma.parentStudent.createMany({ data: parentStudentRows });

  // ------------------------------------------------------------
  // StudentClassHistory
  // - Current: every student has current term history
  // - Past: every student has at least 2 past histories (2024/2025 FIRST + THIRD)
  // - Some students demonstrate promotion / repetition by shifting class names
  // ------------------------------------------------------------
  const primaryClasses = classes.filter((c) => c.levelType === "PRIMARY");
  const secondaryClasses = classes.filter((c) => c.levelType === "SECONDARY");

  // Assign half students to primary, half to secondary
  const studentHistoriesCurrent: { studentId: string; classId: string; sessionId: string; termId: string }[] = [];
  const studentHistoriesPast: { studentId: string; classId: string; sessionId: string; termId: string }[] = [];

  for (let i = 0; i < students.length; i++) {
    const st = students[i];

    const isSecondary = i >= 10;
    const currentClass = isSecondary ? pick(secondaryClasses, i) : pick(primaryClasses, i);

    studentHistoriesCurrent.push({
      studentId: st.id,
      classId: currentClass.id,
      sessionId: currentSession.id,
      termId: currentTerm.id,
    });

    // Past session baseline class (2024/2025)
    const pastBase = isSecondary ? pick(secondaryClasses, i + 3) : pick(primaryClasses, i + 3);

    // Demonstrate movement:
    // - Every 3rd student changes class between past terms (arm change)
    // - Others stay same
    const pastClassTerm1 = pastBase;
    const pastClassTerm3 =
      i % 3 === 0
        ? isSecondary
          ? pick(secondaryClasses, i + 7)
          : pick(primaryClasses, i + 7)
        : pastBase;

    studentHistoriesPast.push(
      { studentId: st.id, classId: pastClassTerm1.id, sessionId: s2024.id, termId: t2024.first.id },
      { studentId: st.id, classId: pastClassTerm3.id, sessionId: s2024.id, termId: t2024.third.id }
    );
  }

  // Insert histories (need IDs later => create individually)
  const currentHistories = [];
  for (const h of studentHistoriesCurrent) {
    currentHistories.push(await prisma.studentClassHistory.create({ data: h }));
  }

  const pastHistories = [];
  for (const h of studentHistoriesPast) {
    pastHistories.push(await prisma.studentClassHistory.create({ data: h }));
  }

  // Map for quick lookup: studentId -> current history
  const currentHistoryByStudent = new Map(currentHistories.map((h) => [h.studentId, h]));

  // ------------------------------------------------------------
  // Teacher assignments for CURRENT term
  // - ClassTeacher: assign one teacher per class (cycled)
  // - SubjectTeacher: assign teacher per class per subject (lightweight subset)
  // ------------------------------------------------------------
  const classTeacherRows: { teacherId: string; classId: string; sessionId: string; termId: string }[] = [];
  for (let i = 0; i < classes.length; i++) {
    classTeacherRows.push({
      teacherId: teachers[i % teachers.length].id,
      classId: classes[i].id,
      sessionId: currentSession.id,
      termId: currentTerm.id,
    });
  }
  // createMany is fine because @@unique prevents duplicates
  await prisma.classTeacher.createMany({ data: classTeacherRows });

  // SubjectTeacher (don’t explode: pick 6 subjects per class max)
  const subjectTeacherRows: { teacherId: string; subjectId: string; classId: string; sessionId: string; termId: string }[] = [];

  // Build class->subjects list from our known code groups
  const primarySubjectIds = primarySubjectCodes.map((c) => subjectByCode.get(c)!.id);
  const secondarySubjectIds = secondarySubjectCodes.map((c) => subjectByCode.get(c)!.id);

  for (let i = 0; i < classes.length; i++) {
    const c = classes[i];
    const subjIds = c.levelType === "PRIMARY" ? primarySubjectIds : secondarySubjectIds;

    // pick 6 rotating subjects per class
    const start = i % subjIds.length;
    const chosen = Array.from({ length: Math.min(6, subjIds.length) }, (_, k) => subjIds[(start + k) % subjIds.length]);

    for (let k = 0; k < chosen.length; k++) {
      subjectTeacherRows.push({
        teacherId: teachers[(i + k) % teachers.length].id,
        subjectId: chosen[k],
        classId: c.id,
        sessionId: currentSession.id,
        termId: currentTerm.id,
      });
    }
  }

  // Insert one-by-one to avoid createMany failing entire batch if any collisions happen
  for (const row of subjectTeacherRows) {
    await prisma.subjectTeacher.create({ data: row }).catch(() => {
      // ignore duplicates (in case rotation hits same unique combo)
    });
  }

  // ------------------------------------------------------------
  // Timetable (CURRENT term) — a few entries per class
  // ------------------------------------------------------------
  const weekdays: Weekday[] = [Weekday.MON, Weekday.TUE, Weekday.WED, Weekday.THU, Weekday.FRI];
  const times = [
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:30", end: "11:30" },
    { start: "11:30", end: "12:30" },
  ];

  const timetableRows: {
    classId: string;
    subjectId: string;
    teacherId: string;
    venueId: string;
    sessionId: string;
    termId: string;
    weekday: Weekday;
    startTime: string;
    endTime: string;
    status: TimetableStatus;
  }[] = [];

  for (let i = 0; i < classes.length; i++) {
    const c = classes[i];
    const subjIds = c.levelType === "PRIMARY" ? primarySubjectIds : secondarySubjectIds;

    // 3 timetable entries per class
    for (let k = 0; k < 3; k++) {
      const subjectId = subjIds[(i + k) % subjIds.length];
      const teacherId = teachers[(i + k) % teachers.length].id;
      const venueId = venues[(i + k) % venues.length].id;
      const day = weekdays[(i + k) % weekdays.length];
      const t = times[(i + k) % times.length];

      timetableRows.push({
        classId: c.id,
        subjectId,
        teacherId,
        venueId,
        sessionId: currentSession.id,
        termId: currentTerm.id,
        weekday: day,
        startTime: t.start,
        endTime: t.end,
        status: TimetableStatus.ACTIVE,
      });
    }
  }

  await prisma.timetableEntry.createMany({ data: timetableRows });

  // ------------------------------------------------------------
  // Attendance (CURRENT term) — create attendance for first 10 students
  // ------------------------------------------------------------
  const today = new Date();
  const attendanceRows = [];
  for (let i = 0; i < 10; i++) {
    const st = students[i];
    const h = currentHistoryByStudent.get(st.id)!;

    attendanceRows.push({
      studentId: st.id,
      teacherId: teachers[i % teachers.length].id,
      subjectId: primarySubjectIds[i % primarySubjectIds.length],
      classId: h.classId,
      sessionId: currentSession.id,
      termId: currentTerm.id,
      date: today,
      period: "Period 1 (08:00 AM)",
      status: AttendanceStatus.PRESENT,
      notes: i % 4 === 0 ? "On time" : null,
    });
  }
  await prisma.attendance.createMany({ data: attendanceRows });

  // ------------------------------------------------------------
  // Fees: 2 structures (Primary + Secondary) for CURRENT term
  // ------------------------------------------------------------
  const feePrimary = await prisma.feeStructure.create({
    data: {
      name: "Primary Term 1 Fees",
      sessionId: currentSession.id,
      termId: currentTerm.id,
      levelId: levelPrimary.id,
      status: FeeStatus.ACTIVE,
      createdBy: adminUser.id,
      items: {
        create: [
          { name: "Tuition Fee", amount: 65000 },
          { name: "Uniform", amount: 15000, isOptional: true },
          { name: "Books & Materials", amount: 20000 },
          { name: "Medical", amount: 5000 },
        ],
      },
    },
    include: { items: true },
  });

  const feeSecondary = await prisma.feeStructure.create({
    data: {
      name: "Secondary Term 1 Fees",
      sessionId: currentSession.id,
      termId: currentTerm.id,
      levelId: levelSecondary.id,
      status: FeeStatus.ACTIVE,
      createdBy: adminUser.id,
      items: {
        create: [
          { name: "Tuition Fee", amount: 120000 },
          { name: "Development Levy", amount: 20000 },
          { name: "Books & Materials", amount: 35000 },
          { name: "Medical", amount: 5000 },
        ],
      },
    },
    include: { items: true },
  });

  // Assign to a few classes (so you can test class fee screens)
  const primaryClassIds = primaryClasses.slice(0, 4).map((c) => c.id);
  const secondaryClassIds = secondaryClasses.slice(0, 4).map((c) => c.id);

  const assignments = [];

  for (const classId of primaryClassIds) {
    assignments.push(
      await prisma.classFeeAssignment.create({
        data: {
          feeStructureId: feePrimary.id,
          classId,
          sessionId: currentSession.id,
          termId: currentTerm.id,
        },
      })
    );
  }

  for (const classId of secondaryClassIds) {
    assignments.push(
      await prisma.classFeeAssignment.create({
        data: {
          feeStructureId: feeSecondary.id,
          classId,
          sessionId: currentSession.id,
          termId: currentTerm.id,
        },
      })
    );
  }

  // Payments: create 10 payments linked to parent+student (use first 10 parents that have kids)
  for (let i = 0; i < 10; i++) {
    const parent = parents[i];
    const st = students[i * 2]; // one child per parent for payments
    const h = currentHistoryByStudent.get(st.id)!;

    // choose assignment based on class level
    const isSec = secondaryClasses.some((c) => c.id === h.classId);
    const assignment = isSec ? assignments[primaryClassIds.length + (i % secondaryClassIds.length)] : assignments[i % primaryClassIds.length];
    const fee = isSec ? feeSecondary : feePrimary;

    const amount = isSec ? 180000 : 90000;
    const status = i % 3 === 0 ? PaymentStatus.PARTIAL : PaymentStatus.PAID;

    const payment = await prisma.payment.create({
      data: {
        studentId: st.id,
        parentId: parent.id,
        assignmentId: assignment.id,
        amount,
        paymentMethod: i % 2 === 0 ? "Bank Transfer" : "Cash",
        referenceNumber: `DEV-REF-${pad(i + 1, 4)}`,
        status,
        notes: status === "PARTIAL" ? "Part payment for term fees" : "Full payment",
      },
    });

    // Allocate to 2 fee items
    const item1 = fee.items[0];
    const item2 = fee.items[1] ?? fee.items[0];

    await prisma.paymentItem.createMany({
      data: [
        { paymentId: payment.id, feeStructureItemId: item1.id, amount: Math.min(item1.amount, amount) },
        { paymentId: payment.id, feeStructureItemId: item2.id, amount: Math.max(0, amount - Math.min(item1.amount, amount)) },
      ],
    });
  }

  // ------------------------------------------------------------
  // Notices (mix of admin + teacher notices)
  // ------------------------------------------------------------
  await prisma.notice.createMany({
    data: [
      {
        from: "Admin Office",
        title: "Welcome Back",
        message: "Welcome to the new academic session. Please check your timetable and settle outstanding fees.",
        priority: NoticePriority.HIGH,
        targetAudience: "ALL",
        isPublished: true,
        publishedAt: new Date(),
        sessionId: currentSession.id,
      },
      {
        teacherId: teachers[0].id,
        sessionId: currentSession.id,
        title: "Math Clinic",
        from: "Mathematics Dept",
        message: "Math clinic holds every Friday at 2:00 PM in the Library.",
        priority: NoticePriority.MEDIUM,
        targetAudience: "STUDENTS",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        teacherId: teachers[3].id,
        sessionId: currentSession.id,
        title: "PTA Reminder",
        from: "School Management",
        message: "PTA meeting holds next week Thursday by 10:00 AM at the Multipurpose Hall.",
        priority: NoticePriority.URGENT,
        targetAudience: "PARENTS",
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  // ------------------------------------------------------------
  // Results (CURRENT term) — create results for first 8 students across 5 subjects
  // - Also create affective/psychomotor for a couple results
  // ------------------------------------------------------------
  const resultStudents = students.slice(0, 8);
  const resultSubjectIds = subjects.slice(0, 5).map((s) => s.id); // 5 subjects

  const createdResults = [];
  for (let i = 0; i < resultStudents.length; i++) {
    const st = resultStudents[i];
    const h = currentHistoryByStudent.get(st.id)!;

    for (let j = 0; j < resultSubjectIds.length; j++) {
      const ca1 = 10 + ((i + j) % 6);
      const ca2 = 10 + ((i + 2 * j) % 6);
      const project = 8 + ((i + j) % 5);
      const exam = 55 + ((i * 3 + j * 4) % 25);
      const total = ca1 + ca2 + project + exam;

      const r = await prisma.result.create({
        data: {
          studentId: st.id,
          subjectId: resultSubjectIds[j],
          classHistoryId: h.id,
          ca1,
          ca2,
          project,
          exam,
          totalScore: total,
          grade: scoreToGrade(total),
          position: ((i + j) % 10) + 1,
          teacherRemark: total >= 70 ? "Very good performance." : "Keep improving.",
          status: "submitted",
        },
      });

      createdResults.push(r);
    }
  }

  // Affective/Psychomotor for first 2 results
  if (createdResults[0]) {
    await prisma.affectiveDomainScore.create({
      data: {
        resultId: createdResults[0].id,
        studentId: createdResults[0].studentId,
        punctuality: "Excellent",
        neatness: "Very Good",
        politeness: "Excellent",
        honesty: "Very Good",
        relationshipWithOthers: "Excellent",
      },
    });

    await prisma.psychomotorDomainScore.create({
      data: {
        resultId: createdResults[0].id,
        studentId: createdResults[0].studentId,
        handwriting: "Very Good",
        sportsAndGames: "Excellent",
        drawingAndPainting: "Good",
        musicalSkills: "Good",
        verbalFluency: "Excellent",
      },
    });
  }

  if (createdResults[1]) {
    await prisma.affectiveDomainScore.create({
      data: {
        resultId: createdResults[1].id,
        studentId: createdResults[1].studentId,
        punctuality: "Very Good",
        neatness: "Good",
        politeness: "Excellent",
        honesty: "Good",
        relationshipWithOthers: "Very Good",
      },
    });
  }

  // ------------------------------------------------------------
  // Summary logs
  // ------------------------------------------------------------
  console.log("✅ Seed completed");
  console.log({
    sessions: sessions.map((s) => ({ name: s.name, isCurrent: s.isCurrent })),
    current: { session: currentSession.name, term: currentTerm.name },
    counts: {
      classes: classes.length,
      subjects: subjects.length,
      teachers: teachers.length,
      parents: parents.length,
      students: students.length,
      currentHistories: currentHistories.length,
      pastHistories: pastHistories.length,
      timetableEntries: timetableRows.length,
      attendance: attendanceRows.length,
      results: createdResults.length,
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed");
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
