import { ApiResponse } from "../hooks/useAxios";
// import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// import { gerBatchListInterface } from "../pages/ems/academics/academicBatch/responceinterface";
// import { CourseListInterface } from "../pages/ems/academics/course/responceinterface";
// import { ProgramListresponse } from "../pages/ems/configuration/program/responceinterface";
import { OptionsResponse } from "../pages/login/loginModel";
import { commonAPi, commonAPiResponse, Department, ProgramType } from "../types/auth";
import {
  BatchCycleInterface,
  CityListInterface,
  countryListInterface,
  CourseGroupInterface,
  eventCalenterTypeList,
  GetBatchTermListInterface,
  getCourseRelatedUSNOInterface,
  GetOccupationList,
  OccasionOptionListInterface,
  OccasionTypeInterface,
  sectionOptionlistInterface,
  SemesterListInterface,
  StateListInterface,
} from "../types/optionlist";
import axiosInstance from "./api";
import { ApiEndpoint } from "./ApiEndpoint/emsapiEndpoint";
import { LocalStorageHelper } from "./localStorageHelper";
import moment from "moment";

const AUTH_COOKIE_OPTIONData_KEY = "cookie_option_list";

export const getCookieOptionList = (): OptionsResponse | null => {
  return LocalStorageHelper.getObject<OptionsResponse>(AUTH_COOKIE_OPTIONData_KEY) || null;
};

export const fetchDepartmentOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.get<ApiResponse<commonAPiResponse>>(
      endpoint ? endpoint : ApiEndpoint.common_api.deportment_list,
      { ...params }, // Move params to the request body
    );

    const res = response.data;
    return res && res.data ? LocalStorageHelper.setObject(AUTH_COOKIE_Department_KEY, res.data) : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching Department options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

const AUTH_COOKIE_Department_KEY = "cookie_dept_option_list";
export const getDeptOptionList = (): commonAPi | null => {
  const cookieOptions = LocalStorageHelper.getObject<commonAPi>(AUTH_COOKIE_Department_KEY);

  if (!cookieOptions) {
    fetchDepartmentOptions("", "");
    return (LocalStorageHelper.getObject<commonAPi>(AUTH_COOKIE_Department_KEY) as commonAPi) || null;
  }

  return (cookieOptions as commonAPi) || null;
};
// export const // Helper to add/update department or program type
export const updateCookieCommonApiData = (
  key: "departments" | "program_types",
  newData: Department | ProgramType,
) => {
  let cookieOptions = LocalStorageHelper.getObject<commonAPi>(AUTH_COOKIE_Department_KEY);
  // Retrieve the existing data from local storage
  if (!cookieOptions) {
    console.error("Error: Could not retrieve cookieOptions");
    cookieOptions = {
      departments: [],
      program_types: [],
    };
  }

  // Determine whether the key is 'departments' or 'program_types' and update accordingly
  if (key === "departments") {
    const index = cookieOptions.departments.findIndex(
      (dep) => dep.department_id === (newData as Department).department_id,
    );

    if (index !== -1) {
      // If department already exists, update it
      // if ((newData as Department).status !== 0) {
      cookieOptions.departments[index] = newData as Department;
      // } else {
      //   cookieOptions.departments.splice(index, 1);
      // }
    } else {
      // Otherwise, add a new department
      cookieOptions.departments.push(newData as Department);
    }
  } else if (key === "program_types") {
    const index = cookieOptions.program_types.findIndex(
      (pgm) => pgm.pgmtype_id === (newData as ProgramType).pgmtype_id,
    );

    if (index !== -1) {
      // If program type already exists, update it
      cookieOptions.program_types[index] = newData as ProgramType;
    } else {
      // Otherwise, add a new program type
      cookieOptions.program_types.push(newData as ProgramType);
    }
  }

  // Save the updated object back to local storage
  LocalStorageHelper.setObject(AUTH_COOKIE_Department_KEY, cookieOptions);
};

// exam event
// export const fetchExamEventOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<ExamEventInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.examEvent.examEventlist,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchEXAMEVENTOptions", response);
//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: ExamEventInterface) => ({
//           ...item,
//           value: item.result_year,
//           label: item.result_year,
//         }))
//       : []; // Change null to an empty array
//   } catch (error) {
//     // console.error("Error fetching EXAMEVENT options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

