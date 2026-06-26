import { Router } from 'express';
import * as controller from './sal-comp-employees.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ComplaintEmployee:
 *       type: object
 *       properties:
 *         pk_emp_id:
 *           type: integer
 *           description: Unique employee identifier
 *           example: 105
 *         employee:
 *           type: string
 *           description: Full name of the employee
 *           example: "Avinash Magar"
 *         emp_code:
 *           type: string
 *           description: Unique employee code
 *           example: "TX001"
 *     ComplaintAttachment:
 *       type: object
 *       properties:
 *         pk_att_id:
 *           type: integer
 *           description: Unique attachment identifier
 *           example: 1
 *         file_name:
 *           type: string
 *           description: Name of the uploaded file
 *           example: "complaint_report.pdf"
 *         file_path:
 *           type: string
 *           description: Storage/URL path of the file
 *           example: "/uploads/complaints/complaint_report.pdf"
 *         doc_type:
 *           type: string
 *           description: File type/extension description
 *           example: "pdf"
 *         uploaded_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the file was uploaded
 *           example: "2026-06-23T12:00:00.000Z"
 *     ComplaintDetail:
 *       type: object
 *       properties:
 *         pk_com_id:
 *           type: string
 *           description: Numeric complaint identifier represented as string
 *           example: "12345"
 *         title:
 *           type: string
 *           description: Title/Subject of the complaint
 *           example: "Equipment Malfunction"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the complaint
 *           example: "The server room AC is not functioning properly."
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2026-06-23T12:00:00.000Z"
 *         employees:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ComplaintEmployee'
 *         attachments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ComplaintAttachment'
 */

/**
 * @openapi
 * /api/sal-comp-employees:
 *   get:
 *     summary: Retrieve complaints
 *     description: Returns a list of complaints with pagination, filtering, and associated employees and attachments.
 *     tags:
 *       - Complaint Employees
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Page size for pagination
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Optional text filter to match complaint title (case-insensitive search)
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Complaints retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ComplaintDetail'
 */
router.get('/', controller.getAll);

/**
 * @openapi
 * /api/sal-comp-employees/{id}:
 *   get:
 *     summary: Get complaint by ID
 *     description: Returns detailed complaint records, including linked employees and attachment files.
 *     tags:
 *       - Complaint Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Numeric primary key ID (pk_com_id)
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Complaint retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ComplaintDetail'
 *       404:
 *         description: Complaint not found
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /api/sal-comp-employees:
 *   post:
 *     summary: Create a complaint
 *     description: Creates a new complaint, links it to target employees, and registers multiple attachments.
 *     tags:
 *       - Complaint Employees
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pk_com_id
 *               - title
 *               - employee_ids
 *             properties:
 *               pk_com_id:
 *                 type: integer
 *                 description: Unique numeric identifier
 *                 example: 98765
 *               title:
 *                 type: string
 *                 description: Complaint title
 *                 example: "AC breakdown"
 *               description:
 *                 type: string
 *                 description: Description detail
 *                 example: "AC stopped cooling in server room 2B"
 *               employee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Employee IDs to link to the complaint
 *                 example: [1, 2]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - file_name
 *                     - file_path
 *                     - doc_type
 *                   properties:
 *                     file_name:
 *                       type: string
 *                       example: "receipt.png"
 *                     file_path:
 *                       type: string
 *                       example: "/uploads/receipt.png"
 *                     doc_type:
 *                       type: string
 *                       example: "png"
 *     responses:
 *       201:
 *         description: Complaint created successfully
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
 *                   example: "Complaint created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_com_id:
 *                       type: string
 *                       example: "98765"
 */
router.post('/', controller.create);

/**
 * @openapi
 * /api/sal-comp-employees/{id}:
 *   put:
 *     summary: Update a complaint by ID
 *     description: Updates the complaint fields, resets employee lists, and replaces attachments.
 *     tags:
 *       - Complaint Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Numeric primary key ID (pk_com_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "AC breakdown updated"
 *               description:
 *                 type: string
 *                 example: "AC stopped cooling completely."
 *               employee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     file_name:
 *                       type: string
 *                       example: "updated_receipt.png"
 *                     file_path:
 *                       type: string
 *                       example: "/uploads/updated_receipt.png"
 *                     doc_type:
 *                       type: string
 *                       example: "png"
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       404:
 *         description: Complaint not found
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /api/sal-comp-employees/{id}:
 *   delete:
 *     summary: Delete a complaint by ID
 *     description: Deletes the complaint. Cascading foreign keys will auto-delete linked employees and attachments.
 *     tags:
 *       - Complaint Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Numeric primary key ID (pk_com_id)
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *       404:
 *         description: Complaint not found
 */
router.delete('/:id', controller.remove);

export default router;
