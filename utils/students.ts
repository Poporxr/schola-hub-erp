import { useMemo } from "react";
import { ClassRow, StudentRow, TeacherRow, SubjectCard, ResultRow, SubjectBreakdownRow, ParentRow, FeeStructure, ClassAssignment, NoticeItem, ScheduleItem, WeeklyTimetableMock, TimetableEntry} from "./types";

export const students: StudentRow[] = [
  {
    id: "1",
    name: "Liam Anderson",
    studentId: "STU-001",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    className: "Grade 3-A",
    age: "8 yrs",
    gender: "Male",
    status: "Active",
    email: "liam.anderson@student.edu",
    phone: "+234 802 345 1122",
    address: "12 Maple Street, Ikeja, Lagos",
  },
  {
    id: "2",
    name: "Emma Johnson",
    studentId: "STU-002",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    className: "Grade 4-B",
    age: "9 yrs",
    gender: "Female",
    status: "Active",
    email: "emma.johnson@student.edu",
    phone: "+234 805 998 6611",
    address: "45 Sunrise Avenue, Gwarinpa, Abuja",
  },
  {
    id: "3",
    name: "Noah Williams",
    studentId: "STU-003",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    className: "Grade 5-A",
    age: "10 yrs",
    gender: "Male",
    status: "Active",
    email: "noah.williams@student.edu",
    phone: "+234 701 554 9928",
    address: "8 Unity Crescent, Lekki Phase 1, Lagos",
  },
  {
    id: "4",
    name: "Olivia Brown",
    studentId: "STU-004",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
    className: "Grade 2-C",
    age: "7 yrs",
    gender: "Female",
    status: "Inactive",
    email: "olivia.brown@student.edu",
    phone: "+234 814 722 1155",
    address: "33 Park Lane, Port Harcourt",
  },
  {
    id: "5",
    name: "James Wilson",
    studentId: "STU-005",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    className: "Grade 6-A",
    age: "11 yrs",
    gender: "Male",
    status: "Active",
    email: "james.wilson@student.edu",
    phone: "+234 708 444 2277",
    address: "19 Palm View Estate, Ibadan",
  },
  {
    id: "6",
    name: "Sophia Martinez",
    studentId: "STU-006",
    image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d",
    className: "Grade 1-B",
    age: "6 yrs",
    gender: "Female",
    status: "Active",
    email: "sophia.martinez@student.edu",
    phone: "+234 802 781 9923",
    address: "52 Harmony Street, Enugu",
  },
  {
    id: "7",
    name: "Benjamin Taylor",
    studentId: "STU-007",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
    className: "Grade 4-A",
    age: "9 yrs",
    gender: "Male",
    status: "Inactive",
    email: "benjamin.taylor@student.edu",
    phone: "+234 817 665 4411",
    address: "27 Coral Estate, Uyo",
  },
  {
    id: "8",
    name: "Ava Thomas",
    studentId: "STU-008",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b",
    className: "Grade 3-B",
    age: "8 yrs",
    gender: "Female",
    status: "Active",
    email: "ava.thomas@student.edu",
    phone: "+234 803 117 5533",
    address: "6 Kings Road, Asaba",
  },
  {
    id: "9",
    name: "Lucas Moore",
    studentId: "STU-009",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
    className: "Grade 5-B",
    age: "10 yrs",
    gender: "Male",
    status: "Active",
    email: "lucas.moore@student.edu",
    phone: "+234 809 441 9311",
    address: "20 Cedar Close, Benin City",
  },
  {
    id: "10",
    name: "Mia Jackson",
    studentId: "STU-010",
    image: "https://images.unsplash.com/photo-1545992336-cbfdeeda2f20",
    className: "Grade 2-A",
    age: "7 yrs",
    gender: "Female",
    status: "Active",
    email: "mia.jackson@student.edu",
    phone: "+234 818 222 7400",
    address: "18 Royal Gardens, Abeokuta",
  },
  {
    id: "11",
    name: "Ethan White",
    studentId: "STU-011",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    className: "Grade 6-B",
    age: "11 yrs",
    gender: "Male",
    status: "Inactive",
    email: "ethan.white@student.edu",
    phone: "+234 812 509 8899",
    address: "3 Blossom Street, Kaduna",
  },
  {
    id: "12",
    name: "Charlotte Harris",
    studentId: "STU-012",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    className: "Grade 1-A",
    age: "6 yrs",
    gender: "Female",
    status: "Active",
    email: "charlotte.harris@student.edu",
    phone: "+234 706 841 2200",
    address: "77 Queen’s Drive, Calabar",
  },
  {
    id: "13",
    name: "Daniel Clark",
    studentId: "STU-013",
    image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6",
    className: "Grade 4-C",
    age: "9 yrs",
    gender: "Male",
    status: "Active",
    email: "daniel.clark@student.edu",
    phone: "+234 815 944 0033",
    address: "11 Temple Avenue, Owerri",
  },
  {
    id: "14",
    name: "Amelia Lewis",
    studentId: "STU-014",
    image: "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e",
    className: "Grade 3-C",
    age: "8 yrs",
    gender: "Female",
    status: "Active",
    email: "amelia.lewis@student.edu",
    phone: "+234 803 755 6622",
    address: "24 Lakeview Road, Ilorin",
  },
  {
    id: "15",
    name: "Henry Walker",
    studentId: "STU-015",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
    className: "Grade 5-C",
    age: "10 yrs",
    gender: "Male",
    status: "Inactive",
    email: "henry.walker@student.edu",
    phone: "+234 809 334 9080",
    address: "63 Orchard Lane, Jos",
  },
];