export interface allexamEventInterface {
  result_year: string;
  event_type: string;
  result_year_dd: string;
  semester_start_date?: string;
  semester_end_date?: string;
}
export const fetchallExamEventOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<allexamEventInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.fetch_result_year_options,
      { ...params }, // Move params to the request body
    );

    const res = response.data;
    return res && res.data
      ? res.data.map((item: allexamEventInterface) => ({
          ...item,
          value: item.result_year,
          label: item.result_year,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching all EXAMEVENT options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

// export const fetchallReportTypeOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<any[]>>(
//       endpoint ? endpoint : ApiEndpoint.reports.consolidated_course_reg_report_type,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     return res && res.data ? res.data : []; // Change null to an empty array
//   } catch (error) {
//     console.error("Error fetching  options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

// program type
// export const fetchReportTypeOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<{ label: string; value: string }[]>>(
//       endpoint ? endpoint : ApiEndpoint.reports.get_con_se_report_type_options,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     return res && res.data ? res.data : []; // Change null to an empty array
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

// program type
// export const fetchProgramTypeOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<{ label: string; value: string }[]>>(
//       endpoint ? endpoint : ApiEndpoint.reports.getProgramType,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     return res && res.data ? res.data : []; // Change null to an empty array
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

// // academic year

// export const fetchAcadamicYearOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<string[]>>(
//       endpoint ? endpoint : ApiEndpoint.reports.getacademicyear,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: string) => ({
//           value: item,
//           label: item,
//         }))
//       : []; // Change null to an empty array
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

//  program list

// export const fetchProgramOptions = async (endpoint?: string, params?: any) => {
//   // console.log("program", endpoint, params);

//   try {
//     const response = await axiosInstance.post<ApiResponse<ProgramListresponse | any>>(
//       ApiEndpoint.program.program_list,
//       {
//         ...params,
//         equal_or_not_equal: 0,
//       },
//     );

//     const res = response.data;

//     return res && res.data
//       ? res.data
//           .filter((item: ProgramListresponse) => item.status === 1)
//           .map((item: ProgramListresponse) => ({
//             value: item.pgm_id.toString(),
//             label: item.pgm_title,
//           }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching program options:", error);
//     return []; // Return an empty array or handle the error as needed
//   }
// };

//  batch list

// export const fetchBatchOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<gerBatchListInterface | any>>(
//       endpoint ? endpoint : ApiEndpoint.academicBatch.getTabledata,
//       { show_delete: params?.show_delete ?? 1, program_id: params?.dept_id ?? params?.program_id ?? null }, // Move params to the request body
//     );

//     // console.log("fetchBatchOptions", response);
//     const res = response.data;
//     LocalStorageHelper.setObject<gerBatchListInterface[]>("batchOptionList", res.data);
//     return res && res.data
//       ? res.data
//           .filter((item: gerBatchListInterface) => item.status === 1)
//           .map((item: gerBatchListInterface) => ({
//             value: item.academic_batch_id.toString(),
//             label: item.academic_batch_code,
//             acaramic_year: item.academic_year,
//             program_duration: item.program_duration,
//           }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching batch options:", error);
//     return []; // Handle the error as needed
//   }
// };

// get batchcycle list
// {
//   "show_branch": "0",
//   "show_both": "",
//   "show_na": ""
// }
export const fetchBatchCycleOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<BatchCycleInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.common_api.batch_cycle_list,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchEXAMEVENTOptions", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: BatchCycleInterface) => ({
          value: item.batch_cycle_id ? item.batch_cycle_id.toString() : "",
          label: item.batch_cycle_code,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching EXAMEVENT options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

// semester list
// {
//   "academic_batch_id": 0,
//   "is_course": 1,
//   "is_first_year": false,
//   "is_batch_wise": false,
//   "result_year": "",
//   "flag": ""
// }
export const fetchsemesterOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<SemesterListInterface[] | any>>(
      endpoint ? endpoint : ApiEndpoint.common_api.get_semester_list,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchsemesterOptions", response);
    const res = response.data;

    return res && res.data
      ? res.data.map((item: SemesterListInterface) => ({
          value: item.semester ? item.semester.toString() : "",
          label: item.semester,
        }))
      : null;
  } catch (error) {
    console.error("Error fetching semester options:", error);
    return []; // Handle the error as needed
  }
};

export const fetchcyclesemesterOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<SemesterListInterface[] | any>>(
      endpoint ? endpoint : ApiEndpoint.common_api.get_cycle_semester_list,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchcyclesemesterOptions", response);
    const res = response.data;

    return res && res.data
      ? res.data.map((item: SemesterListInterface) => ({
          value: item.semester ? item.semester.toString() : "",
          label: item.semester,
        }))
      : null;
  } catch (error) {
    console.error("Error fetching semester options:", error);
    return []; // Handle the error as needed
  }
};

// export const fetchReportsemesterOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<SemesterListInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.reports.get_resultyearwise_report_semester_list,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchcyclesemesterOptions", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: SemesterListInterface) => ({
//           value: item.semester ? item.semester.toString() : "",
//           label: item.semester,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching semester options:", error);
//     return []; // Handle the error as needed
//   }
// };

export const fetchcycleStudentsectionOptions = async (endpoint?: string, params?: any) => {
  try {
    // const payload = {
    //   result_year: "2025-01-31",
    //   semester: 1,
    //   branch_cycle: 2,
    //   not_na: 1,
    //   flag: 1,
    // };
    const response = await axiosInstance.post<ApiResponse<sectionOptionlistInterface[] | any>>(
      endpoint ? endpoint : ApiEndpoint.common_api.fetch_student_section_list,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchcycleStudentsectionOptions", response);
    const res = response.data;

    return res && res.data
      ? res.data.map((item: sectionOptionlistInterface) => ({
          value: item.section,
          label: item.section,
        }))
      : null;
  } catch (error) {
    console.error("Error fetching semester options:", error);
    return []; // Handle the error as needed
  }
};

//  course list

export interface getCourseListOptionInterface {
  crs_id: number;
  crs_code: string;
  academic_year: string;
  crs_title: string;
  dept_id: number;
  dept_name: string;
  pgm_id: number;
  pgm_title: string;
  academic_batch_id: number;
  academic_batch_code: string;
  course_type_id: number;
  course_type_code: string;
  batch_cycle_id: number;
  batch_cycle_code: string;
  status: number;
  result_year: string;
  credit_based: number;
  credit_hours: number;
  semester: number;
  lab_course: string;
  crs_type: string;
  crs_order: number;
  no_of_cia: number;
  no_of_ise: number;
  no_of_mse: number;
  cia_max_marks: number;
  cia_min_marks: number;
  cia_weightage: number;
  see_max_marks: number;
  see_min_marks: number;
  see_weightage: number;
  viva_max_marks: number;
  viva_min_marks: number;
  viva_weightage: number;
  tw_credit_hours: number;
  tw_max_marks: number;
  tw_min_marks: number;
  tw_weightage: number;
  ise_max_marks: number;
  ise_min_marks: number;
  ise_weightage: number;
  mse_max_marks: number;
  mse_min_marks: number;
  mse_weightage: number;
  total_classes: number;
  min_passing_marks: number;
  base_crs_code: string;
  event_type_name: string;
  show_event_type: number;
}

// export const fetchCourselistOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<getCourseListOptionInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.reports.get_course_list,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: getCourseListOptionInterface) => ({
//           value: item.crs_id ? item.crs_id.toString() : "",
//           label: item.crs_code,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching course list options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface ReportCourselistInterface {
  crs_id: number;
  lab_course: string;
  crs_code: string;
  crs_title: string;
  total_classes: number;
  see_max_marks: number;
  see_min_marks: number;
  credit_hours: number;
  is_finalize: number;
}

// export const fetchReportCourselistOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<ReportCourselistInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.reports.consolidated_form_a,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: ReportCourselistInterface) => ({
//           value: item.crs_code,
//           label: item.crs_code,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching course list options:", error);
//     return []; // Handle the error as needed
//   }
// };

// export const fetchcycleCourselistOptions = async (endpoint?: string, params?: any) => {
//   try {
//     // const payload = {
//     //   result_year_value: "2025-01-31",
//     //   semester: 1,
//     //   batch_cycle_id: 2,
//     //   is_backlog: 1,
//     //   flag: 1,
//     // };
//     const response = await axiosInstance.post<ApiResponse<CourseListOptionInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.studentAllocation.fetch_course_option,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchcycleCourselistOptions", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: CourseListOptionInterface) => ({
//           ...item,
//           value: item.crs_code ? String(item.crs_code) : "",
//           label: item.crs_code,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching course list options:", error);
//     return []; // Handle the error as needed
//   }
// };

// export const fetchcycleCourselistOptions1 = async (endpoint?: string, params?: any) => {
//   try {
//     // const payload = {
//     //   result_year_value: "2025-01-31",
//     //   semester: 1,
//     //   batch_cycle_id: 2,
//     //   is_backlog: 1,
//     //   flag: 1,
//     // };
//     const response = await axiosInstance.post<ApiResponse<CourseListOptionInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.studentAllocation.fetch_course_option,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchcycleCourselistOptions", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: CourseListOptionInterface) => ({
//           ...item,
//           value: item.crs_id ? String(item.crs_id) : "",
//           label: item.crs_code,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching course list options:", error);
//     return []; // Handle the error as needed
//   }
// };

// export const fetchCourseLabBatchlistOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<any | LabBatchListOptionInterface>>(
//       endpoint ? endpoint : ApiEndpoint.studentAllocation.lab_batch_list_option,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchCourseLabBatchlistOptions", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: LabBatchListOptionInterface) => ({
//           value: item.lab_course_batch_id ? String(item.lab_course_batch_id) : "",
//           label: item.lab_batch_name,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching course list options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface getExamLabcourseInterface {
  crs_code: string;
  crs_title: string;
}
// export const fetchLabBatchCourseOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<getExamLabcourseInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.examnation.get_exam_lab_course,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchCourselistOptions", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: getExamLabcourseInterface) => ({
//           value: item.crs_code,
//           label: item.crs_code,
//         }))
//       : [];
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface getusn_optionsOptionsInterface {
  usno: string;
}
// export const fetchtransitional_gradeusn_listOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<getusn_optionsOptionsInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.transitional_grade.usn_options,
//       { ...params },
//     );

