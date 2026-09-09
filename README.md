# JNTUA Central Library Management System (CLMS)
### Jawaharlal Nehru Technological University Anantapur
**College of Engineering Anantapur (Autonomous) • Ananthapuramu - 515002, Andhra Pradesh**

---

## Project Overview

The **JNTUA Central Library Management System (CLMS)** is a modern, responsive full-stack academic web application designed specifically for the Dr. A.P.J. Abdul Kalam Central Library at JNTUA College of Engineering.

This project is built with a maintainable, clean architecture suitable for a **1-month B.Tech Computer Science & Engineering (CSE) capstone project developed by a team of 5 beginner full-stack developers**.

### Technology Stack
- **Frontend**: React.js 18 + Vite + Tailwind CSS + Lucide Icons + TypeScript
- **Styling**: JNTUA Institutional Theme (Deep Navy `#0f2851`, Saffron/Gold `#d97706`, Slate academic cards)
- **Backend**: Node.js v24 + Express.js REST APIs
- **Authentication**: Stateless JSON Web Tokens (JWT) + bcryptjs salted password hashing
- **Database**: Dual-Engine Relational Storage
  - **Embedded SQLite (Default)**: Powered by Node v24 `node:sqlite` — runs out of the box with zero configuration!
  - **MySQL 8.0+ / MariaDB / XAMPP**: Fully supported via `mysql2` with pure InnoDB schema scripts provided for college viva evaluation.

---

## Core Library Business Rules Implemented

| Policy | Rule Specification | Mathematical Formula |
|---|---|---|
| **Borrowing Period** | Strictly **15 days** from date of issue | $\text{Due Date} = \text{Issue Date} + 15\text{ days}$ |
| **Overdue Late Fine** | **₹1.00 per day** overdue | $\text{Fine} = \max(0, \text{Return Date} - \text{Due Date}) \times ₹1$ |
| **On-Time Return** | Return on or before due date | $\text{Fine} = ₹0$ |
| **Lost / Damaged Book** | ₹300 replacement penalty + applicable late fine | $\text{Total Payable} = ₹300 + (\text{Overdue Days} \times ₹1)$ |
| **Inventory Write-off** | Lost/Damaged physical copy is removed from total copies | Physical copy is **never** restored to available pool |
| **Queue Reservation** | Permitted **only** when `available_copies = 0` | Queue position assigned incrementally ($N+1$). When a copy is returned, Position #1 is notified with priority pickup status |
| **Admin Fine Waiver** | Admin can adjust or waive fine | Original fine is **permanently preserved** in audit log along with mandatory reason |
| **Library Timings** | Configurable setting (Notice placeholder) | Displayed as *"Library timings will be updated soon. Notice will be published on the university portal as per academic schedule."* (No fabricated timings) |

---

## Quick Start (Run in 2 Minutes)

### Prerequisites
- Node.js (v18 or higher; v24 recommended)
- npm (v9+)

### 1. Database Setup & Seeding
The backend includes an automated migration and seeder script. In the project directory:

```bash
cd backend
npm install --strict-ssl=false
node database/initDb.js
```

### 2. Start the Backend API Server
```bash
# Inside backend directory
node server.js
```
The REST API server will start on: **`http://localhost:5000`**
Health check endpoint: **`http://localhost:5000/api/health`**