export const teachers: TeacherRow[] = [
  {
    id: "1",
    name: "Michael Thompson",
    teacherId: "TCH-001",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    department: "Mathematics",
    age: "38 years",
    gender: "Male",
    status: "Active",
    phone: "+1 (202) 555-0176",
    class: "5B"
  },
  {
    id: "2",
    name: "Sarah Williams",
    teacherId: "TCH-002",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    department: "English Language",
    age: "34 years",
    gender: "Female",
    status: "Active",
    phone: "+1 (303) 555-0149",
    class: "2A"
  },
  {
    id: "3",
    name: "Daniel Robinson",
    teacherId: "TCH-003",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    department: "Physics",
    age: "41 years",
    gender: "Male",
    status: "Active",
    phone: "+1 (415) 555-0194",
    class: "6A"
  },
  {
    id: "4",
    name: "Emily Carter",
    teacherId: "TCH-004",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
    department: "Biology",
    age: "36 years",
    gender: "Female",
    status: "Inactive",
    phone: "+1 (212) 555-0133",
    class: "1B"
  },
  {
    id: "5",
    name: "James Wilson",
    teacherId: "TCH-005",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    department: "Chemistry",
    age: "45 years",
    gender: "Male",
    status: "Active",
    phone: "+1 (415) 555-0128",
    class: "3B"
  },
  {
    id: "6",
    name: "Olivia Martinez",
    teacherId: "TCH-006",
    image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d",
    department: "Primary Education",
    age: "29 years",
    gender: "Female",
    status: "Active",
    phone: "+1 (646) 555-0172",
    class: "4A"
  },
  {
    id: "7",
    name: "Benjamin Lee",
    teacherId: "TCH-007",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
    department: "Geography",
    age: "39 years",
    gender: "Male",
    status: "Inactive",
    phone: "+1 (502) 555-0189",
    class: "6B"
  },
  {
    id: "8",
    name: "Ava Hernandez",
    teacherId: "TCH-008",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b",
    department: "Fine Arts",
    age: "33 years",
    gender: "Female",
    status: "Active",
    phone: "+1 (708) 555-0164",
    class: "2B"
  },
  {
    id: "9",
    name: "Lucas Moore",
    teacherId: "TCH-009",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
    department: "Computer Science",
    age: "35 years",
    gender: "Male",
    status: "Active",
    phone: "+1 (405) 555-0157",
    class: "5A"
  },
  {
    id: "10",
    name: "Mia Jackson",
    teacherId: "TCH-010",
    image: "https://images.unsplash.com/photo-1545992336-cbfdeeda2f20",
    department: "Home Economics",
    age: "42 years",
    gender: "Female",
    status: "Active",
    phone: "+1 (214) 555-0142",
    class: "3A"
  },
  {
    id: "11",
    name: "Ethan White",
    teacherId: "TCH-011",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    department: "Physical Education",
    age: "37 years",
    gender: "Male",
    status: "Inactive",
    phone: "+1 (509) 555-0121",
    class: "1A"
  },
  {
    id: "12",
    name: "Charlotte Harris",
    teacherId: "TCH-012",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    department: "Civic Education",
    age: "31 years",
    gender: "Female",
    status: "Active",
    phone: "+1 (720) 555-0182",
    class: "6A"
  },
  {
    id: "13",
    name: "Daniel Clark",
    teacherId: "TCH-013",
    image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6",
    department: "Economics",
    age: "44 years",
    gender: "Male",
    status: "Active",
    phone: "+1 (513) 555-0178",
    class: "4B"
  },
  {
    id: "14",
    name: "Amelia Lewis",
    teacherId: "TCH-014",
    image: "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e",
    department: "Literature",
    age: "32 years",
    gender: "Female",
    status: "Active",
    phone: "+1 (325) 555-0139",
    class: "2A"
  },
  {
    id: "15",
    name: "Henry Walker",
    teacherId: "TCH-015",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
    department: "History",
    age: "46 years",
    gender: "Male",
    status: "Inactive",
    phone: "+1 (612) 555-0193",
    class: "5B"
  },
];

