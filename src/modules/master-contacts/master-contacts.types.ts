import { contCategory } from '@/shared/database/schemas/cont-category.schema.js';
import { contDepartment } from '@/shared/database/schemas/cont-department.schema.js';
import { contDesignation } from '@/shared/database/schemas/cont-designation.schema.js';
import { contQualification } from '@/shared/database/schemas/cont-qualification.schema.js';
import { contRelationship } from '@/shared/database/schemas/cont-relationship.schema.js';
import { contTitle } from '@/shared/database/schemas/cont-title.schema.js';

// ---------------------------------------------------------------------------
// Inferred DB Types
// ---------------------------------------------------------------------------

export type ContCategory = typeof contCategory.$inferSelect;
export type NewContCategory = typeof contCategory.$inferInsert;

export type ContDepartment = typeof contDepartment.$inferSelect;
export type NewContDepartment = typeof contDepartment.$inferInsert;

export type ContDesignation = typeof contDesignation.$inferSelect;
export type NewContDesignation = typeof contDesignation.$inferInsert;

export type ContQualification = typeof contQualification.$inferSelect;
export type NewContQualification = typeof contQualification.$inferInsert;

export type ContRelationship = typeof contRelationship.$inferSelect;
export type NewContRelationship = typeof contRelationship.$inferInsert;

export type ContTitle = typeof contTitle.$inferSelect;
export type NewContTitle = typeof contTitle.$inferInsert;

// ---------------------------------------------------------------------------
// Shared query filter shape (reused by all sub-resources)
// ---------------------------------------------------------------------------

export interface MasterContactQuery {
  search?: string | undefined;
  last_status?: string | undefined;
}
