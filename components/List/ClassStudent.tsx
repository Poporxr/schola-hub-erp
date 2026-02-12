import ClassStudentClient from "./ClassStudentClient";

export type ClassStudentItem = {
    id: string;
    admissionNumber: string;
    gender: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
    };
};

const ClassStudent = ({ students }: { students: ClassStudentItem[] }) => {
    return <ClassStudentClient students={students} />;
};

export default ClassStudent;
