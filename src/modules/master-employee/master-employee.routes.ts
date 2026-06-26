/**
 * master-employee.routes.ts
 * Route definitions for master-employee CRUD.
 * Integrates authenticate middleware and OpenAPI documentation.
 */

import { Router } from 'express';

import { authenticate } from '../../core/middlewares/auth.middleware.js';

import * as controller from './master-employee.controller.js';

const router = Router();

// Secure all endpoints with authentication
router.use(authenticate);

/**
 * @openapi
 * components:
 *   schemas:
 *     EmpContact:
 *       type: object
 *       required:
 *         - fk_moc_id
 *         - contact
 *         - sr_no
 *       properties:
 *         pk_cont_id:
 *           type: integer
 *           description: Unique primary key ID for the contact entry.
 *           example: 1
 *         fk_emp_id:
 *           type: integer
 *           description: Foreign key reference of the employee.
 *           example: 4
 *         fk_moc_id:
 *           type: string
 *           description: Mode of contact ID.
 *           example: "MOB"
 *         contact:
 *           type: string
 *           description: Contact value (phone number, email address, etc.).
 *           example: "9999888833"
 *         ext:
 *           type: string
 *           description: Optional extension code.
 *           example: "+91"
 *         sr_no:
 *           type: integer
 *           description: Serial order number.
 *           example: 1
 *     EmpDocument:
 *       type: object
 *       required:
 *         - fk_dt_id
 *         - doc_file
 *       properties:
 *         pk_d_emp_id:
 *           type: integer
 *           description: Unique primary key ID for the employee document reference.
 *           example: 1
 *         fk_emp_id:
 *           type: integer
 *           description: Foreign key reference of the employee.
 *           example: 4
 *         fk_dt_id:
 *           type: integer
 *           description: Document type ID.
 *           example: 2
 *         doc_file:
 *           type: string
 *           description: File name/path of the uploaded document.
 *           example: "aadhar_card.pdf"
 *         valid_until:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Validity expiration date of the document.
 *           example: "2030-12-31"
 *     MasterEmployee:
 *       type: object
 *       required:
 *         - emp_code
 *         - employee
 *         - doj
 *         - p_address
 *         - n_address
 *         - username
 *         - password
 *         - answer
 *       properties:
 *         pk_emp_id:
 *           type: integer
 *           description: Unique primary key ID for the employee.
 *           example: 4
 *         emp_code:
 *           type: string
 *           description: Unique employee identification code.
 *           example: "EMP001"
 *         fk_tit_id:
 *           type: integer
 *           nullable: true
 *           description: Foreign key reference to Title prefix.
 *           example: 1
 *         employee:
 *           type: string
 *           description: Full name of the employee.
 *           example: "Samiksha"
 *         doj:
 *           type: string
 *           format: date
 *           description: Date of joining.
 *           example: "2026-06-15"
 *         dob:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Date of birth.
 *           example: "1998-05-20"
 *         photo:
 *           type: string
 *           nullable: true
 *           description: Filename or URL of the employee's photograph.
 *           example: "photo_4.png"
 *         fk_qual_id:
 *           type: integer
 *           nullable: true
 *           description: Foreign key reference to Qualification.
 *           example: 2
 *         male:
 *           type: string
 *           description: Gender status of the employee (Male, Female, LGBT, Others).
 *           example: "Female"
 *         married:
 *           type: string
 *           description: Marital status (Single, Married, Divorced, Widowed, Separated, Engaged, Livein, Others).
 *           example: "Single"
 *         anni:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Anniversary date if married.
 *           example: null
 *         p_address:
 *           type: string
 *           description: Present resident address.
 *           example: "123 Street, City"
 *         n_address:
 *           type: string
 *           description: Native permanent address.
 *           example: "456 Village, State"
 *         fk_dep_id:
 *           type: integer
 *           nullable: true
 *           description: Foreign key reference to Department.
 *           example: 2
 *         fk_deg_id:
 *           type: integer
 *           nullable: true
 *           description: Foreign key reference to Designation.
 *           example: 3
 *         fk_bnk_id:
 *           type: integer
 *           nullable: true
 *           description: Foreign key reference to Bank.
 *           example: 1
 *         account_no:
 *           type: string
 *           description: Bank account number.
 *           example: "1234567890"
 *         pf_no:
 *           type: string
 *           description: Provident Fund registration number.
 *           example: "PF12345"
 *         esic_no:
 *           type: string
 *           description: Employee State Insurance Corporation number.
 *           example: "ESIC12345"
 *         pan_no:
 *           type: string
 *           description: Permanent Account Number (PAN).
 *           example: "ABCDE1234F"
 *         dol:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Date of leaving if applicable.
 *           example: null
 *         blood_grp:
 *           type: string
 *           description: Blood group type.
 *           example: "O+"
 *         wp:
 *           type: string
 *           description: Work place location.
 *           example: "Head Office"
 *         aadhar:
 *           type: string
 *           description: Aadhaar Card number.
 *           example: "123456789012"
 *         cv_copy:
 *           type: string
 *           description: Path/name of CV document copy.
 *           example: ""
 *         le_copy:
 *           type: string
 *           description: Path/name of Leaving Certificate copy.
 *           example: ""
 *         fk_m_doc_id:
 *           type: string
 *           nullable: true
 *           description: Foreign key reference to master document metadata.
 *           example: null
 *         username:
 *           type: string
 *           description: Authentication username assigned to the employee.
 *           example: "samiksha"
 *         question:
 *           type: string
 *           description: Security question for credential recovery.
 *           example: "What is your favorite color?"
 *         answer:
 *           type: string
 *           description: Security answer.
 *           example: "black"
 *         ext:
 *           type: string
 *           description: Extension number.
 *           example: ""
 *         date_time_stamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when record was updated.
 *           example: "2026-06-15T09:03:30.675Z"
 *         fk_user_id:
 *           type: integer
 *           description: ID of user who modified the record.
 *           example: 1
 *         last_status:
 *           type: string
 *           description: Audit trails status.
 *           example: "Added"
 *         rtgs:
 *           type: string
 *           description: RTGS details.
 *           example: ""
 *         s_address:
 *           type: string
 *           description: Secondary address details.
 *           example: ""
 *         sb:
 *           type: boolean
 *           description: SB flag.
 *           example: true
 *         fk_set_id:
 *           type: integer
 *           nullable: true
 *           description: Settings ID mapping.
 *           example: 1
 *         type:
 *           type: string
 *           description: Staff categorization type.
 *           example: "Office Staff"
 *         att_type:
 *           type: boolean
 *           description: Attendance tracking type flag.
 *           example: true
 *         height:
 *           type: string
 *           nullable: true
 *           description: Height of employee.
 *           example: null
 *         weight:
 *           type: string
 *           nullable: true
 *           description: Weight of employee.
 *           example: null
 *         fk_rg_id:
 *           type: string
 *           nullable: true
 *           description: Religion reference code.
 *           example: null
 *         fk_cs_id:
 *           type: string
 *           nullable: true
 *           description: Caste reference code.
 *           example: null
 *         fk_st_id:
 *           type: string
 *           nullable: true
 *           description: State reference code.
 *           example: null
 *         mark:
 *           type: string
 *           description: Personal identification mark.
 *           example: ""
 *         experience:
 *           type: string
 *           nullable: true
 *           description: Work experience description.
 *           example: null
 *         fk_r_emp_id:
 *           type: string
 *           nullable: true
 *           description: Reporter/Manager employee ID reference.
 *           example: null
 *         police:
 *           type: string
 *           description: Police verification status details.
 *           example: ""
 *         add_police:
 *           type: string
 *           description: Additional police verification details.
 *           example: ""
 *         cont_police:
 *           type: string
 *           description: Police contact details.
 *           example: ""
 *         fk_w1_emp_id:
 *           type: string
 *           nullable: true
 *           description: Witness 1 employee ID.
 *           example: null
 *         fk_w2_emp_id:
 *           type: string
 *           nullable: true
 *           description: Witness 2 employee ID.
 *           example: null
 *         personality1:
 *           type: string
 *           description: Reference contact person 1 name.
 *           example: ""
 *         fk_p1_des_id:
 *           type: integer
 *           nullable: true
 *           description: Designation of reference 1.
 *           example: null
 *         p1_address:
 *           type: string
 *           description: Address of reference 1.
 *           example: ""
 *         p1_contact:
 *           type: string
 *           description: Contact of reference 1.
 *           example: ""
 *         personality2:
 *           type: string
 *           description: Reference contact person 2 name.
 *           example: ""
 *         fk_p2_des_id:
 *           type: integer
 *           nullable: true
 *           description: Designation of reference 2.
 *           example: null
 *         p2_address:
 *           type: string
 *           description: Address of reference 2.
 *           example: ""
 *         p2_contact:
 *           type: string
 *           description: Contact of reference 2.
 *           example: ""
 *         messaging:
 *           type: boolean
 *           description: Status flag for messaging.
 *           example: true
 *         fk_acct_id:
 *           type: integer
 *           nullable: true
 *           description: Accounting ledger code relation.
 *           example: null
 *         geolocation:
 *           type: boolean
 *           description: GPS tracking option permission.
 *           example: true
 *         employment:
 *           type: string
 *           description: Employment nature contract.
 *           example: ""
 *         inform_pf:
 *           type: boolean
 *           nullable: true
 *           description: Notify PF department status.
 *           example: null
 *         inform_esic:
 *           type: boolean
 *           nullable: true
 *           description: Notify ESIC department status.
 *           example: null
 *         contacts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EmpContact'
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EmpDocument'
 */

