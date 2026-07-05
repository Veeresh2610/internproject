import React from "react";
import MainPage from "../pages/mainPage";
import ChangePasswordPage from "../pages/changepassword";
import ConfigurationTypePage from "../pages/mentoring/ConfigurationTypePage";
import DeptConfigurationPage from "../pages/mentoring/DeptConfigurationPage";
import MentorListPage from "../pages/mentoring/MentorListPage";
import QuestionnairePage from "../pages/mentoring/QuestionnairePage";
import MentoringSessionPage from "../pages/mentoring/MentoringSessionPage";
import MapMentorMenteePage from "../pages/mentoring/MapMentorMenteePage";
import CourseRegistrationPage from "../pages/curriculum/CourseRegistrationPage";
import { FaHome, FaUsers, FaBook } from "react-icons/fa";

export const MAINROUTE = [
  {
    name: "Home",
    href: "/",
    element: MainPage,
    icon: React.createElement("div", { className: "w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white mr-1.5" }, React.createElement(FaHome, { size: 11 })),
    roles: [],
    subItems: [],
  },
  {
    name: "Mentoring",
    href: "/mentoring",
    element: ConfigurationTypePage,
    icon: React.createElement("div", { className: "w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white mr-1.5" }, React.createElement(FaUsers, { size: 11 })),
    roles: [],
    subItems: [],
  },
  {
    name: "",
    href: "/mentoring/dept_configuration",
    element: DeptConfigurationPage,
    roles: [],
    subItems: [],
    hidden: true,
  },
  {
    name: "",
    href: "/mentoring/mentor_list",
    element: MentorListPage,
    roles: [],
    subItems: [],
    hidden: true,
  },
  {
    name: "",
    href: "/mentoring/questionnaires",
    element: QuestionnairePage,
    roles: [],
    subItems: [],
    hidden: true,
  },
  {
    name: "",
    href: "/mentoring/mentoring_session",
    element: MentoringSessionPage,
    roles: [],
    subItems: [],
    hidden: true,
  },
  {
    name: "",
    href: "/mentoring/map_mentor_mentee",
    element: MapMentorMenteePage,
    roles: [],
    subItems: [],
    hidden: true,
  },
  {
    name: "Curriculum",
    href: "/curriculum",
    element: CourseRegistrationPage,
    icon: React.createElement("div", { className: "w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white mr-1.5" }, React.createElement(FaBook, { size: 11 })),
    roles: [],
    subItems: [],
  },
  {
    name: "Change Password",
    href: "/change_password",
    element: ChangePasswordPage,
    roles: [],
    subItems: [],
  },
  // {
  //   name: "User",
  //   href: "",
  //   element: Outlet,
  //   roles: [],
  //   subItems: [
  //     {
  //       name: "User Roles",
  //       href: "user_roles",
  //       roles: [],
  //       element: Outlet,
  //       subItems: [
  //         { name: "", href: "", roles: [], element: UserRolePage },
  //         { name: "Create", href: "create", roles: [], element: UserRoleAddEditForm },
  //         { name: "Update", href: "update", roles: [], element: UserRoleAddEditForm },
  //       ],
  //     },
  //     {
  //       name: "User Master",
  //       href: "user_master",
  //       roles: [],
  //       element: Outlet,
  //       subItems: [
  //         { name: "", href: "", roles: [], element: UserMasterPage },
  //         { name: "Create", href: "create", roles: [], element: UserMasterForm },
  //         { name: "Update", href: "update", roles: [], element: UserMasterForm },
  //       ],
  //     },
  //     {
  //       name: "User Access",
  //       href: "user_access",
  //       roles: [],
  //       element: Outlet,
  //       subItems: [
  //         { name: "", href: "", roles: [], element: UserAccessPage },
  //         { name: "Create", href: "create", roles: [], element: UserAccessAddEditForm },
  //         { name: "Update", href: "update", roles: [], element: UserAccessAddEditForm },
  //       ],
  //     },
  //     { name: "Department", href: "department", roles: [], element: DepartmentPage },
  //     { name: "Program Type", href: "program_type", roles: [], element: ProgramTypePage },
  //     { name: "Program", href: "program", roles: [], element: ProgramPage },

  //   ],
  // },
  // {
  //   name: "Academics",
  //   href: "",
  //   element: Outlet,
  //   roles: [],
  //   subItems: [
  //     {
  //       name: "Academic Batch",
  //       href: "academic_batch",
  //       roles: [],
  //       element: Outlet,
  //       subItems: [
  //         {
  //           name: "",
  //           href: "",
  //           roles: [],
  //           element: AcademicBatchPage,
  //         },
  //         {
  //           name: "Create",
  //           href: "create",
  //           roles: [],
  //           element: AcademicBatchForm,
  //         },
  //         {
  //           name: "Update",
  //           href: "update",
  //           roles: [],
  //           element: AcademicBatchForm,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Semester",
  //       href: "semester",
  //       roles: [],
  //       element: Outlet,
  //       subItems: [
  //         {
  //           name: "",
  //           href: "",
  //           roles: [],
  //           element: SemesterPage,
  //         },
  //         {
  //           name: "Create",
  //           href: "create",
  //           roles: [],
  //           element: SemesterForm,
  //         },
  //         {
  //           name: "Update",
  //           href: "update",
  //           roles: [],
  //           element: SemesterForm,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Course",
  //       href: "course",
  //       roles: [],
  //       element: Outlet,
  //       subItems: [
  //         {
  //           name: "",
  //           href: "",
  //           roles: [],
  //           element: CoursePage,
  //         },
  //         {
  //           name: "Create",
  //           href: "create",
  //           roles: [],
  //           element: CourseForm,
  //         },
  //         {
  //           name: "Update",
  //           href: "update",
  //           roles: [],
  //           element: UpdateCourseForm,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Bulk Course Import",
  //       href: "bulk_course_import",
  //       roles: [],
  //       element: Outlet,
  //       subItems: [
  //         {
  //           name: "",
  //           href: "",
  //           roles: [],
  //           element: BulkImportCoursePage,
  //         },
  //         {
  //           name: "Create",
  //           href: "create",
  //           roles: [],
  //           element: BulkCourseForm,
  //         },
  //         {
  //           name: "Update",
  //           href: "update",
  //           roles: [],
  //           element: BulkUpdateCourseForm,
  //         },
  //       ],
  //     },
    // ],
  // },
];
