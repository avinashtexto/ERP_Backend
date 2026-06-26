/**
 * master-employee.types.ts
 * Type definitions for the master-employee domain module.
 * Properties match the database schema column names exactly.
 */

export type DbId = number;

export interface EmployeeCore {
  pk_emp_id: DbId;
  emp_code: string;
  fk_tit_id: number | null;
  employee: string;
  doj: Date;
  dob: Date | null;
  photo: string | null;
  fk_qual_id: number | null;
  gender: string; // Male, Female, LGBT, Others (dropdown in frontend)
  martial_status: string; // Single, Married, Divorced, Widowed, Separated, Engaged, Livein, Others (dropdown in frontend)
  anni: Date | null;
  p_address: string;
  n_address: string;
  fk_dep_id: number | null;
  fk_deg_id: number | null;
  fk_bnk_id: number | null;
  account_no: string;
  pf_no: string;
  esic_no: string;
  pan_no: string;
  dol: Date | null;
  blood_grp: string;
  wp: string;
  aadhar: string;
  cv_copy: string;
  le_copy: string;
  fk_m_doc_id: string | null; // numeric stored as string
  username: string;
  password?: string;
  question: string;
  answer: string;
  ext: string;
  date_time_stamp: Date;
  fk_user_id: number;
  last_status: string;
  rtgs: string;
  s_address: string;
  sb: boolean;
  fk_set_id: number | null;
  type: string;
  att_type: boolean;
  height: string | null;
  weight: string | null;
  fk_rg_id: string | null;
  fk_cs_id: string | null;
  fk_st_id: string | null;
  mark: string;
  experience: string | null;
  fk_r_emp_id: string | null;
  police: string;
  add_police: string;
  cont_police: string;
  fk_w1_emp_id: string | null;
  fk_w2_emp_id: string | null;
  personality1: string;
  fk_p1_des_id: number | null;
  p1_address: string;
  p1_contact: string;
  personality2: string;
  fk_p2_des_id: number | null;
  p2_address: string;
  p2_contact: string;
  messaging: boolean;
  fk_acct_id: number | null;
  geolocation: boolean;
  employment: string;
  inform_pf?: boolean | null;
  inform_esic?: boolean | null;
}

export interface EmpContact {
  pk_cont_id: DbId;
  fk_emp_id: DbId;
  fk_moc_id: string;
  contact: string;
  ext: string;
  sr_no: number;
}

export interface EmpDocument {
  pk_d_emp_id: DbId;
  fk_emp_id: DbId;
  fk_dt_id: number;
  doc_file: string;
  valid_until: Date | null;
}

export interface EmployeeFull extends EmployeeCore {
  contacts: Omit<EmpContact, 'pk_cont_id' | 'fk_emp_id'>[];
  documents: Omit<EmpDocument, 'pk_d_emp_id' | 'fk_emp_id'>[];
}