export const classes: ClassRow[] = [
  {
    id: "CLS-001",
    name: "10B",
    level: "Secondary Level",
    teacher: "John Smith",
    totalStudents: 28
  },
  {
    id: "CLS-002",
    name: "9A",
    level: "Secondary Level",
    teacher: "Emily Roberts",
    totalStudents: 32
  },
  {
    id: "CLS-003",
    name: "8C",
    level: "Secondary Level",
    teacher: "Michael Johnson",
    totalStudents: 27
  },
  {
    id: "CLS-004",
    name: "7B",
    level: "Secondary Level",
    teacher: "Sarah Thompson",
    totalStudents: 30
  },
  {
    id: "CLS-005",
    name: "6A",
    level: "Primary Level",
    teacher: "Daniel Carter",
    totalStudents: 33
  },
  {
    id: "CLS-006",
    name: "5B",
    level: "Primary Level",
    teacher: "Ava Martinez",
    totalStudents: 22
  },
  {
    id: "CLS-007",
    name: "4C",
    level: "Primary Level",
    teacher: "Liam Anderson",
    totalStudents: 25
  },
  {
    id: "CLS-008",
    name: "3A",
    level: "Primary Level",
    teacher: "Olivia Harris",
    totalStudents: 35
  },
  {
    id: "CLS-009",
    name: "2B",
    level: "Primary Level",
    teacher: "Benjamin Lee",
    totalStudents: 29
  },
  {
    id: "CLS-010",
    name: "1A",
    level: "Primary Level",
    teacher: "Sophia Walker",
    totalStudents: 24
  }
];
export const subjectsMock: SubjectCard[] = [
  {
    id: "sub-001",
    name: "Social Studies",
    schedule: "Tue, Fri • 2:00 PM",
    icon: "Globe",
    teacher: {
      name: "Mr. David Thompson",
      role: "Social Studies Teacher",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200",
    },
  },
  {
    id: "sub-002",
    name: "Mathematics",
    schedule: "Mon, Thu • 10:00 AM",
    icon: "Calculator",
    teacher: {
      name: "Mrs. Linda Okafor",
      role: "Mathematics Teacher",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    },
  },
  {
    id: "sub-003",
    name: "English Language",
    schedule: "Wed • 11:30 AM",
    icon: "BookOpen",
    teacher: {
      name: "Mr. Samuel Wright",
      role: "English Teacher",
      avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200",
    },
  },
  {
    id: "sub-004",
    name: "Basic Science",
    schedule: "Tue, Thu • 1:00 PM",
    icon: "FlaskRound",
    teacher: {
      name: "Ms. Grace Adeniyi",
      role: "Science Teacher",
      avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200",
    },
  },
  {
    id: "sub-005",
    name: "Agricultural Science",
    schedule: "Fri • 9:00 AM",
    icon: "Leaf",
    teacher: {
      name: "Mr. Ibrahim Musa",
      role: "Agricultural Science Teacher",
      avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200",
    },
  },
  {
    id: "sub-006",
    name: "Computer Studies",
    schedule: "Mon, Wed • 12:00 PM",
    icon: "Computer",
    teacher: {
      name: "Mrs. Adaeze Nwosu",
      role: "ICT Instructor",
      avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200",
    },
  },
  {
    id: "sub-007",
    name: "Physical & Health Education",
    schedule: "Tue • 3:00 PM",
    icon: "Dumbbell",
    teacher: {
      name: "Coach Henry Adams",
      role: "PHE Instructor",
      avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200",
    },
  },
  {
    id: "sub-008",
    name: "Home Economics",
    schedule: "Thu • 11:00 AM",
    icon: "Utensils",
    teacher: {
      name: "Mrs. Teniola Bello",
      role: "Home Economics Teacher",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
    },
  },
  {
    id: "sub-009",
    name: "Fine Arts",
    schedule: "Wed • 2:00 PM",
    icon: "Palette",
    teacher: {
      name: "Mr. Julian Peters",
      role: "Fine Arts Teacher",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    },
  },
  {
    id: "sub-010",
    name: "Civic Education",
    schedule: "Fri • 8:00 AM",
    icon: "ShieldCheck",
    teacher: {
      name: "Mrs. Esther John",
      role: "Civic Education Teacher",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200",
    },
  },
];

