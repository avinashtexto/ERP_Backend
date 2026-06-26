import ResponseBuilder from '@/core/base/response.builder.js';
import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { TenantConfig } from '@/shared/database/tenant-manager.js';

export type ExpressUser = Partial<Omit<typeof appUser.$inferSelect, 'password' | 'fk_emp_id'>> & {
  id: string | number;
  fk_emp_id?: string | number;
  role?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: ExpressUser;
      db?: any;
      tenant?: TenantConfig;
      tenantId?: number;
    }

    interface Response {
      build: ResponseBuilder;
    }
  }
}

export {};