### 3. Start the Frontend Application
In a separate terminal window:
```bash
cd frontend
npm install --strict-ssl=false
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

## Demo Login Credentials

For quick evaluation during college vivas and external examinations, the portal provides a **1-Click Role Switcher** in the header, or you can log in with:

| Role | Member ID / Roll No | Name | Department | Borrow Limit | Password |
|---|---|---|---|---|---|
| **Chief Librarian (Admin)** | `LIBRARIAN-01` | Dr. M. Sreenivasulu | Central Library | 10 Books | `jntua@123` |
| **Faculty Member** | `JNTUA-FAC-101` | Dr. K. Kavitha | Computer Science & Engineering | 6 Books | `jntua@123` |
| **Faculty Member** | `JNTUA-FAC-102` | Dr. P. Ramesh | AI & Machine Learning | 6 Books | `jntua@123` |
| **B.Tech CSE Student** | `21001A0501` | S. Charan Reddy | Computer Science & Engineering | 3 Books | `jntua@123` |
| **B.Tech CSE Student** | `21001A0515` | M. Deepika Rani | Computer Science & Engineering | 3 Books | `jntua@123` |
| **B.Tech CSE Student** | `22001A0542` | B. Pavan Kumar | Computer Science & Engineering | 3 Books | `jntua@123` |

*(Note: You can also log in using the email address, e.g. `admin@jntua.ac.in` or `student.charan@jntua.ac.in`).*

---

## Switching to Standard MySQL (Optional)

If your college requires running on MySQL Workbench or XAMPP phpMyAdmin:
1. Open XAMPP or start MySQL service on port 3306.
2. Import `backend/database/schema_mysql.sql` and `backend/database/seed.sql` into MySQL:
   ```bash
   mysql -u root -p < backend/database/schema_mysql.sql
   mysql -u root -p < backend/database/seed.sql
   ```
3. Edit `backend/.env`:
   ```env
   DB_CLIENT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=jntua_clms
   ```
4. Restart `node server.js`. The backend will automatically switch from SQLite to MySQL!

---

## Major REST API Endpoints

### Authentication
- `POST /api/auth/login` — Member ID / Email + password authentication
- `GET /api/auth/me` — Current user profile, active borrow counts, outstanding dues
- `GET /api/auth/demo-accounts` — List of demo credentials

### Book Catalog
- `GET /api/books` — Forgiving search by title, author, ISBN, category filter, availability
- `GET /api/books/:id` — Complete book details, syllabus description, shelf location, queue length
- `POST /api/books` — Add new title to inventory *(Admin only)*
- `PUT /api/books/:id` — Update book details or copies *(Admin only)*
- `DELETE /api/books/:id` — Deactivate book *(Admin only)*
- `GET /api/books/categories` — List of engineering categories

### Transactions (Issue & Return)
- `POST /api/transactions/issue` — Issues book, sets 15-day due date, decrements copies
- `POST /api/transactions/return` — Returns book, calculates ₹1/day overdue fine, increments copies, triggers reservation queue
- `POST /api/transactions/lost-damaged` — Reports book lost/damaged, charges ₹300 + late fine, writes off physical copy
- `GET /api/transactions/my-transactions` — Active loans with live countdown + historical transactions

### Queue-Based Reservations
- `POST /api/reservations` — Joins waitlist when available copies = 0 (prevents duplicates)
- `DELETE /api/reservations/:id` — Cancels active reservation & promotes remaining queue
- `GET /api/reservations/my-reservations` — Student's active waitlist & pickup alerts
- `GET /api/reservations/all` — Master reservation queue *(Admin only)*

### Administrative Operations & Reports
- `GET /api/admin/stats` — Real-time KPI summary (Books, Copies, Issued, Overdue, Fines)
- `POST /api/admin/fines/adjust` — Waive or adjust fine with mandatory audit reason
- `POST /api/admin/counter-issue` — Counter issue by Roll No + ISBN
- `GET /api/admin/members` — Directory of students and faculty with borrowing status
- `GET /api/reports/overdue` — Overdue books list with days overdue and fine calculation
- `GET /api/reports/most-borrowed` — Top circulated titles ranked by borrow count
- `GET /api/reports/categories` — Departmental category breakdown
- `GET /api/reports/history` — Complete transaction audit log with status filter
- `GET /api/settings` / `PUT /api/settings` — University library timings notice and rules

---

## Project Team Structure & Viva Preparation

This application was structured so that a team of 5 B.Tech CSE students can cleanly divide responsibilities and explain each module in a college viva:

1. **Student 1 (Team Lead & Backend Architecture)**: Express server, JWT authentication, role middleware, REST routing.
2. **Student 2 (Database Architect)**: Normalized relational schema (1NF, 2NF, 3NF), foreign keys, transactions, dual MySQL/SQLite engine adapter.
3. **Student 3 (Business Logic & Calculations)**: 15-day due date algorithm, ₹1/day fine calculator, ₹300 lost book penalty, queue reservation promotion.
4. **Student 4 (Frontend UI & JNTUA Theme)**: React components, Tailwind CSS styling, responsive layouts, JNTUA institutional header.
5. **Student 5 (Reports & Quality Assurance)**: SQL aggregations for overdue and most borrowed reports, audit log trails, error handling.

For 25+ viva questions with detailed answers, see [`docs/VIVA_QUESTIONS.md`](docs/VIVA_QUESTIONS.md).
For database entity-relationship documentation, see [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md).
