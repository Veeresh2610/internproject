/**
 * API Endpoint Configuration for IonLMS Module
 * Central location for all LMS-related API endpoints
 */

export const LmsApiEndpoint = {
  configType: {
    list: "api/v1/config-type/list",
    save: "api/v1/config-type/save",
    delete: "api/v1/config-type/delete",
  },
  crossDeptMentor: {
    departments: "api/v1/cross-dept-mentor/departments",
    curriculums: "api/v1/cross-dept-mentor/curriculums",
    mentorsFromOtherDept: "api/v1/cross-dept-mentor/mentors-from-other-dept",
    mentorsToOtherDept: "api/v1/cross-dept-mentor/mentors-to-other-dept",
    save: "api/v1/cross-dept-mentor/save",
    update: "api/v1/cross-dept-mentor/update",
    delete: "api/v1/cross-dept-mentor/delete",
  },
  mentorList: {
    departments: "api/v1/mentoring/mentor-list/departments",
    programs: "api/v1/mentoring/mentor-list/programs",
    curriculums: "api/v1/mentoring/mentor-list/curriculums",
    semesters: "api/v1/mentoring/mentor-list/semesters",
    students: "api/v1/mentoring/mentor-list/students",
    mentorsMentees: "api/v1/mentoring/mentor-list/mentors-mentees",
    exportPdf: "api/v1/mentoring/mentor-list/export-pdf",
  },
  mentoringSession: {
    curriculumList: "mentoring-session/get_academic_batch_list",
    semestersByCurriculum: "mentoring-session/get_semesters_by_academic_batch",
    groupsByCurriculum: "mentoring-session/get_groups_by_academic_batch",
    groupMentees: "mentoring-session/get_group_mentees",
    saveMentoringSession: "mentoring-session/save_mentoring_session",
    getMentoringSessions: "mentoring-session/get_mentoring_sessions",
    getSessionMentees: "mentoring-session/get_session_mentees",
    updateMentoringSession: "mentoring-session/update_mentoring_session",
    deleteMentoringSession: "mentoring-session/delete_mentoring_session",
  },
  mentoring: {
    questionnaire: "api/v1/mentoring/questionnaires",
    sessions: "api/v1/mentoring/sessions",
    upload: "api/v1/mentoring/upload",
  },
} as const;
