import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaSort, FaSortUp, FaSortDown, FaSave } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import MentoringPageLayout from "./MentoringPageLayout";
import { useAxios } from "../../hooks/useAxios";
import { LmsApiEndpoint } from "../../utils/ApiEndpoint/lmsApiEndpoint";
import { LocalStorageHelper } from "../../utils/localStorageHelper";
import { loginData } from "../login/loginModel";

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────
interface DepartmentItem {
  dept_id: number;
  dept_name: string;
  dept_acronym: string;
}

interface UserItem {
  user_id: number;
  name: string;
  email: string;
}

interface CurriculumItem {
  crclm_id: number;
  crclm_name: string;
}

interface CrossDeptMentorRecord {
  id: number;
  mentor_user_id: number;
  mentor_name: string;
  mentor_email: string;
  mentor_dept_id: number;
  mentor_dept_name: string;
  assigned_dept_id: number;
  assigned_dept_name: string;
  curriculum_id?: number | null;
  curriculum_name?: string | null;
}

// ─────────────────────────────────────────────
// Reusable Sort Icon
// ─────────────────────────────────────────────
const SortIcon: React.FC<{
  col: string;
  sortCol: string;
  sortDir: "asc" | "desc";
}> = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col) return <FaSort className="inline ml-1 text-gray-400 text-xs" />;
  return sortDir === "asc" ? (
    <FaSortUp className="inline ml-1 text-gray-750 dark:text-gray-200 text-sm" />
  ) : (
    <FaSortDown className="inline ml-1 text-gray-750 dark:text-gray-200 text-sm" />
  );
};