//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: getusn_optionsOptionsInterface) => ({
//           value: item.usno ? String(item.usno) : "",
//           label: item.usno,
//         }))
//       : [];
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface getExamLabOptionsInterface {
  crs_id: number;
  crs_code: string;
}
// export const fetchExaminerLabBatchCourseOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.get<ApiResponse<getExamLabOptionsInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.examinerLabBatch.examine_course_list,
//     );

//     // console.log("fetchCourselistOptions", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: getExamLabOptionsInterface) => ({
//           value: item.crs_id ? String(item.crs_id) : "",
//           label: item.crs_code,
//         }))
//       : [];
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface getExamLabOptionsInterface {
  lab_batch_id: number;
  lab_batch: string;
}
// export const fetchExaminerLabBatchOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<getExamLabOptionsInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.examinerLabBatch.examiner_lab_batch_allocation,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchCourselistOptions", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: getExamLabOptionsInterface) => ({
//           value: item.lab_batch_id ? String(item.lab_batch_id) : "",
//           label: item.lab_batch,
//         }))
//       : [];
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface examattendenceInterface {
  crs_id: number;
  lab_course: string;
  crs_code: string;
  crs_title: string;
  total_classes: number;
  see_max_marks: number;
  see_min_marks: number;
  credit_hours: number;
  is_finalize: number;
}

