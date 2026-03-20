export type RemarkResult = {
  grade: string;
  label: string;
  teacherRemark: string;
  principalRemark: string;
};

export function getStudentRemark(average: number): RemarkResult {
  const safeAverage = Number.isFinite(average) ? Math.max(0, Math.min(100, average)) : 0;

  if (safeAverage >= 90) {
    return {
      grade: "A+",
      label: "Excellent",
      teacherRemark: "Excellent performance. Keep it up.",
      principalRemark: "Outstanding result. Maintain this excellent standard.",
    };
  }

  if (safeAverage >= 80) {
    return {
      grade: "A",
      label: "Very Good",
      teacherRemark: "Very good performance. Keep pushing higher.",
      principalRemark: "A very commendable result. Keep improving.",
    };
  }

  if (safeAverage >= 70) {
    return {
      grade: "B",
      label: "Good",
      teacherRemark: "Good performance. Stay focused and consistent.",
      principalRemark: "A good result. There is still room for greater achievement.",
    };
  }

  if (safeAverage >= 60) {
    return {
      grade: "C",
      label: "Fair",
      teacherRemark: "Fair performance. You need to put in more effort.",
      principalRemark: "An average result. Improvement is expected next term.",
    };
  }

  if (safeAverage >= 50) {
    return {
      grade: "D",
      label: "Pass",
      teacherRemark: "Pass. Work harder to achieve better results.",
      principalRemark: "You can do better with more seriousness and commitment.",
    };
  }

  if (safeAverage >= 40) {
    return {
      grade: "E",
      label: "Weak",
      teacherRemark: "Weak performance. Serious improvement is needed.",
      principalRemark: "This result is below expectation. More effort is required.",
    };
  }

  return {
    grade: "F",
    label: "Fail",
    teacherRemark: "Poor performance. You need to work much harder.",
    principalRemark: "A disappointing result. Immediate improvement is necessary.",
  };
}
