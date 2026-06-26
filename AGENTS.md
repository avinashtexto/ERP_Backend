# Backend Developer Guidelines: Architecture, Database, and Coding Practices

Welcome to the Tionix ERP Backend codebase. This document outlines the project structure, design patterns, database integration rules, coding standards, and best practices. Please follow these guidelines closely to maintain type safety, clean code execution, and system maintainability.

---

## 1. Folder Structure Overview

We follow a clean, domain-driven modular structure to organize backend code. Cross-cutting concerns are kept in `src/core` and `src/shared`.

```
backend/
├── env/                   # Deployment environment configurations (.env.dev)
├── scripts/               # Scaffolding templates and script tools (create-module.js)
├── src/
│   ├── index.ts           # Bootstrapper (Loads environment first, manages graceful shutdowns)
│   ├── app.ts             # Express App setup (Global middlewares, route mappings)
│   ├── config/            # System config (Drizzle DB configs, email client)
│   ├── core/              # Global frameworks and base classes
│   │   ├── base/          # Response builder class
│   │   ├── errors/        # Error handlers and class definitions
│   │   ├── guards/        # Route validation guards
│   │   └── middlewares/   # Express middlewares (auth, logger, rate-limiter)
│   ├── modules/           # Feature-Specific Domain Modules
│   │   └── [module-name]/ # Adheres to the 5-file modular pattern (see below)
│   └── shared/            # Shared database schemas and utilities
│       ├── database/      # Drizzle migration scripts and schema declarations
│       └── utils/         # Helpers (logging, dates, memory caching)
```

### Modular Scaffolding Pattern

Every domain module under `src/modules/[module-name]` must contain these 5 standard files:

1.  `[module-name].types.ts`: TypeScript interfaces and type signatures representing module inputs/outputs.
2.  `[module-name].dto.ts`: Zod validation schemas for payload parsing and validation checks.
3.  `[module-name].service.ts`: Core database transaction logic, Drizzle ORM operations, and business rules.
4.  `[module-name].controller.ts`: Route request/response mappings. Uses `asyncHandler` to safely trap execution anomalies.
5.  `[module-name].routes.ts`: Defines routes, maps controller endpoints, and writes dynamic OpenAPI schemas.

> [!TIP]
> Use the automated generator script to bootstrap new modules rather than creating files manually:
>
> ```bash
> npm run make [new-module-name]
> ```

---

## 2. Database Architecture: Drizzle ORM & Multi-Tenancy

### Type-Safe Queries

We use **Drizzle ORM** as our primary database connector and SQL query builder. Schema definitions reside in `src/shared/database/schemas`.

### Dynamic Multi-Tenancy Router Proxy

Our codebase implements a database routing proxy designed to transparently switch database contexts per request:

1.  **Context Interception**: A custom middleware in `app.ts` resolves the active tenant identifiers (`bookName`) from request headers (`x-book-name`), query strings, body parameters, or JWT payloads.
2.  **Context Storage**: The book name is bound to the thread context using Node's `AsyncLocalStorage` (`tenantStorage.run(bookName, ...)`).
3.  **Connection Cache**: Connection pools are created dynamically on-demand and cached in `dbCache` inside `db.config.ts` to prevent PostgreSQL connection exhaustion.
4.  **ES6 Database Proxy Wrapper**: The exported `db` object from `@/config/db.config.js` is a Proxy. When any SQL call is made, it checks `AsyncLocalStorage` for the active database name. If present, it routes the query to the tenant database connection pool, otherwise, it falls back to the default database pool.

> [!IMPORTANT]
> Because of this proxy design, developers must import `db` statically from `@/config/db.config.js` and run queries as normal. Never try to manage connection pool switching inside service classes manually.

---

## 3. Coding Practices & Conventions

### A. ESM Suffix Requirement

- We compile Node.js with native ES Modules (`"type": "module"` in `package.json`).
- **Requirement**: All local imports must explicitly suffix TypeScript files with `.js` (e.g., `import { db } from '@/config/db.config.js'`). Skipping this suffix will break runtime compilation.

### B. Standard API Response Structure

- Always format API responses using the customized builder pattern middleware `res.build` (`ResponseBuilder` in `src/core/base/response.builder.ts`).
- **Success Formats**:
  ```typescript
  res.build
    .withStatus(200)
    .withModule('account-groups')
    .withMessage('Retrieved successfully')
    .withData(payload)
    .success()
    .send();
  ```
- **Failure Formats**:
  ```typescript
  res.build.withStatus(400).withError('INVALID_PAYLOAD', errorDetails).fail().send();
  ```

### C. OpenAPI Documentation

- Endpoints must be documented using `@openapi` (Swagger JSDoc format) directly in the `[module-name].routes.ts` files.
- Document incoming body schemas, path parameters, query filters, and response blocks.
- The system aggregates these annotations dynamically and serves documentation on `http://localhost:[PORT]/api/docs` via Scalar.

### D. Input Validation (Zod DTOs)