// export const fetchCourseOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<examattendenceInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.examattendence.fetch_course,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchCourselistOptions", response);
//     const res = response.data;
//     // LocalStorageHelper.setObject("courseGroupList", res?.data);
//     return res && res.data
//       ? res.data.map((item: examattendenceInterface) => ({
//           ...item,
//           value: item.crs_id ? String(item.crs_id) : "",
//           label: item.crs_code,
//         }))
//       : [];
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Handle the error as needed
//   }
// };

// get course group list
export const fetchCourseGroupOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<CourseGroupInterface | null>>(
      endpoint ? endpoint : ApiEndpoint.allMaster.course_type_list,
      { ...params, show_delete: 1 }, // Move params to the request body
    );

    // console.log("fetchBatchOptions", response);
    const res = response.data.data as CourseGroupInterface[] | null;
    LocalStorageHelper.setObject("courseGroupList", res);
    return res && Array.isArray(res)
      ? res
          .filter((item: CourseGroupInterface) => item.status === 1)
          .map((item: CourseGroupInterface) => ({
            value: item.course_type_id.toString(),
            label: item.course_type_code,
          }))
      : null;
  } catch (error) {
    console.error("Error fetching course group options:", error);
    return []; // Handle the error as needed
  }
};

// section list
// {
//   "result_year": "string",
//   "crs_code": "string",
//   "academic_batch_id": "string",
//   "flag": "string",
//   "not_na": true,
//   "crs_id": "string",
//   "faculty_id": "string",
//   "is_class_attendance": true
// }

