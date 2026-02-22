# TaskFlow — Backend API

A RESTful API built with **Node.js**, **Express**, and **TypeScript**, providing JWT authentication and full CRUD task management with MySQL persistence.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express |
| Language | TypeScript |
| Database | MySQL 8.0+ via Knex.js |
| Authentication | JSON Web Tokens (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| API Documentation | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- MySQL Server 8.0+ running on `localhost:3306`

---

## Installation & Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
JWT_SECRET=your_strong_secret_min_32_characters
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
```

### 3. Create the database

```bash
CREATE DATABASE taskflow_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations

```bash
npm run migrate
```

This creates the following tables:

- `users` — `id`, `email`, `password`, `name`, `created_at`
- `tasks` — `id`, `user_id`, `title`, `description`, `status`, `priority`, `due_date`, `created_at`, `updated_at`

---

## Running the Server

### Development

```bash
npm run dev
# Server:  http://localhost:5000
# Swagger: http://localhost:5000/api-docs
```

### Production

```bash
npm run build
npm start
```

---

## API Reference

All task endpoints require an `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register a new account |
| POST | `/api/auth/login` | No | Login and receive a JWT |
| GET | `/api/auth/me` | Yes | Get the current user profile |
| GET | `/api/tasks` | Yes | List tasks (supports `?status=`, `?priority=`, `?search=`) |
| GET | `/api/tasks/:id` | Yes | Get a single task |
| POST | `/api/tasks` | Yes | Create a task |
| PATCH | `/api/tasks/:id` | Yes | Partially update a task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |

Full interactive documentation is available at `http://localhost:5000/api-docs`.

---

## Database Migrations

```bash
# Run all pending migrations
npm run migrate

# Rollback the last migration
npm run migrate:rollback

# Create a new migration file
npm run migrate:make <migration_name>
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/         # Swagger spec, database connection, repository
│   ├── controllers/    # authController, taskController
│   ├── middleware/     # authenticate, validate, errorHandler
│   ├── routes/         # auth.ts, tasks.ts (with Swagger JSDoc annotations)
│   ├── types/          # Shared TypeScript interfaces
│   └── index.ts        # Express application entry point
├── migrations/         # Knex migration files
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Security

- **Rate limiting** — Auth endpoints are protected against brute-force attacks via `express-rate-limit`.
- **Helmet** — Sets security-relevant HTTP headers automatically.
- **CORS** — Configured to whitelist approved origins only.
- **Input validation** — All request bodies are validated with `express-validator` before reaching controllers.
- **Password hashing** — Passwords are hashed using `bcryptjs` with a configurable work factor.

---

## Package Rationale

| Package | Reason |
|---------|--------|
| **jsonwebtoken** | Mature, spec-compliant JWT signing and verification |
| **bcryptjs** | Reliable password hashing with configurable cost factor |
| **helmet** | Applies 11 security-relevant HTTP headers in a single call |
| **express-rate-limit** | Protects authentication endpoints from brute-force attacks |
| **express-validator** | Declarative, chainable input validation with detailed error messages |
| **knex** | SQL query builder with migration support and connection pooling |
| **swagger-jsdoc + swagger-ui-express** | Generates interactive API documentation directly from JSDoc comments |

---

## Troubleshooting

**`Access denied for user 'root'@'localhost'`**
Verify the `DB_PASSWORD` value in your `.env` file matches your MySQL root password.

**`Database 'taskflow_db' doesn't exist`**
Run the `CREATE DATABASE` command from the Installation section above.

**`connect ECONNREFUSED`**
Ensure MySQL is running and that `DB_HOST` and `DB_PORT` in `.env` are correct.

**`Client does not support authentication protocol`**
Run the following in MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

---

## Known Limitations

- **Single user context** — No team or workspace collaboration features.
- **No file attachments** — Tasks support text fields only.

---

## License

Created as part of a technical assessment for VitaSoft.