export const resultsMock: ResultRow[] = [
  {
    id: "1",
    name: "Emma Wilson",
    studentId: "STU-012",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ca1: 92,
    ca2: 94,
    exam: 96,
    project: 93,
    average: 93.8,
    grade: "A+",
    position: 2,
  },
  {
    id: "2",
    name: "Liam Anderson",
    studentId: "STU-003",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ca1: 88,
    ca2: 90,
    exam: 95,
    project: 92,
    average: 91.3,
    grade: "A+",
    position: 3,
  },
  {
    id: "3",
    name: "Sophia Martinez",
    studentId: "STU-006",
    image:
      "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ca1: 90,
    ca2: 92,
    exam: 94,
    project: 90,
    average: 91.5,
    grade: "A+",
    position: 4,
  },
  {
    id: "4",
    name: "Noah Williams",
    studentId: "STU-009",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ca1: 84,
    ca2: 86,
    exam: 91,
    project: 88,
    average: 87.3,
    grade: "A",
    position: 5,
  },
  {
    id: "5",
    name: "Ava Thomas",
    studentId: "STU-008",
    image:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ca1: 78,
    ca2: 82,
    exam: 89,
    project: 85,
    average: 83.5,
    grade: "B",
    position: 6,
  },
  {
    id: "6",
    name: "Daniel Clark",
    studentId: "STU-013",
    image:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ca1: 72,
    ca2: 75,
    exam: 83,
    project: 80,
    average: 77.5,
    grade: "C",
    position: 7,
  },
  {
    id: "7",
    name: "Olivia Brown",
    studentId: "STU-004",
    image:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ca1: 65,
    ca2: 70,
    exam: 78,
    project: 72,
    average: 71.3,
    grade: "C",
    position: 8,
  },
];