export const fetchsectionOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<any[] | any>>(
      endpoint ? endpoint : ApiEndpoint.common_api.get_section_list,
      { ...params, not_na: true }, // Move params to the request body
    );

    // console.log("get_section_list", response);
    const res = response.data;

    return res && res.data
      ? res.data.map((item: SemesterListInterface) => ({
          value: item.semester ? item.semester.toString() : "",
          label: item.semester,
        }))
      : null;
  } catch (error) {
    console.error("Error fetching get_section_list options:", error);
    return []; // Handle the error as needed
  }
};

//  usn list option

export const fetchUSNOptionslist = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<any | getCourseRelatedUSNOInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.common_api.fetch_student_course,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchUSNOptionslist", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: getCourseRelatedUSNOInterface) => ({
          value: item.usno,
          label: item.usno,
        }))
      : null;
  } catch (error) {
    console.error("Error fetching fetchUSNOptionslist options:", error);
    return []; // Handle the error as needed
  }
};

export const fetchstudentUSNOptionslist = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<any | getCourseRelatedUSNOInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.common_api.get_student_course_usn,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchUSNOptionslist", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: getCourseRelatedUSNOInterface) => ({
          value: item.usno,
          label: item.usno,
        }))
      : null;
  } catch (error) {
    console.error("Error fetching fetchUSNOptionslist options:", error);
    return []; // Handle the error as needed
  }
};

// export const fetchstudentUSNOptionlist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<any | getCourseRelatedUSNOInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.revalApi.fetch_student_usn,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchUSNOptionslist", response);
//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: getCourseRelatedUSNOInterface) => ({
//           value: item.usno,
//           label: item.usno,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching fetchUSNOptionslist options:", error);
//     return []; // Handle the error as needed
//   }
// };

// export const fetchBacklogstudentUSNOptionlist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<any | getCourseRelatedUSNOInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.backlogApi.fetch_backlog_usns,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: getCourseRelatedUSNOInterface) => ({
//           value: item.usno,
//           label: item.usno,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching fetchBacklogstudentUSNOptionlist options:", error);
//     return []; // Handle the error as needed
//   }
// };

// export const fetchFastTrackstudentUSNOptionlist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<any | getCourseRelatedUSNOInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.fastTrackApi.fetch_fastrack_usns,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchUSNOptionslist", response);
//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: getCourseRelatedUSNOInterface) => ({
//           value: item.usno,
//           label: item.usno,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching fetchUSNOptionslist options:", error);
//     return []; // Handle the error as needed
//   }
// };

// interface fetchBacklogsstudentUSNOptionlistInterface {
//   regno: string;
//   usno: string;
// }

// export const fetchBacklogsstudentUSNOptionlist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<
//       ApiResponse<any | fetchBacklogsstudentUSNOptionlistInterface[]>
//     >(
//       endpoint ? endpoint : ApiEndpoint.backlogApi.fetch_backlog_usns,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: fetchBacklogsstudentUSNOptionlistInterface) => ({
//           value: item.regno,
//           label: item.usno,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching fetchBacklogsstudentUSNOptionlist options:", error);
//     return []; // Handle the error as needed
//   }
// };

// export const fetchUSNOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<any | any[]>>(
//       endpoint ? endpoint : ApiEndpoint.reports.get_usn_list_options,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: any) => ({
//           value: item.regno,
//           label: item.usno,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching fetchUSNOptions options:", error);
//     return []; // Handle the error as needed
//   }
// };

// Occutation list

