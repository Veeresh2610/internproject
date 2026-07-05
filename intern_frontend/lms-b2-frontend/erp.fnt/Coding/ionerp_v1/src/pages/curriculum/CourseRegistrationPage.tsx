import React, { useState, useEffect, useMemo } from "react";
import CurriculumPageLayout from "./CurriculumPageLayout";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/api";
import { LmsApiEndpoint } from "../../utils/ApiEndpoint/lmsApiEndpoint";
import { Info, HelpCircle, List, ArrowUpDown } from "lucide-react";

interface CourseItem {
  id: string;
  section: string;
  code: string;
  title: string;
  type: "Core" | "Elective";
  credits: number;
  totalMarks: number;
  owner: string;
  reviewer: string;
  mode: string;
  instructor: string;
  status: "Register" | "Pending Approval" | "Registered";
}

const CourseRegistrationPage: React.FC = () => {
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [curriculumsLoading, setCurriculumsLoading] = useState(false);
  const [semestersLoading, setSemestersLoading] = useState(false);

  // Table controls
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof CourseItem; direction: "asc" | "desc" } | null>({
    key: "section",
    direction: "asc"
  });

  // Course registrations state
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [registeringIds, setRegisteringIds] = useState<string[]>([]);

  // Fetch curriculums
  useEffect(() => {
    const fetchCurriculums = async () => {
      setCurriculumsLoading(true);
      try {
        // Safe check using general mentoringSession endpoint
        const url = LmsApiEndpoint.mentoringSession.curriculumList;
        const res = await axiosInstance.get<any>(url);
        if (res.data && res.data.status && res.data.data && res.data.data.length > 0) {
          const mapped = res.data.data.map((b: any) => ({
            id: String(b.academic_batch_id),
            code: b.academic_batch_code,
            desc: b.academic_batch_desc || `${b.academic_batch_name || ""} ${b.academic_batch_code || ""}`.trim(),
          }));
          setCurriculums(mapped);
        } else {
          setCurriculums([
            { id: "1", code: "BE-CSE-2019", desc: "B. E in CSE 2019-2023" },
            { id: "2", code: "BE-ECE-2020", desc: "B. E in ECE 2020-2024" },
            { id: "3", code: "BE-ISE-2021", desc: "B. E in ISE 2021-2025" }
          ]);
        }
      } catch (err) {
        setCurriculums([
          { id: "1", code: "BE-CSE-2019", desc: "B. E in CSE 2019-2023" },
          { id: "2", code: "BE-ECE-2020", desc: "B. E in ECE 2020-2024" },
          { id: "3", code: "BE-ISE-2021", desc: "B. E in ISE 2021-2025" }
        ]);
      } finally {
        setCurriculumsLoading(false);
      }
    };
    fetchCurriculums();
  }, []);

  // Default to B. E in CSE 2019-2023 if loaded
  useEffect(() => {
    if (curriculums.length > 0 && !selectedCurriculum) {
      const defaultCur = curriculums.find(c => c.desc.includes("CSE 2019") || c.desc.includes("CSE"));
      if (defaultCur) {
        setSelectedCurriculum(defaultCur.id);
      } else {
        setSelectedCurriculum(curriculums[0].id);
      }
    }
  }, [curriculums, selectedCurriculum]);

  // Fetch terms/semesters based on curriculum
  useEffect(() => {
    if (!selectedCurriculum) {
      setSemesters([]);
      setSelectedTerm("");
      return;
    }
    const fetchSemesters = async () => {
      setSemestersLoading(true);
      try {
        const url = `${LmsApiEndpoint.mentoringSession.semestersByCurriculum}/${selectedCurriculum}`;
        const res = await axiosInstance.get<any>(url);
        if (res.data && res.data.status && res.data.data && res.data.data.length > 0) {
          const mapped = res.data.data.map((s: any) => ({
            id: String(s.semester_id),
            code: s.semester_code,
            desc: s.semester_desc,
          }));
          setSemesters(mapped);
        } else {
          setSemesters([
            { id: "1", code: "SEM1", desc: "Semester 1" },
            { id: "2", code: "SEM2", desc: "Semester 2" },
            { id: "3", code: "SEM3", desc: "Semester 3" },
            { id: "4", code: "SEM4", desc: "Semester 4" },
            { id: "5", code: "SEM5", desc: "Semester 5" },
            { id: "6", code: "SEM6", desc: "Semester 6" },
            { id: "7", code: "SEM7", desc: "Semester 7" },
            { id: "8", code: "SEM8", desc: "Semester 8" }
          ]);
        }
      } catch (err) {
        setSemesters([
          { id: "1", code: "SEM1", desc: "Semester 1" },
          { id: "2", code: "SEM2", desc: "Semester 2" },
          { id: "3", code: "SEM3", desc: "Semester 3" },
          { id: "4", code: "SEM4", desc: "Semester 4" },
          { id: "5", code: "SEM5", desc: "Semester 5" },
          { id: "6", code: "SEM6", desc: "Semester 6" },
          { id: "7", code: "SEM7", desc: "Semester 7" },
          { id: "8", code: "SEM8", desc: "Semester 8" }
        ]);
      } finally {
        setSemestersLoading(false);
      }
    };
    fetchSemesters();
  }, [selectedCurriculum]);

  // Load mock course registration list based on selections
  useEffect(() => {
    if (!selectedCurriculum || !selectedTerm) {
      setCourses([]);
      return;
    }

    // Mock data populated once curriculum and term are chosen
    const mockCourses: CourseItem[] = [
      {
        id: "c1",
        section: "A",
        code: "18CS61",
        title: "System Software and Compilers",
        type: "Core",
        credits: 4,
        totalMarks: 100,
        owner: "Dr. Suresh Kumar",
        reviewer: "Prof. Anita Rao",
        mode: "Lecture",
        instructor: "Dr. Ramesh Dev",
        status: "Register",
      },
      {
        id: "c2",
        section: "A",
        code: "18CS62",
        title: "Computer Graphics and Visualization",
        type: "Core",
        credits: 4,
        totalMarks: 100,
        owner: "Dr. Mamatha J",
        reviewer: "Dr. Kiran K",
        mode: "Lecture",
        instructor: "Mrs. Deepa Gowda",
        status: "Register",
      },
      {
        id: "c3",
        section: "A",
        code: "18CS63",
        title: "Web Technology and its Applications",
        type: "Core",
        credits: 3,
        totalMarks: 100,
        owner: "Mr. Harish Kumar",
        reviewer: "Dr. Raghavendra",
        mode: "Lecture + Practical",
        instructor: "Mr. Harish Kumar",
        status: "Register",
      },
      {
        id: "c4",
        section: "A",
        code: "18CSE641",
        title: "Advanced Computer Architecture",
        type: "Elective",
        credits: 3,
        totalMarks: 100,
        owner: "Dr. Asha Latha",
        reviewer: "Prof. Naveen S",
        mode: "Lecture",
        instructor: "Dr. Asha Latha",
        status: "Register",
      },
      {
        id: "c5",
        section: "B",
        code: "18CSE652",
        title: "Introduction to Data Science",
        type: "Elective",
        credits: 3,
        totalMarks: 100,
        owner: "Dr. Prem Singh",
        reviewer: "Dr. Asha Latha",
        mode: "Lecture",
        instructor: "Dr. Prem Singh",
        status: "Register",
      }
    ];
    setCourses(mockCourses);
  }, [selectedCurriculum, selectedTerm]);

  // Handle course registration click
  const handleRegister = (courseId: string, title: string) => {
    setRegisteringIds(prev => [...prev, courseId]);
    
    // Mock network request delay
    setTimeout(() => {
      setCourses(prev =>
        prev.map(c => (c.id === courseId ? { ...c, status: "Registered" as const } : c))
      );
      setRegisteringIds(prev => prev.filter(id => id !== courseId));
      toast.success(`Successfully registered for course: ${title}!`);
    }, 1000);
  };

  // Sorting logic
  const handleSort = (key: keyof CourseItem) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCourses = useMemo(() => {
    if (!sortConfig) return courses;
    const sorted = [...courses].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [courses, sortConfig]);

  // Filtering logic
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return sortedCourses;
    const query = searchQuery.toLowerCase();
    return sortedCourses.filter(
      c =>
        c.code.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query) ||
        c.owner.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
    );
  }, [sortedCourses, searchQuery]);

  // Pagination logic
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredCourses.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredCourses, currentPage, entriesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / entriesPerPage));

  return (
    <CurriculumPageLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
        
        {/* Dark Header Title Bar */}
        <div className="bg-[#1e293b] text-white px-5 py-3 flex items-center justify-between shadow-sm">
          <span className="text-[15px] font-semibold tracking-wide">Student to course Registration</span>
          <div className="flex items-center gap-3">
            <button className="text-white/80 hover:text-white p-1 rounded hover:bg-slate-700/50 transition" title="View layout options">
              <List size={17} />
            </button>
            <button className="text-white/80 hover:text-white p-1 rounded hover:bg-slate-700/50 transition" title="Page Information">
              <Info size={17} />
            </button>
            <button className="text-white/80 hover:text-white p-1 rounded hover:bg-slate-700/50 transition" title="Get Help">
              <HelpCircle size={17} />
            </button>
          </div>
        </div>

        {/* Dropdowns Selection Panel */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Curriculum Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Curriculum:<span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs shadow-sm transition-colors"
                value={selectedCurriculum}
                onChange={(e) => {
                  setSelectedCurriculum(e.target.value);
                  setSelectedTerm("");
                  setCurrentPage(1);
                }}
                disabled={curriculumsLoading}
              >
                <option value="">{curriculumsLoading ? "Loading..." : "Select Curriculum"}</option>
                {curriculums.map(c => (
                  <option key={c.id} value={c.id}>{c.desc}</option>
                ))}
              </select>
            </div>

            {/* Term/Semester Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Term:<span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs shadow-sm transition-colors disabled:opacity-50"
                value={selectedTerm}
                onChange={(e) => {
                  setSelectedTerm(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={!selectedCurriculum || semestersLoading}
              >
                <option value="">{semestersLoading ? "Loading..." : "Select Term"}</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.desc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls (Show entries and Search) */}
        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 focus:outline-none text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto">
            <span>Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-300 dark:border-slate-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 focus:outline-none text-xs w-full sm:w-64"
            />
          </div>
        </div>

        {/* Course Registration Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-y border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 uppercase font-semibold">
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 w-16">SI No.</th>
                <th 
                  onClick={() => handleSort("section")} 
                  className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Section</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Code</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Course Title</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Core / Elective</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Credits</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Total Marks</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Course Owner</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Course Reviewer</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Mode</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Section/Course Instructor</th>
                <th className="px-4 py-3">Student to Course Registration Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((c, index) => {
                  const siNo = (currentPage - 1) * entriesPerPage + index + 1;
                  const isRegistering = registeringIds.includes(c.id);

                  return (
                    <tr key={c.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">{siNo}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 font-semibold">{c.section}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">{c.code}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100">{c.title}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                          c.type === "Core" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" : "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center font-bold text-slate-700 dark:text-slate-300">{c.credits}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-center font-semibold text-slate-500">{c.totalMarks}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350">{c.owner}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350">{c.reviewer}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">{c.mode}</td>
                      <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">{c.instructor}</td>
                      <td className="px-4 py-3">
                        {c.status === "Register" ? (
                          <button
                            onClick={() => handleRegister(c.id, c.title)}
                            disabled={isRegistering}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded text-[10px] font-bold shadow-xs cursor-pointer transition select-none"
                          >
                            {isRegistering ? "Registering..." : "Register"}
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold text-[10px]">
                            ✓ Registered
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic bg-slate-50/20">
                    {selectedCurriculum && selectedTerm ? "No data matched the search query." : "No data available in table"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredCourses.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * entriesPerPage, filteredCourses.length)} of {filteredCourses.length} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || filteredCourses.length === 0}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed select-none transition"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-300 px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || filteredCourses.length === 0}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed select-none transition"
            >
              Next →
            </button>
          </div>
        </div>

      </div>
    </CurriculumPageLayout>
  );
};

export default CourseRegistrationPage;