export const subjectBreakdown: SubjectBreakdownRow[] = [
  {
    id: "1",
    subject: "Mathematics",
    icon: "calculator",
    iconColor: "bg-purple-100 text-purple-600",
    tests: "18/20",
    assignments: "19/20",
    exam: "55/60",
    total: 92,
    grade: "A+",
    teacher: "Mr. Johnson",
    performance: { label: "Excellent", status: "perf-excellent" },
  },
  {
    id: "2",
    subject: "English Language",
    icon: "book-open",
    iconColor: "bg-blue-100 text-blue-600",
    tests: "17/20",
    assignments: "18/20",
    exam: "52/60",
    total: 87,
    grade: "A",
    teacher: "Mrs. Williams",
    performance: { label: "Excellent", status: "perf-excellent" },
  },
  {
    id: "3",
    subject: "Basic Science",
    icon: "flask-conical",
    iconColor: "bg-emerald-100 text-emerald-600",
    tests: "19/20",
    assignments: "20/20",
    exam: "56/60",
    total: 95,
    grade: "A+",
    teacher: "Dr. Okafor",
    performance: { label: "Excellent", status: "perf-excellent" },
  },
  {
    id: "4",
    subject: "Social Studies",
    icon: "globe",
    iconColor: "bg-amber-100 text-amber-600",
    tests: "16/20",
    assignments: "17/20",
    exam: "50/60",
    total: 83,
    grade: "A",
    teacher: "Mr. Adeyemi",
    performance: { label: "Very Good", status: "perf-good" },
  },
  {
    id: "5",
    subject: "Computer Studies",
    icon: "monitor",
    iconColor: "bg-indigo-100 text-indigo-600",
    tests: "18/20",
    assignments: "19/20",
    exam: "54/60",
    total: 91,
    grade: "A+",
    teacher: "Mr. Ibrahim",
    performance: { label: "Excellent", status: "perf-excellent" },
  },
  {
    id: "6",
    subject: "Creative Arts",
    icon: "palette",
    iconColor: "bg-pink-100 text-pink-600",
    tests: "17/20",
    assignments: "18/20",
    exam: "50/60",
    total: 85,
    grade: "A",
    teacher: "Mrs. Eze",
    performance: { label: "Very Good", status: "perf-good" },
  },
  {
    id: "7",
    subject: "Physical Education",
    icon: "dumbbell",
    iconColor: "bg-red-100 text-red-600",
    tests: "19/20",
    assignments: "20/20",
    exam: "53/60",
    total: 92,
    grade: "A+",
    teacher: "Coach Bello",
    performance: { label: "Excellent", status: "perf-excellent" },
  },
  {
    id: "8",
    subject: "Religious Studies",
    icon: "book-heart",
    iconColor: "bg-cyan-100 text-cyan-600",
    tests: "16/20",
    assignments: "18/20",
    exam: "51/60",
    total: 85,
    grade: "A",
    teacher: "Pastor Okoro",
    performance: { label: "Very Good", status: "perf-good" },
  },
  {
    id: "9",
    subject: "Yoruba Language",
    icon: "languages",
    iconColor: "bg-orange-100 text-orange-600",
    tests: "15/20",
    assignments: "17/20",
    exam: "48/60",
    total: 80,
    grade: "A",
    teacher: "Mrs. Ajayi",
    performance: { label: "Very Good", status: "perf-good" },
  },
  {
    id: "10",
    subject: "Home Economics",
    icon: "chef-hat",
    iconColor: "bg-teal-100 text-teal-600",
    tests: "17/20",
    assignments: "19/20",
    exam: "49/60",
    total: 85,
    grade: "A",
    teacher: "Mrs. Nwosu",
    performance: { label: "Very Good", status: "perf-good" },
  },
  {
    id: "11",
    subject: "Agricultural Science",
    icon: "sprout",
    iconColor: "bg-green-100 text-green-600",
    tests: "18/20",
    assignments: "17/20",
    exam: "52/60",
    total: 87,
    grade: "A",
    teacher: "Mr. Musa",
    performance: { label: "Excellent", status: "perf-excellent" },
  },
];



export const parentsMock: ParentRow[] = [
  {
    id: "0249448",
    name: "Mr. David Okonkwo",
    location: "Lagos, Nigeria",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    phone: "+234 801 234 5678",
    email: "david.okonkwo@email.com",
    students: {
      count: 2,
      summary: "2 Students (JSS1, SSS2)",
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80",
      ],
    },
    status: "Owing",
    balance: { amount: 45000, label: "Due now" },
    lastPayment: "Oct 24, 2023",
  },
  {
    id: "0912331",
    name: "Mrs. Sarah Adebayo",
    location: "Abuja, Nigeria",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    phone: "+234 809 876 5432",
    email: "sarah.adebayo@email.com",
    students: {
      count: 1,
      summary: "1 Student (Grade 4)",
      avatars: [
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64&q=80",
      ],
    },
    status: "Paid",
    balance: { amount: 0, label: "due" },
    lastPayment: "Nov 02, 2023",
  },
];

