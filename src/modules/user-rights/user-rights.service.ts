import { eq, asc } from 'drizzle-orm';

import type {
  UserRightsOut,
  SaveUserRightsIn,
  FormRightRow,
  FormReportRow,
  FormOtherRow,
  SpecialRow,
  BranchRow,
  DashboardRow,
  ProcessRow,
  CreateNewFormIn,
} from './user-rights.types.js';

import { db } from '@/config/db.config.js';
import {
  appUser,
  newId,
  appUserRight,
  appUserReport,
  appUserOther,
  appUserSpecial,
  appUserBranch,
  appUserDashboard,
  appUserProcess,
} from '@/shared/database/schemas/index.js';

const toBool = (val: any): boolean => {
  if (val === null || val === undefined) return false;
  return val === 1 || val === '1' || val === true || val === 'true' || val === 'True';
};

export async function listUsers() {
  return db
    .select({
      pk_user_id: appUser.pk_user_id,
      username: appUser.username,
      answer: appUser.answer,
      date_time_stamp: appUser.date_time_stamp,
      fk_user_id: appUser.fk_user_id,
      last_status: appUser.last_status,
      fk_ec_id: appUser.fk_ec_id,
      own_records: appUser.own_records,
      other_records: appUser.other_records,
      mobile: appUser.mobile,
      fk_emp_id: appUser.fk_emp_id,
    })
    .from(appUser)
    .orderBy(asc(appUser.username));
}

export async function getUser(userId: number) {
  const result = await db.select().from(appUser).where(eq(appUser.pk_user_id, userId));
  return result[0] || null;
}

export async function loadUserRights(userId: number): Promise<UserRightsOut> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error(`User '${userId}' not found`);
  }

  const [rights, reports, others, specials, branches, dashboards, processes, newIds] =
    await Promise.all([
      db.select().from(appUserRight).where(eq(appUserRight.user_id, userId)),
      db.select().from(appUserReport).where(eq(appUserReport.user_id, userId)),
      db.select().from(appUserOther).where(eq(appUserOther.user_id, userId)),
      db.select().from(appUserSpecial).where(eq(appUserSpecial.user_id, userId)),
      db.select().from(appUserBranch).where(eq(appUserBranch.fk_user_id, userId)),
      db.select().from(appUserDashboard).where(eq(appUserDashboard.fk_user_id, userId)),
      db.select().from(appUserProcess).where(eq(appUserProcess.fk_user_id, userId)),
      db.select().from(newId).orderBy(asc(newId.module_id), asc(newId.form_id)),
    ]);

  const rightsMap = new Map(rights.map((r) => [r.form, r]));
  const reportsMap = new Map(reports.map((r) => [r.form, r]));
  const othersMap = new Map(others.map((r) => [r.form, r]));

  const masters: FormRightRow[] = [];
  const transactions: FormRightRow[] = [];
  const reportRows: FormReportRow[] = [];
  const otherRows: FormOtherRow[] = [];

  for (const n of newIds) {
    const moduleId = n.module_id ? Number(n.module_id) : 0;
    const formId = n.form_id ? Number(n.form_id) : 0;
    const formName = n.form_name;

    const meta = {
      form_name: formName,
      module_name: n.module_name || '',
      module_caption: n.module_caption || '',
      module_id: moduleId,
      form_id: formId,
    };

    // master -> 101 to 1800
    if (formId >= 101 && formId <= 1800) {
      const r = rightsMap.get(formName);
      masters.push({
        ...meta,
        add: r ? toBool(r.add) : false,
        edit: r ? toBool(r.edit) : false,
        delete: r ? toBool(r.delete) : false,
        view: r ? toBool(r.view) : false,
        print: r ? toBool(r.print) : false,
        export: r ? toBool(r.export) : false,
        authorize: r ? toBool(r.authorize) : false,
      });
    }
    // transaction -> 1801 to 3400
    else if (formId >= 1801 && formId <= 3400) {
      const r = rightsMap.get(formName);
      transactions.push({
        ...meta,
        add: r ? toBool(r.add) : false,
        edit: r ? toBool(r.edit) : false,
        delete: r ? toBool(r.delete) : false,
        view: r ? toBool(r.view) : false,
        print: r ? toBool(r.print) : false,
        export: r ? toBool(r.export) : false,
        authorize: r ? toBool(r.authorize) : false,
      });
    }
    // report -> 3401 to 9999
    else if (formId >= 3401 && formId <= 9999) {
      const r = reportsMap.get(formName);
      reportRows.push({
        ...meta,
        view: r ? toBool(r.view) : false,
        print: r ? toBool(r.print) : false,
        export: r ? toBool(r.export) : false,
      });
    }
    // other -> 10000
    else if (formId >= 10000) {
      const r = othersMap.get(formName);
      otherRows.push({
        ...meta,
        rights: r ? toBool(r.rights) : false,
      });
    }
  }

  const specialRows: SpecialRow[] = specials.map((sp) => ({
    form: sp.form,
    rights: toBool(sp.rights),
  }));

  const branchRows: BranchRow[] = branches.map((b) => ({
    fk_set_id: Number(b.fk_set_id),
  }));

  const dashboardRows: DashboardRow[] = dashboards.map((d) => ({
    id: Number(d.id),
  }));

  const processRows: ProcessRow[] = processes.map((p) => ({
    fk_prod_id: p.fk_prod_id,
  }));

  return {
    user: {
      pk_user_id: user.pk_user_id,
      username: user.username,
      own_records: toBool(user.own_records),
      other_records: toBool(user.other_records),
    },
    masters,
    transactions,
    reports: reportRows,
    others: otherRows,
    specials: specialRows,
    branches: branchRows,
    dashboards: dashboardRows,
    processes: processRows,
  };
}

