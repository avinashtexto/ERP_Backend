import { Router } from 'express';

import * as controller from './book.controller.js';

const router = Router();

/**
 * @openapi
 * /api/book/health:
 *   get:
 *     summary: Retrieve health status for book
 *     description: Checks if the Book database module is operational and accessible.
 *     tags:
 *       - Book
 *     responses:
 *       200:
 *         description: Success. Book module health check successful.
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
 *                   example: "Book module health check successful"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:39:00"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "UP"
 *       500:
 *         description: Server Error. Health check failed.
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
 *                   example: "Book module health check failed"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:39:00"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "HEALTH_CHECK_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.get('/health', controller.health);

/**
 * @openapi
 * /api/book/names:
 *   get:
 *     summary: Retrieve a list of all book database names in the common database
 *     description: Returns a list of strings representing the names of the books, with support for pagination.
 *     tags:
 *       - Book
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of names per page
 *     responses:
 *       200:
 *         description: Success. Book names retrieved successfully.
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
 *                   example: "Book names retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:39:52"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["TIKSON PATHOHUB TECH PRIVATE LIMITED", "Lamor India Pvt Ltd"]
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 2
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 100
 *       500:
 *         description: Server Error.
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
 *                   example: "Failed to retrieve book names"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:39:52"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "GET_BOOK_NAMES_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Failed to read database records"
 */
router.get('/names', controller.getBookNames);

/**
 * @openapi
 * /api/book:
 *   get:
 *     summary: Retrieve list of all book entries in the common database
 *     description: Returns detailed records of all registered books.
 *     tags:
 *       - Book
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of books per page
 *     responses:
 *       200:
 *         description: Success. Book list retrieved successfully.
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
 *                   example: "Book list retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:39:57"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pk_book_id:
 *                         type: integer
 *                         example: 1
 *                       book_name:
 *                         type: string
 *                         example: "Lamor India Pvt Ltd"
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       file_name:
 *                         type: string
 *                         example: "lamor_data.db"
 *                       database_name:
 *                         type: string
 *                         example: "lamor_db"
 *                       product_id:
 *                         type: integer
 *                         example: 1
 *                       parent_id:
 *                         type: integer
 *                         example: 0
 *                       add_path:
 *                         type: string
 *                         example: "/data"
 *                       backup_path:
 *                         type: string
 *                         example: "/backup"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 2
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 100
 *       500:
 *         description: Server Error.
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
 *                   example: "Failed to retrieve book list"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:39:57"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "GET_BOOKS_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Internal database failure"
 */
router.get('/', controller.getBooks);

/**
 * @openapi
 * /api/book:
 *   post:
 *     summary: Create a new book entry
 *     description: Registers a new book database configuration.
 *     tags:
 *       - Book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Superuser username for the new book DB
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: Superuser password for the new book DB
 *                 example: "secure_password"
 *               book_name:
 *                 type: string
 *                 description: Book name identifier (also accepts bookname, bookName, or BookName)
 *                 example: "tionix_one"
 *               bookname:
 *                 type: string
 *               bookName:
 *                 type: string
 *               BookName:
 *                 type: string
 *           example:
 *             username: "john_doe"
 *             password: "secure_password"
 *             book_name: "tionix_one"
 *     responses:
 *       201:
 *         description: Book created successfully.
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
 *                   example: "Book created successfully"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:11:52"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pk_book_id:
 *                       type: integer
 *                       example: 2
 *                     book_name:
 *                       type: string
 *                       example: "tionix_one"
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     file_name:
 *                       type: string
 *                       example: ""
 *                     database_name:
 *                       type: string
 *                       example: "tionix_one"
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     parent_id:
 *                       type: integer
 *                       example: 1
 *                     add_path:
 *                       type: string
 *                       example: "IERPCom"
 *                     backup_path:
 *                       type: string
 *                       example: ""
 *       400:
 *         description: Bad Request. Validation failed.
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
 *                   example: "2026-06-11 14:11:52"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_INPUT"
 *                     details:
 *                       type: object
 *                       properties:
 *                         _errors:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Book name is required (use book_name, bookname, bookName, or BookName)"]
 *       500:
 *         description: Server Error.
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
 *                   example: "Failed to create book entry"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-11 14:11:52"
 *                 module:
 *                   type: string
 *                   example: "book"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "CREATE_BOOK_FAILED"
 *                     details:
 *                       type: string
 *                       example: "Database connection failed"
 */
router.post('/', controller.createBook);

export default router;
