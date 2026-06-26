import { pgTable, numeric, varchar, char, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';
import { contDepartment } from './cont-department.schema.js';
import { contDesignation } from './cont-designation.schema.js';
import { contQualification } from './cont-qualification.schema.js';
import { contTitle } from './cont-title.schema.js';

export const salEmployee = pgTable('sal_employee', {
  pk_emp_id: integer('pk_emp_id').primaryKey().notNull().generatedByDefaultAsIdentity(),

  emp_code: varchar('emp_code', {
    length: 30,
  }).notNull(),

  fk_tit_id: integer('fk_tit_id').references(() => contTitle.pk_tit_id),

  employee: varchar('employee', {
    length: 50,
  }).notNull(),

  doj: timestamp('doj').notNull(),

  dob: timestamp('dob'),

  photo: varchar('photo', {
    length: 255,
  }),

  fk_qual_id: integer('fk_qual_id').references(() => contQualification.pk_qua_id),

  gender: varchar('gender', {
    length: 10,
  }).notNull(),

  martial_status: varchar('martial_status', {
    length: 15,
  }).notNull(),

  anni: timestamp('anni'),

  p_address: varchar('p_address', {
    length: 255,
  }).notNull(),

  n_address: varchar('n_address', {
    length: 255,
  }).notNull(),

  fk_dep_id: integer('fk_dep_id').references(() => contDepartment.pk_dep_id),

  fk_deg_id: integer('fk_deg_id').references(() => contDesignation.pk_des_id),

  fk_bnk_id: integer('fk_bnk_id'),

  account_no: varchar('account_no', {
    length: 20,
  }).notNull(),

  pf_no: varchar('pf_no', {
    length: 25,
  }).notNull(),

  esic_no: varchar('esic_no', {
    length: 25,
  }).notNull(),

  pan_no: varchar('pan_no', {
    length: 25,
  }).notNull(),

  dol: timestamp('dol'),

  blood_grp: varchar('blood_grp', {
    length: 6,
  }).notNull(),

  wp: varchar('wp', {
    length: 50,
  }).notNull(),

  aadhar: varchar('aadhar', {
    length: 50,
  }).notNull(),

  cv_copy: varchar('cv_copy', {
    length: 50,
  }).notNull(),

  le_copy: varchar('le_copy', {
    length: 50,
  }).notNull(),

  fk_m_doc_id: numeric('fk_m_doc_id', {
    precision: 18,
    scale: 0,
  }),

  username: varchar('username', {
    length: 15,
  }).notNull(),

  password: varchar('password', {
    length: 255,
  }).notNull(),

  question: varchar('question', {
    length: 50,
  }).notNull(),

  answer: varchar('answer', {
    length: 50,
  }).notNull(),

  ext: varchar('ext', {
    length: 10,
  }).notNull(),

  date_time_stamp: timestamp('date_time_stamp').notNull(),

  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),

  last_status: varchar('last_status', {
    length: 10,
  }).notNull(),

  rtgs: varchar('rtgs', {
    length: 20,
  }).notNull(),

  s_address: varchar('s_address', {
    length: 30,
  }).notNull(),

  sb: boolean('sb').notNull(),

  fk_set_id: integer('fk_set_id'),

  type: varchar('type', {
    length: 20,
  }).notNull(),

  att_type: boolean('att_type').notNull(),

  height: numeric('height', {
    precision: 18,
    scale: 0,
  }),

  weight: numeric('weight', {
    precision: 18,
    scale: 2,
  }),

  fk_rg_id: numeric('fk_rg_id', {
    precision: 18,
    scale: 0,
  }),

  fk_cs_id: numeric('fk_cs_id', {
    precision: 18,
    scale: 0,
  }),

  fk_st_id: numeric('fk_st_id', {
    precision: 18,
    scale: 0,
  }),

  mark: varchar('mark', {
    length: 50,
  }).notNull(),

  experience: varchar('experience', {
    length: 5,
  }),

  fk_r_emp_id: numeric('fk_r_emp_id', {
    precision: 18,
    scale: 0,
  }),

  police: varchar('police', {
    length: 50,
  }).notNull(),

  add_police: varchar('add_police', {
    length: 255,
  }).notNull(),

  cont_police: varchar('cont_police', {
    length: 25,
  }).notNull(),

  fk_w1_emp_id: numeric('fk_w1_emp_id', {
    precision: 18,
    scale: 0,
  }),

  fk_w2_emp_id: numeric('fk_w2_emp_id', {
    precision: 18,
    scale: 0,
  }),

  personality1: varchar('personality1', {
    length: 50,
  }).notNull(),

  fk_p1_des_id: integer('fk_p1_des_id').references(() => contDesignation.pk_des_id),

  p1_address: varchar('p1_address', {
    length: 255,
  }).notNull(),

  p1_contact: varchar('p1_contact', {
    length: 25,
  }).notNull(),

  personality2: varchar('personality2', {
    length: 50,
  }).notNull(),

  fk_p2_des_id: integer('fk_p2_des_id').references(() => contDesignation.pk_des_id),

  p2_address: varchar('p2_address', {
    length: 255,
  }).notNull(),

  p2_contact: varchar('p2_contact', {
    length: 25,
  }).notNull(),

  messaging: boolean('messaging').notNull(),

  fk_acct_id: integer('fk_acct_id'),

  geolocation: boolean('geolocation').notNull(),

  employment: varchar('employment', {
    length: 3,
  }).notNull(),

  sync: char('sync', {
    length: 1,
  }).notNull(),

  sys_defined: boolean('sys_defined').notNull(),

  inform_pf: boolean('inform_pf'),

  inform_esic: boolean('inform_esic'),
});
