import { Router } from 'express';

import { addressRouter } from './address/address.routes.js';
import { cityRouter } from './city/city.routes.js';
import { countryRouter } from './country/country.routes.js';
import individualRouter from './individual/individual.routes.js';
import * as controller from './master-contacts.controller.js';
import { modeOfContactRouter } from './mode-of-contact/mode-of-contact.routes.js';
import { regionRouter } from './region/region.routes.js';
import { stateRouter } from './state/state.routes.js';
import { titleRouter } from './title/title.routes.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ContCategory:
 *       type: object
 *       properties:
 *         pk_cat_id:
 *           type: integer
 *           description: Unique category identifier (auto-incremented)
 *           example: 1
 *         category:
 *           type: string
 *           description: Name of the contact category
 *           maxLength: 30
 *           example: "Client"
 *         fk_user_id:
 *           type: integer
 *           description: ID of the user who owns or created the category
 *           example: 4
 *         last_status:
 *           type: string
 *           description: Audit status of the last operation
 *           example: "Added"
 *         last_update:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the last database modification
 *           example: "2026-06-09T12:00:00.000Z"
 *
 *     ContDepartment:
 *       type: object
 *       properties:
 *         pk_dep_id:
 *           type: integer
 *           description: Unique department identifier
 *           example: 2
 *         department:
 *           type: string
 *           description: Name of the department
 *           maxLength: 30
 *           example: "Sales & Marketing"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *         last_status:
 *           type: string
 *           example: "Added"
 *         last_update:
 *           type: string
 *           format: date-time
 *           example: "2026-06-09T12:00:00.000Z"
 *
 *     ContDesignation:
 *       type: object
 *       properties:
 *         pk_des_id:
 *           type: integer
 *           description: Unique designation identifier
 *           example: 5
 *         designation:
 *           type: string
 *           description: Job title / designation name
 *           maxLength: 30
 *           example: "Senior Software Engineer"
 *         se:
 *           type: boolean
 *           description: Special designation flag (e.g., Executive status)
 *           default: false
 *           example: true
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *         last_status:
 *           type: string
 *           example: "Added"
 *         last_update:
 *           type: string
 *           format: date-time
 *           example: "2026-06-09T12:00:00.000Z"
 *
 *     ContQualification:
 *       type: object
 *       properties:
 *         pk_qua_id:
 *           type: integer
 *           description: Unique qualification identifier
 *           example: 1
 *         qualification:
 *           type: string
 *           description: Degree or educational qualification
 *           maxLength: 40
 *           example: "Master of Business Administration"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *         last_status:
 *           type: string
 *           example: "Added"
 *         last_update:
 *           type: string
 *           format: date-time
 *           example: "2026-06-09T12:00:00.000Z"
 *
 *     ContRelationship:
 *       type: object
 *       properties:
 *         pk_rel_id:
 *           type: integer
 *           description: Unique relationship identifier
 *           example: 3
 *         relationship:
 *           type: string
 *           description: Definition of relationship mapping
 *           maxLength: 30
 *           example: "Spouse"
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *         last_status:
 *           type: string
 *           example: "Added"
 *         last_update:
 *           type: string
 *           format: date-time
 *           example: "2026-06-09T12:00:00.000Z"
 *
 *     ContTitle:
 *       type: object
 *       properties:
 *         pk_tit_id:
 *           type: integer
 *           description: Unique title identifier
 *           example: 1
 *         title:
 *           type: string
 *           description: Salutation title
 *           maxLength: 15
 *           example: "Dr."
 *         fk_user_id:
 *           type: integer
 *           example: 4
 *         last_status:
 *           type: string
 *           example: "Added"
 *         last_update:
 *           type: string
 *           format: date-time
 *           example: "2026-06-09T12:00:00.000Z"
 */

// ===========================================================================
// CATEGORIES  —  /api/master-contacts/categories
// ===========================================================================

/**
 * @openapi
 * /api/master-contacts/categories:
 *   get:
 *     summary: List all contact categories
 *     description: Retrieve contact categories with optional search filtering by name and status.
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search phrase matching category name partially
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *         description: Filter records matching the audit status (e.g. Added, Edited)
 *     responses:
 *       200:
 *         description: Successfully fetched list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContCategory'
 *       500:
 *         description: Database error
 */
router.get('/categories', controller.getCategories);

