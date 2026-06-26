const LOGIN_IDENTIFIER_KEYS = [
  'login',
  'identifier',
  'username',
  'UserName',
  'email',
  'Email',
  'mobile',
  'Mobile',
  'phone',
  'Phone',
];

export const resolveLoginIdentifier = (body: any = {}): string => {
  for (const key of LOGIN_IDENTIFIER_KEYS) {
    const value = body[key];
    if (value != null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
};

export const getPhoneDigits = (value: string): string | null => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
};

const SENSITIVE_USER_FIELDS = new Set(['Password', 'password', 'Answer', 'answer']);

export const sanitizeUserForResponse = (user: any): any => {
  if (!user || typeof user !== 'object') return user;

  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !SENSITIVE_USER_FIELDS.has(key)),
  );
};
