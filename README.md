# TaskFlow — Full-Stack Task Management Application

A modern, full-stack task management application built with **React**, **TypeScript**, **Node.js**, and **MySQL**. Features include JWT authentication, real-time task filtering, animated UI transitions, and comprehensive API documentation.

---

## Project Overview

TaskFlow is a production-ready task management system designed for individual productivity. Users can:

- **Authenticate securely** with JWT-based login and registration
- **Create, read, update, and delete tasks** with full CRUD operations
- **Filter and search tasks** by status, priority, and keywords
- **Track progress** with real-time statistics dashboard
- **Enjoy smooth UX** with animated transitions and dark/light theme support
- **Access API documentation** via interactive Swagger UI

---

## Tech Stack

### Backend

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

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| State Management | Zustand + TanStack Query (React Query) |
| HTTP Client | Axios |
| Animations | Framer Motion |
| Styling | CSS Modules |
| Notifications | React Hot Toast |

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- MySQL Server 8.0+ running on `localhost:3306`

---

## Installation & Setup

### Backend Setup

#### 1. Install backend dependencies

```bash
cd backend
npm install
```

#### 2. Configure environment variables

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
PORT=5000
JWT_SECRET=your_strong_secret_min_32_characters
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
```

#### 3. Create the database

Open MySQL and run:

```sql
CREATE DATABASE taskflow_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

#### 4. Run migrations

```bash
npm run migrate
```

This creates the following tables:

- `users` — `id`, `email`, `password`, `name`, `created_at`
- `tasks` — `id`, `user_id`, `title`, `description`, `status`, `priority`, `due_date`, `created_at`, `updated_at`

#### 5. Start the backend server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

Backend will be available at:
- **API Server**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api-docs

---

### Frontend Setup

#### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

#### 2. Configure environment variables

Create a `.env` file in the `frontend` directory:

```bash
VITE_API_URL=http://localhost:5000/api
```

#### 3. Start the development server

```bash
npm run dev
```

Frontend will be available at:
- **Application**: http://localhost:3000

#### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Running the Full Application

1. **Start MySQL** (ensure it's running on port 3306)
2. **Start Backend** (in `backend/` directory):
   ```bash
   npm run dev
   ```
3. **Start Frontend** (in `frontend/` directory):
   ```bash
   npm run dev
   ```
4. **Open browser** and navigate to http://localhost:3000
5. **Register a new account** or login to start managing tasks

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
task-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # Swagger spec, database connection, repository
│   │   ├── controllers/    # authController, taskController
│   │   ├── middleware/     # authenticate, validate, errorHandler
│   │   ├── routes/         # auth.ts, tasks.ts (with Swagger JSDoc annotations)
│   │   ├── types/          # Shared TypeScript interfaces
│   │   └── index.ts        # Express application entry point
│   ├── database/
│   │   └── migrations/     # Knex migration files
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/       # AuthPage (login/register)
│   │   │   ├── tasks/      # Dashboard, TaskCard, TaskModal
│   │   │   ├── layout/     # Layout component with navigation
│   │   │   └── ui/         # ProtectedRoute and reusable UI components
│   │   ├── hooks/          # useTasks (React Query hook)
│   │   ├── services/       # API client with Axios interceptors
│   │   ├── store/          # Zustand stores (auth, theme)
│   │   ├── types/          # TypeScript interfaces
│   │   ├── styles/         # Global CSS
│   │   ├── App.tsx         # Main app with routing
│   │   └── main.tsx        # React entry point
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
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

## Features

### Authentication
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Persistent login sessions
- Protected routes with automatic token refresh

### Task Management
- Create, read, update, and delete tasks
- Set task priority (low, medium, high)
- Track task status (todo, in-progress, done)
- Add due dates with validation
- Rich text descriptions

### User Experience
- Real-time task statistics dashboard
- Advanced filtering by status and priority
- Full-text search across title and description
- Smooth animations with Framer Motion
- Dark/light theme toggle with persistence
- Responsive design for all screen sizes
- Toast notifications for user feedback

### Developer Experience
- Full TypeScript coverage
- Interactive API documentation (Swagger)
- Hot module replacement in development
- ESLint configuration
- Modular architecture

---

## Known Limitations

- **Single user context** — No team or workspace collaboration features.
- **No file attachments** — Tasks support text fields only.
- **No email verification** — Accounts are activated immediately upon registration.
- **No password reset** — Users cannot recover forgotten passwords.

---

## Future Enhancements

- Task categories and tags
- Recurring tasks
- Task comments and activity log
- Email notifications for due dates
- Export tasks to CSV/PDF
- Mobile application

---

## License

Created as part of a technical assessment for VitaSoft.