/**
 * @openapi
 * /api/master-contacts/categories:
 *   post:
 *     summary: Create a contact category
 *     description: Register a new contact category.
 *     tags: [Master Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, fk_user_id]
 *             properties:
 *               category:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Client"
 *               fk_user_id:
 *                 type: integer
 *                 description: User ID executing this create action
 *                 example: 4
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContCategory'
 *       400:
 *         description: Invalid parameters supplied
 */
router.post('/categories', controller.createCategory);

/**
 * @openapi
 * /api/master-contacts/categories/{id}:
 *   get:
 *     summary: Get a contact category by ID
 *     description: Retrieve details of a specific contact category by its integer ID.
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContCategory'
 *       404:
 *         description: Category not found
 */
router.get('/categories/:id', controller.getCategoryById);

/**
 * @openapi
 * /api/master-contacts/categories/{id}:
 *   put:
 *     summary: Update a contact category
 *     description: Modify one or more properties of an existing contact category.
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric category ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Premium Client"
 *               fk_user_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContCategory'
 *       400:
 *         description: Invalid update schema payload
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', controller.updateCategory);

/**
 * @openapi
 * /api/master-contacts/categories/{id}:
 *   delete:
 *     summary: Delete a contact category
 *     description: Delete a specific category. System-defined categories cannot be deleted.
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric category ID to delete
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete system-defined record
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', controller.deleteCategory);

// ===========================================================================
// DEPARTMENTS  —  /api/master-contacts/departments
// ===========================================================================

/**
 * @openapi
 * /api/master-contacts/departments:
 *   get:
 *     summary: List all departments
 *     description: Retrieve list of contact departments with search options.
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Partial string match on department name
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContDepartment'
 */
router.get('/departments', controller.getDepartments);

/**
 * @openapi
 * /api/master-contacts/departments:
 *   post:
 *     summary: Create a department
 *     tags: [Master Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department, fk_user_id]
 *             properties:
 *               department:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Logistics"
 *               fk_user_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContDepartment'
 */
router.post('/departments', controller.createDepartment);

/**
 * @openapi
 * /api/master-contacts/departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContDepartment'
 *       404:
 *         description: Department not found
 */
router.get('/departments/:id', controller.getDepartmentById);

/**
 * @openapi
 * /api/master-contacts/departments/{id}:
 *   put:
 *     summary: Update a department
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Global Logistics"
 *               sync:
 *                 type: string
 *                 enum: [N, C, E]
 *               fk_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContDepartment'
 */
router.put('/departments/:id', controller.updateDepartment);

/**
 * @openapi
 * /api/master-contacts/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department deleted successfully
 */
router.delete('/departments/:id', controller.deleteDepartment);

// ===========================================================================
// DESIGNATIONS  —  /api/master-contacts/designations
// ===========================================================================

/**
 * @openapi
 * /api/master-contacts/designations:
 *   get:
 *     summary: List all designations
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Designations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContDesignation'
 */
router.get('/designations', controller.getDesignations);

/**
 * @openapi
 * /api/master-contacts/designations:
 *   post:
 *     summary: Create a designation
 *     tags: [Master Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [designation, fk_user_id]
 *             properties:
 *               designation:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Lead Architect"
 *               se:
 *                 type: boolean
 *                 default: false
 *               fk_user_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Designation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContDesignation'
 */
router.post('/designations', controller.createDesignation);

/**
 * @openapi
 * /api/master-contacts/designations/{id}:
 *   get:
 *     summary: Get a designation by ID
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Designation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContDesignation'
 *       404:
 *         description: Designation not found
 */
router.get('/designations/:id', controller.getDesignationById);

/**
 * @openapi
 * /api/master-contacts/designations/{id}:
 *   put:
 *     summary: Update a designation
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Principal Architect"
 *               se:
 *                 type: boolean
 *               sync:
 *                 type: string
 *                 enum: [N, C, E]
 *               fk_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Designation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContDesignation'
 */
router.put('/designations/:id', controller.updateDesignation);

/**
 * @openapi
 * /api/master-contacts/designations/{id}:
 *   delete:
 *     summary: Delete a designation
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Designation deleted successfully
 */
router.delete('/designations/:id', controller.deleteDesignation);

// ===========================================================================
// QUALIFICATIONS  —  /api/master-contacts/qualifications
// ===========================================================================

/**
 * @openapi
 * /api/master-contacts/qualifications:
 *   get:
 *     summary: List all qualifications
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Qualifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContQualification'
 */
router.get('/qualifications', controller.getQualifications);