export const feeStructures: FeeStructure[] = [
      {
        id: "fs1",
        name: "JSS Term 1 Fees",
        term: "1st Term",
        total: 185000,
        status: "Active",
        createdBy: "Admin",
        items: [
          { name: "Tuition Fee", amount: 120000 },
          { name: "Development Levy", amount: 20000 },
          { name: "Books & Materials", amount: 35000 },
          { name: "Medical", amount: 5000 },
          { name: "PTA Levy", amount: 5000 },
          { name: "Uniform", amount: 25000, optional: true },
        ],
      },
      {
        id: "fs2",
        name: "SSS Term 1 Fees",
        term: "1st Term",
        total: 210000,
        status: "Active",
        createdBy: "Admin",
        items: [
          { name: "Tuition Fee", amount: 150000 },
          { name: "Development Levy", amount: 25000 },
          { name: "Books & Materials", amount: 30000 },
          { name: "Medical", amount: 5000 },
        ],
      },
      {
        id: "fs3",
        name: "Primary Term 1 Fees",
        term: "1st Term",
        total: 120000,
        status: "Draft",
        createdBy: "Admin",
        items: [{ name: "Tuition Fee", amount: 120000 }],
      },
    ]
  
export const assignments: ClassAssignment[] = [
      {
        id: "a1",
        className: "JSS 1A",
        structureName: "JSS Term 1 Fees",
        students: 32,
        expected: 5920000,
        collected: 4500000,
        outstanding: 1420000,
        progress: 76,
      },
      {
        id: "a2",
        className: "JSS 1B",
        structureName: "JSS Term 1 Fees",
        students: 30,
        expected: 5550000,
        collected: 5000000,
        outstanding: 550000,
        progress: 90,
      },
    ]


export const schedule: ScheduleItem[] = [
  {
    time: "09:00",
    meridiem: "AM",
    title: "Advanced Mathematics",
    meta: "Room 302 • Mr. Anderson",
    tone: "indigo",
  },
  {
    time: "11:30",
    meridiem: "AM",
    title: "Physics Lab",
    meta: "Lab 4 • Mrs. Davis",
    tone: "orange",
  },
  {
    time: "02:00",
    meridiem: "PM",
    title: "English Literature",
    meta: "Room 105 • Ms. Thompson",
    tone: "green",
  },
];

export const notices: NoticeItem[] = [
  {
    from: "Admin Office",
    message: "School will remain closed on Monday due to public holiday.",
    dot: "red",
  },
  {
    from: "Sports Dept",
    message: "Annual sports day registration closes tomorrow.",
    dot: "blue",
  },
  {
    from: "Library",
    message: "New science journals are now available for checkout.",
    dot: "green",
  },
];