export async function saveUserRights(
  payload: SaveUserRightsIn,
): Promise<{ success: boolean; message: string }> {
  const uid = payload.user_id;
  const op = payload.operator_id;
  const now = new Date();

  return await db.transaction(async (tx) => {
    // Validate user exists
    const userResult = await tx.select().from(appUser).where(eq(appUser.pk_user_id, uid));
    const user = userResult[0];
    if (!user) {
      throw new Error(`User ${uid} not found`);
    }

    // Load valid FormNames and FormIds from NewId
    const newIds = await tx
      .select({
        form_name: newId.form_name,
        form_id: newId.form_id,
      })
      .from(newId);

    const formMap = new Map(newIds.map((n) => [n.form_name, Number(n.form_id || 0)]));

    const validateForm = (formName: string) => {
      if (!formName) {
        throw new Error('Form name required');
      }
      if (!formMap.has(formName)) {
        throw new Error(`Invalid form_name: ${formName}`);
      }
    };

    // Validate payload forms
    for (const row of payload.masters) validateForm(row.form_name);
    for (const row of payload.transactions) validateForm(row.form_name);
    for (const row of payload.reports) validateForm(row.form_name);
    for (const row of payload.others) validateForm(row.form_name);

    // Delete existing rights
    await tx.delete(appUserRight).where(eq(appUserRight.user_id, uid));
    await tx.delete(appUserReport).where(eq(appUserReport.user_id, uid));
    await tx.delete(appUserOther).where(eq(appUserOther.user_id, uid));
    await tx.delete(appUserSpecial).where(eq(appUserSpecial.user_id, uid));
    await tx.delete(appUserBranch).where(eq(appUserBranch.fk_user_id, uid));
    await tx.delete(appUserDashboard).where(eq(appUserDashboard.fk_user_id, uid));
    await tx.delete(appUserProcess).where(eq(appUserProcess.fk_user_id, uid));

    // Update AppUser
    await tx
      .update(appUser)
      .set({
        own_records: toBool(payload.own_records),
        other_records: toBool(payload.other_records),
      })
      .where(eq(appUser.pk_user_id, uid));

    // Masters + Transactions (appUserRight table: 101 to 3400)
    const combinedRights = [...payload.masters, ...payload.transactions].filter((row) => {
      const fid = formMap.get(row.form_name) || 0;
      return fid >= 101 && fid <= 3400;
    });

    if (combinedRights.length > 0) {
      await tx.insert(appUserRight).values(
        combinedRights.map((row) => ({
          form: row.form_name,
          user_id: uid,
          add: toBool(row.add),
          edit: toBool(row.edit),
          delete: toBool(row.delete),
          view: toBool(row.view),
          print: toBool(row.print),
          export: toBool(row.export),
          authorize: toBool(row.authorize),
          date_time_stamp: now,
          fk_user_id: op,
          last_status: 'Edited',
        })),
      );
    }

    // Reports (appUserReport table: 3401 to 9999)
    const validReports = payload.reports.filter((row) => {
      const fid = formMap.get(row.form_name) || 0;
      return fid >= 3401 && fid <= 9999;
    });

    if (validReports.length > 0) {
      await tx.insert(appUserReport).values(
        validReports.map((row) => ({
          form: row.form_name,
          user_id: uid,
          view: toBool(row.view),
          print: toBool(row.print),
          export: toBool(row.export),
          date_time_stamp: now,
          fk_user_id: op,
          last_status: 'Edited',
        })),
      );
    }

    // Others (appUserOther table: 10000+)
    const validOthers = payload.others.filter((row) => {
      const fid = formMap.get(row.form_name) || 0;
      return fid >= 10000;
    });

    if (validOthers.length > 0) {
      await tx.insert(appUserOther).values(
        validOthers.map((row) => ({
          form: row.form_name,
          user_id: uid,
          rights: toBool(row.rights),
          date_time_stamp: now,
          fk_user_id: op,
          last_status: 'Edited',
        })),
      );
    }

    // Specials
    if (payload.specials.length > 0) {
      await tx.insert(appUserSpecial).values(
        payload.specials.map((row) => ({
          form: row.form,
          user_id: uid,
          rights: toBool(row.rights),
        })),
      );
    }

    // Branches
    if (payload.branches.length > 0) {
      await tx.insert(appUserBranch).values(
        payload.branches.map((row) => ({
          fk_user_id: uid,
          fk_set_id: row.fk_set_id,
        })),
      );
    }

    // Dashboards
    if (payload.dashboards.length > 0) {
      await tx.insert(appUserDashboard).values(
        payload.dashboards.map((row) => ({
          fk_user_id: uid,
          id: row.id.toString(),
        })),
      );
    }

    // Processes
    if (payload.processes.length > 0) {
      await tx.insert(appUserProcess).values(
        payload.processes.map((row) => ({
          fk_user_id: uid,
          fk_prod_id: row.fk_prod_id.trim(),
        })),
      );
    }

    return { success: true, message: 'User rights updated successfully' };
  });
}