// ─────────────────────────────────────────────
// Generic Pagination Controls
// ─────────────────────────────────────────────
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  entriesPerPage: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ currentPage, totalPages, totalEntries, entriesPerPage, onPrev, onNext }) => {
  const start = totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const end = Math.min(currentPage * entriesPerPage, totalEntries);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
      <span>
        Showing {start} to {end} of {totalEntries} entries
      </span>
      <div className="flex gap-1">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Tab 1: Mentors FROM Other Departments
// ─────────────────────────────────────────────
const MentorsFromTab: React.FC = () => {
  const [filterDeptId, setFilterDeptId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Add-mentor form state
  const [formDeptId, setFormDeptId] = useState("");
  const [formUserId, setFormUserId] = useState("");
  const [formCurriculumId, setFormCurriculumId] = useState("");
  const [formErrors, setFormErrors] = useState<{ dept?: string; user?: string; curriculum?: string }>({});

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Retrieve current user's department to exclude from dropdown
  const myDeptId = useMemo(() => {
    const authState = LocalStorageHelper.getObject<loginData>("auth_state");
    return authState?.user_dept_id;
  }, []);

  const myDeptName = useMemo(() => {
    if (!myDeptId || departments.length === 0) return "General Department";
    const dept = departments.find(d => d.dept_id === myDeptId);
    return dept ? dept.dept_name : "General Department";
  }, [myDeptId, departments]);

  // API integration: list mentors from other departments
  const {
    responseData,
    loading: listLoading,
    refetch: refetchList,
    customApiCall,
  } = useAxios<null, CrossDeptMentorRecord[]>(LmsApiEndpoint.crossDeptMentor.mentorsFromOtherDept, {
    method: "get",
    loader: true,
    shouldFetch: true,
  });

  // Stable refs to avoid stale-closure / infinite-loop in useEffect deps
  const customApiCallRef = useRef(customApiCall);
  const refetchListRef = useRef(refetchList);
  useEffect(() => { customApiCallRef.current = customApiCall; });
  useEffect(() => { refetchListRef.current = refetchList; });

  const data = useMemo(() => responseData ?? [], [responseData]);

  // Fetch departments list and curriculums list — runs ONCE on mount
  useEffect(() => {
    const fetchDeptsAndCurriculums = async () => {
      const deptsResult = await customApiCallRef.current<null, DepartmentItem[]>(
        LmsApiEndpoint.crossDeptMentor.departments,
        "get"
      );
      if (deptsResult) {
        setDepartments(deptsResult);
      }
      const curriculumsResult = await customApiCallRef.current<null, CurriculumItem[]>(
        LmsApiEndpoint.crossDeptMentor.curriculums,
        "get"
      );
      if (curriculumsResult) {
        setCurriculums(curriculumsResult);
      }
    };
    fetchDeptsAndCurriculums();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch users when a department is selected in form
  useEffect(() => {
    if (!formDeptId) {
      setUsers([]);
      return;
    }
    const fetchUsers = async () => {
      setUsersLoading(true);
      const selectedDept = departments.find(d => d.dept_id === Number(formDeptId));
      if (selectedDept) {
        const result = await customApiCallRef.current<null, UserItem[]>(
          `api/v1/user/by_school/${encodeURIComponent(selectedDept.dept_name)}`,
          "get"
        );
        setUsers(result ?? []);
      } else {
        setUsers([]);
      }
      setUsersLoading(false);
    };
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDeptId, departments]);

  // Refetch when department filter changes
  useEffect(() => {
    refetchListRef.current({
      params: filterDeptId ? { filter_dept_id: Number(filterDeptId) } : {},
    });
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDeptId]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const processed = useMemo(() => {
    let result = [...data];
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      result = result.filter(r =>
        (r.mentor_name || "").toLowerCase().includes(t) ||
        (r.mentor_dept_name || "").toLowerCase().includes(t) ||
        (r.mentor_email || "").toLowerCase().includes(t) ||
        (r.curriculum_name || "").toLowerCase().includes(t)
      );
    }
    if (sortCol) {
      result.sort((a, b) => {
        const aVal = String((a as any)[sortCol] || "");
        const bVal = String((b as any)[sortCol] || "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [data, searchTerm, sortCol, sortDir]);

  const totalEntries = processed.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const paginated = processed.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handleDelete = async (id: number) => {
    const result = await customApiCallRef.current<null, any>(
      `${LmsApiEndpoint.crossDeptMentor.delete}/${id}`,
      "delete",
      undefined,
      true
    );
    if (result) {
      refetchListRef.current();
    }
  };

  const validateForm = () => {
    const errs: typeof formErrors = {};
    if (!formDeptId) errs.dept = "Department is required";
    if (!formUserId) errs.user = "User is required";
    if (!formCurriculumId) errs.curriculum = "Curriculum is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      mentor_user_id: Number(formUserId),
      mentor_dept_id: Number(formDeptId),
      curriculum_id: Number(formCurriculumId),
    };

    const result = await customApiCallRef.current<any, any>(
      LmsApiEndpoint.crossDeptMentor.save,
      "post",
      payload,
      true
    );

    if (result) {
      setFormDeptId("");
      setFormUserId("");
      setFormCurriculumId("");
      setFormErrors({});
      refetchListRef.current();
    }
  };

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-650 dark:text-gray-300 uppercase tracking-wide cursor-pointer select-none bg-gray-50 dark:bg-gray-700/50";

  return (
    <div className="space-y-5">
      {/* Note banner */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        Note: Faculty from "{myDeptName}" are already mentors by default. You do not need to import them.<br />
        You only need to import faculty from other departments to act as mentors.
      </p>

      {/* Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Filter by Department:
        </label>
        <select
          value={filterDeptId}
          onChange={e => setFilterDeptId(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">Select Department</option>
          {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
        </select>
      </div>

      {/* Table controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Search:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search..."
            className="w-56 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Datatable */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-750 text-sm">
          <thead>
            <tr>
              <th className={thClass + " w-16"} onClick={() => handleSort("id")}>
                Sl No. <SortIcon col="id" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("mentor_name")}>
                User Name <SortIcon col="mentor_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("mentor_dept_name")}>
                From Department <SortIcon col="mentor_dept_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("mentor_email")}>
                Email <SortIcon col="mentor_email" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("curriculum_name")}>
                To Curriculum <SortIcon col="curriculum_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-650 dark:text-gray-300 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/50 w-20">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-800">
            {listLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-4" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto" /></td>
                </tr>
              ))
            ) : paginated.length > 0 ? (
              paginated.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/35 transition-colors">
                  <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 font-medium">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.mentor_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-350">{row.mentor_dept_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-350">{row.mentor_email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-350">{row.curriculum_name || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-500 hover:text-red-750 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                      title="Remove mapping"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500">
                  No data available in table
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={totalEntries}
        entriesPerPage={entriesPerPage}
        onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
        onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      />

      {/* ─── Add Mentor Form ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
        {/* Form Banner */}
        <div className="bg-slate-800 dark:bg-slate-950 px-6 py-3.5 flex items-center">
          <h3 className="text-base font-semibold text-white tracking-wide">
            Add mentor from another department
          </h3>
        </div>

        <form onSubmit={handleSave} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Department: <span className="text-red-500">*</span>
              </label>
              <select
                value={formDeptId}
                onChange={e => {
                  setFormDeptId(e.target.value);
                  setFormUserId("");
                  setFormErrors(prev => ({ ...prev, dept: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 ${
                  formErrors.dept ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select Department</option>
                {departments
                  .filter(d => d.dept_id !== myDeptId) // Exclude current user's department
                  .map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
              {formErrors.dept && <p className="mt-1 text-xs text-red-500">{formErrors.dept}</p>}
            </div>

            {/* User */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                User: <span className="text-red-500">*</span>
              </label>
              <select
                value={formUserId}
                onChange={e => {
                  setFormUserId(e.target.value);
                  setFormErrors(prev => ({ ...prev, user: undefined }));
                }}
                disabled={!formDeptId || usersLoading}
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
                  formErrors.user ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">
                  {usersLoading
                    ? "Loading users..."
                    : !formDeptId
                    ? "Select department first"
                    : users.length === 0
                    ? "No users found!"
                    : "Select User"}
                </option>
                {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>)}
              </select>
              {formErrors.user && <p className="mt-1 text-xs text-red-500">{formErrors.user}</p>}
            </div>

            {/* Curriculum */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Curriculum: <span className="text-red-500">*</span>
              </label>
              <select
                value={formCurriculumId}
                onChange={e => {
                  setFormCurriculumId(e.target.value);
                  setFormErrors(prev => ({ ...prev, curriculum: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500 ${
                  formErrors.curriculum ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select Curriculum</option>
                {curriculums.map(c => <option key={c.crclm_id} value={c.crclm_id}>{c.crclm_name}</option>)}
              </select>
              {formErrors.curriculum && <p className="mt-1 text-xs text-red-500">{formErrors.curriculum}</p>}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white text-sm font-semibold rounded shadow transition cursor-pointer"
            >
              <FaSave size={13} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Tab 2: Mentors TO Other Departments
// ─────────────────────────────────────────────
const MentorsToTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // API integration: list mentors sent to other departments
  const {
    responseData,
    loading: listLoading,
  } = useAxios<null, CrossDeptMentorRecord[]>(LmsApiEndpoint.crossDeptMentor.mentorsToOtherDept, {
    method: "get",
    loader: true,
    shouldFetch: true,
  });

  const data = useMemo(() => responseData ?? [], [responseData]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const processed = useMemo(() => {
    let result = [...data];
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      result = result.filter(r =>
        (r.mentor_name || "").toLowerCase().includes(t) ||
        (r.mentor_email || "").toLowerCase().includes(t) ||
        (r.assigned_dept_name || "").toLowerCase().includes(t)
      );
    }
    if (sortCol) {
      result.sort((a, b) => {
        const aVal = String((a as any)[sortCol] || "");
        const bVal = String((b as any)[sortCol] || "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [data, searchTerm, sortCol, sortDir]);

  const totalEntries = processed.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const paginated = processed.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-650 dark:text-gray-350 uppercase tracking-wide cursor-pointer select-none bg-gray-50 dark:bg-gray-700/50";

  return (
    <div className="space-y-5">
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Search:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search..."
            className="w-56 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Datatable */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-750 text-sm">
          <thead>
            <tr>
              <th className={thClass + " w-16"} onClick={() => handleSort("id")}>
                Sl No. <SortIcon col="id" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("mentor_name")}>
                User Name <SortIcon col="mentor_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("mentor_email")}>
                Email <SortIcon col="mentor_email" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("mentor_dept_name")}>
                Home Department <SortIcon col="mentor_dept_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("assigned_dept_name")}>
                To Department <SortIcon col="assigned_dept_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-800">
            {listLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-4" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" /></td>
                </tr>
              ))
            ) : paginated.length > 0 ? (
              paginated.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/35 transition-colors">
                  <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 font-medium">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.mentor_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-350">{row.mentor_email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-350">{row.mentor_dept_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-350">{row.assigned_dept_name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500">
                  No data available in table
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={totalEntries}
        entriesPerPage={entriesPerPage}
        onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
        onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main DeptConfigurationPage
// ─────────────────────────────────────────────
const DeptConfigurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"from" | "to">("from");

  return (
    <MentoringPageLayout>
      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Banner */}
        <div className="bg-slate-800 dark:bg-slate-950 px-6 py-4">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Cross-department Users List
          </h2>
        </div>

        <div className="p-5">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-5 gap-1">
            <button
              id="tab-mentors-from"
              onClick={() => setActiveTab("from")}
              className={`px-4 py-2 text-sm font-semibold rounded-t border transition-colors cursor-pointer ${
                activeTab === "from"
                  ? "border-gray-300 dark:border-gray-700 border-b-white dark:border-b-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white -mb-px"
                  : "border-transparent text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-transparent"
              }`}
            >
              Mentors from Other Departments
            </button>
            <button
              id="tab-mentors-to"
              onClick={() => setActiveTab("to")}
              className={`px-4 py-2 text-sm font-semibold rounded-t border transition-colors cursor-pointer ${
                activeTab === "to"
                  ? "border-gray-300 dark:border-gray-700 border-b-white dark:border-b-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white -mb-px"
                  : "border-transparent text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-transparent"
              }`}
            >
              Mentors to Other Departments
            </button>
          </div>

          {/* Tab Panels */}
          {activeTab === "from" ? <MentorsFromTab /> : <MentorsToTab />}
        </div>
      </div>
    </MentoringPageLayout>
  );
};

export default DeptConfigurationPage;
