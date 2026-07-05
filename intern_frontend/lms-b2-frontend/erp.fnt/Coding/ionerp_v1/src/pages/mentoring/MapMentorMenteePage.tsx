import React, { useState, useEffect, useMemo } from "react";
import { FaPlusCircle, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FiEdit2, FiTrash2, FiPlusCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import MentoringPageLayout from "./MentoringPageLayout";

// Interface for Mentoring Group
interface MentoringGroup {
  id: number;
  curriculum: string;
  group_title: string;
  applicable_terms: string;
  config_type: string;
  questionnaire_title: string;
  mentors: string[];
  mentees: string[];
  session_date: string;
  session_status: string;
}

// Default Configuration Types if none in localStorage
const DEFAULT_CONFIG_TYPES = [
  "CSE Config type 2",
  "CSE Config type -1",
  "ECE Config type 1",
  "General Config Type"
];

// Initial mock mentoring groups
const INITIAL_GROUPS: MentoringGroup[] = [
  {
    id: 1,
    curriculum: "B. E in BT 2015-2019",
    group_title: "a",
    applicable_terms: "Term 1",
    config_type: "CSE Config type 2",
    questionnaire_title: "Student MMP Questionnaire",
    mentors: ["Dr. Ameen", "Mr. C J Savanurmat"],
    mentees: [],
    session_date: "",
    session_status: ""
  }
];

const AVAILABLE_MENTORS = [
  "Dr. Ameen",
  "Mr. C J Savanurmat",
  "Dr. Anil Kumar",
  "Prof. Sunita Rao",
  "Dr. Ramesh Patil",
  "Prof. Kavita Sharma",
  "Dr. Vijay Singh",
  "Prof. Deepa Nair",
  "Dr. Suresh Menon",
  "Dr. Priya Pillai",
  "Dr. Smith",
  "Prof. Johnson"
];

const LOCAL_STORAGE_KEY = "lms_mentoring_groups";
const CONFIG_TYPES_LS_KEY = "lms_mentoring_config_types";

const MapMentorMenteePage: React.FC = () => {
  // --- View Toggle ---
  const [view, setView] = useState<"list" | "add">("list");

  // --- State Variables ---
  const [groups, setGroups] = useState<MentoringGroup[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("B. E in BT 2015-2019");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<keyof MentoringGroup | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Configuration types loaded from localStorage
  const [configTypes, setConfigTypes] = useState<string[]>([]);

  // Add Group Page state
  const [groupTitleInput, setGroupTitleInput] = useState("");
  const [applicableTermInput, setApplicableTermInput] = useState("");
  const [configTypeInput, setConfigTypeInput] = useState("");
  const [questionnaireInput, setQuestionnaireInput] = useState("");
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit Title Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MentoringGroup | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Delete Confirm Modal state
  const [groupToDelete, setGroupToDelete] = useState<MentoringGroup | null>(null);

  // Add Mentor Modal state
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [targetGroupForMentor, setTargetGroupForMentor] = useState<MentoringGroup | null>(null);
  const [newMentorName, setNewMentorName] = useState("");

  // Add Mentee Modal state
  const [isMenteeModalOpen, setIsMenteeModalOpen] = useState(false);
  const [targetGroupForMentee, setTargetGroupForMentee] = useState<MentoringGroup | null>(null);
  const [newMenteeName, setNewMenteeName] = useState("");

  // --- Load Data on Mount ---
  useEffect(() => {
    // Load mentoring groups
    const storedGroups = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedGroups) {
      try {
        setGroups(JSON.parse(storedGroups));
      } catch (e) {
        setGroups(INITIAL_GROUPS);
      }
    } else {
      setGroups(INITIAL_GROUPS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_GROUPS));
    }

    // Load configuration types
    const storedConfigs = localStorage.getItem(CONFIG_TYPES_LS_KEY);
    if (storedConfigs) {
      try {
        const parsed = JSON.parse(storedConfigs) as { config_type: string }[];
        const names = parsed.map(c => c.config_type);
        setConfigTypes(names.length > 0 ? names : DEFAULT_CONFIG_TYPES);
      } catch (e) {
        setConfigTypes(DEFAULT_CONFIG_TYPES);
      }
    } else {
      setConfigTypes(DEFAULT_CONFIG_TYPES);
    }
  }, []);

  // --- Save Data Helper ---
  const saveGroups = (updated: MentoringGroup[]) => {
    setGroups(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  // --- Sorting Handler ---
  const handleSort = (column: keyof MentoringGroup) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // --- Filter and Search Logic ---
  const filteredAndSearchedGroups = useMemo(() => {
    let result = groups.filter(g => g.curriculum === selectedCurriculum);

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => 
        g.group_title.toLowerCase().includes(term) ||
        g.mentors.some(m => m.toLowerCase().includes(term)) ||
        g.mentees.some(m => m.toLowerCase().includes(term)) ||
        g.session_status.toLowerCase().includes(term) ||
        g.config_type.toLowerCase().includes(term)
      );
    }

    if (sortColumn !== "") {
      result.sort((a, b) => {
        let valA: any = a[sortColumn];
        let valB: any = b[sortColumn];

        if (Array.isArray(valA)) valA = valA.join(", ");
        if (Array.isArray(valB)) valB = valB.join(", ");

        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
      });
    }

    return result;
  }, [groups, selectedCurriculum, searchTerm, sortColumn, sortDirection]);

  // --- Pagination Logic ---
  const totalEntries = filteredAndSearchedGroups.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredAndSearchedGroups.slice(start, start + entriesPerPage);
  }, [filteredAndSearchedGroups, currentPage, entriesPerPage]);

  // --- Checkbox Handlers ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedGroups.map(g => g.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedGroups.map(g => g.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelectedOnPage = useMemo(() => {
    if (paginatedGroups.length === 0) return false;
    return paginatedGroups.every(g => selectedIds.includes(g.id));
  }, [paginatedGroups, selectedIds]);

  // --- Add Page Operations ---
  const handleOpenAddView = () => {
    setGroupTitleInput("");
    setApplicableTermInput("");
    setConfigTypeInput("");
    setQuestionnaireInput("");
    setSelectedMentors([]);
    setAddErrors({});
    setView("add");
  };

  const validateAddForm = () => {
    const errors: Record<string, string> = {};
    if (!groupTitleInput.trim()) {
      errors.group_title = "Group Title is required";
    }
    if (!applicableTermInput) {
      errors.applicable_terms = "Applicable Terms selection is required";
    }
    if (!configTypeInput) {
      errors.config_type = "Configuration Type selection is required";
    }
    if (!questionnaireInput) {
      errors.questionnaire_title = "Questionnaire Title selection is required";
    }
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    const newId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;
    const newGroup: MentoringGroup = {
      id: newId,
      curriculum: selectedCurriculum,
      group_title: groupTitleInput.trim(),
      applicable_terms: applicableTermInput,
      config_type: configTypeInput,
      questionnaire_title: questionnaireInput,
      mentors: selectedMentors,
      mentees: [],
      session_date: "",
      session_status: ""
    };

    saveGroups([...groups, newGroup]);
    setView("list");
    toast.success("Mentoring group added successfully!");
  };

  // --- Edit Modal Operations ---
  const handleOpenEditModal = (group: MentoringGroup) => {
    setEditingGroup(group);
    setEditTitleInput(group.group_title);
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitleInput.trim()) {
      setEditErrors({ group_title: "Group Title is required" });
      return;
    }

    if (editingGroup) {
      const updated = groups.map(g =>
        g.id === editingGroup.id ? { ...g, group_title: editTitleInput.trim() } : g
      );
      saveGroups(updated);
      setIsEditModalOpen(false);
      setEditingGroup(null);
      toast.success("Group title updated successfully!");
    }
  };

  // --- Delete Group Operations ---
  const handleDeleteClick = (group: MentoringGroup) => {
    setGroupToDelete(group);
  };

  const confirmDeleteGroup = () => {
    if (groupToDelete) {
      const updated = groups.filter(g => g.id !== groupToDelete.id);
      saveGroups(updated);
      setSelectedIds(prev => prev.filter(id => id !== groupToDelete.id));
      setGroupToDelete(null);
      toast.success("Mentoring group deleted successfully!");
    }
  };

  // --- Add Mentor Operations ---
  const handleOpenAddMentor = (group: MentoringGroup) => {
    setTargetGroupForMentor(group);
    setNewMentorName("");
    setIsMentorModalOpen(true);
  };

  const handleAddMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentorName.trim()) return;

    if (targetGroupForMentor) {
      const updated = groups.map(g => {
        if (g.id === targetGroupForMentor.id) {
          return {
            ...g,
            mentors: [...g.mentors, newMentorName.trim()]
          };
        }
        return g;
      });
      saveGroups(updated);
      setIsMentorModalOpen(false);
      setTargetGroupForMentor(null);
      toast.success("Mentor added successfully!");
    }
  };

  // --- Add Mentee Operations ---
  const handleOpenAddMentee = (group: MentoringGroup) => {
    setTargetGroupForMentee(group);
    setNewMenteeName("");
    setIsMenteeModalOpen(true);
  };

  const handleAddMenteeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenteeName.trim()) return;

    if (targetGroupForMentee) {
      const updated = groups.map(g => {
        if (g.id === targetGroupForMentee.id) {
          return {
            ...g,
            mentees: [...g.mentees, newMenteeName.trim()]
          };
        }
        return g;
      });
      saveGroups(updated);
      setIsMenteeModalOpen(false);
      setTargetGroupForMentee(null);
      toast.success("Mentee added successfully!");
    }
  };

  // Sort Icon Renderer
  const renderSortIcon = (column: keyof MentoringGroup) => {
    if (sortColumn !== column) return <FaSort className="inline ml-1 text-gray-400 text-xs" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="inline ml-1 text-gray-800 text-sm" />
    ) : (
      <FaSortDown className="inline ml-1 text-gray-800 text-sm" />
    );
  };

  return (
    <MentoringPageLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Banner header title */}
        <div className="bg-slate-800 dark:bg-slate-950 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {view === "list" ? "Map Mentor Mentee" : "Add Mentor Mentee"}
          </h2>
        </div>

        {view === "list" ? (
          // --- List View Screen ---
          <div className="p-6">
            {/* Top Row: Curriculum Selector and Add button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Curriculum:<span className="text-red-500">*</span>
                </label>
                <select
                  className="w-72 px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  value={selectedCurriculum}
                  onChange={(e) => {
                    setSelectedCurriculum(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="B. E in BT 2015-2019">B. E in BT 2015-2019</option>
                  <option value="B. E in CSE 2015-2019">B. E in CSE 2015-2019</option>
                  <option value="B.Tech CSE 2024">B.Tech CSE 2024</option>
                </select>
              </div>
              
              <button
                onClick={handleOpenAddView}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded shadow transition duration-150 cursor-pointer"
              >
                <FiPlusCircle size={16} />
                Add Mentor Mentee
              </button>
            </div>

            {/* Table Controls (Search and Entries count) */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
              
              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              {/* Search Input */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-64 px-3 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Mentoring Groups Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-semibold text-[13px]">
                  <tr>
                    <th className="px-4 py-3 w-20 cursor-pointer select-none">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAllSelectedOnPage}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Sl. No.</span>
                        {renderSortIcon("id")}
                      </div>
                    </th>

                    <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("group_title")}>
                      <div className="flex items-center">
                        Group Title
                        {renderSortIcon("group_title")}
                      </div>
                    </th>

                    <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("mentors")}>
                      <div className="flex items-center">
                        Mentor
                        {renderSortIcon("mentors")}
                      </div>
                    </th>

                    <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("mentees")}>
                      <div className="flex items-center">
                        Mentee
                        {renderSortIcon("mentees")}
                      </div>
                    </th>

                    <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("session_date")}>
                      <div className="flex items-center">
                        Session Date
                        {renderSortIcon("session_date")}
                      </div>
                    </th>

                    <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("session_status")}>
                      <div className="flex items-center">
                        Session Status
                        {renderSortIcon("session_status")}
                      </div>
                    </th>

                    <th className="px-4 py-3 text-center w-24">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {paginatedGroups.length > 0 ? (
                    paginatedGroups.map((group, index) => {
                      const slNo = (currentPage - 1) * entriesPerPage + index + 1;
                      const isSelected = selectedIds.includes(group.id);

                      return (
                        <tr
                          key={group.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/40 transition duration-150 ${
                            isSelected ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectRow(group.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>{slNo}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {group.group_title}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              {group.mentors.length > 0 ? (
                                <span className="text-gray-805 dark:text-gray-200">
                                  {group.mentors.join(" , ")}
                                </span>
                              ) : null}
                              <button
                                onClick={() => handleOpenAddMentor(group)}
                                className="flex items-center gap-1 text-[13px] text-[#337ab7] dark:text-blue-400 hover:underline text-left font-medium w-max"
                              >
                                <FaPlusCircle className="text-[#337ab7] dark:text-blue-400" size={13} />
                                Add mentor
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              {group.mentees.length > 0 ? (
                                <span className="text-gray-805 dark:text-gray-200">
                                  {group.mentees.join(" , ")}
                                </span>
                              ) : null}
                              <button
                                onClick={() => handleOpenAddMentee(group)}
                                className="flex items-center gap-1 text-[13px] text-[#337ab7] dark:text-blue-400 hover:underline text-left font-medium w-max"
                              >
                                <FaPlusCircle className="text-[#337ab7] dark:text-blue-400" size={13} />
                                Add mentee
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            {group.session_date || ""}
                          </td>

                          <td className="px-4 py-3">
                            {group.session_status || ""}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => handleOpenEditModal(group)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer"
                                title="Edit Group Title"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(group)}
                                className="text-red-650 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition cursor-pointer"
                                title="Delete Mentoring Group"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No mentoring groups found. Click "Add Mentor Mentee" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-6">
              <div className="text-sm text-gray-500">
                {totalEntries > 0 ? (
                  <span>
                    Showing {Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)} to{" "}
                    {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
                  </span>
                ) : (
                  <span>Showing 0 to 0 of 0 entries</span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center -space-x-px text-sm">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-505 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border cursor-pointer ${
                        currentPage === page
                          ? "z-10 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                          : "border-gray-300 bg-white text-gray-705 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-505 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          // --- Add Mentor Mentee Full Page View Screen ---
          <form onSubmit={handleAddSubmit} className="p-6 space-y-5 max-w-2xl animate-in fade-in duration-200">
            
            {/* Group Title input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Group Title: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupTitleInput}
                onChange={(e) => {
                  setGroupTitleInput(e.target.value);
                  if (e.target.value.trim()) setAddErrors(p => ({ ...p, group_title: "" }));
                }}
                placeholder="Enter Group Title"
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  addErrors.group_title ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {addErrors.group_title && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{addErrors.group_title}</p>
              )}
            </div>

            {/* Applicable Terms dropdown select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Applicable Terms: <span className="text-red-500">*</span>
              </label>
              <select
                value={applicableTermInput}
                onChange={(e) => {
                  setApplicableTermInput(e.target.value);
                  if (e.target.value) setAddErrors(p => ({ ...p, applicable_terms: "" }));
                }}
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  addErrors.applicable_terms ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select Applicable Term</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Fall 2024">Fall 2024</option>
                <option value="Spring 2025">Spring 2025</option>
              </select>
              {addErrors.applicable_terms && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{addErrors.applicable_terms}</p>
              )}
            </div>

            {/* Configuration Type dropdown select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Configuration Type: <span className="text-red-500">*</span>
              </label>
              <select
                value={configTypeInput}
                onChange={(e) => {
                  setConfigTypeInput(e.target.value);
                  if (e.target.value) setAddErrors(p => ({ ...p, config_type: "" }));
                }}
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  addErrors.config_type ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select configuration type</option>
                {configTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
              {addErrors.config_type && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{addErrors.config_type}</p>
              )}
            </div>

            {/* Questionnaire Title dropdown select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Questionnaire Title: <span className="text-red-500">*</span>
              </label>
              <select
                value={questionnaireInput}
                onChange={(e) => {
                  setQuestionnaireInput(e.target.value);
                  if (e.target.value) setAddErrors(p => ({ ...p, questionnaire_title: "" }));
                }}
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  addErrors.questionnaire_title ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select questionnaire title</option>
                <option value="Student MMP Questionnaire">Student MMP Questionnaire</option>
                <option value="Academic and Non Academic skills">Academic and Non Academic skills</option>
                <option value="Self Assessment/Personal questionnaire">Self Assessment/Personal questionnaire</option>
              </select>
              {addErrors.questionnaire_title && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{addErrors.questionnaire_title}</p>
              )}
            </div>

            {/* Mentor Selection Checklist (Show mentor name with select check button) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Mentors:
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/30 dark:bg-gray-900/10 p-4 max-h-[180px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_MENTORS.map((mentor) => {
                  const isChecked = selectedMentors.includes(mentor);
                  return (
                    <label 
                      key={mentor} 
                      className="flex items-center gap-2.5 px-3 py-1.5 border border-gray-250 dark:border-gray-750 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer shadow-sm transition-all text-[13px] font-medium text-gray-750 dark:text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedMentors(prev =>
                            prev.includes(mentor)
                              ? prev.filter(m => m !== mentor)
                              : [...prev, mentor]
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{mentor}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-solid border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-semibold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold shadow transition cursor-pointer flex items-center gap-2"
              >
                Save &amp; Proceed to Add Mentee
              </button>
            </div>
          </form>
        )}
      </div>

      {/* --- EDIT GROUP TITLE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black opacity-50 transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md mx-auto my-6 z-50">
            <div className="relative flex flex-col w-full bg-white dark:bg-gray-800 border-0 rounded-lg shadow-lg outline-none focus:outline-none overflow-hidden">
              
              <div className="flex items-center justify-between p-5 border-b border-solid border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Mentoring Group Title
                </h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-650 float-right text-3xl leading-none font-semibold outline-none focus:outline-none cursor-pointer"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <span className="text-gray-400 block h-6 w-6 text-2xl outline-none focus:outline-none">×</span>
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="relative p-6 flex-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Group Title: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editTitleInput}
                      onChange={(e) => {
                        setEditTitleInput(e.target.value);
                        if (e.target.value.trim()) setEditErrors({});
                      }}
                      placeholder="Enter Group Title"
                      className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        editErrors.group_title ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {editErrors.group_title && (
                      <p className="mt-1 text-xs text-red-500 font-semibold">{editErrors.group_title}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end p-4 border-t border-solid border-gray-200 dark:border-gray-700 rounded-b bg-gray-50 dark:bg-gray-700/30 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold shadow transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE DIALOG --- */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black opacity-55 transition-opacity" onClick={() => setGroupToDelete(null)}></div>
          
          <div className="relative w-full max-w-sm mx-auto my-6 z-50">
            <div className="relative flex flex-col w-full bg-white dark:bg-gray-800 border-0 rounded-lg shadow-lg outline-none focus:outline-none overflow-hidden">
              
              <div className="flex items-center justify-between p-4 border-b border-solid border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                <h3 className="text-md font-bold">Confirm Delete</h3>
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete mentoring group{" "}
                  <strong className="text-gray-900 dark:text-white">
                    "{groupToDelete.group_title}"
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end p-4 border-t border-solid border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 gap-2">
                <button
                  type="button"
                  onClick={() => setGroupToDelete(null)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-655 text-gray-705 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteGroup}
                  className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded text-sm font-semibold shadow transition cursor-pointer"
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- ADD MENTOR DIALOG --- */}
      {isMentorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black opacity-50 transition-opacity" onClick={() => setIsMentorModalOpen(false)}></div>
          
          <div className="relative w-full max-w-sm mx-auto my-6 z-50">
            <div className="relative flex flex-col w-full bg-white dark:bg-gray-800 border-0 rounded-lg shadow-lg outline-none focus:outline-none overflow-hidden">
              
              <div className="flex items-center justify-between p-5 border-b border-solid border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-md font-bold text-gray-900 dark:text-white">
                  Add Mentor to {targetGroupForMentor?.group_title}
                </h3>
              </div>

              <form onSubmit={handleAddMentorSubmit}>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mentor Name: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMentorName}
                      onChange={(e) => setNewMentorName(e.target.value)}
                      placeholder="e.g. Dr. Ramesh"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end p-4 border-t border-solid border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMentorModalOpen(false)}
                    className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-650 text-gray-700 dark:text-gray-350 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold shadow transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* --- ADD MENTEE DIALOG --- */}
      {isMenteeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black opacity-50 transition-opacity" onClick={() => setIsMenteeModalOpen(false)}></div>
          
          <div className="relative w-full max-w-sm mx-auto my-6 z-50">
            <div className="relative flex flex-col w-full bg-white dark:bg-gray-800 border-0 rounded-lg shadow-lg outline-none focus:outline-none overflow-hidden">
              
              <div className="flex items-center justify-between p-5 border-b border-solid border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-md font-bold text-gray-900 dark:text-white">
                  Add Mentee to {targetGroupForMentee?.group_title}
                </h3>
              </div>

              <form onSubmit={handleAddMenteeSubmit}>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mentee Name: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMenteeName}
                      onChange={(e) => setNewMenteeName(e.target.value)}
                      placeholder="e.g. Rahul Sen"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end p-4 border-t border-solid border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMenteeModalOpen(false)}
                    className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-655 text-gray-700 dark:text-gray-350 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold shadow transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </MentoringPageLayout>
  );
};

export default MapMentorMenteePage;
