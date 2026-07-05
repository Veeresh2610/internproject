
export interface loginResponse {
  status: boolean;
  message: string;
  data: loginData;
}

export interface loginPayload {
  role: string;
  username: string;
  password: string;
}

export interface loginData {
  access_token: string;
  profile?: string;
  token_type: string;
  org_data: orgDataResponse[];
  menuType?: string;
  first_name: string;
  last_name: string;
  options: OptionsResponse;
  username: string;
  // Additional metadata
  user_id?: number;
  user_dept_id?: number;
  email?: string;
  last_login?: string;
}

export interface orgDataResponse {
  label: string;
  value: number;
}

export interface OptionsResponse {
  user_type: UserType[];
  role_list: RoleList[];
  get_hall_type_list: hallType[];
  priority_list: priorityOption[];
  designations: Designation[];
  organisations: Organisation[];
  all_masters_list: AllMastersList[];
  get_academics_event: {id: number; event: string;}[];
  get_academics_event_status: {id: number; event_status: string;}[];
  get_grade_type_list: garde_type_list[]
  get_coursetype_list: GetCoursetypeList[]
  get_coursetype_cia_marks: CourseAssessment[]
  get_coursetype_options: string[]
  get_event_status_options: GetEventStatusOption[]
  get_section_list_options: GetSectionListOption[]
  get_admission_type_list: admission_typeList[]
  get_quota_list: quota_type[]
  get_category_options: category_options[]
  get_blood_group_list_options: blood_group_list_options[]
  get_caste_list:caste_list[]
  get_religion_list:religion_list[]
  get_physically_cha_desc_list: physically_cha_desc[]
  get_education_details_list: education_details[]
  get_occupation_list: get_occupation_list[]
  get_certificate_list: certificate_list[]
}

export interface CourseAssessment {
  cia_max_marks: number;
  cia_weightage: number;
  course_type_code: string;
  min_passing_marks: number;
  see_max_marks: number;
  see_min_marks: number;
  see_weightage: number;
  total_classes: number;
}

export interface certificate_list {
  certificate_description: string;
}

export interface get_occupation_list {
  occupation_description: string;
  occupation_id: number;
}
export interface education_details {
  education_qualification_code: string;
}
export interface physically_cha_desc {
  description: string;
  pc_description_id: number;
}
export interface religion_list {
  name: string;
  religion_id: number;
}
export interface caste_list {
  name: string;
  caste_id: number;
}
export interface blood_group_list_options {
  value: string;
  id: number;
}

export interface category_options {
  category_code: string;
}
export interface quota_type {
  quota_type: string;
  id: number;
}

export interface admission_typeList{
  admission_type: string;
admission_type_id : number;
}

export interface GetSectionListOption {
  section_list: string
}


export interface garde_type_list {
  grade_id: string
  grade: string
  grade_level: string
  min_range: string
  max_range: string
  grade_point: string
  grade_type: string
}

export interface GetCoursetypeList {
  id: number
  value: string
}

export interface priorityOption {
  priority_id: number;
  priority_name: string;
  status: number;
}

export interface hallType {
  hall_type_id: number;
  hall_type_name: string;
  status: number;
}

export interface UserType {
  user_type: string;
  user_type_description: string;
}

export interface RoleList {
  user_role_id: number;
  user_role: string;
}

export interface Designation {
  designation_id: number;
  designation_name: string;
}

export interface Organisation {
  org_id: number;
  org_name: string;
  org_desc: string;
  org_society: string;
  unv_id: number;
  unv_name: string;
  status: number;
  profile_image: string;
}

export interface AllMastersList {
  master_id: number;
  master_name: string;
  master_description: string;
  status: number;
  org_id: number;
  created_by: number;
  modified_by: number;
  create_date: any;
  modify_date: any;
}

export interface GetEventStatusOption {
  label: string
  value: string
}
