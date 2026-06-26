# Tionix Backend

Node.js backend for a scalable ERP System built with Express, TypeScript, and Drizzle ORM.

## Tech Stack
- **Runtime**: Node.js (with TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **Validation**: Zod / Express Validator
- **Logging**: Morgan
- **Security**: Helmet, CORS, Bcrypt, JSON Web Tokens (JWT)

## Getting Started

### Prerequisites
Make sure you have Node.js and npm installed.

### Setup environment variables
Configure your environment variables in the `env/` directory or a `.env` file in the root.

### Install dependencies
```bash
npm install
```

### Development
To run in development mode:
```bash
npm run dev
```

### Database Migration
To generate and push migrations:
```bash
npm run db:gen
npm run db:push
```

### Production Build
```bash
npm run build
npm run start
```