/**
 * @openapi
 * /api/master-contacts/qualifications:
 *   post:
 *     summary: Create a qualification
 *     tags: [Master Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qualification, fk_user_id]
 *             properties:
 *               qualification:
 *                 type: string
 *                 maxLength: 40
 *                 example: "Doctor of Philosophy"
 *               fk_user_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Qualification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContQualification'
 */
router.post('/qualifications', controller.createQualification);

/**
 * @openapi
 * /api/master-contacts/qualifications/{id}:
 *   get:
 *     summary: Get a qualification by ID
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Qualification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContQualification'
 *       404:
 *         description: Qualification not found
 */
router.get('/qualifications/:id', controller.getQualificationById);

/**
 * @openapi
 * /api/master-contacts/qualifications/{id}:
 *   put:
 *     summary: Update a qualification
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qualification:
 *                 type: string
 *                 maxLength: 40
 *                 example: "PhD"
 *               sync:
 *                 type: string
 *                 enum: [N, C, E]
 *               fk_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Qualification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContQualification'
 */
router.put('/qualifications/:id', controller.updateQualification);

/**
 * @openapi
 * /api/master-contacts/qualifications/{id}:
 *   delete:
 *     summary: Delete a qualification
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Qualification deleted successfully
 */
router.delete('/qualifications/:id', controller.deleteQualification);

// ===========================================================================
// RELATIONSHIPS  —  /api/master-contacts/relationships
// ===========================================================================

/**
 * @openapi
 * /api/master-contacts/relationships:
 *   get:
 *     summary: List all relationships
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relationships retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContRelationship'
 */
router.get('/relationships', controller.getRelationships);

/**
 * @openapi
 * /api/master-contacts/relationships:
 *   post:
 *     summary: Create a relationship
 *     tags: [Master Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [relationship, fk_user_id]
 *             properties:
 *               relationship:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Sibling"
 *               fk_user_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Relationship created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContRelationship'
 */
router.post('/relationships', controller.createRelationship);

/**
 * @openapi
 * /api/master-contacts/relationships/{id}:
 *   get:
 *     summary: Get a relationship by ID
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relationship retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContRelationship'
 *       404:
 *         description: Relationship not found
 */
router.get('/relationships/:id', controller.getRelationshipById);

/**
 * @openapi
 * /api/master-contacts/relationships/{id}:
 *   put:
 *     summary: Update a relationship
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               relationship:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Sister"
 *               sync:
 *                 type: string
 *                 enum: [N, C, E]
 *               fk_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Relationship updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContRelationship'
 */
router.put('/relationships/:id', controller.updateRelationship);

/**
 * @openapi
 * /api/master-contacts/relationships/{id}:
 *   delete:
 *     summary: Delete a relationship
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relationship deleted successfully
 */
router.delete('/relationships/:id', controller.deleteRelationship);

// ===========================================================================
// TITLES  —  /api/master-contacts/titles
// ===========================================================================

/**
 * @openapi
 * /api/master-contacts/titles:
 *   get:
 *     summary: List all contact titles
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: last_status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Titles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContTitle'
 */
router.get('/titles', controller.getTitles);

/**
 * @openapi
 * /api/master-contacts/titles:
 *   post:
 *     summary: Create a contact title
 *     tags: [Master Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, fk_user_id]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 15
 *                 example: "Prof."
 *               fk_user_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Title created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContTitle'
 */
router.post('/titles', controller.createTitle);

/**
 * @openapi
 * /api/master-contacts/titles/{id}:
 *   get:
 *     summary: Get a contact title by ID
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Title retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContTitle'
 *       404:
 *         description: Title not found
 */
router.get('/titles/:id', controller.getTitleById);

/**
 * @openapi
 * /api/master-contacts/titles/{id}:
 *   put:
 *     summary: Update a contact title
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 15
 *                 example: "Professor"
 *               sync:
 *                 type: string
 *                 enum: [N, C, E]
 *               fk_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Title updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContTitle'
 */
router.put('/titles/:id', controller.updateTitle);

/**
 * @openapi
 * /api/master-contacts/titles/{id}:
 *   delete:
 *     summary: Delete a contact title
 *     tags: [Master Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Title deleted successfully
 */
router.delete('/titles/:id', controller.deleteTitle);

router.use('/title', titleRouter());
router.use('/city', cityRouter());
router.use('/address', addressRouter());
router.use('/country', countryRouter());
router.use('/state', stateRouter());
router.use('/mode-of-contact', modeOfContactRouter);
router.use('/region', regionRouter);
router.use('/individuals', individualRouter);

export default router;