export interface OpenElectiveCourseInterface {
  crs_id: number;
  lab_course: number;
  crs_code: string;
  crs_title: string;
  total_classes: number;
  see_max_marks: number;
  credit_hours: number;
}

// export const fetchOpenElectiveCourseOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<OpenElectiveCourseInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.openElective.fetch_open_elective_courses,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchOccutationOptions", response);
//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: OpenElectiveCourseInterface) => ({
//           value: item.crs_code,
//           label: item.crs_code,
//         }))
//       : []; // Change null to an empty array
//   } catch (error) {
//     console.error("Error fetching Occutation options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

export interface OccasionOptionInterface {
  is_marks_entered: number;
  ao_id: number;
  cia_occasion_type_id: number;
  cia_occasion_type_code: string;
  cia_occasion: string;
  cia_occasion_type_desc: string;
  crs_code: string;
  result_year: string;
  max_marks: number;
  weightage: string;
  bestof: boolean;
  status: number;
}

// export const fetchOccutationOptionListsss = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<OccasionOptionInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.course.occasionlist,
//       { ...params }, // Move params to the request body
//     );

//     const res = response.data;
//     // console.log("fetchOccutationOptions", res);
//     if (res && res.data) {
//       return res.data.map((item) => ({
//         ...item,
//         value: item.ao_id ? String(item.ao_id) : "",
//         label:
//           !item.cia_occasion && item.cia_occasion === "" ? item.cia_occasion_type_code : item.cia_occasion,
//       }));
//     } else {
//       return []; // Change null to an empty array
//     }
//   } catch (error) {
//     console.error("Error fetching Occutation options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

export const fetchOccutationOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<OccasionOptionListInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.common_api.occubationoption,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchOccutationOptions", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: OccasionOptionListInterface) => ({
          value: item.cia_occasion ? item.cia_occasion.toUpperCase().trim() : "",
          label: item.cia_occasion,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching Occutation options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

// export const fetchOccutationListOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<getOccationListOptionInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.course.occasionlist,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchOccutationOptions", response);
//     const res = response.data;
//     return res && res.data
//       ? res.data.map((item: getOccationListOptionInterface) => ({
//           ...item,
//           value: item.ao_id ? String(item.ao_id) : "",
//           label: item.cia_occasion_type_code,
//         }))
//       : []; // Change null to an empty array
//   } catch (error) {
//     // console.error("Error fetching Occutation options:", error);
//     return []; // Ensure it returns an empty array on error
//   }
// };

// Occutation Type list

export const fetchOccutationTypeOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<OccasionTypeInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.allMaster.occasion_type_list,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchOccutationTypeOptions", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: OccasionTypeInterface) => ({
          value: item.cia_occasion_type_id,
          label: item.cia_occasion_type_code,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching OccutationType options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

// calenter eventtype list

export const fetchEventCalenterEventTypeOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<eventCalenterTypeList[]>>(
      endpoint ? endpoint : ApiEndpoint.allMaster.event_type_master_list,
      { ...params, show_delete: 0 }, // Move params to the request body
    );

    // console.log("fetchEventCalenterEventTypeOptions", response);
    const res = response.data;
    const eventTypeOptions = res.data.map((item: eventCalenterTypeList) => ({
      value: item.event_master_id ? item.event_master_id.toString() : "",
      label: item.event_master_type,
    }));
    sessionStorage.setItem("EventCalenterEventType", JSON.stringify(res.data));
    return eventTypeOptions;
  } catch (error) {
    console.error("Error fetching EventCalenter options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

// get batch term list

export const fetchBatchTermOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.get<ApiResponse<GetBatchTermListInterface[] | any>>(
      endpoint
        ? endpoint
        : ApiEndpoint.common_api.get_batch_terms + `?academic_batch_id=${params.academic_batch_id}`,
    );

    const res = response.data;
    return res && res.data.options ? res.data.options : null;
  } catch (error) {
    console.error("Error fetching batch options:", error);
    return []; // Handle the error as needed
  }
};

// get timetable section list

export const fetchTimetableSessionOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ section: string }[] | any>>(
      endpoint ? endpoint : ApiEndpoint.common_api.gettimetablesession,
      { ...params, not_na: 1 }, // Move params to the request body
    );

    const res = response.data;
    return res && res.data
      ? res.data.map((item: { section: string }) => ({
          value: item.section,
          label: item.section,
        }))
      : null;
  } catch (error) {
    console.error("Error fetching batch options:", error);
    return []; // Handle the error as needed
  }
};

