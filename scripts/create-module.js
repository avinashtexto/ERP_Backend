#!/usr/bin/env ts-node

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import chalk from 'chalk';

/* ---------------------------------- */
/* CONFIG */
/* ---------------------------------- */

const inputPath = process.argv[2];

if (!inputPath) {
  console.log();
  console.log(chalk.bgRed.white.bold(' ERROR '));
  console.log(chalk.red(' Please provide a module path.\n'));
  console.log(chalk.gray(' Usage:'));
  console.log(chalk.cyan('   npm run make master-contacts/city\n'));
  process.exit(1);
}

// Clean up input path (e.g., remove trailing slashes)
const cleanPath = inputPath.replace(/\/$/, '');

// Extract the base module name from the end of the path (e.g., "city" from "master-contacts/city")
const moduleName = basename(cleanPath);

// Convert hyphens to camelCase for JS/TS identifiers
const camelName = moduleName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);
const snakeDbName = moduleName.replace(/-/g, '_');

const root = process.cwd();
// This will resolve to src/modules/master-contacts/city
const moduleDir = join(root, 'src', 'modules', cleanPath);

ensureDir(moduleDir);

printHeader(`Creating ${pascalName} Module`);

/* ---------------------------------- */
/* FILE TEMPLATES */
/* ---------------------------------- */

const files = {
  /* ---------------- LOCAL TYPES & SCHEMA ENTITIES ---------------- */

  [join(moduleDir, `${moduleName}.types.ts`)]: `
export interface ${pascalName} {
  id: string | number;
  createdAt?: Date;
}
`,

  /* ---------------- DTO ---------------- */

  [join(moduleDir, `${moduleName}.dto.ts`)]: `
import { z } from 'zod';

export const ${camelName}BaseSchema = z.object({
});
`,

  /* ---------------- SERVICE ---------------- */

  [join(moduleDir, `${moduleName}.service.ts`)]: `
import type { ${pascalName} } from './${moduleName}.types.js';

export async function health(): Promise<${pascalName}[]> {
  return [];
}
`,

  /* ---------------- CONTROLLER ---------------- */

  [join(moduleDir, `${moduleName}.controller.ts`)]: `
import type { Request, Response } from 'express';
import * as service from './${moduleName}.service.js';

export async function health(req: Request, res: Response): Promise<void> {
  try {
    const data = await service.health();
    res.build
      .withStatus(200)
      .withModule('${moduleName}')
      .withMessage('${pascalName} health check successful')
      .withData(data)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('HEALTH_CHECK_FAILED', error.message)
      .fail()
      .send();
  }
}
`,

  /* ---------------- ROUTE ---------------- */

  [join(moduleDir, `${moduleName}.routes.ts`)]: `
import { Router } from 'express';
import * as controller from './${moduleName}.controller.js';

const router = Router();

/**
* @openapi
* /api/${cleanPath}/health:
* get:
* summary: Retrieve health status for ${moduleName}
* tags:
* - ${pascalName}
* responses:
* - 200:
* description: Success
* - 400:
* description: Bad Request
* - 500:
* description: Server Error
*/
router.get('/health', controller.health);

export default router;
`,
};

/* ---------------------------------- */
/* FILE CREATION */
/* ---------------------------------- */

let created = 0;
let skipped = 0;

for (const [fullPath, content] of Object.entries(files)) {
  const displayPath = relative(root, fullPath);

  if (existsSync(fullPath)) {
    logSkipped(displayPath);
    skipped++;
  } else {
    writeFileSync(fullPath, content.trimStart(), 'utf8');
    logCreated(displayPath);
    created++;
  }
}

/* ---------------------------------- */
/* SUMMARY */
/* ---------------------------------- */

printSummary(pascalName, created, skipped);

/* ---------------------------------- */
/* HELPERS */
/* ---------------------------------- */

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(
      `${chalk.gray('📁')} ${chalk.green('created')} ${chalk.cyan(relative(root, dirPath))}`,
    );
  }
}

function logCreated(path) {
  console.log(`${chalk.bgGreen.black(' CREATE ')} ${chalk.cyan(path)}`);
}

function logSkipped(path) {
  console.log(`${chalk.bgYellow.black(' SKIP   ')} ${chalk.gray(path)}`);
}

function printHeader(title) {
  const width = title.length + 6;
  const top = '╔' + '═'.repeat(width) + '╗';
  const middle = '║' + title.padStart((width + title.length) / 2).padEnd(width) + '║';
  const bottom = '╚' + '═'.repeat(width) + '╝';

  console.log();
  console.log(chalk.bold.blueBright(top));
  console.log(chalk.bold.white.bgBlue(middle));
  console.log(chalk.bold.blueBright(bottom));
  console.log();
}

function printSummary(name, created, skipped) {
  console.log();
  console.log(`${chalk.bgBlue.white(' DONE ')} ${chalk.bold(name)} module`);
  console.log(
    `  ${chalk.green('✔ created:')} ${created}   ${chalk.gray('⏭ skipped:')} ${skipped}`,
  );
  console.log();
}