export async function createNewForm(payload: CreateNewFormIn) {
  const existing = await db.select().from(newId).where(eq(newId.form_name, payload.form_name));
  if (existing.length > 0) {
    throw new Error(`Form name '${payload.form_name}' already exists`);
  }

  const allNewIds = await db.select().from(newId);

  // 1. Resolve or generate module_id
  const matchedModule = allNewIds.find(
    (n) =>
      n.module_name && n.module_name.toLowerCase() === payload.module_name.trim().toLowerCase(),
  );

  let moduleIdStr: string;
  if (matchedModule && matchedModule.module_id) {
    moduleIdStr = matchedModule.module_id;
  } else {
    const maxModuleId = allNewIds.reduce((max, curr) => {
      const val = curr.module_id ? Number(curr.module_id) : 0;
      return val > max ? val : max;
    }, 0);
    moduleIdStr = (maxModuleId + 1).toString();
  }

  // 2. Generate form_id based on category
  let minFormId = 101;
  let maxFormId = 1800;
  if (payload.category === 'transaction') {
    minFormId = 1801;
    maxFormId = 3400;
  } else if (payload.category === 'report') {
    minFormId = 3401;
    maxFormId = 9999;
  } else if (payload.category === 'other') {
    minFormId = 10000;
    maxFormId = 999999;
  }

  const formIdsInRange = allNewIds
    .map((n) => (n.form_id ? Number(n.form_id) : 0))
    .filter((fid) => fid >= minFormId && fid <= maxFormId);

  const maxFormIdInRange = formIdsInRange.reduce(
    (max, curr) => (curr > max ? curr : max),
    minFormId - 1,
  );
  const nextFormId = maxFormIdInRange + 1;

  if (nextFormId > maxFormId) {
    throw new Error(
      `Limit exceeded for form category '${payload.category}'. Maximum form_id is ${maxFormId}`,
    );
  }

  const formIdStr = nextFormId.toString();

  await db.insert(newId).values({
    form_name: payload.form_name,
    prefix: payload.prefix || null,
    last_id: payload.last_id ? payload.last_id.toString() : null,
    start_with: payload.start_with ? payload.start_with.toString() : null,
    len: payload.len ? payload.len.toString() : null,
    module_name: payload.module_name.trim(),
    module_caption: payload.module_caption || null,
    module_id: moduleIdStr,
    form_id: formIdStr,
    news: payload.news ?? null,
  });

  return {
    success: true,
    message: `Form '${payload.form_name}' (ID: ${formIdStr}) registered successfully under Module '${payload.module_name}' (ID: ${moduleIdStr})`,
  };
}