//  occupation list
export const fetchOccupationOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<GetOccupationList[]>>(
      endpoint ? endpoint : ApiEndpoint.allMaster.parents_occupation_master_list,
      { show_delete: 1 }, // Move params to the request body
    );

    // console.log("GetOccupationList", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: GetOccupationList) => ({
          value: item.occupation_id ? item.occupation_id.toString() : "",
          label: item.occupation_description,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching GetOccupationList options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

// country, city, state

export const fetchCountryListOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.get<ApiResponse<countryListInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.allMaster.country_list,
    );

    // console.log("country_list", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: countryListInterface) => ({
          value: item.country_id ? item.country_id.toString() : "",
          label: item.country_name,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching country_list options:", error);
    return []; // Ensure it returns an empty array on error
  }
};
export const fetchStateListOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<StateListInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.allMaster.state_list,
      { ...params }, // Move params to the request body
    );

    // console.log("fetchStateListOptions", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: StateListInterface) => ({
          value: item.state_id ? item.state_id.toString() : "",
          label: item.name,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching fetchStateListOptions options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

export const fetchCityListOptions = async (endpoint?: string, params?: any) => {
  try {
    const response = await axiosInstance.post<ApiResponse<CityListInterface[]>>(
      endpoint ? endpoint : ApiEndpoint.allMaster.common_city_list,
      { ...params, name: params?.name ?? "", status: 1 }, // Move params to the request body
    );

    // console.log("fetchCityListOptions", response);
    const res = response.data;
    return res && res.data
      ? res.data.map((item: CityListInterface) => ({
          value: item.city_id ? item.city_id.toString() : "",
          label: item.city_name,
        }))
      : []; // Change null to an empty array
  } catch (error) {
    console.error("Error fetching fetchCityListOptions options:", error);
    return []; // Ensure it returns an empty array on error
  }
};

export interface ExaminerdetailsInterface {
  id: number;
  name: string;
  user_role_id: number;
}

// export const fetchExaminerOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<ExaminerdetailsInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.examiner_batch_allocation.get_examiner_details_list,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchExaminerOptionslist", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: ExaminerdetailsInterface) => ({
//           value: item.id,
//           label: item.name,
//         }))
//       : [];
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface ExaminercourselistInterface {
  crs_id: number;
  crs_title: string;
  crs_code: string;
}

// export const fetchExaminerCourseOptionslist = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<ExaminercourselistInterface[]>>(
//       endpoint ? endpoint : ApiEndpoint.examiner_batch_allocation.get_examiner_course_list,
//       { ...params }, // Move params to the request body
//     );

