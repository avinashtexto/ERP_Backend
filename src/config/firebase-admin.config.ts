import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathsToTry = [
  path.join(process.cwd(), 'src/config/firebase-service-account.json'),
  path.join(process.cwd(), 'public/dist/config/firebase-service-account.json'),
  path.join(__dirname, 'firebase-service-account.json'),
];

let serviceAccountPath = '';
for (const p of pathsToTry) {
  if (fs.existsSync(p)) {
    serviceAccountPath = p;
    break;
  }
}

// Initialize Firebase Admin SDK
let app;


if (getApps().length === 0) {
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (err) {
      console.error('Failed to parse or initialize Firebase Service Account:', err);
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'xone-ed61d',
      });
    }
  } else {
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'xone-ed61d',
    });
  }
} else {
  app = getApp();
}

export const messaging = getMessaging(app);

