import React, { useState, useEffect, useMemo, useCallback } from "react";
import MentoringPageLayout from "./MentoringPageLayout";
import { 
  Calendar, 
  Plus, 
  ChevronRight, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  MessageSquare, 
  Paperclip, 
  Send, 
  MoreVertical, 
  Check, 
  PlusCircle, 
  AlertCircle, 
  FileText,
  Clock,
  MapPin,
  Users,
  Search,
  MessageCircle,
  FileCheck
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/api";
import { LmsApiEndpoint } from "../../utils/ApiEndpoint/lmsApiEndpoint";

// Type definitions
interface DateTimeSlot {
  id: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface SubGroup {
  id: number;
  sub_group_id?: number;
  name: string;
  slots: DateTimeSlot[];
  locationUrl: string;
  menteeCount: number;
  menteeIds: number[];
}

interface CurriculumItem {
  curriculum_id: number;
  curriculum_code: string;
  curriculum_desc: string;
}

interface SemesterItem {
  semester_id: number;
  semester: number;
  semester_desc: string;
}

interface GroupItem {
  mentors_group_id: number;
  mentors_pgm_title: string;
  questionnaire_id: number;
  mentors: any[];
}

interface MenteeItem {
  student_id: number;
  student_name: string;
}

interface MentoringSession {
  schedule_id: number;
  curriculum_id: number;
  group_name: string;
  semester_id: number;
  questionnaire_id: number;
  session_agenda: string;
  sub_groups: {
    sub_group_id: number;
    sub_group_name: string;
    location: string;
    dates?: {
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
    }[];
  }[];
  mentor_names?: string[];
}

// Question types mapping
const QUESTION_TYPES = [
  { id: 1, label: "Single Select" },
  { id: 2, label: "Multiple Select" },
  { id: 3, label: "Open Ended" }
];

const QUESTIONNAIRE_CATEGORIES = [
  { id: 1, label: "Self-Assessment / Personal Questionnaire" },
  { id: 2, label: "Academic and Non Academic skills" }
];

// Helper to parse time strings in various formats (12h/24h/HH:MM:SS)
const parseTime = (timeStr: string) => {
  if (!timeStr) return { hour: "10", minute: "00", period: "AM" };
  const parts12 = timeStr.match(/^(\d{2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (parts12) {
    return { hour: parts12[1], minute: parts12[2], period: parts12[3].toUpperCase() };
  }
  const parts24 = timeStr.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (parts24) {
    let hour = parseInt(parts24[1]);
    let period = "AM";
    if (hour >= 12) {
      period = "PM";
      if (hour > 12) hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
    return {
      hour: String(hour).padStart(2, "0"),
      minute: parts24[2],
      period: period
    };
  }
  return { hour: "10", minute: "00", period: "AM" };
};

const MentoringSessionPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);

  // Filter / Selection state
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Creation form state
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [sessionAgenda, setSessionAgenda] = useState("");

  // Data lists
  const [curriculums, setCurriculums] = useState<CurriculumItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [allMentees, setAllMentees] = useState<MenteeItem[]>([]);
  const [sessions, setSessions] = useState<MentoringSession[]>([]);

  // Sub-groups state
  const [subGroups, setSubGroups] = useState<SubGroup[]>([
    {
      id: 1,
      name: "Sub-group 1",
      slots: [{ id: 1, startDate: "", endDate: "", startTime: "10:00 AM", endTime: "11:00 AM" }],
      locationUrl: "",
      menteeCount: 0,
      menteeIds: []
    }
  ]);

  // Modal selector for mentees during creation
  const [activeSgForMentees, setActiveSgForMentees] = useState<number | null>(null);

  // Loading flags
  const [curriculumsLoading, setCurriculumsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Custom Feature Modal States
  // 1. Questionnaire Modal
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [activeSessionForQuestionnaire, setActiveSessionForQuestionnaire] = useState<MentoringSession | null>(null);
  const [questionnaireLoading, setQuestionnaireLoading] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [questionnaireTitle, setQuestionnaireTitle] = useState("");
  const [messageToMentees, setMessageToMentees] = useState("");
  const [fieldSetting, setFieldSetting] = useState(0); // 0: Allow all, 1: Modify only, 2: Read-only
  const [questionnaireQuestions, setQuestionnaireQuestions] = useState<any[]>([]);

  // 2. Mentees List & Response Modal
  const [isMenteesOpen, setIsMenteesOpen] = useState(false);
  const [activeSessionForMentees, setActiveSessionForMentees] = useState<MentoringSession | null>(null);
  const [menteesList, setMenteesList] = useState<any[]>([]);
  const [menteesLoading, setMenteesLoading] = useState(false);
  const [selectedMenteeResponse, setSelectedMenteeResponse] = useState<any>(null);
  const [activeSessionQuestions, setActiveSessionQuestions] = useState<any[]>([]);

  // 3. Chat Panel inside Mentees Modal
  const [selectedMenteeForChat, setSelectedMenteeForChat] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState<string | null>(null);
  const [chatAttachmentName, setChatAttachmentName] = useState<string | null>(null);
  const [chatUploading, setChatUploading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // API helper
  const apiCall = useCallback(async (url: string, method: "get" | "post" | "put" | "delete", payload?: any) => {
    try {
      const response = await axiosInstance.request<{ status: boolean; message: string; data: any }>({
        url,
        method,
        data: payload,
      });
      return response.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      return { status: false, message: msg, data: null };
    }
  }, []);

  // Fetch curriculums
  useEffect(() => {
    const fetchCurriculums = async () => {
      setCurriculumsLoading(true);
      const res = await apiCall(LmsApiEndpoint.mentoringSession.curriculumList, "get");
      if (res && res.status) {
        const mapped = (res.data || []).map((b: any) => ({
          curriculum_id: b.academic_batch_id,
          curriculum_code: b.academic_batch_code,
          curriculum_desc: b.academic_batch_desc,
        }));
        setCurriculums(mapped);
      } else {
        toast.error(res?.message || "Failed to load curriculums.");
      }
      setCurriculumsLoading(false);
    };
    fetchCurriculums();
  }, [apiCall]);

  // Load details based on curriculum
  useEffect(() => {
    if (!selectedCurriculum) {
      setSemesters([]);
      setGroups([]);
      return;
    }
    const loadCurriculumDetails = async () => {
      const semRes = await apiCall(
        `${LmsApiEndpoint.mentoringSession.semestersByCurriculum}/${selectedCurriculum}`,
        "get"
      );
      if (semRes && semRes.status) {
        setSemesters(semRes.data || []);
      }

      const groupRes = await apiCall(
        `${LmsApiEndpoint.mentoringSession.groupsByCurriculum}/${selectedCurriculum}`,
        "get"
      );
      if (groupRes && groupRes.status) {
        setGroups(groupRes.data || []);
      }
    };
    loadCurriculumDetails();
  }, [selectedCurriculum, apiCall]);

  // Load mentees based on group selection
  useEffect(() => {
    if (!selectedGroup) {
      setAllMentees([]);
      return;
    }
    const loadMentees = async () => {
      const res = await apiCall(
        `${LmsApiEndpoint.mentoringSession.groupMentees}/${selectedGroup}`,
        "get"
      );
      if (res && res.status) {
        setAllMentees(res.data || []);
      }
    };
    loadMentees();
  }, [selectedGroup, apiCall]);

  const handleRegisterMenteesClick = async (sgId: number) => {
    if (!selectedGroup) {
      toast.error("Please select a mentoring group first.");
      return;
    }
    try {
      const res = await apiCall(
        `${LmsApiEndpoint.mentoringSession.groupMentees}/${selectedGroup}`,
        "get"
      );
      if (res && res.status) {
        setAllMentees(res.data || []);
      } else {
        toast.error(res?.message || "Failed to load mentees.");
      }
    } catch (err) {
      toast.error("Failed to fetch mentees from database.");
    }
    setActiveSgForMentees(sgId);
  };

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    setListLoading(true);
    const res = await apiCall(LmsApiEndpoint.mentoringSession.getMentoringSessions, "get");
    if (res && res.status) {
      const mapped = (res.data || []).map((s: any) => ({
        ...s,
        curriculum_id: s.academic_batch_id,
      }));
      setSessions(mapped);
    }
    setListLoading(false);
  }, [apiCall]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Search & Filter
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchCurriculum = selectedCurriculum ? s.curriculum_id === parseInt(selectedCurriculum) : true;
      
      let matchMonth = true;
      if (selectedMonth && s.sub_groups) {
        const [year, month] = selectedMonth.split("-");
        matchMonth = s.sub_groups.some(sg => 
          sg.dates?.some(d => {
            if (!d.start_date) return false;
            const dPart = d.start_date.split("-");
            return dPart[0] === year && dPart[1] === month;
          })
        );
      }

      let matchSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const groupMatch = s.group_name?.toLowerCase().includes(query);
        const agendaMatch = s.session_agenda?.toLowerCase().includes(query);
        const subGroupMatch = s.sub_groups?.some(sg => sg.sub_group_name.toLowerCase().includes(query) || sg.location.toLowerCase().includes(query));
        const mentorMatch = s.mentor_names?.some(m => m.toLowerCase().includes(query));
        matchSearch = !!(groupMatch || agendaMatch || subGroupMatch || mentorMatch);
      }

      return matchCurriculum && matchMonth && matchSearch;
    });
  }, [sessions, selectedCurriculum, selectedMonth, searchQuery]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCurriculum, selectedMonth, searchQuery, entriesPerPage]);

  // Paginated sessions
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredSessions.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredSessions, currentPage, entriesPerPage]);

  const totalEntries = filteredSessions.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const showingStart = totalEntries > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const showingEnd = Math.min(currentPage * entriesPerPage, totalEntries);

  const handleCreateSession = () => {
    setEditingScheduleId(null);
    setIsCreating(true);
  };

  const handleClose = () => {
    setIsCreating(false);
    setEditingScheduleId(null);
    setSelectedGroup("");
    setSelectedTerm("");
    setSessionAgenda("");
    setSubGroups([
      {
        id: 1,
        name: "Sub-group 1",
        slots: [{ id: Date.now(), startDate: "", endDate: "", startTime: "10:00 AM", endTime: "11:00 AM" }],
        locationUrl: "",
        menteeCount: 0,
        menteeIds: []
      }
    ]);
  };

  // --- Sub-group Management ---
  const handleAddSubGroup = () => {
    const newId = subGroups.length > 0 ? Math.max(...subGroups.map(sg => sg.id)) + 1 : 1;
    const newSubGroup: SubGroup = {
      id: newId,
      name: `Sub-group ${newId}`,
      slots: [{ id: Date.now(), startDate: "", endDate: "", startTime: "10:00 AM", endTime: "11:00 AM" }],
      locationUrl: "",
      menteeCount: 0,
      menteeIds: []
    };
    setSubGroups([...subGroups, newSubGroup]);
    toast.success("New sub-group added!");
  };

  const handleRenameSubGroup = (sgId: number, newName: string) => {
    setSubGroups(prev => prev.map(sg => sg.id === sgId ? { ...sg, name: newName } : sg));
  };

  const handleDeleteSubGroup = (sgId: number) => {
    setSubGroups(subGroups.filter(sg => sg.id !== sgId));
    toast.info("Sub-group removed.");
  };

  const handleAddSlot = (sgId: number) => {
    setSubGroups(prev => prev.map(sg => {
      if (sg.id === sgId) {
        return {
          ...sg,
          slots: [...sg.slots, { id: Date.now(), startDate: "", endDate: "", startTime: "10:00 AM", endTime: "11:00 AM" }]
        };
      }
      return sg;
    }));
  };

  const handleRemoveSlot = (sgId: number, slotId: number) => {
    setSubGroups(prev => prev.map(sg => {
      if (sg.id === sgId) {
        return { ...sg, slots: sg.slots.filter(s => s.id !== slotId) };
      }
      return sg;
    }));
  };

  const handleUpdateSlot = (sgId: number, slotId: number, field: keyof DateTimeSlot, value: string) => {
    setSubGroups(prev => prev.map(sg => {
      if (sg.id === sgId) {
        return {
          ...sg,
          slots: sg.slots.map(s => s.id === slotId ? { ...s, [field]: value } : s)
        };
      }
      return sg;
    }));
  };

  const handleUpdateTimePart = (sgId: number, slotId: number, field: 'startTime' | 'endTime', part: 'hour' | 'minute' | 'period', val: string) => {
    setSubGroups(prev => prev.map(sg => {
      if (sg.id === sgId) {
        return {
          ...sg,
          slots: sg.slots.map(s => {
            if (s.id === slotId) {
              const current = parseTime(s[field]);
              current[part] = val;
              return { ...s, [field]: `${current.hour}:${current.minute} ${current.period}` };
            }
            return s;
          })
        };
      }
      return sg;
    }));
  };

  const handleUpdateSubGroupField = (sgId: number, field: keyof SubGroup, value: any) => {
    setSubGroups(prev => prev.map(sg => sg.id === sgId ? { ...sg, [field]: value } : sg));
  };

  const handleSaveSession = async () => {
    if (!selectedCurriculum) return toast.error("Please select a Curriculum.");
    if (!selectedGroup) return toast.error("Please select a mentoring group.");
    if (!selectedTerm) return toast.error("Please select a term.");

    for (const sg of subGroups) {
      for (const slot of sg.slots) {
        if (!slot.startDate || !slot.endDate || !slot.startTime || !slot.endTime) {
          return toast.error(`Please fill all date and time slots in ${sg.name}.`);
        }
      }
      if (!sg.locationUrl.trim()) {
        return toast.error(`Please provide location or URL in ${sg.name}.`);
      }
      if (!sg.menteeIds || sg.menteeIds.length === 0) {
        return toast.error(`Please register at least one mentee in ${sg.name}.`);
      }
    }

    const convertTo24h = (timeStr: string) => {
      const parts = parseTime(timeStr);
      let hrs = parseInt(parts.hour);
      if (parts.period === "PM" && hrs < 12) hrs += 12;
      if (parts.period === "AM" && hrs === 12) hrs = 0;
      return `${String(hrs).padStart(2, "0")}:${parts.minute}:00`;
    };

    const payload = {
      academic_batch_id: parseInt(selectedCurriculum),
      mentors_group_id: parseInt(selectedGroup),
      semester_id: parseInt(selectedTerm),
      session_agenda: sessionAgenda,
      sub_groups: subGroups.map(sg => ({
        sub_group_name: sg.name,
        location: sg.locationUrl,
        dates: sg.slots.map(s => ({
          start_date: s.startDate,
          end_date: s.endDate,
          start_time: convertTo24h(s.startTime),
          end_time: convertTo24h(s.endTime)
        })),
        mentee_ids: sg.menteeIds
      }))
    };

    let result;
    if (editingScheduleId !== null) {
      result = await apiCall(
        `${LmsApiEndpoint.mentoringSession.updateMentoringSession}/${editingScheduleId}`,
        "put",
        payload
      );
    } else {
      result = await apiCall(
        LmsApiEndpoint.mentoringSession.saveMentoringSession,
        "post",
        payload
      );
    }

    if (result && result.status) {
      toast.success(editingScheduleId ? "Mentoring Session updated!" : "Mentoring Session saved!");
      fetchSessions();
      handleClose();
    } else {
      toast.error(result?.message || "Failed to save mentoring session.");
    }
  };

  const handleEditSession = async (session: MentoringSession) => {
    setEditingScheduleId(session.schedule_id);
    setSelectedCurriculum(String(session.curriculum_id));
    setSelectedTerm(String(session.semester_id));

    const groupRes = await apiCall(
      `${LmsApiEndpoint.mentoringSession.groupsByCurriculum}/${session.curriculum_id}`,
      "get"
    );
    if (groupRes && groupRes.status) {
      setGroups(groupRes.data || []);
      const matched = (groupRes.data || []).find((g: any) => g.mentors_pgm_title === session.group_name);
      if (matched) {
        setSelectedGroup(String(matched.mentors_group_id));
      }
    }

    setSessionAgenda(session.session_agenda || "");

    const menteesRes = await apiCall(
      `${LmsApiEndpoint.mentoringSession.getSessionMentees}/${session.schedule_id}`,
      "get"
    );
    const sessionMentees = menteesRes && menteesRes.status ? (menteesRes.data || []) : [];

    const mappedSgs: SubGroup[] = session.sub_groups.map((sg, idx) => {
      const datesForSg = sg.dates || [];
      const slots: DateTimeSlot[] = datesForSg.map((d, dIdx) => ({
        id: dIdx + 1,
        startDate: d.start_date,
        endDate: d.end_date,
        startTime: d.start_time,
        endTime: d.end_time
      }));

      const menteesInSg = sessionMentees.filter((m: any) => m.sub_group_name === sg.sub_group_name);
      const menteeIds = menteesInSg.map((m: any) => m.student_id);

      return {
        id: idx + 1,
        sub_group_id: sg.sub_group_id,
        name: sg.sub_group_name,
        slots: slots.length > 0 ? slots : [{ id: 1, startDate: "", endDate: "", startTime: "10:00 AM", endTime: "11:00 AM" }],
        locationUrl: sg.location || "",
        menteeCount: menteeIds.length,
        menteeIds: menteeIds
      };
    });

    setSubGroups(mappedSgs);
    setIsCreating(true);
  };

  const handleDeleteSession = async (scheduleId: number) => {
    if (!window.confirm("Are you sure you want to delete this mentoring session?")) return;
    const res = await apiCall(
      `${LmsApiEndpoint.mentoringSession.deleteMentoringSession}/${scheduleId}`,
      "delete"
    );
    if (res && res.status) {
      toast.success("Mentoring Session deleted successfully!");
      fetchSessions();
    } else {
      toast.error(res?.message || "Failed to delete mentoring session.");
    }
  };

  // --- 1. Questionnaires Modal Handlers ---
  const handleOpenQuestionnaire = async (session: MentoringSession) => {
    setActiveSessionForQuestionnaire(session);
    setQuestionnaireLoading(true);
    setIsQuestionnaireOpen(true);

    const res = await apiCall(`${LmsApiEndpoint.mentoring.questionnaire}/${session.questionnaire_id}`, "get");
    if (res && res.status && res.data) {
      const q = res.data;
      setQuestionnaireData(q);
      setQuestionnaireTitle(q.questionnaire_name || "");
      setMessageToMentees(q.message_to_mentees || "");
      setFieldSetting(q.access_level ?? 0);
      
      const questions = (q.questions || []).map((que: any) => ({
        id: que.questionnaire_que_id,
        que_no: que.que_no,
        questionText: que.question || "",
        que_type_id: que.que_type_id || 1,
        questionnaire_type_id: que.questionnaire_type_id || 1,
        que_is_mandatory: !!que.que_is_mandatory,
        options: (que.options || []).map((o: any) => o.que_option)
      }));
      setQuestionnaireQuestions(questions);
    } else {
      setQuestionnaireData(null);
      setQuestionnaireTitle("Student MMP Questionnaire");
      setMessageToMentees("Answer all mandatory questions.");
      setFieldSetting(0);
      setQuestionnaireQuestions([
        {
          id: Date.now(),
          que_no: 1,
          questionText: "Are you satisfied with the teaching staff and their teaching methods",
          que_type_id: 1,
          questionnaire_type_id: 1,
          que_is_mandatory: true,
          options: ["Extremely satisfied", "Satisfied", "Dissatisfied", "Extremely dissatisfied"]
        }
      ]);
    }
    setQuestionnaireLoading(false);
  };

  const handleAddQuestion = () => {
    if (fieldSetting === 2) return;
    if (fieldSetting === 1 && editingScheduleId) return;

    const newQue = {
      id: Date.now(),
      que_no: questionnaireQuestions.length + 1,
      questionText: "",
      que_type_id: 1,
      questionnaire_type_id: 1,
      que_is_mandatory: false,
      options: [""]
    };
    setQuestionnaireQuestions([...questionnaireQuestions, newQue]);
  };

  const handleUpdateQuestion = (qId: number, field: string, value: any) => {
    if (fieldSetting === 2) return;
    setQuestionnaireQuestions(prev => prev.map(q => q.id === qId ? { ...q, [field]: value } : q));
  };

  const handleDeleteQuestion = (qId: number) => {
    if (fieldSetting === 2) return;
    const filtered = questionnaireQuestions.filter(q => q.id !== qId);
    const renumbered = filtered.map((q, idx) => ({ ...q, que_no: idx + 1 }));
    setQuestionnaireQuestions(renumbered);
  };

  const handleAddOption = (qId: number) => {
    if (fieldSetting === 2) return;
    setQuestionnaireQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return { ...q, options: [...q.options, ""] };
      }
      return q;
    }));
  };

  const handleRemoveOption = (qId: number, optIdx: number) => {
    if (fieldSetting === 2) return;
    setQuestionnaireQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return { ...q, options: q.options.filter((_: any, idx: number) => idx !== optIdx) };
      }
      return q;
    }));
  };

  const handleUpdateOption = (qId: number, optIdx: number, val: string) => {
    if (fieldSetting === 2) return;
    setQuestionnaireQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const copy = [...q.options];
        copy[optIdx] = val;
        return { ...q, options: copy };
      }
      return q;
    }));
  };

  const handleSaveQuestionnaire = async () => {
    if (fieldSetting === 2) {
      toast.info("This questionnaire is read-only according to field settings.");
      setIsQuestionnaireOpen(false);
      return;
    }
    if (!questionnaireTitle.trim()) {
      return toast.error("Questionnaire Title is required.");
    }

    const payload = {
      questionnaire_name: questionnaireTitle,
      message_to_mentees: messageToMentees,
      access_level: fieldSetting,
      parent_id: questionnaireData?.questionnaire_id || null,
      questions: questionnaireQuestions.map((q, idx) => ({
        que_no: idx + 1,
        question: q.questionText,
        que_type_id: parseInt(String(q.que_type_id)),
        questionnaire_type_id: parseInt(String(q.questionnaire_type_id)),
        que_is_mandatory: q.que_is_mandatory,
        options: q.options.filter((o: string) => o.trim() !== "")
      }))
    };

    const res = await apiCall(`${LmsApiEndpoint.mentoring.questionnaire}/save`, "post", payload);
    if (res && res.status) {
      toast.success("Questionnaire saved successfully!");
      fetchSessions();
      setIsQuestionnaireOpen(false);
    } else {
      toast.error(res?.message || "Failed to save questionnaire.");
    }
  };

  // --- 2. Registered Mentees Modal & Chat Handlers ---
  const handleOpenMentees = async (session: MentoringSession) => {
    setActiveSessionForMentees(session);
    setIsMenteesOpen(true);
    setSelectedMenteeForChat(null);
    setSelectedMenteeResponse(null);
    setMenteesLoading(true);

    const res = await apiCall(`${LmsApiEndpoint.mentoring.sessions}/${session.schedule_id}/mentees`, "get");
    if (res && res.status) {
      setMenteesList(res.data || []);
    } else {
      toast.error(res?.message || "Failed to load mentees.");
    }
    setMenteesLoading(false);

    // Fetch questionnaire questions for this session so we can display them even if no response has been submitted yet
    if (session.questionnaire_id) {
      const qRes = await apiCall(`${LmsApiEndpoint.mentoring.questionnaire}/${session.questionnaire_id}`, "get");
      if (qRes && qRes.status && qRes.data) {
        const questions = (qRes.data.questions || []).map((que: any) => ({
          questionnaire_que_id: que.questionnaire_que_id,
          question_text: que.question,
          text_answer: "",
          selected_options: []
        }));
        setActiveSessionQuestions(questions);
      } else {
        setActiveSessionQuestions([]);
      }
    } else {
      setActiveSessionQuestions([]);
    }

    fetchChatHistory(session.schedule_id, null);
  };

  const fetchChatHistory = async (scheduleId: number, menteeId: number | null) => {
    setChatLoading(true);
    let url = `${LmsApiEndpoint.mentoring.sessions}/${scheduleId}/chat`;
    if (menteeId !== null) {
      url += `?mentee_id=${menteeId}`;
    }
    const res = await apiCall(url, "get");
    if (res && res.status) {
      setChatMessages(res.data || []);
    }
    setChatLoading(false);
  };

  const handleSelectMenteeChat = (mentee: any) => {
    if (!activeSessionForMentees) return;
    if (selectedMenteeForChat?.student_id === mentee.student_id) {
      setSelectedMenteeForChat(null);
      fetchChatHistory(activeSessionForMentees.schedule_id, null);
    } else {
      setSelectedMenteeForChat(mentee);
      fetchChatHistory(activeSessionForMentees.schedule_id, mentee.student_id);
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setChatUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.post<{ status: boolean; message: string; data: { file_path: string } }>(
        LmsApiEndpoint.mentoring.upload,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data && response.data.status) {
        setChatAttachment(response.data.data.file_path);
        setChatAttachmentName(file.name);
        toast.success("Attachment uploaded successfully!");
      } else {
        toast.error(response.data?.message || "Upload failed.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed.");
    } finally {
      setChatUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeSessionForMentees) return;
    if (!chatInput.trim() && !chatAttachment) return;

    const payload = {
      mentee_id: selectedMenteeForChat ? selectedMenteeForChat.student_id : null,
      comment: chatInput,
      attachment: chatAttachment
    };

    const res = await apiCall(
      `${LmsApiEndpoint.mentoring.sessions}/${activeSessionForMentees.schedule_id}/chat/send`,
      "post",
      payload
    );

    if (res && res.status) {
      setChatInput("");
      setChatAttachment(null);
      setChatAttachmentName(null);
      fetchChatHistory(activeSessionForMentees.schedule_id, selectedMenteeForChat ? selectedMenteeForChat.student_id : null);
    } else {
      toast.error(res?.message || "Failed to send message.");
    }
  };

  return (
    <MentoringPageLayout>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[600px] transition-all duration-300">
        
        {/* Banner Title - Styled exactly like the image */}
        <div className="bg-[#1b2b3c] text-white px-6 py-2.5 font-bold text-lg flex items-center justify-between shadow-sm relative overflow-hidden" style={{ borderTopLeftRadius: '4px', borderTopRightRadius: '30px' }}>
          <span>{isCreating ? (editingScheduleId ? "Edit Mentoring Session" : "Add Mentoring Session") : "Mentoring Session"}</span>
        </div>

        {!isCreating ? (
          // --- First Screen: Exact UI Mockup Dashboard ---
          <div className="p-6 flex flex-col flex-grow text-gray-800 dark:text-gray-200">
            
            {/* Filters Row: Curriculum, Month, Create Session */}
            <div className="flex flex-wrap items-end gap-6 mb-4">
              
              {/* Curriculum Selection */}
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                  Curriculum: <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  value={selectedCurriculum}
                  onChange={(e) => setSelectedCurriculum(e.target.value)}
                  className="px-3 py-1.5 text-[13px] border border-gray-300 bg-white text-gray-750 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[280px]"
                >
                  <option value="">Select Curriculum</option>
                  {curriculums.map(c => (
                    <option key={c.curriculum_id} value={c.curriculum_id}>
                      {c.curriculum_desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selection */}
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                  Month: <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="month"
                    id="month-filter-input"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 text-[13px] border border-gray-300 rounded-l bg-white text-gray-750 focus:outline-none focus:ring-1 focus:ring-blue-500 h-[34px] w-40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("month-filter-input") as HTMLInputElement | null;
                      if (el) {
                        try {
                          el.showPicker();
                        } catch {
                          el.focus();
                        }
                      }
                    }}
                    className="bg-gray-100 border border-l-0 border-gray-300 rounded-r px-3 py-2 text-gray-600 flex items-center justify-center h-[34px] cursor-pointer"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Create Session Button (Green) */}
              <div className="flex items-end ml-auto">
                <button
                  type="button"
                  onClick={handleCreateSession}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white bg-[#5cb85c] hover:bg-[#4cae4c] border border-[#4cae4c] rounded shadow-sm hover:shadow transition cursor-pointer"
                >
                  <span className="border border-white/45 rounded p-0.5"><Plus className="h-3.5 w-3.5 text-white font-bold" /></span>
                  Create Session
                </button>
              </div>

            </div>

            {/* Controls row: Show entries dropdown & Search input */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-4">
              
              <div className="flex items-center gap-1.5 text-[13px] text-gray-700 dark:text-gray-300">
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-2.5 py-1 bg-white text-gray-750 focus:outline-none text-[13px]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              <div className="flex items-center gap-1.5 text-[13px] text-gray-700 dark:text-gray-300">
                <span>Search:</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded px-2.5 py-1 bg-white text-gray-750 focus:outline-none text-[13px] w-48 md:w-56"
                />
              </div>

            </div>

            {/* Sessions Table Layout */}
            <div className="flex flex-col gap-6 flex-grow">
              {listLoading ? (
                // Pulse loader
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded p-6 flex flex-col gap-4 animate-pulse">
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded w-full" />
                  </div>
                ))
              ) : paginatedSessions.length > 0 ? (
                paginatedSessions.map((session) => (
                  <div 
                    key={session.schedule_id} 
                    className="border border-gray-300 dark:border-gray-700 rounded overflow-hidden shadow-xs bg-white dark:bg-gray-800"
                  >
                    {/* Session Title Header (Gray Block) */}
                    <div className="bg-[#dcdcdc] dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-b border-gray-300 dark:border-gray-600">
                      <div className="flex flex-col text-left">
                        <span className="text-base font-bold text-gray-800 dark:text-white">
                          {session.group_name}
                        </span>
                        <span className="text-[13px] text-gray-600 dark:text-gray-300 mt-0.5">
                          {session.mentor_names && session.mentor_names.length > 0 
                            ? session.mentor_names.join(", ") 
                            : "Generic Faculty"}
                        </span>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenQuestionnaire(session)}
                          className="text-[#337ab7] dark:text-blue-400 hover:underline text-sm font-semibold cursor-pointer bg-transparent border-0 p-0"
                        >
                          Questionnaires
                        </button>
                      </div>
                    </div>

                    {/* Semester Sub-header (Lighter Gray Block) */}
                    <div className="bg-[#eaeded] dark:bg-gray-750 px-4 py-2.5 flex items-center justify-between border-b border-gray-300 dark:border-gray-600">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {session.semester_id} - Semester
                      </span>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleEditSession(session)}
                          className="text-[#337ab7] hover:text-blue-700 dark:text-blue-400 cursor-pointer bg-transparent border-0 p-0"
                          title="Edit Mentoring Session"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session.schedule_id)}
                          className="text-red-500 hover:text-red-750 cursor-pointer bg-transparent border-0 p-0"
                          title="Delete Mentoring Session"
                        >
                          <span className="text-red-500 font-extrabold text-sm">✖</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-groups Table Grid */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[13px] text-gray-700 dark:text-gray-200">
                        <tbody>
                          {session.sub_groups && session.sub_groups.length > 0 ? (
                            session.sub_groups.map((sg, sgIdx) => (
                              <tr 
                                key={sg.sub_group_id || sgIdx} 
                                className="border-b border-gray-300 dark:border-gray-600 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/10"
                              >
                                {/* Column 1: Subgroup name */}
                                <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-white border-r border-gray-300 dark:border-gray-600 w-1/4">
                                  {sg.sub_group_name}
                                </td>

                                {/* Column 2: Date & Time range stacked */}
                                <td className="px-4 py-3.5 border-r border-gray-300 dark:border-gray-600 w-1/3 text-gray-600 dark:text-gray-300">
                                  <div className="flex flex-col text-[13px] gap-1">
                                    {sg.dates && sg.dates.length > 0 ? (
                                      sg.dates.map((d, dIdx) => (
                                        <div key={dIdx} className="flex flex-col">
                                          <span>{d.start_date} to {d.end_date}</span>
                                          <span>{d.start_time} to {d.end_time}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="italic text-gray-450">No dates mapped</span>
                                    )}
                                  </div>
                                </td>

                                {/* Column 3: Location */}
                                <td className="px-4 py-3.5 border-r border-gray-300 dark:border-gray-600 w-1/6">
                                  {sg.location || "Conference room"}
                                </td>

                                {/* Column 4: Mentees link */}
                                <td className="px-4 py-3.5 text-center border-r border-gray-300 dark:border-gray-600 w-1/12">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenMentees(session)}
                                    className="text-[#337ab7] dark:text-blue-400 hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0"
                                  >
                                    Mentees
                                  </button>
                                </td>

                                {/* Column 5: Status */}
                                <td className="px-4 py-3.5 text-center border-r border-gray-300 dark:border-gray-600 w-1/12 text-[#337ab7] dark:text-blue-400 font-semibold">
                                  Yet to start
                                </td>

                                {/* Column 6: Action menu */}
                                <td className="px-4 py-3.5 text-center w-[50px] text-gray-400 dark:text-gray-500">
                                  <button className="hover:bg-gray-150 dark:hover:bg-gray-700 p-1 rounded transition cursor-pointer bg-transparent border-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </td>

                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-4 py-4 text-center text-gray-400 dark:text-gray-500 italic">
                                No sub-groups mapped to this session.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                ))
              ) : (
                <div className="border border-gray-200 dark:border-gray-800 rounded p-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  No mentoring sessions found matching the filter criteria.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalEntries > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                <div className="text-[13px] text-gray-600 dark:text-gray-400">
                  Showing {showingStart} to {showingEnd} of {totalEntries} entries
                </div>
                
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded overflow-hidden shadow-xs text-[13px] bg-white dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border-r border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 border-r border-gray-300 dark:border-gray-700 last:border-r-0 font-medium cursor-pointer ${
                        currentPage === pageNum 
                          ? 'bg-[#337ab7] text-white' 
                          : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          // --- Second Screen: Add / Edit Mentoring Session ---
          <div className="flex flex-col flex-grow animate-in fade-in duration-200 p-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* Form details */}
              <div className="lg:col-span-2 flex flex-col gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                
                {/* Curriculum Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-slate-805 dark:text-slate-200">
                    Curriculum: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCurriculum}
                    onChange={(e) => setSelectedCurriculum(e.target.value)}
                    disabled={editingScheduleId !== null}
                    className="w-full px-3.5 py-2.5 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 disabled:opacity-55"
                  >
                    <option value="">Select Curriculum</option>
                    {curriculums.map(c => (
                      <option key={c.curriculum_id} value={c.curriculum_id}>
                        {c.curriculum_desc} ({c.curriculum_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mentoring Group */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-slate-805 dark:text-slate-200">
                      Mentoring Group: <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      <option value="">Select Mentoring Group</option>
                      {groups.map(g => (
                        <option key={g.mentors_group_id} value={g.mentors_group_id}>
                          {g.mentors_pgm_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-slate-850 dark:text-slate-200">
                      Term / Semester: <span className="text-red-505">*</span>
                    </label>
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      <option value="">Select Term</option>
                      {semesters.map(s => (
                        <option key={s.semester_id} value={s.semester_id}>
                          {s.semester_desc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Session Agenda */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-slate-805 dark:text-slate-200">
                    Session Agenda:
                  </label>
                  <textarea
                    rows={4}
                    value={sessionAgenda}
                    onChange={(e) => setSessionAgenda(e.target.value)}
                    placeholder="Enter session agenda details..."
                    className="w-full px-3.5 py-3 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  ></textarea>
                </div>

              </div>

              {/* Tips & Guidance */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-[13px] text-blue-800 dark:text-blue-300 flex flex-col gap-3">
                <h4 className="font-bold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5" />
                  Creating Mentoring Sessions
                </h4>
                <ul className="list-disc pl-4 flex flex-col gap-2 leading-relaxed">
                  <li>Choose a <strong>Curriculum</strong> first to enable group and semester mappings.</li>
                  <li>Each <strong>Sub-group</strong> must specify date and time ranges, and at least one mapped student/mentee.</li>
                  <li>Provide a valid <strong>Location/URL</strong> link for online calls or offline locations.</li>
                  <li>Students in the group will be notified once the session is saved.</li>
                </ul>
              </div>

            </div>

            {/* Sub-groups Sections */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                  Sub-group Allocations
                </h3>
                <button
                  type="button"
                  onClick={handleAddSubGroup}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow cursor-pointer transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Sub-group
                </button>
              </div>

              {subGroups.map((sg) => (
                <div
                  key={sg.id}
                  className="border border-slate-200 dark:border-slate-700 p-6 rounded-2xl bg-white dark:bg-gray-800/40 shadow-sm animate-in fade-in zoom-in-98 duration-150 flex flex-col gap-6"
                >
                  {/* Subgroup Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <label className="text-[13px] font-bold text-slate-805 dark:text-slate-200">
                        Sub-group Name: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={sg.name}
                        onChange={(e) => handleRenameSubGroup(sg.id, e.target.value)}
                        className="px-3.5 py-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-gray-750 border border-slate-200 dark:border-slate-655 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
                        placeholder="e.g. Sub-group 1"
                      />
                    </div>
                    {subGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSubGroup(sg.id)}
                        className="text-red-650 hover:text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                      >
                        Remove Sub-group
                      </button>
                    )}
                  </div>

                  {/* Slots Mapping */}
                  <div className="flex flex-col gap-5">
                    {sg.slots.map((slot, index) => {
                      const startInputId = `start-date-${sg.id}-${slot.id}`;
                      const endInputId = `end-date-${sg.id}-${slot.id}`;
                      const startTimeParts = parseTime(slot.startTime);
                      const endTimeParts = parseTime(slot.endTime);

                      return (
                        <div key={slot.id} className="flex flex-wrap items-end gap-6 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-slate-100 dark:border-slate-750">
                          
                          {/* Start Date */}
                          <div className="flex flex-col gap-1.5 w-44">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                            <div className="flex h-[34px]">
                              <input
                                type="date"
                                id={startInputId}
                                value={slot.startDate}
                                onChange={(e) => handleUpdateSlot(sg.id, slot.id, 'startDate', e.target.value)}
                                className="w-full px-3 py-1 text-[13px] text-slate-700 bg-white border border-slate-200 border-r-0 rounded-l-lg focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-250 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(startInputId) as HTMLInputElement | null;
                                  if (el) try { el.showPicker(); } catch (err) { el.focus(); }
                                }}
                                className="flex items-center justify-center px-3 border border-slate-200 rounded-r-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-600 dark:border-slate-600 dark:text-slate-350 cursor-pointer"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* End Date */}
                          <div className="flex flex-col gap-1.5 w-44">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">End Date</label>
                            <div className="flex h-[34px]">
                              <input
                                type="date"
                                id={endInputId}
                                value={slot.endDate}
                                onChange={(e) => handleUpdateSlot(sg.id, slot.id, 'endDate', e.target.value)}
                                className="w-full px-3 py-1 text-[13px] text-slate-700 bg-white border border-slate-200 border-r-0 rounded-l-lg focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-255 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(endInputId) as HTMLInputElement | null;
                                  if (el) try { el.showPicker(); } catch (err) { el.focus(); }
                                }}
                                className="flex items-center justify-center px-3 border border-slate-200 rounded-r-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-600 dark:border-slate-600 dark:text-slate-350 cursor-pointer"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Start Time */}
                          <div className="flex flex-col gap-1.5 w-48">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Start Time</label>
                            <div className="flex h-[34px] items-center border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-700 overflow-hidden w-full">
                              <select
                                value={startTimeParts.hour}
                                onChange={(e) => handleUpdateTimePart(sg.id, slot.id, 'startTime', 'hour', e.target.value)}
                                className="px-2 py-1 text-[13px] text-slate-700 bg-white border-0 focus:outline-none dark:bg-gray-700 dark:text-slate-200 flex-grow text-center cursor-pointer"
                              >
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                              <span className="text-slate-400 font-bold">:</span>
                              <select
                                value={startTimeParts.minute}
                                onChange={(e) => handleUpdateTimePart(sg.id, slot.id, 'startTime', 'minute', e.target.value)}
                                className="px-2 py-1 text-[13px] text-slate-700 bg-white border-0 focus:outline-none dark:bg-gray-700 dark:text-slate-200 flex-grow text-center cursor-pointer"
                              >
                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <select
                                value={startTimeParts.period}
                                onChange={(e) => handleUpdateTimePart(sg.id, slot.id, 'startTime', 'period', e.target.value)}
                                className="px-2 py-1 text-[13px] text-slate-805 bg-slate-50 border-0 border-l border-slate-200 focus:outline-none dark:bg-gray-600 dark:text-slate-200 dark:border-slate-750 font-bold text-center cursor-pointer"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>

                          {/* End Time */}
                          <div className="flex flex-col gap-1.5 w-48">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">End Time</label>
                            <div className="flex h-[34px] items-center border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-700 overflow-hidden w-full">
                              <select
                                value={endTimeParts.hour}
                                onChange={(e) => handleUpdateTimePart(sg.id, slot.id, 'endTime', 'hour', e.target.value)}
                                className="px-2 py-1 text-[13px] text-slate-700 bg-white border-0 focus:outline-none dark:bg-gray-700 dark:text-slate-200 flex-grow text-center cursor-pointer"
                              >
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                              <span className="text-slate-400 font-bold">:</span>
                              <select
                                value={endTimeParts.minute}
                                onChange={(e) => handleUpdateTimePart(sg.id, slot.id, 'endTime', 'minute', e.target.value)}
                                className="px-2 py-1 text-[13px] text-slate-700 bg-white border-0 focus:outline-none dark:bg-gray-700 dark:text-slate-200 flex-grow text-center cursor-pointer"
                              >
                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <select
                                value={endTimeParts.period}
                                onChange={(e) => handleUpdateTimePart(sg.id, slot.id, 'endTime', 'period', e.target.value)}
                                className="px-2 py-1 text-[13px] text-slate-805 bg-slate-50 border-0 border-l border-slate-200 focus:outline-none dark:bg-gray-600 dark:text-slate-200 dark:border-slate-750 font-bold text-center cursor-pointer"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>

                          {/* Control slots */}
                          <div className="flex items-center gap-2.5 h-[34px]">
                            <button
                              type="button"
                              onClick={() => handleAddSlot(sg.id)}
                              className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 p-1.5 rounded-lg border border-blue-200 dark:border-blue-900 cursor-pointer"
                              title="Add slot inline"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            {sg.slots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(sg.id, slot.id)}
                                className="text-red-650 hover:bg-red-50 dark:text-red-400 p-1.5 rounded-lg border border-red-200 dark:border-red-900 cursor-pointer font-bold"
                              >
                                ×
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* Register Mentees row triggers */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div
                      onClick={() => handleRegisterMenteesClick(sg.id)}
                      className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-slate-655 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-600 w-full max-w-[280px]"
                    >
                      <span className="text-[13px] font-bold text-slate-750 dark:text-slate-250 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Register Mentees
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950/40 text-blue-600 px-2 py-0.5 rounded-full">
                          {sg.menteeCount}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Location / URL */}
                    <div className="flex flex-col gap-1 w-full max-w-[480px]">
                      <input
                        type="text"
                        value={sg.locationUrl}
                        onChange={(e) => handleUpdateSubGroupField(sg.id, 'locationUrl', e.target.value)}
                        className="w-full px-3.5 py-2 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                        placeholder="Enter Location or Gmeet/Zoom Link"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end border-t border-slate-250/30 pt-6 gap-3 mt-auto">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSession}
                className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition cursor-pointer"
              >
                <Save className="h-4.5 w-4.5" />
                Save Session
              </button>
            </div>

          </div>
        )}
      </div>

      {/* --- MODAL 1: Register Mentees Checklist for creation --- */}
      {activeSgForMentees !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh] transform scale-100 transition-all duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Select Mentees
              </h3>
              <button onClick={() => setActiveSgForMentees(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto mb-4 border border-slate-100 dark:border-slate-700 rounded-xl p-2 custom-scrollbar flex flex-col gap-1">
              {allMentees.length === 0 ? (
                <div className="text-sm text-slate-450 dark:text-slate-400 p-8 text-center">
                  No mentees available in this group.
                </div>
              ) : (
                allMentees.map(m => {
                  const activeSg = subGroups.find(sg => sg.id === activeSgForMentees);
                  const isChecked = activeSg?.menteeIds?.includes(m.student_id) || false;
                  return (
                    <label key={m.student_id} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl cursor-pointer text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSubGroups(prev => prev.map(sg => {
                            if (sg.id === activeSgForMentees) {
                              const ids = checked
                                ? [...(sg.menteeIds || []), m.student_id]
                                : (sg.menteeIds || []).filter(id => id !== m.student_id);
                              return {
                                ...sg,
                                menteeIds: ids,
                                menteeCount: ids.length
                              };
                            }
                            return sg;
                          }));
                        }}
                        className="rounded-md border-slate-350 text-blue-600 focus:ring-blue-500/40 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold">{m.student_name}</span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSgForMentees(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-805 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
              >
                Done Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Questionnaire Manager Modal (Matches Design Image 1) --- */}
      {isQuestionnaireOpen && activeSessionForQuestionnaire && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Header banner matching first design image */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
              <h2 className="text-[17px] font-bold text-white tracking-wide">
                Questionnaires
              </h2>
              <button onClick={() => setIsQuestionnaireOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-full transition">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5 flex-grow custom-scrollbar bg-slate-50/50 dark:bg-gray-900/10">
              
              {/* Field settings indicators */}
              {fieldSetting === 2 && (
                <div className="flex items-center gap-2 p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200/50 dark:border-amber-900/50 text-[13px] font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>Field Setting Restriction: This questionnaire is view-only. Questions cannot be added, modified or deleted.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-gray-800 p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                {/* Curriculum name (static text) */}
                <div className="flex flex-col gap-1 text-[13px]">
                  <span className="font-bold text-slate-850 dark:text-slate-200">Curriculum:</span>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">{activeSessionForQuestionnaire.group_name}</span>
                </div>

                {/* Field Setting Options (Dropdown/Display) */}
                <div className="flex flex-col gap-1 text-[13px]">
                  <span className="font-bold text-slate-850 dark:text-slate-200">Field Setting:</span>
                  <select
                    value={fieldSetting}
                    onChange={(e) => setFieldSetting(parseInt(e.target.value))}
                    disabled={fieldSetting === 2}
                    className="mt-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-850 text-slate-700 dark:text-slate-250 rounded-lg text-[13px]"
                  >
                    <option value={0}>Allow to add / modify / delete Questionnaire</option>
                    <option value={1}>Allow to modify / delete Questionnaire only</option>
                    <option value={2}>Do not allow to add / modify / delete Questionnaire</option>
                  </select>
                </div>

                {/* Questionnaire Title Input */}
                <div className="flex flex-col gap-1 text-[13px] md:col-span-2">
                  <span className="font-bold text-slate-850 dark:text-slate-200">
                    Questionnaire Title: <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={questionnaireTitle}
                    onChange={(e) => setQuestionnaireTitle(e.target.value)}
                    disabled={fieldSetting === 2}
                    className="mt-1 px-3 py-2 w-full max-w-[400px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-850 text-slate-700 dark:text-slate-250 rounded-lg focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter questionnaire title"
                  />
                </div>

                {/* Message to Mentees Input */}
                <div className="flex flex-col gap-1 text-[13px] md:col-span-2">
                  <span className="font-bold text-slate-850 dark:text-slate-200">Message to Mentees:</span>
                  <input
                    type="text"
                    value={messageToMentees}
                    onChange={(e) => setMessageToMentees(e.target.value)}
                    disabled={fieldSetting === 2}
                    className="mt-1 px-3 py-2 w-full max-w-[600px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-850 text-slate-700 dark:text-slate-250 rounded-lg focus:ring-1 focus:ring-blue-500"
                    placeholder="Message to Mentees"
                  />
                </div>
              </div>

              {/* Questions list */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-[14px] text-slate-800 dark:text-slate-200">Questions Layout</h3>

                {questionnaireLoading ? (
                  <div className="text-center p-8 text-slate-400">Loading questionnaire template...</div>
                ) : questionnaireQuestions.map((q, idx) => (
                  <div key={q.id} className="border border-slate-250 dark:border-slate-700 rounded-xl p-5 flex flex-col gap-4 bg-white dark:bg-gray-800/60 relative">
                    
                    {/* Top Row: Type dropdowns & mandatory toggle */}
                    <div className="flex flex-wrap items-center gap-4 text-[13px]">
                      {/* Q Number */}
                      <input
                        type="text"
                        value={q.que_no}
                        readOnly
                        className="w-12 text-center text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-700 rounded-lg py-1 bg-slate-50 dark:bg-gray-700 font-bold"
                      />

                      {/* Question Type */}
                      <select
                        value={q.que_type_id}
                        onChange={(e) => handleUpdateQuestion(q.id, 'que_type_id', parseInt(e.target.value))}
                        disabled={fieldSetting === 2}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-850"
                      >
                        {QUESTION_TYPES.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>

                      {/* Questionnaire Category */}
                      <select
                        value={q.questionnaire_type_id}
                        onChange={(e) => handleUpdateQuestion(q.id, 'questionnaire_type_id', parseInt(e.target.value))}
                        disabled={fieldSetting === 2}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-850"
                      >
                        {QUESTIONNAIRE_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>

                      {/* Mandatory checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={q.que_is_mandatory}
                          onChange={(e) => handleUpdateQuestion(q.id, 'que_is_mandatory', e.target.checked)}
                          disabled={fieldSetting === 2}
                          className="rounded text-blue-600 cursor-pointer w-4 h-4"
                        />
                        <span>Mandatory:</span>
                      </label>

                      {/* Delete Question Icon */}
                      {fieldSetting !== 2 && (fieldSetting !== 1 || !editingScheduleId) && (
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="ml-auto text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Question Text Area */}
                    <div className="flex flex-col gap-1.5">
                      <textarea
                        value={q.questionText}
                        onChange={(e) => handleUpdateQuestion(q.id, 'questionText', e.target.value)}
                        disabled={fieldSetting === 2}
                        placeholder="Enter the question text here..."
                        maxLength={2000}
                        className="w-full px-3 py-2 text-[13px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg focus:outline-none dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
                        rows={2}
                      ></textarea>
                      <span className="text-[11px] self-end text-slate-400 font-semibold">
                        {q.questionText.length} / 2000 characters
                      </span>
                    </div>

                    {/* Options / Choices list if type is single or multiple select */}
                    {q.que_type_id !== 3 && (
                      <div className="flex flex-col gap-2 mt-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                        <span className="text-[12px] font-bold text-slate-505">Choices list:</span>
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                              disabled={fieldSetting === 2}
                              placeholder={`Option ${optIdx + 1}`}
                              className="px-3 py-1.5 text-[13px] border border-slate-200 dark:border-slate-750 rounded-lg bg-white dark:bg-gray-850 text-slate-700 dark:text-slate-250 w-full max-w-[400px]"
                            />
                            {fieldSetting !== 2 && (
                              <div className="flex items-center gap-1.5">
                                {optIdx === q.options.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(q.id)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded cursor-pointer"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                                {q.options.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(q.id, optIdx)}
                                    className="p-1 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded cursor-pointer font-bold"
                                  >
                                    –
                                  </button>
                                )}
                              </div>
                            )}
                            <MessageSquare className="h-4 w-4 text-slate-350" />
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Add question button */}
              {fieldSetting !== 2 && (fieldSetting !== 1 || !editingScheduleId) && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Question
                  </button>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end p-4 bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-slate-700 gap-3">
              <button
                type="button"
                onClick={() => setIsQuestionnaireOpen(false)}
                className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
              >
                <X className="h-4 w-4" />
                Close
              </button>
              {fieldSetting !== 2 && (
                <button
                  type="button"
                  onClick={handleSaveQuestionnaire}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-650 hover:bg-blue-700 rounded-xl transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 3: Registered Mentees List & Chat (Matches Design Image 2) --- */}
      {isMenteesOpen && activeSessionForMentees && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Header banner matching second design image */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
              <h2 className="text-[17px] font-bold text-white tracking-wide">
                Registered Mentees List
              </h2>
              <button onClick={() => setIsMenteesOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-full transition">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable layout area */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 flex-grow custom-scrollbar bg-slate-50/50 dark:bg-gray-900/10">
              
              {/* Mentees Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-gray-800">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-750 text-[13px] text-slate-700 dark:text-slate-250">
                  <thead className="bg-slate-50 dark:bg-gray-700/50 text-slate-650 dark:text-slate-350 uppercase font-semibold text-xs tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left w-16">Sl No.</th>
                      <th className="px-4 py-3 text-left">USN</th>
                      <th className="px-4 py-3 text-left">Student Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-center">Questionnaires</th>
                      <th className="px-4 py-3 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                    {menteesLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-3" colSpan={7}><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full" /></td>
                        </tr>
                      ))
                    ) : menteesList.length > 0 ? (
                      menteesList.map((m, index) => (
                        <tr key={m.student_id} className={`hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors ${selectedMenteeForChat?.student_id === m.student_id ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}`}>
                          <td className="px-4 py-3.5 font-semibold text-slate-400">{index + 1}</td>
                          <td className="px-4 py-3.5 font-semibold">{m.student_usn || "N/A"}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-805 dark:text-slate-100">{m.student_name}</td>
                          <td className="px-4 py-3.5 text-slate-505 dark:text-slate-400">{m.student_email || "N/A"}</td>
                          <td className="px-4 py-3.5 text-slate-505 dark:text-slate-400">-</td>
                          <td className="px-4 py-3.5 text-center">
                            {activeSessionForMentees?.questionnaire_id ? (
                              <button
                                onClick={() => {
                                  if (!m.response) {
                                    // If no response has been submitted, mock a response using the session's questionnaire questions
                                    setSelectedMenteeResponse({
                                      ...m,
                                      response: {
                                        submitted_at: "Not Submitted",
                                        answers: activeSessionQuestions
                                      }
                                    });
                                  } else {
                                    setSelectedMenteeResponse(m);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline"
                              >
                                Response
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs italic">No response</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => handleSelectMenteeChat(m)}
                              className={`p-1.5 rounded-full transition-colors cursor-pointer ${selectedMenteeForChat?.student_id === m.student_id ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-150'}`}
                              title="Chat with Mentee"
                            >
                              <MessageCircle className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-450 dark:text-slate-505">
                          No mentees mapped to this mentoring session.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Chat Interface Block at bottom matching Design Image 2 */}
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
                
                {/* Chat Panel Header */}
                <div className="bg-slate-50 dark:bg-slate-750/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-805 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    {selectedMenteeForChat 
                      ? `Chatting with: ${selectedMenteeForChat.student_name}` 
                      : "General Group Guidance Comments"}
                  </span>
                  {selectedMenteeForChat && (
                    <button
                      onClick={() => {
                        setSelectedMenteeForChat(null);
                        fetchChatHistory(activeSessionForMentees.schedule_id, null);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold cursor-pointer"
                    >
                      Switch to Group Chat
                    </button>
                  )}
                </div>

                {/* Dual Panel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 flex-grow min-h-[220px]">
                  
                  {/* Left Column: Chat History */}
                  <div className="border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto max-h-[280px] custom-scrollbar flex flex-col gap-3 bg-slate-50/20">
                    {chatLoading ? (
                      <div className="text-center text-slate-400 text-xs py-8">Loading chats...</div>
                    ) : chatMessages.length > 0 ? (
                      chatMessages.map((msg, index) => (
                        <div key={index} className="flex flex-col gap-1 text-[13px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-805 dark:text-slate-100">{msg.sender_name}:</span>
                            <span className="text-slate-505 dark:text-slate-400">{msg.comment}</span>
                          </div>
                          {msg.attachment && (
                            <a
                              href={`${axiosInstance.defaults.baseURL}${msg.attachment}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 w-max"
                            >
                              <Paperclip className="h-3 w-3" />
                              View Attachment
                            </a>
                          )}
                          <span className="text-[10px] text-slate-455">{msg.created_date}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-12 italic">
                        No messages yet. Send a message to start conversation.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Message Writing Form (overall justification) */}
                  <div className="p-5 flex flex-col gap-4 bg-white dark:bg-gray-800">
                    <div className="flex-grow flex flex-col gap-1.5 relative">
                      <textarea
                        rows={4}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Enter message or overall justification..."
                        maxLength={2000}
                        className="w-full flex-grow px-3 py-2.5 text-[13px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl focus:outline-none dark:text-slate-200 focus:ring-1 focus:ring-blue-500 resize-none"
                      ></textarea>
                      <div className="absolute right-3.5 bottom-3.5 flex items-center gap-3">
                        
                        {/* File Upload Attachment Indicator/Trigger */}
                        <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-650 cursor-pointer transition relative">
                          <input
                            type="file"
                            onChange={handleUploadAttachment}
                            className="hidden"
                          />
                          <Paperclip className="h-4.5 w-4.5" />
                        </label>

                        {/* Send Trigger */}
                        <button
                          onClick={handleSendMessage}
                          disabled={chatUploading || (!chatInput.trim() && !chatAttachment)}
                          className="p-2 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 rounded-lg shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition cursor-pointer"
                        >
                          <Send className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>

                    {/* Attachment feedback status */}
                    {(chatAttachment || chatUploading) && (
                      <div className="text-[12px] flex items-center justify-between bg-blue-50 dark:bg-blue-950/20 px-3.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50 font-semibold text-blue-800 dark:text-blue-300">
                        {chatUploading ? (
                          <span>Uploading file...</span>
                        ) : (
                          <span className="truncate">Attached: {chatAttachmentName || "File"}</span>
                        )}
                        {chatAttachment && (
                          <button
                            onClick={() => { setChatAttachment(null); setChatAttachmentName(null); }}
                            className="text-red-500 hover:text-red-700 font-bold ml-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                    
                    <span className="text-[11px] self-end text-slate-400 font-semibold">
                      {chatInput.length} / 2000 characters
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Close */}
            <div className="flex justify-end p-4 bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsMenteesOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 4: Mentee Response Viewing Popover --- */}
      {selectedMenteeResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-55 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-md p-5 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-705 dark:text-white">
                Student response
              </h3>
              <button onClick={() => setSelectedMenteeResponse(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-full transition">
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
              </button>
            </div>

            {/* Student Details Grid Table */}
            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 text-[13px] mb-4 text-slate-700 dark:text-slate-200">
              <tbody>
                <tr>
                  <td className="border border-slate-200 dark:border-slate-700 p-2.5 w-1/2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Mentee name :</span> {selectedMenteeResponse.student_name}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2.5 w-1/2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Email & Contact :</span> {selectedMenteeResponse.student_email || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 dark:border-slate-700 p-2.5 w-1/2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Mentee usn :</span> {selectedMenteeResponse.student_usn || "N/A"}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2.5 w-1/2"></td>
                </tr>
              </tbody>
            </table>

            <div className="flex-grow overflow-y-auto mb-4 pr-1 flex flex-col custom-scrollbar text-[13px]">
              {selectedMenteeResponse.response?.answers && selectedMenteeResponse.response.answers.length > 0 ? (
                selectedMenteeResponse.response.answers.map((ans: any, aIdx: number) => (
                  <div key={aIdx} className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                    <div className="font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {aIdx + 1}. {ans.question_text || "Question"}
                    </div>
                    {/* Answer block (rendered only when present to match blank/empty lines in mockup) */}
                    {(ans.text_answer || (ans.selected_options && ans.selected_options.length > 0)) ? (
                      <div className="text-slate-600 dark:text-slate-350 ml-4 mb-2 font-normal">
                        {ans.text_answer ? (
                          <span>{ans.text_answer}</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {ans.selected_options.map((opt: any, oIdx: number) => (
                              <span key={oIdx} className="text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ {opt.specification || "Option"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-2" /> // Empty spacing to match mockup empty lines
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-450 text-center py-8">No responses found.</div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMenteeResponse(null)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition duration-150 cursor-pointer shadow-sm"
              >
                <span className="text-[9px]">✖</span> Close
              </button>
            </div>
          </div>
        </div>
      )}

    </MentoringPageLayout>
  );
};

export default MentoringSessionPage;