//     // console.log("fetchExaminerCourseOptionslist", response);
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: ExaminercourselistInterface) => ({
//           value: item.crs_id,
//           label: item.crs_code,
//         }))
//       : [];
//   } catch (error) {
//     console.error("Error fetching options:", error);
//     return []; // Handle the error as needed
//   }
// };

// vertical Progression

export interface fetchverticalProgramOptionsInterface {
  program_id: number;
  pgm_acronym: string;
}

// export const fetchverticalProgramOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<fetchverticalProgramOptionsInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.verticalarProgression.fetchverticalProgramOptions,
//       { ...params }, // Move params to the request body
//     );
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: fetchverticalProgramOptionsInterface) => ({
//           value: item.program_id ? item.program_id.toString() : "",
//           label: item.pgm_acronym,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching program options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface fetchverticalBatchOptionsInterface {
  academic_batch_id: number;
  academic_batch_code: string;
  status: string;
}

// export const fetchverticalBatchOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<fetchverticalBatchOptionsInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.verticalarProgression.fetchverticalBatchOptions,
//       { ...params }, // Move params to the request body
//     );
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: fetchverticalBatchOptionsInterface) => ({
//           value: item.academic_batch_id ? item.academic_batch_id.toString() : "",
//           label: item.academic_batch_code,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching Batch options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface fetchverticalsemesterOptionsInterface {
  semester: number;
  status: string;
}

// export const fetchverticalsemesterOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<fetchverticalsemesterOptionsInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.verticalarProgression.fetchverticalsemesterOptions,
//       { ...params }, // Move params to the request body
//     );
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: fetchverticalsemesterOptionsInterface) => ({
//           value: item.semester ? item.semester.toString() : "",
//           label: item.semester,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching semester options:", error);
//     return []; // Handle the error as needed
//   }
// };

// export const fetchverticalRollbacksemesterOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<fetchverticalsemesterOptionsInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.verticalarProgression.fetchverticalRollbacksemesterOptions,
//       { ...params }, // Move params to the request body
//     );
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: fetchverticalsemesterOptionsInterface) => ({
//           value: item.semester ? item.semester.toString() : "",
//           label: item.semester,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching semester options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface fetchverticalFromYearOptionsInterface {
  result_year: string;
  result_year_display: string;
}

// export const fetchverticalFromYearOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<fetchverticalFromYearOptionsInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.verticalarProgression.fetch_result_year,
//       { ...params }, // Move params to the request body
//     );
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: fetchverticalFromYearOptionsInterface) => ({
//           value: item.result_year_display ? item.result_year_display : "",
//           label: item.result_year_display,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching  options:", error);
//     return []; // Handle the error as needed
//   }
// };
export interface fetchverticalToYearOptionsInterface {
  result_year: string;
  result_year_dd: string;
  event_type: string;
}

// export const fetchverticalToYearOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<fetchverticalToYearOptionsInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.verticalarProgression.fetch_to_result_year,
//       { ...params }, // Move params to the request body
//     );
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: fetchverticalToYearOptionsInterface) => ({
//           value: item.result_year_dd ? item.result_year_dd : "",
//           label: item.result_year_dd,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching  options:", error);
//     return []; // Handle the error as needed
//   }
// };

export interface fetchverticalRulesOptionsInterface {
  progression_rule_id: number;
  progression_rule: string;
}

// export const fetchverticalRulesOptions = async (endpoint?: string, params?: any) => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<fetchverticalRulesOptionsInterface[] | any>>(
//       endpoint ? endpoint : ApiEndpoint.verticalarProgression.fetch_progression_rules,
//       { ...params }, // Move params to the request body
//     );
//     const res = response.data;

//     return res && res.data
//       ? res.data.map((item: fetchverticalRulesOptionsInterface) => ({
//           value: item.progression_rule_id ? item.progression_rule_id.toString() : "",
//           label: item.progression_rule,
//         }))
//       : null;
//   } catch (error) {
//     console.error("Error fetching fetchverticalRulesOptions options:", error);
//     return []; // Handle the error as needed
//   }
// };

export const formatTime = (date: Date) => {
  let hours = date.getHours(); // Use getHours() for local time
  const minutes = date.getMinutes(); // Use getMinutes() for local time
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert 24-hour format to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Add leading zero to minutes if needed
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  // Combine hours and minutes into a time string
  const time = `${hours}:${formattedMinutes}`;

  // Return the time and AM/PM separately
  return {
    time, // e.g. "1:15"
    ampm, // e.g. "PM"
  };
};

export const convertToTime = (timeString: string) => {
  // Create a new Date object for the current date
  const date = new Date();

  // Extract hours, minutes, and AM/PM from the time string
  const [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  // Convert to 24-hour format based on AM/PM
  if (modifier === "PM" && hours < 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  // Set the hours and minutes on the current date
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

// report response conversion

export const parseCSV = (csvString: string) => {
  const rows = csvString.split("\n");
  const headers = rows[0].split(","); // Extract headers (first row)
  return rows.slice(1).map((row) => {
    const values = row.split(",");
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index]; // Map each value to its header
      return acc;
    }, {} as Record<string, string>);
  });
};

// downloadHelper.ts

export const downloadFile = (fileUrl: string, fileName: string) => {
  // Trigger file download by creating a temporary link element
  const baseUrl = window.location.origin;
  const link = document.createElement("a");
  link.href = baseUrl + fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = <T>(data: T[], fileName: string, sheetName: string = "Sheet1"): void => {
  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download the Excel file
  XLSX.writeFile(workbook, `${fileName}_${moment().format("llll")}.xlsx`);
};
