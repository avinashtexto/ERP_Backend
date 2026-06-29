import { relations } from 'drizzle-orm';
import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { cont_common } from '@/shared/database/schemas/cont-common.schema.js';
import {
  contTitle,
  contQualification,
  contDepartment,
  contDesignation,
} from '@/shared/database/schemas/index.js';

export const cont_individual = pgTable('cont_individual', {
  pk_ind_id: integer('pk_ind_id').primaryKey().generatedByDefaultAsIdentity(),

  fk_com_id: integer('fk_com_id')
    .notNull()
    .references(() => cont_common.pk_cont_id, { onUpdate: 'cascade' }),

  fk_tit_id: integer('fk_tit_id').references(() => contTitle.pk_tit_id, { onUpdate: 'cascade' }),

  first_name: varchar('first_name', { length: 50 }).notNull(),

  middle_name: varchar('middle_name', { length: 40 }).notNull().default(''),

  surname: varchar('surname', { length: 25 }).notNull(),

  dob: timestamp('dob'),

  photo_url: varchar('photo_url', { length: 500 }),

  fk_qual_id: integer('fk_qual_id').references(() => contQualification.pk_qua_id, {
    onUpdate: 'cascade',
  }),

  gender: varchar('gender', { length: 25 }).default(''),

  marital_status: varchar('marital_status', { length: 25 }).notNull().default('single'),
  fk_org_id: integer('fk_org_id').references(() => cont_common.pk_cont_id, {
    onUpdate: 'cascade',
  }),

  fk_dep_id: integer('fk_dep_id').references(() => contDepartment.pk_dep_id, {
    onUpdate: 'cascade',
  }),

  fk_deg_id: integer('fk_deg_id').references(() => contDesignation.pk_des_id, {
    onUpdate: 'cascade',
  }),

  fk_spo_id: integer('fk_spo_id').references(() => cont_common.pk_cont_id, {
    onUpdate: 'cascade',
  }),

  anniversary: timestamp('anniversary'),

  ext: varchar('ext', { length: 10 }),
});

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────
export const cont_individual_relations = relations(cont_individual, ({ one }) => ({
  /** Parent contact record */
  contact: one(cont_common, {
    fields: [cont_individual.fk_com_id],
    references: [cont_common.pk_cont_id],
    relationName: 'individual_contact',
  }),

  title: one(contTitle, {
    fields: [cont_individual.fk_tit_id],
    references: [contTitle.pk_tit_id],
  }),

  qualification: one(contQualification, {
    fields: [cont_individual.fk_qual_id],
    references: [contQualification.pk_qua_id],
  }),

  department: one(contDepartment, {
    fields: [cont_individual.fk_dep_id],
    references: [contDepartment.pk_dep_id],
  }),

  designation: one(contDesignation, {
    fields: [cont_individual.fk_deg_id],
    references: [contDesignation.pk_des_id],
  }),

  organisation: one(cont_common, {
    fields: [cont_individual.fk_org_id],
    references: [cont_common.pk_cont_id],
    relationName: 'individual_organisation',
  }),

  spouse: one(cont_common, {
    fields: [cont_individual.fk_spo_id],
    references: [cont_common.pk_cont_id],
    relationName: 'individual_spouse',
  }),
}));

export type ContIndividual = typeof cont_individual.$inferSelect;
export type NewContIndividual = typeof cont_individual.$inferInsert;