export const weeklyTimetableMock: WeeklyTimetableMock = {
  times: ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  grid: {
    Mon: [
      {
        type: "class",
        subject: "Math",
        teacher: "Ms. Lee",
        style: {
          container: "bg-blue-50 border-blue-200",
          title: "text-blue-900",
          subtitle: "text-blue-600",
        },
      },
      {
        type: "class",
        subject: "Science",
        teacher: "Dr. Chen",
        style: {
          container: "bg-purple-50 border-purple-200",
          title: "text-purple-900",
          subtitle: "text-purple-600",
        },
      },
      { type: "lunch", label: "Lunch" },
      {
        type: "class",
        subject: "English",
        teacher: "Ms. Johnson",
        style: {
          container: "bg-green-50 border-green-200",
          title: "text-green-900",
          subtitle: "text-green-600",
        },
      },
      {
        type: "class",
        subject: "PE",
        teacher: "Mr. Wilson",
        style: {
          container: "bg-red-50 border-red-200",
          title: "text-red-900",
          subtitle: "text-red-600",
        },
      },
    ],
    Tue: [
      {
        type: "class",
        subject: "English",
        teacher: "Ms. Johnson",
        style: {
          container: "bg-green-50 border-green-200",
          title: "text-green-900",
          subtitle: "text-green-600",
        },
      },
      {
        type: "class",
        subject: "Social",
        teacher: "Mr. Thompson",
        style: {
          container: "bg-orange-50 border-orange-200",
          title: "text-orange-900",
          subtitle: "text-orange-600",
        },
      },
      { type: "lunch", label: "Lunch" },
      {
        type: "class",
        subject: "Math",
        teacher: "Ms. Lee",
        style: {
          container: "bg-blue-50 border-blue-200",
          title: "text-blue-900",
          subtitle: "text-blue-600",
        },
      },
      null, // empty slot
    ],
    Wed: [
      {
        type: "class",
        subject: "Math",
        teacher: "Ms. Lee",
        style: {
          container: "bg-blue-50 border-blue-200",
          title: "text-blue-900",
          subtitle: "text-blue-600",
        },
      },
      {
        type: "class",
        subject: "Science",
        teacher: "Dr. Chen",
        style: {
          container: "bg-purple-50 border-purple-200",
          title: "text-purple-900",
          subtitle: "text-purple-600",
        },
      },
      { type: "lunch", label: "Lunch" },
      {
        type: "class",
        subject: "Art",
        teacher: "Ms. Rodriguez",
        style: {
          container: "bg-pink-50 border-pink-200",
          title: "text-pink-900",
          subtitle: "text-pink-600",
        },
      },
      {
        type: "class",
        subject: "PE",
        teacher: "Mr. Wilson",
        style: {
          container: "bg-red-50 border-red-200",
          title: "text-red-900",
          subtitle: "text-red-600",
        },
      },
    ],
    Thu: [
      {
        type: "class",
        subject: "English",
        teacher: "Ms. Johnson",
        style: {
          container: "bg-green-50 border-green-200",
          title: "text-green-900",
          subtitle: "text-green-600",
        },
      },
      {
        type: "class",
        subject: "Social",
        teacher: "Mr. Thompson",
        style: {
          container: "bg-orange-50 border-orange-200",
          title: "text-orange-900",
          subtitle: "text-orange-600",
        },
      },
      { type: "lunch", label: "Lunch" },
      {
        type: "class",
        subject: "Art",
        teacher: "Ms. Rodriguez",
        style: {
          container: "bg-pink-50 border-pink-200",
          title: "text-pink-900",
          subtitle: "text-pink-600",
        },
      },
      null, // empty slot
    ],
    Fri: [
      {
        type: "class",
        subject: "Math",
        teacher: "Ms. Lee",
        style: {
          container: "bg-blue-50 border-blue-200",
          title: "text-blue-900",
          subtitle: "text-blue-600",
        },
      },
      {
        type: "class",
        subject: "Science",
        teacher: "Dr. Chen",
        style: {
          container: "bg-purple-50 border-purple-200",
          title: "text-purple-900",
          subtitle: "text-purple-600",
        },
      },
      { type: "lunch", label: "Lunch" },
      {
        type: "class",
        subject: "Social",
        teacher: "Mr. Thompson",
        style: {
          container: "bg-orange-50 border-orange-200",
          title: "text-orange-900",
          subtitle: "text-orange-600",
        },
      },
      {
        type: "class",
        subject: "PE",
        teacher: "Mr. Wilson",
        style: {
          container: "bg-red-50 border-red-200",
          title: "text-red-900",
          subtitle: "text-red-600",
        },
      },
    ],
  },
};
export const teacherMock = {
  id: "tch_0001",
  name: "Mr. Adeyemi",
};

export const subjectMock = [
  { id: "sub_math", name: "Mathematics", color: "TEAL" as const },
  { id: "sub_fmath", name: "Further Maths", color: "BLUE" as const },
  { id: "sub_bscience", name: "Basic Science", color: "PURPLE" as const },
];

