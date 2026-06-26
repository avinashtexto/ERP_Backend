const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

const CLAMAV_HOST = process.env.CLAMAV_HOST || '127.0.0.1';
const CLAMAV_PORT = parseInt(process.env.CLAMAV_PORT || '3310', 10);

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, CLAMAV_HOST, CLAMAV_PORT };
