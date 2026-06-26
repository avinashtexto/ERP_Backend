import { db } from '../../config/db.config.js';
import { hr_announcement, hr_notice_type, notification_log, app_user } from '../../shared/database/schemas/index.js';
import { eq, and, gte, lte, count, sql } from 'drizzle-orm';
import { logger } from '../../shared/utils/devHelper.js';
import { sendTemplatedEmail } from '../email/email.service.js';
import { DEFAULT_CSV_HEADERS } from './report.config.js';

/**
 * Retrieves aggregate statistics for the HR Announcements dashboard
 */
export const getDashboardStats = async () => {
  try {
    // 1. Total announcements count
    const [totalAnn] = await db.select({ count: count() }).from(hr_announcement);

    // 2. Total authorized announcements count
    const [authorizedAnn] = await db
      .select({ count: count() })
      .from(hr_announcement)
      .where(eq(hr_announcement.authorize, true));

    // 3. Notice types breakdown
    const noticeBreakdown = await db
      .select({
        type: hr_notice_type.type,
        count: count(hr_announcement.pk_an_id),
      })
      .from(hr_announcement)
      .innerJoin(hr_notice_type, eq(hr_announcement.fk_nt_id, hr_notice_type.pk_nt_id))
      .groupBy(hr_notice_type.type);

    // 4. Notification delivery rates (sent, failed, bounces)
    const notificationBreakdown = await db
      .select({
        status: notification_log.status,
        count: count(),
      })
      .from(notification_log)
      .groupBy(notification_log.status);

    return {
      totalAnnouncements: totalAnn?.count || 0,
      authorizedAnnouncements: authorizedAnn?.count || 0,
      announcementsByNoticeType: noticeBreakdown,
      notificationsDeliveryStats: notificationBreakdown,
    };
  } catch (err) {
    logger.error('[ReportService] Failed to calculate dashboard stats:', err);
    throw err;
  }
};

/**
 * Builds CSV report content from query results
 */
export const generateCSV = (headers: string[], rows: any[][]): string => {
  const formatCell = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
  };

  const headerLine = headers.map(formatCell).join(',');
  const rowLines = rows.map((row) => row.map(formatCell).join(','));
  return [headerLine, ...rowLines].join('\n');
};

/**
 * Generates and prepares raw CSV report data based on filters
 */
export const exportAnnouncementData = async (filters: {
  from_date?: Date | null;
  to_date?: Date | null;
  notice_type?: string | null;
}) => {
  try {
    const conditions = [];
    if (filters.from_date) conditions.push(gte(hr_announcement.ref_date, filters.from_date));
    if (filters.to_date) conditions.push(lte(hr_announcement.ref_date, filters.to_date));
    if (filters.notice_type) conditions.push(eq(hr_notice_type.type, filters.notice_type));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: hr_announcement.pk_an_id,
        refNo: hr_announcement.ref_no,
        refDate: hr_announcement.ref_date,
        type: hr_notice_type.type,
        announcement: hr_announcement.announcement,
        authorized: hr_announcement.authorize,
        creator: app_user.username,
      })
      .from(hr_announcement)
      .innerJoin(hr_notice_type, eq(hr_announcement.fk_nt_id, hr_notice_type.pk_nt_id))
      .innerJoin(app_user, eq(hr_announcement.fk_user_id, app_user.pk_user_id))
      .where(whereClause);

    const headers = DEFAULT_CSV_HEADERS;
    const rows = data.map((item: any) => [
      item.id,
      item.refNo,
      item.refDate ? item.refDate.toISOString().split('T')[0] : '',
      item.type,
      item.announcement,
      item.authorized ? 'YES' : 'NO',
      item.creator,
    ]);

    return generateCSV(headers, rows);
  } catch (err) {
    logger.error('[ReportService] Export announcement query failed:', err);
    throw err;
  }
};

/**
 * Exports announcement reports and sends them via email
 */
export const emailExportedReport = async (params: {
  toEmail: string;
  filters: { from_date?: Date | null; to_date?: Date | null; notice_type?: string | null };
}) => {
  const { toEmail, filters } = params;

  try {
    logger.info(`[ReportService] Preparing announcement report for ${toEmail}...`);
    const csvContent = await exportAnnouncementData(filters);
    
    const emailTemplate = `
      <h1>HR Announcement Report</h1>
      <p>Please find attached the exported announcements and notices report according to your query filters.</p>
      <br/>
      <p>Best regards,<br/>HR ERP Automated Reports</p>
    `;

    await sendTemplatedEmail({
      to: toEmail,
      subject: 'HR Announcement Export Report',
      templateText: emailTemplate,
      variables: {},
      attachments: [
        {
          filename: `HR_Announcements_Report_${Date.now()}.csv`,
          content: Buffer.from(csvContent, 'utf-8'),
          contentType: 'text/csv',
        },
      ],
    });

    logger.info(`[ReportService] Report emailed successfully to ${toEmail}`);
    return { success: true };
  } catch (err) {
    logger.error(`[ReportService] Failed to email report to ${toEmail}:`, err);
    throw err;
  }
};