- Every request payload (params, query, body) must validate using a Zod schema defined in the module's `.dto.ts` file.
- Use `.parse()` directly on input values (e.g., `acctGroupQuerySchema.parse(req.query)`). The global error middleware automatically catches any thrown `ZodError` and translates it to standard HTTP `422 Unprocessable Entity` responses containing validation fields.

### E. Database Property Naming and Case Rules

To maintain strict alignment with the database schema and columns:

- **Username Naming**: Always use `username` (fully lowercase). Do not use camelCase `userName` or snake_case `user_name`.
- **Primary Keys**: Always use `pk_user_id` (fully lowercase snake_case). Do not use camelCase `pkUserid` or `pkUserId`.
- **Primary Key Column Definition**: Primary key columns must always be defined as an `integer` and automatically generated using `.generatedAlwaysAsIdentity()`. Example: `id: integer('id').primaryKey().generatedAlwaysAsIdentity()`.
- **Variables Matching Database Columns**: Ensure all variable names, controller outputs, parameters, and DTO/Zod properties match the exact database columns (e.g., `fk_set_id`, `fk_prod_id`, `id`, `form`, `rights`).
- **Standard API Responses**: Always structure controller success/fail blocks using the fluent `res.build` ResponseBuilder middleware pattern.

### F. Controller vs Service Responsibilities

- **Controllers**: Always validate and sanitize requests (using Zod DTOs) _before_ passing them to services. Controllers must handle all extra business logic, orchestrate workflows, and ensure all errors are properly caught using `asyncHandler` and handled gracefully.
- **Services**: Services must strictly contain ONLY database logic (Drizzle ORM queries, transactions). Never place HTTP-specific request parsing, validation, or extra business logic inside the service layer.

### G. Backward Compatibility

- **Regression Prevention**: Never alter or delete existing properties, database schemas, function/method signatures, or module endpoints unless explicitly required. Ensure all modifications remain fully backward-compatible to avoid breaking existing working functionality in other parts of the application.

---

## 4. Codebase Analysis & Recommendations for Improvement

### 1. Database Schema Extension Cleanups

- **Finding**: A database schema file is named [acct-account.tsx](file:///c:/Users/ADMIN/Desktop/tionix_erp/backend/src/shared/database/schemas/acct-account.tsx) with a `.tsx` extension instead of `.ts`.
- **Recommendation**: Rename `acct-account.tsx` to `acct-account.ts` to prevent confusion, as there is no React JSX code inside database schemas.

### 2. Missing Centralized Exception Class Exports

- **Finding**: `src/core/errors/index.ts` is empty. Core error classes (`AppError`, `ValidationError`, `NotFoundError`) are defined directly inside the Express middleware wrapper [error.middleware.ts](file:///c:/Users/ADMIN/Desktop/tionix_erp/backend/src/core/middlewares/error.middleware.ts).
- **Recommendation**: Export exceptions inside `src/core/errors/index.ts` or shift error definitions to `src/core/errors` files, leaving the middleware to handle only request traps. This decouples logic cleanly.

### 3. Dynamic Sequential ID Generation

- **Finding**: The custom sequence table `new_id` defines standard system formats for custom IDs across tables.
- **Recommendation**: Standardize a reusable ID sequencer utility inside `src/shared/database` that queries `new_id` and advances sequences atomically using a centralized transaction helper, rather than querying raw sql updates inside individual module services.

---

## 5. Security, Quality, and Compliance Requirements

To ensure enterprise-readiness, the application follows strict criteria covering security, data protection, recovery, and exit readiness:

### A. Security & Compliance

- **ISO/IEC 27001 Compliance**: Operations, asset management, and risk treatment plans must align with ISO 27001 guidelines.
- **SOC 2 Type II Certification**: Ensure systems maintain continuous compliance audits regarding Security, Availability, and Confidentiality.
- **GDPR Compliance**: Support user privacy protection, consent management, and data deletion requests (right to be forgotten).
- **Internal Security Policy Documentation**: Follow established internal security procedures, encryption, and password policies.
- **Access Control Mechanisms**: Restrict resource access using role-based or permission-based validation before handling critical APIs.
- **Audit Logs Capability**: Maintain secure, immutable logs tracking write, update, and delete actions for accountability.

### B. Business Continuity & Disaster Recovery

- **ISO 22301 Compliance**: Structural alignment with international business continuity management systems.
- **Defined RPO and RTO**: Support defined Recovery Point Objectives (RPO) and Recovery Time Objectives (RTO).
- **Backup Frequency and Storage Location**: Manage database backups systematically, replicating to designated secure offsite/cloud locations.

### C. Quality Assurance

- **ISO 9001 Compliance**: Maintain process consistency, code reviews, and testing to ensure software quality.

### D. Data Portability & Vendor Lock-In Prevention

- **Source Code Escrow Agreement**: Establish code escrow options where applicable.
- **Data Export in Standard Formats (SQL/CSV/XML)**: Support data exports in open, widely accepted formats.
- **Transition Assistance and Full Database Backup Access**: Provide tools and raw access for smooth transition offboarding.
- **Avoidance of Proprietary Encrypted Formats without Keys**: Never lock client data behind custom encryption keys or unreadable structures.

updated at 17/06/2026
