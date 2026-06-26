import cors from 'cors';

export const configureCors = () => {
  return cors({
    origin: ['http://127.0.0.1:4100', 'http://localhost:4100', true],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'x-book-name',
      'current_db',
    ],
    credentials: true,
    optionsSuccessStatus: 204,
  });
};