export const classesMock = [
  { id: "cls_jss2a", name: "JSS 2A" },
  { id: "cls_jss3c", name: "JSS 3C" },
  { id: "cls_ss1b", name: "SS 1B" },
  { id: "cls_ss2b", name: "SS 2B" },
  { id: "cls_ss3a", name: "SS 3A" },
];

export const venuesMock = [
  { id: "ven_room204", name: "Room 204" },
  { id: "ven_room205", name: "Room 205" },
  { id: "ven_room206", name: "Room 206" },
  { id: "ven_room301", name: "Room 301" },
  { id: "ven_room302", name: "Room 302" },
  { id: "ven_lab2", name: "Lab 2" },
];


export const timetableEntriesMock: TimetableEntry[] = [
  // 08:00 - 09:00
  { id: "tt_001", classIds: ["cls_jss2a"], subjectId: "sub_math", teacherId: "tch_0001", venueId: "ven_room204", time: { day: "MON", start: "08:00", end: "09:00" } },
  { id: "tt_002", classIds: ["cls_ss2b"], subjectId: "sub_fmath", teacherId: "tch_0001", venueId: "ven_room301", time: { day: "TUE", start: "08:00", end: "09:00" } },
  { id: "tt_003", classIds: ["cls_jss2a"], subjectId: "sub_bscience", teacherId: "tch_0001", venueId: "ven_lab2",   time: { day: "WED", start: "08:00", end: "09:00" } },
  { id: "tt_004", classIds: ["cls_ss1b"], subjectId: "sub_math", teacherId: "tch_0001", venueId: "ven_room206", time: { day: "THU", start: "08:00", end: "09:00" } },
  // FRI 08:00 free

  // 09:00 - 10:00
  { id: "tt_005", classIds: ["cls_jss3c"], subjectId: "sub_math", teacherId: "tch_0001", venueId: "ven_room205", time: { day: "TUE", start: "09:00", end: "10:00" } },
  { id: "tt_006", classIds: ["cls_ss3a"], subjectId: "sub_fmath", teacherId: "tch_0001", venueId: "ven_room302", time: { day: "THU", start: "09:00", end: "10:00" } },
  { id: "tt_007", classIds: ["cls_jss2a"], subjectId: "sub_math", teacherId: "tch_0001", venueId: "ven_room204", time: { day: "FRI", start: "09:00", end: "10:00" } },
  // MON/WED free at 09:00

  // 10:30 - 11:30
  { id: "tt_008", classIds: ["cls_ss2b"], subjectId: "sub_fmath", teacherId: "tch_0001", venueId: "ven_room301", time: { day: "MON", start: "10:30", end: "11:30" } },
  { id: "tt_009", classIds: ["cls_ss1b"], subjectId: "sub_math",  teacherId: "tch_0001", venueId: "ven_room206", time: { day: "WED", start: "10:30", end: "11:30" } },
  { id: "tt_010", classIds: ["cls_ss3a"], subjectId: "sub_fmath", teacherId: "tch_0001", venueId: "ven_room302", time: { day: "FRI", start: "10:30", end: "11:30" } },
  // TUE/THU free at 10:30

  // Lunch block is NOT stored as TimetableEntry (optional).
  // Usually lunch is a school-wide policy, not a teacher lesson.

  // 02:00 - 03:00
  { id: "tt_011", classIds: ["cls_jss3c"], subjectId: "sub_math",     teacherId: "tch_0001", venueId: "ven_room205", time: { day: "MON", start: "14:00", end: "15:00" } },
  { id: "tt_012", classIds: ["cls_jss2a"], subjectId: "sub_bscience", teacherId: "tch_0001", venueId: "ven_lab2",    time: { day: "TUE", start: "14:00", end: "15:00" } },
  { id: "tt_013", classIds: ["cls_jss2a"], subjectId: "sub_math",     teacherId: "tch_0001", venueId: "ven_room204", time: { day: "THU", start: "14:00", end: "15:00" } },
  // WED/FRI free at 14:00
];
