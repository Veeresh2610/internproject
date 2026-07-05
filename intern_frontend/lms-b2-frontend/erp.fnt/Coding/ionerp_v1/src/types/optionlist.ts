export interface CourseGroupInterface {
  filter(arg0: (item: CourseGroupInterface) => boolean): unknown;
  org_id: number;
  see_weightage: number;
  cia_max_marks: number;
  status: number;
  viva_min_marks: number;
  cia_min_marks: number;
  created_by: number;
  viva_max_marks: number;
  see_max_marks: number;
  modified_by: number;
  viva_weightage: number;
  see_min_marks: number;
  create_date: number;
  total_classes: number;
  modify_date: number;
  course_type_id: number;
  course_type_code: string;
  total_classes_fastrack: number;
  cia_weightage: number;
  course_type_desc: string;
  min_passing_marks: number;
}

export interface ExamEventInterface {
  result_year: string;
  event_type: string;
  event_status: number;
  result_year_dd: string;
  see_start_date: string;
  see_end_date: string;
  semester_start_date: string;
  semester_end_date: string;
}

export interface BatchCycleInterface {
  batch_cycle_id: number;
  batch_cycle_code: string;
  batch_cycle_desc: string;
}

export interface SemesterListInterface {
  semester: number;
  semester_id: number;
  semester_desc: string;
  branch_cycle: string;
  academic_year_planned: number;
  batch_cycle_id: any;
}

export interface OccasionTypeInterface {
  status: number
  cia_occasion_type_code: string
  modified_by: any
  modify_date: any
  cia_occasion_type_desc: string
  cia_occasion_type_id: number
  org_id: number
  created_by: number
  create_date: string
}

export interface eventCalenterTypeList {
  event_master_id: number
  event_master_type: string
  event_master_description: string
  status: number
  date_only: boolean
  date_time: boolean
}

export interface OccasionOptionListInterface {
  im_id: number
  occasion_name: string
  occasions: string
  ise_mse_type_id: number
  cia_occasion: string
  weightage: string
}

export interface GetBatchTermListInterface {
  value: string
  label: string
}

export interface GetOccupationList {
  status: number
  occupation_id: number
  created_by: number
  updated_by: number
  occupation_description: string
  created_at: string
  updated_at: string
}


export interface sectionOptionlistInterface {
  id: number
  section: string
}


export interface countryListInterface {
  country_id: number
  country_name: string
  country_sortname: string
}

export interface StateListInterface {
  state_id: number
  name: string
  country_id: number
}


export interface CityListInterface {
  city_id: number
  city_name: string
  state_id: number
  country_id: number
  status: boolean
}


export interface CourseListOptionInterface {
  crs_id: number
  lab_course: string
  crs_code: string
  crs_title: string
  total_classes: number
  see_max_marks: number
  see_min_marks: number
  credit_hours: number
  is_finalize: number
}


export interface LabBatchListOptionInterface {
  lab_course_batch_id: number
  lab_batch_name: string
  crs_id: number
  lab_batch_strength: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  status: number
  is_all: number
}

export interface getCourseRelatedUSNOInterface {
    usno: string
  }


export interface getOccationListOptionInterface {
  is_marks_entered: number
  ao_id: number
  cia_occasion_type_id: number
  cia_occasion_type_code: string
  cia_occasion: string
  cia_occasion_type_desc: string
  crs_code: string
  result_year: string
  max_marks: number
  weightage: string
  bestof: boolean
  status: number
}






