import PrintButton from "@/components/PrintButton";

export default function PrintResultPage() {
  return (
    <div className="bg-white text-black overflow-auto h-screen">
      {/* page container (A4-ish width) */}
      <div className="mx-auto w-[210mm] max-w-full px-4 py-6 print:px-0 print:py-0">
        <div className="print-view">
          {/* School Header Section */}
          <div className="relative mb-4 border-b-2 border-black pb-2 text-center">
            {/* School Logo (Left) */}
            <div className="absolute left-0 top-0">
              <img
                src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop"
                alt="School Logo"
                className="h-15 w-15 rounded-full border-2 border-black object-cover"
              />
            </div>

            {/* Student Passport (Right) */}
            <div className="absolute right-0 top-0">
              <img
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Student"
                className="h-25 w-20 border-2 border-black object-cover"
              />
            </div>

            <h1 className="m-0 text-[20pt] font-bold leading-tight">
              EXCELLENCE INTERNATIONAL SCHOOL
            </h1>
            <p className="mt-1 text-[9pt] text-gray-800">
              Plot 45, Education Avenue, Victoria Island, Lagos State
            </p>
            <p className="text-[9pt] text-gray-800">
              Tel: +234 801 234 5678 | Email: info@excellenceschool.edu.ng
            </p>
            <p className="mt-1 text-[8pt] italic text-gray-600">
              "Excellence in Education, Character in Life"
            </p>
          </div>

          {/* Result Sheet Title */}
          <div className="my-4 text-center">
            <h2 className="inline-block border-2 border-black px-3 py-2 rounded-xl text-[14pt] font-bold uppercase tracking-[2px]">
              TERMINAL REPORT SHEET
            </h2>
          </div>

          {/* Student Information Grid */}
          <div className="mb-4 grid grid-cols-4 gap-y-2 border rounded-xl border-black p-3 text-[9pt]">
            <div className="font-semibold">Name:</div>
            <div className="col-span-1 font-bold">LIAM ANDERSON</div>
            <div className="font-semibold">Admission No:</div>
            <div className="font-bold">STU-006</div>

            <div className="font-semibold">Class:</div>
            <div className="font-bold">GRADE 3A</div>

            <div className="font-semibold">Term:</div>
            <div className="font-bold">SECOND TERM</div>
            <div className="font-semibold">Session:</div>
            <div className="font-bold">2023/2024</div>

            <div className="font-semibold">No. in Class:</div>
            <div className="font-bold">28</div>
            <div className="font-semibold">Position:</div>
            <div className="font-extrabold text-amber-600">1ST</div>
          </div>

          {/* Main Result Table */}
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border-collapse text-[8.5pt]">
              <thead className="bg-gray-200 print:table-header-group">
                <tr className="border border-black">
                  {[
                    "SN",
                    "SUBJECTS",
                    "TEST-1\n(10%)",
                    "TEST-2\n(10%)",
                    "PRO/CW\n(8%)",
                    "THA\n(8%)",
                    "ATT.\n(4%)",
                    "TOTAL CA\n(40%)",
                    "EXAMS\n(60%)",
                    "TOTAL\n(100%)",
                    "CLASS AVG",
                    "POS",
                    "HIGH",
                    "LOW",
                    "GRD",
                    "REMARK",
                  ].map((h) => (
                    <th
                      key={h}
                      className="border border-black px-1 py-1 text-center font-bold whitespace-pre-line"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    sn: 1,
                    subject: "Mathematics",
                    t1: 9,
                    t2: 9,
                    procw: 8,
                    tha: 7,
                    att: 4,
                    totalCa: 37,
                    exams: 55,
                    total: 92,
                    avg: "78.5",
                    pos: "1st",
                    high: 95,
                    low: 52,
                    grd: "A+",
                    remark: "Excellent",
                  },
                  {
                    sn: 2,
                    subject: "English Language",
                    t1: 8,
                    t2: 9,
                    procw: 7,
                    tha: 8,
                    att: 3,
                    totalCa: 35,
                    exams: 52,
                    total: 87,
                    avg: "75.2",
                    pos: "2nd",
                    high: 92,
                    low: 48,
                    grd: "A",
                    remark: "Excellent",
                  },
                ].map((r) => (
                  <tr key={r.sn} className="border border-black">
                    <td className="border border-black px-1 py-1 text-center">
                      {r.sn}
                    </td>
                    <td className="border border-black px-1 py-1">
                      {r.subject}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.t1}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.t2}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.procw}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.tha}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.att}
                    </td>
                    <td className="border border-black px-1 py-1 text-center font-bold">
                      {r.totalCa}
                    </td>
                    <td className="border border-black px-1 py-1 text-center font-bold">
                      {r.exams}
                    </td>
                    <td className="border border-black bg-gray-100 px-1 py-1 text-center font-bold">
                      {r.total}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.avg}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.pos}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.high}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">
                      {r.low}
                    </td>
                    <td className="border border-black px-1 py-1 text-center font-bold">
                      {r.grd}
                    </td>
                    <td className="border border-black px-1 py-1 text-center text-[8pt]">
                      {r.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grading Key */}
          <div className="mb-4 border border-black p-2 text-[8pt]">
            <span className="font-bold uppercase">Grading Key:</span>
            <span className="ml-2">A+ (90-100) Excellent</span> |{" "}
            <span>A (80-89) Very Good</span> | <span>B (70-79) Good</span> |{" "}
            <span>C (60-69) Fair</span> | <span>D (50-59) Pass</span> |{" "}
            <span>E (40-49) Weak Pass</span> | <span>F (0-39) Fail</span>
          </div>

          {/* Behavioural Traits Tables */}
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-2">
            {/* Affective */}
            <div>
              <table className="w-full border-collapse text-[9pt]">
                <thead className="print:table-header-group">
                  <tr>
                    <th
                      colSpan={2}
                      className="border border-black bg-gray-200 px-2 py-1 text-center font-bold"
                    >
                      AFFECTIVE DOMAIN (BEHAVIOUR)
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-1 text-left">
                      TRAIT
                    </th>
                    <th className="border border-black px-2 py-1 text-center">
                      RATING
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Punctuality", 5],
                    ["Neatness", 5],
                    ["Politeness", 5],
                    ["Honesty", 4],
                    ["Relationship with Others", 5],
                    ["Attentiveness", 5],
                    ["Self Control", 4],
                  ].map(([trait, rating]) => (
                    <tr key={String(trait)}>
                      <td className="border border-black px-2 py-1">
                        {trait}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Psychomotor */}
            <div>
              <table className="w-full border-collapse text-[9pt]">
                <thead className="print:table-header-group">
                  <tr>
                    <th
                      colSpan={2}
                      className="border border-black bg-gray-200 px-2 py-1 text-center font-bold"
                    >
                      PSYCHOMOTOR DOMAIN (SKILLS)
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-1 text-left">
                      SKILL
                    </th>
                    <th className="border border-black px-2 py-1 text-center">
                      RATING
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Handwriting", 5],
                    ["Sports & Games", 5],
                    ["Drawing & Painting", 4],
                    ["Musical Skills", 4],
                    ["Verbal Fluency", 5],
                    ["Handling Tools/Equipment", 4],
                    ["Physical Fitness", 5],
                  ].map(([skill, rating]) => (
                    <tr key={String(skill)}>
                      <td className="border border-black px-2 py-1">{skill}</td>
                      <td className="border border-black px-2 py-1 text-center">
                        {rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rating Key */}
          <div className="mb-4 border border-black p-2 text-center text-[8pt]">
            <span className="font-bold">Rating Key:</span>
            <span className="ml-2">5 = Excellent</span> |{" "}
            <span>4 = Very Good</span> | <span>3 = Good</span> |{" "}
            <span>2 = Fair</span> | <span>1 = Poor</span>
          </div>

          {/* Result Summary */}
          <div className="mb-4 border border-black p-3 text-[9pt]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div>
                  <span className="font-bold">Total Subjects:</span> 10
                </div>
                <div>
                  <span className="font-bold">Total Obtainable:</span> 1000
                </div>
                <div>
                  <span className="font-bold">Total Obtained:</span> 875
                </div>
              </div>
              <div>
                <div>
                  <span className="font-bold">Average Score:</span> 87.5%
                </div>
                <div>
                  <span className="font-bold">Class Position:</span> 1st of 28
                </div>
                <div>
                  <span className="font-bold">Overall Grade:</span> A+
                </div>
              </div>
              <div>
                <div className="font-bold">Attendance:</div>
                <div>School Opened: 65 days</div>
                <div>Times Present: 64 days</div>
                <div>Times Absent: 1 day</div>
              </div>
            </div>
          </div>

          {/* Remarks and Signatures */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="border border-black p-3 text-[9pt]">
              <div className="font-bold uppercase">Form Teacher&apos;s Remark:</div>
              <p className="mt-2 leading-relaxed">
                Liam has demonstrated exceptional academic performance throughout
                the term. His dedication to learning and excellent behavior make
                him a role model. Keep up the outstanding work!
              </p>
              <div className="mt-4 border-t border-black pt-2 text-[8pt]">
                <div className="font-bold">Mrs. Sarah Jenkins</div>
                <div>Form Teacher</div>
              </div>
            </div>

            <div className="border border-black p-3 text-[9pt]">
              <div className="font-bold uppercase">Principal&apos;s Remark:</div>
              <p className="mt-2 leading-relaxed">
                An excellent performance. Liam is a brilliant student with great
                potential. We are proud of his achievements and look forward to
                continued excellence.
              </p>
              <div className="mt-4 border-t border-black pt-2 text-[8pt]">
                <div className="font-bold">Dr. Emmanuel Okonkwo</div>
                <div>Principal</div>
              </div>
            </div>
          </div>

          {/* Next Term */}
            <div>
              <span className="font-bold uppercase">Next Term Begins:</span>{" "}
              Monday, 15th April, 2024
            </div>
        </div>
      </div>
      <PrintButton />
    </div>
  );
}