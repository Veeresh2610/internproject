export type Role = 'admin' | 'user' | 'manager';
export type menuType = 'EMS' | 'admin' | 'manager';

export interface User {
  id: string;
  username: string;
  email: string;
  menuType: menuType;
  roles: Role;
}

export interface commonAPiResponse {
  status: boolean
  message: string
  data: commonAPi
}

export interface commonAPi {
  departments: Department[]
  program_types: ProgramType[]
}

export interface Department {
  department_id: number
  dept_name: string
  status: number
}

export interface ProgramType {
  pgmtype_id: number
  pgmtype_name: string
  program_type_code: string
}
