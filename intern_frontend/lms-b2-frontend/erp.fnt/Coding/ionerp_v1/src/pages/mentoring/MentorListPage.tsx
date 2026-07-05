import React, { useState, useEffect, useRef, useMemo } from "react";
import MentoringPageLayout from "./MentoringPageLayout";
import { FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAxios } from "../../hooks/useAxios";
import { LmsApiEndpoint } from "../../utils/ApiEndpoint/lmsApiEndpoint";

interface DepartmentItem {
  dept_id: number;
  dept_name: string;
}

interface ProgramItem {
  pgm_id: number;
  pgm_title: string;
  pgm_acronym: string;
}

interface CurriculumItem {
  crclm_id: number;
  crclm_name: string;
}

interface MenteeItem {
  student_id: number;
  student_name: string;
  student_usn: string;
  student_email: string;
}

interface MentorMenteeRecord {
  group_mentor_id: number;
  mentor_id: number;
  mentor_name: string;
  mentor_email: string;
  mentor_dept: string;
  group_title: string;
  mentees: MenteeItem[];
}

const MentorListPage: React.FC = () => {
  const [departmentId, setDepartmentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumItem[]>([]);
  const [semesters, setSemesters] = useState<{ semester_id: number; semester: number; semester_desc: string }[]>([]);
  const [records, setRecords] = useState<MentorMenteeRecord[]>([]);

  const [listLoading, setListLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [curriculumsLoading, setCurriculumsLoading] = useState(false);
  const [semestersLoading, setSemestersLoading] = useState(false);

  const { customApiCall, custompdfApiCall } = useAxios<null, any>(
    LmsApiEndpoint.mentorList.departments,
    { method: "get", shouldFetch: false }
  );

  const customApiCallRef = useRef(customApiCall);
  const custompdfApiCallRef = useRef(custompdfApiCall);
  useEffect(() => { customApiCallRef.current = customApiCall; });
  useEffect(() => { custompdfApiCallRef.current = custompdfApiCall; });

  // 1. Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      const result = await customApiCallRef.current<null, DepartmentItem[]>(
        LmsApiEndpoint.mentorList.departments,
        "get"
      );
      if (result) {
        setDepartments(result);
      }
    };
    fetchDepartments();
  }, []);

  // 2. Fetch programs when department changes
  useEffect(() => {
    if (!departmentId) {
      setPrograms([]);
      setProgramId("");
      setCurriculums([]);
      setCurriculumId("");
      setSemesters([]);
      setSemesterId("");
      setRecords([]);
      return;
    }
    const fetchPrograms = async () => {
      setProgramsLoading(true);
      const result = await customApiCallRef.current<null, ProgramItem[]>(
        `${LmsApiEndpoint.mentorList.programs}?dept_id=${departmentId}`,
        "get"
      );
      setPrograms(result ?? []);
      setProgramId("");
      setCurriculums([]);
      setCurriculumId("");
      setSemesters([]);
      setSemesterId("");
      setRecords([]);
      setProgramsLoading(false);
    };
    fetchPrograms();
  }, [departmentId]);

  // 3. Fetch curriculums when program and department change
  useEffect(() => {
    if (!departmentId || !programId) {
      setCurriculums([]);
      setCurriculumId("");
      setSemesters([]);
      setSemesterId("");
      setRecords([]);
      return;
    }
    const fetchCurriculums = async () => {
      setCurriculumsLoading(true);
      const result = await customApiCallRef.current<null, CurriculumItem[]>(
        `${LmsApiEndpoint.mentorList.curriculums}?dept_id=${departmentId}&pgm_id=${programId}`,
        "get"
      );
      setCurriculums(result ?? []);
      setCurriculumId("");
      setSemesters([]);
      setSemesterId("");
      setRecords([]);
      setCurriculumsLoading(false);
    };
    fetchCurriculums();
  }, [departmentId, programId]);

  // 3.5 Fetch semesters when curriculum, program, and department change
  useEffect(() => {
    if (!departmentId || !programId || !curriculumId) {
      setSemesters([]);
      setSemesterId("");
      setRecords([]);
      return;
    }
    const fetchSemesters = async () => {
      setSemestersLoading(true);
      const result = await customApiCallRef.current<null, any[]>(
        `${LmsApiEndpoint.mentorList.semesters}?dept_id=${departmentId}&pgm_id=${programId}&curriculum_id=${curriculumId}`,
        "get"
      );
      setSemesters(result ?? []);
      setSemesterId("");
      setRecords([]);
      setSemestersLoading(false);
    };
    fetchSemesters();
  }, [departmentId, programId, curriculumId]);

  // 4. Fetch allocation details when all filters are set
  useEffect(() => {
    if (!departmentId || !programId || !curriculumId || !semesterId) {
      setRecords([]);
      return;
    }
    const fetchAllocation = async () => {
      setListLoading(true);
      const url = `${LmsApiEndpoint.mentorList.mentorsMentees}?dept_id=${departmentId}&pgm_id=${programId}&curriculum_id=${curriculumId}&semester_id=${semesterId}`;
      const result = await customApiCallRef.current<null, MentorMenteeRecord[]>(
        url,
        "get"
      );
      setRecords(result ?? []);
      setListLoading(false);
    };
    fetchAllocation();
  }, [departmentId, programId, curriculumId, semesterId]);

  // --- PDF Export ---
  const handleExportPdf = async () => {
    if (!departmentId || !programId || !curriculumId || !semesterId) {
      toast.warning("Please select Department, Program, Curriculum, and Term to export.");
      return;
    }

    const url = `${LmsApiEndpoint.mentorList.exportPdf}?dept_id=${departmentId}&pgm_id=${programId}&curriculum_id=${curriculumId}&semester_id=${semesterId}`;

    await custompdfApiCallRef.current<null, any>(
      url,
      "get",
      undefined,
      false,
      "pdf",
      `Mentor_Mentee_Allocation_${new Date().toISOString().slice(0, 10)}`
    );
  };

  return (
    <MentoringPageLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-800 dark:bg-slate-950 px-6 py-4">
          <h2 className="text-xl font-bold text-white tracking-wide">Mentor List</h2>
        </div>

        <div className="p-6">
          {/* Filters Row aligned side-by-side with Export button */}
          <div className="flex flex-col lg:flex-row items-end gap-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow w-full">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Department: <span className="text-red-505">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                  ))}
                </select>
              </div>

              {/* Program */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Program: <span className="text-red-505">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs disabled:opacity-50"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  disabled={!departmentId || programsLoading}
                >
                  <option value="">
                    {programsLoading ? "Loading..." : "Select Program"}
                  </option>
                  {programs.map(p => (
                    <option key={p.pgm_id} value={p.pgm_id}>{p.pgm_title} ({p.pgm_acronym})</option>
                  ))}
                </select>
              </div>

              {/* Curriculum */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Curriculum: <span className="text-red-505">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs disabled:opacity-50"
                  value={curriculumId}
                  onChange={(e) => setCurriculumId(e.target.value)}
                  disabled={!programId || curriculumsLoading}
                >
                  <option value="">
                    {curriculumsLoading ? "Loading..." : "Select Curriculum"}
                  </option>
                  {curriculums.map(c => (
                    <option key={c.crclm_id} value={c.crclm_id}>{c.crclm_name}</option>
                  ))}
                </select>
              </div>

              {/* Term */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Term: <span className="text-red-505">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs disabled:opacity-50"
                  value={semesterId}
                  onChange={(e) => setSemesterId(e.target.value)}
                  disabled={!curriculumId || semestersLoading}
                >
                  <option value="">
                    {semestersLoading ? "Loading..." : "Select Term"}
                  </option>
                  {semesters.map(s => (
                    <option key={s.semester_id} value={s.semester_id}>{s.semester_desc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Export Button aligned on the right */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <button
                onClick={handleExportPdf}
                disabled={!departmentId || !programId || !curriculumId || !semesterId}
                className="flex items-center justify-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded shadow transition duration-150 cursor-pointer w-full lg:w-auto h-[38px] select-none"
                title="Export Mentor List as PDF"
              >
                <FaFilePdf size={13} />
                Export
              </button>
            </div>
          </div>

          {/* Grouped Mentor Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {listLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm animate-pulse h-64" />
              ))
            ) : records.length > 0 ? (
              records.map((rec, index) => (
                <div key={rec.group_mentor_id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden shadow-sm flex flex-col">
                  {/* Banner header for mentor */}
                  <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2.5 text-center text-white text-xs font-bold uppercase tracking-wider">
                    MENTOR NAME: {rec.mentor_name}
                  </div>

                  {/* Table area */}
                  <div className="flex-grow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs text-left">
                      <thead className="bg-gray-550 dark:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider">
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="px-4 py-2.5 w-16 border-b border-gray-200 dark:border-gray-700 border-r dark:border-gray-600">Sl. No</th>
                          <th className="px-4 py-2.5 w-32 border-b border-gray-200 dark:border-gray-700 border-r dark:border-gray-600">USN</th>
                          <th className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">Name of the Student</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-150 dark:divide-gray-700 text-gray-800 dark:text-gray-250">
                        {rec.mentees && rec.mentees.length > 0 ? (
                          rec.mentees.map((m, idx) => (
                            <tr key={m.student_id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/5 transition-colors">
                              <td className="px-4 py-2 font-medium text-gray-500 border-r dark:border-gray-705">{idx + 1}</td>
                              <td className="px-4 py-2 font-semibold text-gray-650 dark:text-gray-300 border-r dark:border-gray-705">{m.student_usn || "-"}</td>
                              <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{m.student_name}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400 dark:text-gray-550 font-medium">
                              No mentees assigned to this mentor.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer signature line */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-350">
                    Mentor Signature: 
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                {!departmentId || !programId || !curriculumId || !semesterId
                  ? "Please select Department, Program, Curriculum, and Term to view the allocation list."
                  : "No mentor-mentee allocation records found."}
              </div>
            )}
          </div>
        </div>
      </div>
    </MentoringPageLayout>
  );
};

export default MentorListPage;
