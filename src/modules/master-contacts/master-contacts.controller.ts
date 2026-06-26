import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
  createDesignationSchema,
  updateDesignationSchema,
  designationQuerySchema,
  createQualificationSchema,
  updateQualificationSchema,
  qualificationQuerySchema,
  createRelationshipSchema,
  updateRelationshipSchema,
  relationshipQuerySchema,
  createTitleSchema,
  updateTitleSchema,
  titleQuerySchema,
} from './master-contacts.dto.js';
import * as service from './master-contacts.service.js';

const MODULE = 'master-contacts';

// ---------------------------------------------------------------------------
// Helper to build a consistent 404 response
// ---------------------------------------------------------------------------
function notFound(res: Response, label: string): void {
  res.build.withStatus(404).withError('NOT_FOUND', `${label} record not found`).fail().send();
}

// ── CATEGORY ─────────────────────────────────────────────────────────────

export const getCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = categoryQuerySchema.parse(req.query);
  const data = await service.findAllCategories(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Categories retrieved successfully')
    .withData(data)
    .success()
    .send();
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await service.findCategoryById(parseInt(req.params.id as string, 10));
  if (!data) {
    notFound(res, 'Category');
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Category retrieved successfully')
    .withData(data)
    .success()
    .send();
});

export const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createCategorySchema.parse(req.body);
  const data = await service.createCategory(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Category created successfully')
    .withData(data)
    .success()
    .send();
});

export const updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = updateCategorySchema.parse(req.body);
  const data = await service.updateCategory(parseInt(req.params.id as string, 10), dto);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Category updated successfully')
    .withData(data)
    .success()
    .send();
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await service.deleteCategory(parseInt(req.params.id as string, 10));
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Category deleted successfully')
    .success()
    .send();
});

// ── DEPARTMENT ───────────────────────────────────────────────────────────

export const getDepartments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = departmentQuerySchema.parse(req.query);
  const data = await service.findAllDepartments(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Departments retrieved successfully')
    .withData(data)
    .success()
    .send();
});

export const getDepartmentById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await service.findDepartmentById(parseInt(req.params.id as string, 10));
    if (!data) {
      notFound(res, 'Department');
      return;
    }
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Department retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const createDepartment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createDepartmentSchema.parse(req.body);
  const data = await service.createDepartment(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Department created successfully')
    .withData(data)
    .success()
    .send();
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = updateDepartmentSchema.parse(req.body);
  const data = await service.updateDepartment(parseInt(req.params.id as string, 10), dto);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Department updated successfully')
    .withData(data)
    .success()
    .send();
});

export const deleteDepartment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await service.deleteDepartment(parseInt(req.params.id as string, 10));
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Department deleted successfully')
    .success()
    .send();
});

// ── DESIGNATION ──────────────────────────────────────────────────────────

export const getDesignations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = designationQuerySchema.parse(req.query);
  const data = await service.findAllDesignations(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Designations retrieved successfully')
    .withData(data)
    .success()
    .send();
});

export const getDesignationById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await service.findDesignationById(parseInt(req.params.id as string, 10));
    if (!data) {
      notFound(res, 'Designation');
      return;
    }
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Designation retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const createDesignation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const dto = createDesignationSchema.parse(req.body);
    const data = await service.createDesignation(dto);
    res.build
      .withStatus(201)
      .withModule(MODULE)
      .withMessage('Designation created successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const updateDesignation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const dto = updateDesignationSchema.parse(req.body);
    const data = await service.updateDesignation(parseInt(req.params.id as string, 10), dto);
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Designation updated successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const deleteDesignation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await service.deleteDesignation(parseInt(req.params.id as string, 10));
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Designation deleted successfully')
      .success()
      .send();
  },
);

// ── QUALIFICATION ────────────────────────────────────────────────────────

export const getQualifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const filters = qualificationQuerySchema.parse(req.query);
    const data = await service.findAllQualifications(filters);
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Qualifications retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const getQualificationById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await service.findQualificationById(parseInt(req.params.id as string, 10));
    if (!data) {
      notFound(res, 'Qualification');
      return;
    }
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Qualification retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const createQualification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const dto = createQualificationSchema.parse(req.body);
    const data = await service.createQualification(dto);
    res.build
      .withStatus(201)
      .withModule(MODULE)
      .withMessage('Qualification created successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const updateQualification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const dto = updateQualificationSchema.parse(req.body);
    const data = await service.updateQualification(parseInt(req.params.id as string, 10), dto);
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Qualification updated successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const deleteQualification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await service.deleteQualification(parseInt(req.params.id as string, 10));
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Qualification deleted successfully')
      .success()
      .send();
  },
);

// ── RELATIONSHIP ─────────────────────────────────────────────────────────

export const getRelationships = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = relationshipQuerySchema.parse(req.query);
  const data = await service.findAllRelationships(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Relationships retrieved successfully')
    .withData(data)
    .success()
    .send();
});

export const getRelationshipById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await service.findRelationshipById(parseInt(req.params.id as string, 10));
    if (!data) {
      notFound(res, 'Relationship');
      return;
    }
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Relationship retrieved successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const createRelationship = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const dto = createRelationshipSchema.parse(req.body);
    const data = await service.createRelationship(dto);
    res.build
      .withStatus(201)
      .withModule(MODULE)
      .withMessage('Relationship created successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const updateRelationship = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const dto = updateRelationshipSchema.parse(req.body);
    const data = await service.updateRelationship(parseInt(req.params.id as string, 10), dto);
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Relationship updated successfully')
      .withData(data)
      .success()
      .send();
  },
);

export const deleteRelationship = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await service.deleteRelationship(parseInt(req.params.id as string, 10));
    res.build
      .withStatus(200)
      .withModule(MODULE)
      .withMessage('Relationship deleted successfully')
      .success()
      .send();
  },
);

// ── TITLE ────────────────────────────────────────────────────────────────

export const getTitles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = titleQuerySchema.parse(req.query);
  const data = await service.findAllTitles(filters);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Titles retrieved successfully')
    .withData(data)
    .success()
    .send();
});

export const getTitleById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await service.findTitleById(parseInt(req.params.id as string, 10));
  if (!data) {
    notFound(res, 'Title');
    return;
  }
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Title retrieved successfully')
    .withData(data)
    .success()
    .send();
});

export const createTitle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = createTitleSchema.parse(req.body);
  const data = await service.createTitle(dto);
  res.build
    .withStatus(201)
    .withModule(MODULE)
    .withMessage('Title created successfully')
    .withData(data)
    .success()
    .send();
});

export const updateTitle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = updateTitleSchema.parse(req.body);
  const data = await service.updateTitle(parseInt(req.params.id as string, 10), dto);
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Title updated successfully')
    .withData(data)
    .success()
    .send();
});

export const deleteTitle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await service.deleteTitle(parseInt(req.params.id as string, 10));
  res.build
    .withStatus(200)
    .withModule(MODULE)
    .withMessage('Title deleted successfully')
    .success()
    .send();
});
