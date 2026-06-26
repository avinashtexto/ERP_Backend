import { Router } from 'express';

import * as controller from './individual.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ContIndividual:
 *       type: object
 *       description: An individual contact record linked to a common contact record.
 *       properties:
 *         pk_ind_id:
 *           type: integer
 *           description: Unique individual identifier (auto-incremented)
 *           example: 1
 *         fk_com_id:
 *           type: integer
 *           description: FK reference to cont_common (the parent contact record)
 *           example: 5
 *         fk_tit_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_title
 *           example: 2
 *         first_name:
 *           type: string
 *           maxLength: 50
 *           description: First name of the individual
 *           example: "John"
 *         middle_name:
 *           type: string
 *           maxLength: 40
 *           description: Middle name of the individual
 *           example: "Robert"
 *         surname:
 *           type: string
 *           maxLength: 25
 *           description: Surname/last name of the individual
 *           example: "Doe"
 *         dob:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date of birth
 *           example: "1990-01-01T00:00:00.000Z"
 *         photo_url:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           description: URL of the individual's photo
 *           example: "https://example.com/photo.jpg"
 *         fk_qual_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_qualification
 *           example: 3
 *         male:
 *           type: boolean
 *           default: true
 *           description: Gender indicator (true for Male, false for Female/other)
 *           example: true
 *         married:
 *           type: boolean
 *           default: false
 *           description: Marital status indicator
 *           example: false
 *         fk_org_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_common (organization)
 *           example: 10
 *         fk_dep_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_department
 *           example: 4
 *         fk_deg_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_designation
 *           example: 2
 *         fk_spo_id:
 *           type: integer
 *           nullable: true
 *           description: FK reference to cont_common (spouse)
 *           example: 15
 *         anniversary:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Anniversary date
 *           example: "2015-06-15T00:00:00.000Z"
 *         ext:
 *           type: string
 *           maxLength: 10
 *           nullable: true
 *           description: Telephone extension number
 *           example: "123"
 *
 *     IndividualListRow:
 *       type: object
 *       properties:
 *         pk_ind_id:
 *           type: integer
 *           example: 1
 *         fk_com_id:
 *           type: integer
 *           example: 5
 *         first_name:
 *           type: string
 *           example: "John"
 *         middle_name:
 *           type: string
 *           example: "Robert"
 *         surname:
 *           type: string
 *           example: "Doe"
 *         dob:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "1990-01-01T00:00:00.000Z"
 *         photo_url:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/photo.jpg"
 *         male:
 *           type: boolean
 *           example: true
 *         married:
 *           type: boolean
 *           example: false
 *         contact_name:
 *           type: string
 *           example: "John Doe"
 *         title_name:
 *           type: string
 *           nullable: true
 *           example: "Mr."
 *         qualification_name:
 *           type: string
 *           nullable: true
 *           example: "Bachelor of Science"
 *         organisation_name:
 *           type: string
 *           nullable: true
 *           example: "Tionix Technologies"
 *         department_name:
 *           type: string
 *           nullable: true
 *           example: "Engineering"
 *         designation_name:
 *           type: string
 *           nullable: true
 *           example: "Senior Developer"
 *         spouse_name:
 *           type: string
 *           nullable: true
 *           example: "Jane Doe"
 *
 *     CreateIndividualRequest:
 *       type: object
 *       required: [fk_com_id, first_name, surname]
 *       properties:
 *         fk_com_id:
 *           type: integer
 *           example: 5
 *         fk_tit_id:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         first_name:
 *           type: string
 *           example: "John"
 *         middle_name:
 *           type: string
 *           example: "Robert"
 *         surname:
 *           type: string
 *           example: "Doe"
 *         dob:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "1990-01-01"
 *         photo_url:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/photo.jpg"
 *         fk_qual_id:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         male:
 *           type: boolean
 *           default: true
 *           example: true
 *         married:
 *           type: boolean
 *           default: false
 *           example: false
 *         fk_org_id:
 *           type: integer
 *           nullable: true
 *           example: 10
 *         fk_dep_id:
 *           type: integer
 *           nullable: true
 *           example: 4
 *         fk_deg_id:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         fk_spo_id:
 *           type: integer
 *           nullable: true
 *           example: 15
 *         anniversary:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2015-06-15"
 *         ext:
 *           type: string
 *           nullable: true
 *           example: "123"
 */

/**
 * @openapi
 * /api/master-contacts/individuals/health:
 *   get:
 *     summary: Retrieve health status for individuals
 *     tags:
 *       - Master Contacts / Individual
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/health', controller.health);

/**
 * @openapi
 * /api/master-contacts/individuals:
 *   get:
 *     summary: List individuals with pagination and search filters
 *     tags:
 *       - Master Contacts / Individual
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Partial search filter on first name, middle name, surname, or contact name
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Individuals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IndividualListRow'
 */
router.get('/', controller.listIndividuals);

/**
 * @openapi
 * /api/master-contacts/individuals/{id}:
 *   get:
 *     summary: Get an individual by ID
 *     tags:
 *       - Master Contacts / Individual
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Individual retrieved successfully
 *       404:
 *         description: Individual not found
 */
router.get('/:id', controller.getIndividualById);

/**
 * @openapi
 * /api/master-contacts/individuals:
 *   post:
 *     summary: Create a new individual contact record
 *     tags:
 *       - Master Contacts / Individual
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIndividualRequest'
 *     responses:
 *       201:
 *         description: Individual created successfully
 */
router.post('/', controller.createIndividual);

/**
 * @openapi
 * /api/master-contacts/individuals/{id}:
 *   put:
 *     summary: Update an existing individual contact record
 *     tags:
 *       - Master Contacts / Individual
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
 *             $ref: '#/components/schemas/CreateIndividualRequest'
 *     responses:
 *       200:
 *         description: Individual updated successfully
 */
router.put('/:id', controller.updateIndividual);

/**
 * @openapi
 * /api/master-contacts/individuals/{id}:
 *   delete:
 *     summary: Delete an individual contact record
 *     tags:
 *       - Master Contacts / Individual
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Individual deleted successfully
 */
router.delete('/:id', controller.deleteIndividual);

export default router;