/**
 * @openapi
 * /api/master-employee:
 *   get:
 *     summary: Retrieve list of employees
 *     description: Returns a paginated list of employees with search filters. Secure route requiring JWT authentication.
 *     tags:
 *       - Master Employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employee
 *         schema:
 *           type: string
 *         description: Optional filter by employee full name prefix.
 *       - in: query
 *         name: emp_code
 *         schema:
 *           type: string
 *         description: Optional filter by employee code prefix.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return per page.
 *     responses:
 *       200:
 *         description: List of employees returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employees list retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-employee"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterEmployee'
 *                     total:
 *                       type: integer
 *                       example: 1
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 50
 *       400:
 *         description: Request query parameter validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     details:
 *                       type: string
 *                       example: "Invalid query parameters"
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization Bearer Token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access Denied"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.get('/', controller.listEmployees);
router.get('/next-code', controller.getNextEmpCode);
router.get('/document-types', controller.getDocumentTypes);

/**
 * @openapi
 * /api/master-employee/{id}:
 *   get:
 *     summary: Retrieve employee by ID
 *     description: Returns a single detailed employee record by its unique database primary key integer ID.
 *     tags:
 *       - MasterEmployee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target employee.
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee details retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-employee"
 *                 data:
 *                   $ref: '#/components/schemas/MasterEmployee'
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_ID"
 *                     details:
 *                       type: string
 *                       example: "ID must be an integer"
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization Bearer Token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access Denied"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *       404:
 *         description: Target employee not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     details:
 *                       type: string
 *                       example: "Employee not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.get('/:id', controller.getEmployee);

/**
 * @openapi
 * /api/master-employee:
 *   post:
 *     summary: Create a new employee
 *     description: Creates a new employee record along with related contacts and documents. Enforces uniqueness constraint for `emp_code` and `username`.
 *     tags:
 *       - MasterEmployee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emp_code
 *               - employee
 *               - doj
 *               - p_address
 *               - n_address
 *               - username
 *               - password
 *               - answer
 *             properties:
 *               emp_code:
 *                 type: string
 *                 example: "EMP001"
 *               fk_tit_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               employee:
 *                 type: string
 *                 example: "Samiksha"
 *               doj:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-15"
 *               dob:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "1998-05-20"
 *               photo:
 *                 type: string
 *                 nullable: true
 *                 example: "photo_4.png"
 *               fk_qual_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               male:
 *                 type: string
 *                 example: "Female"
 *               married:
 *                 type: string
 *                 example: "Single"
 *               anni:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: null
 *               p_address:
 *                 type: string
 *                 example: "123 Street, City"
 *               n_address:
 *                 type: string
 *                 example: "456 Village, State"
 *               fk_dep_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               fk_deg_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               fk_bnk_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               account_no:
 *                 type: string
 *                 example: "1234567890"
 *               pf_no:
 *                 type: string
 *                 example: "PF12345"
 *               esic_no:
 *                 type: string
 *                 example: "ESIC12345"
 *               pan_no:
 *                 type: string
 *                 example: "ABCDE1234F"
 *               dol:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: null
 *               blood_grp:
 *                 type: string
 *                 example: "O+"
 *               wp:
 *                 type: string
 *                 example: "Head Office"
 *               aadhar:
 *                 type: string
 *                 example: "123456789012"
 *               cv_copy:
 *                 type: string
 *                 example: ""
 *               le_copy:
 *                 type: string
 *                 example: ""
 *               fk_m_doc_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               username:
 *                 type: string
 *                 example: "samiksha"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *               question:
 *                 type: string
 *                 example: "What is your favorite color?"
 *               answer:
 *                 type: string
 *                 example: "black"
 *               ext:
 *                 type: string
 *                 example: ""
 *               rtgs:
 *                 type: string
 *                 example: ""
 *               s_address:
 *                 type: string
 *                 example: ""
 *               sb:
 *                 type: boolean
 *                 example: true
 *               type:
 *                 type: string
 *                 example: "Office Staff"
 *               att_type:
 *                 type: boolean
 *                 example: true
 *               height:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               weight:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               fk_rg_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               fk_cs_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               fk_st_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               mark:
 *                 type: string
 *                 example: ""
 *               experience:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               fk_r_emp_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               police:
 *                 type: string
 *                 example: ""
 *               add_police:
 *                 type: string
 *                 example: ""
 *               cont_police:
 *                 type: string
 *                 example: ""
 *               fk_w1_emp_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               fk_w2_emp_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               personality1:
 *                 type: string
 *                 example: ""
 *               fk_p1_des_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               p1_address:
 *                 type: string
 *                 example: ""
 *               p1_contact:
 *                 type: string
 *                 example: ""
 *               personality2:
 *                 type: string
 *                 example: ""
 *               fk_p2_des_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               p2_address:
 *                 type: string
 *                 example: ""
 *               p2_contact:
 *                 type: string
 *                 example: ""
 *               messaging:
 *                 type: boolean
 *                 example: true
 *               fk_acct_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               geolocation:
 *                 type: boolean
 *                 example: true
 *               employment:
 *                 type: string
 *                 example: ""
 *               inform_pf:
 *                 type: boolean
 *                 nullable: true
 *                 example: null
 *               inform_esic:
 *                 type: boolean
 *                 nullable: true
 *                 example: null
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fk_moc_id
 *                     - contact
 *                     - sr_no
 *                   properties:
 *                     fk_moc_id:
 *                       type: string
 *                       example: "MOB"
 *                     contact:
 *                       type: string
 *                       example: "9999888833"
 *                     ext:
 *                       type: string
 *                       example: "+91"
 *                     sr_no:
 *                       type: integer
 *                       example: 1
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fk_dt_id
 *                     - doc_file
 *                   properties:
 *                     fk_dt_id:
 *                       type: integer
 *                       example: 2
 *                     doc_file:
 *                       type: string
 *                       example: "aadhar_card.pdf"
 *                     valid_until:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2030-12-31"
 *     responses:
 *       201:
 *         description: Employee created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee created successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-employee"
 *                 data:
 *                   $ref: '#/components/schemas/MasterEmployee'
 *       400:
 *         description: Request validation failed, or employee code/username conflict.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DUPLICATE_CODE"
 *                     details:
 *                       type: string
 *                       example: "Employee code already exists"
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization Bearer Token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access Denied"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.post('/', controller.createEmployee);

/**
 * @openapi
 * /api/master-employee/{id}:
 *   put:
 *     summary: Update an existing employee
 *     description: Updates properties of a specific employee, including contact details and files. Validates uniqueness constraints on modifications.
 *     tags:
 *       - MasterEmployee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target employee to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *                 example: "Samiksha Updated"
 *               male:
 *                 type: string
 *                 example: "Female"
 *               married:
 *                 type: string
 *                 example: "Single"
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fk_moc_id:
 *                       type: string
 *                       example: "MOB"
 *                     contact:
 *                       type: string
 *                       example: "9999888844"
 *                     sr_no:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: Employee updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee updated successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-employee"
 *                 data:
 *                   $ref: '#/components/schemas/MasterEmployee'
 *       400:
 *         description: Request payload validation failed, or employee code/username conflict.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DUPLICATE_CODE"
 *                     details:
 *                       type: string
 *                       example: "Employee code already exists"
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization Bearer Token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access Denied"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *       404:
 *         description: Employee not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     details:
 *                       type: string
 *                       example: "Employee not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.put('/:id', controller.updateEmployee);

/**
 * @openapi
 * /api/master-employee/{id}:
 *   delete:
 *     summary: Delete an employee
 *     description: Deletes an existing employee record, resolving dependent structures from contacts and documents tables.
 *     tags:
 *       - MasterEmployee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique integer ID of the target employee to delete.
 *     responses:
 *       200:
 *         description: Employee deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee deleted successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 module:
 *                   type: string
 *                   example: "master-employee"
 *       400:
 *         description: Invalid numeric ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_ID"
 *                     details:
 *                       type: string
 *                       example: "ID must be an integer"
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization Bearer Token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access Denied"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *       404:
 *         description: Employee not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     details:
 *                       type: string
 *                       example: "Employee not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-15T12:00:00.000Z"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_ERROR"
 *                     details:
 *                       type: string
 *                       example: "An unexpected error occurred"
 */
router.delete('/:id', controller.deleteEmployee);

export default router;
