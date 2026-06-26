import cookieParser from 'cookie-parser';
import express from 'express';

// Importing Global Middlewares
import { apiLoggerMiddleware } from './core/middlewares/api-logger.middleware.js';
import { authenticate } from './core/middlewares/auth.middleware.js';
import { configureCors } from './core/middlewares/cors.middleware.js';
import { notFoundMiddleware, errorHandlerMiddleware } from './core/middlewares/error.middleware.js';
import { ResponseBuilderMiddleware } from './core/middlewares/response.middleware.js';
import { tenantStorageMiddleware } from './core/middlewares/tenant.middleware.js';

// Importing Modular Routes
import accountGroupsRouter from '@/modules/account-groups/account-groups.routes.js';
import attendanceRouter from '@/modules/attendance/attendance.routes.js';
import authRouter from '@/modules/auth/auth.routes.js';
import bookRouter from '@/modules/book/book.routes.js';
import docsRouter from '@/modules/docs/docs.routes.js';
import { kafkaRouter } from '@/modules/kafka/kafka.routes.js';
import leaveRequestRouter from '@/modules/leave-request/leave-request.routes.js';
import loanRequestRouter from '@/modules/loan-request/loan-request.routes.js';
import mobileRouter from '@/modules/mobile/mobile.routes.js';
import masterContactsRouter from '@/modules/master-contacts/master-contacts.routes.js';
import masterEmployeeRouter from '@/modules/master-employee/master-employee.routes.js';
import masterSalaryRouter from '@/modules/master-salary/master-salary.routes.js';
import itSectionsRouter from '@/modules/master-salary/sal-it-section/sal-it-section.routes.js';
import natureOfWorkRouter from '@/modules/master-salary/sal-nature-of-work/sal-nature-of-work.routes.js';
import miscellaneousRouter from '@/modules/miscellaneous/miscellaneous.routes.js';
import userRightsRouter from '@/modules/user-rights/user-rights.routes.js';
import usersRouter from '@/modules/users/users.routes.js';
import personalWorkRouter from '@/modules/personal-work/personal-work.routes.js';
import salShiftTimingRouter from '@/modules/sal-shift-timing/sal-shift-timing.routes.js';
import dailyTaskRouter from '@/modules/daily-task/daily-task.routes.js';
import hrAnnouncementRouter from '@/modules/hr-announcement/hr-announcement.routes.js';


const app = express();


// Global Middlewares
app.use(configureCors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom Response Builder Middleware
app.use(apiLoggerMiddleware);
app.use(ResponseBuilderMiddleware);
app.use(tenantStorageMiddleware);

app.get('/', (req, res) => {
  res.build
    .withStatus(200)
    .withMessage('Welcome to TionixOne API')
    .withData(null)
    .withMeta(null)
    .success()
    .send();
  return;
});

// Modular Routes Registration

// Public
app.use('/api/docs', docsRouter);
app.use('/api/auth', authRouter);

// Admin
app.use('/api/admin/user-rights', authenticate, userRightsRouter);
app.use('/api/admin/users', authenticate, usersRouter);

// Master
app.use('/api/master/master-contacts', authenticate, masterContactsRouter);
app.use('/api/master/account-groups', authenticate, accountGroupsRouter);

// Transaction
app.use('/api/book', bookRouter);
app.use('/api/user-rights', userRightsRouter);
app.use('/api/users', usersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/account-groups', accountGroupsRouter);
app.use('/api/leave-request', leaveRequestRouter);
app.use('/api/loan-request', loanRequestRouter);
app.use('/api/master-contacts', masterContactsRouter);
app.use('/api/personal-work', personalWorkRouter);
app.use('/api/sal-shift-timing', salShiftTimingRouter);
app.use('/api/attendance', authenticate, attendanceRouter);
app.use('/api/leave-request', authenticate, leaveRequestRouter);
app.use('/api/daily-tasks', authenticate, dailyTaskRouter);
app.use('/api/hr', authenticate, hrAnnouncementRouter);

// Report

// Public / Others
app.use('/api/mobile', mobileRouter);
app.use('/api/miscellaneous', miscellaneousRouter);
app.use('/api/master-contacts', masterContactsRouter);
app.use('/api/users', usersRouter);
app.use('/api/master-salary', masterSalaryRouter);
app.use('/api/nature-of-work', natureOfWorkRouter);
app.use('/api/master-salary/sal-nature-of-work', natureOfWorkRouter);
app.use('/api/master-salary/sal-it-section', itSectionsRouter);
app.use('/api/kafka', authenticate, kafkaRouter);
app.use('/api/master-employee', masterEmployeeRouter);

// Global Professional Error Handlers
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;

export { app };
