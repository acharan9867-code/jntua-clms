# B.Tech CSE Project Viva Voce Preparation Guide
### JNTUA Central Library Management System (CLMS)
**Prepared for Viva Examiners & 5-Member Student Presentation**

---

### Q1: What is the high-level architecture of this application?
**Answer:**
The system follows a 3-tier client-server architecture:
1. **Presentation Layer (Frontend)**: React.js single-page application with Tailwind CSS for institutional styling and responsive UI.
2. **Application Layer (Backend)**: Node.js and Express.js REST APIs providing stateless business logic, authentication, and authorization middleware.
3. **Data Layer (Database)**: Relational database with dual-engine support (embedded SQLite for instant execution and MySQL 8.0+ for standard enterprise evaluation) with strict foreign key constraints and ACID transaction boundaries.

---

### Q2: How does the system calculate the due date when a book is issued?
**Answer:**
The due date is calculated dynamically in the backend at the exact moment of issue by adding exactly 15 days to the current timestamp (`dueDate = issueDate + 15 days`). It is never hardcoded on the client. The resulting ISO timestamp is committed to the `transactions` table.

---

### Q3: Explain the exact fine calculation algorithm.
**Answer:**
When a book is returned or inspected:
1. The difference between the return date (or current date for active loans) and the transaction's `due_date` is measured in full days.
2. If `returnDate <= dueDate`, $\text{Overdue Days} = 0$, resulting in a fine of **₹0.00**.
3. If `returnDate > dueDate`, $\text{Overdue Days} = \lfloor(\text{Return Date} - \text{Due Date}) / 86400000\rfloor$.
4. The fine equals $\text{Overdue Days} \times ₹1.00$.
5. The backend validates this calculation before persisting it to the database.

---

### Q4: What is the rule when a borrower reports a book as lost or damaged?
**Answer:**
Under JNTUA CLMS policy:
- The borrower is charged a fixed administrative replacement/damage fee of **₹300.00** plus any accumulated late fine up to the report date.
- Example: If a book is 18 days overdue when reported lost:
  $\text{Total Payable} = ₹300 + (18 \times ₹1) = ₹318.00$.
- If reported within the 15-day period:
  $\text{Total Payable} = ₹300 + ₹0 = ₹300.00$.
- **Inventory update**: The physical copy is permanently written off from `total_copies` ($\text{total\_copies} - 1$) and is **never** added back to `available_copies`.

---

### Q5: How does the reservation queue work when all copies of a book are checked out?
**Answer:**
- A reservation can only be placed when `available_copies === 0`.
- The backend checks for duplicate active reservations by the same user to prevent spamming.
- The user is assigned an incremental queue position: $\text{Position} = \max(\text{existing pending queue}) + 1$.
- When any borrower returns a copy of that book, the backend immediately selects the reservation with `queue_position = 1`, updates its status to `'ready_for_pickup'`, and displays an alert banner on that student's dashboard.

---

### Q6: How does the system ensure ACID properties during issue and return?
**Answer:**
Operations like book issue and return modify multiple tables simultaneously (e.g. updating `books.available_copies`, inserting `transactions`, updating `reservations`).
We wrap these queries inside a database transaction (`BEGIN TRANSACTION ... COMMIT`). If any step fails (such as checking available copies or user quota), the entire operation rolls back (`ROLLBACK`), preventing inventory desynchronization.

---

### Q7: Why do we use bcrypt for password storage?
**Answer:**
We never store plain-text passwords. `bcryptjs` uses an adaptive one-way hashing function incorporating a cryptographic salt with configurable cost factor (work factor 10). It protects against rainbow table attacks and brute-force attacks.

---

### Q8: How does JWT authentication work and how are routes protected?
**Answer:**
Upon successful login, the backend issues a signed JSON Web Token containing the user's ID, role, and expiry. The client stores this in `localStorage` and includes it in the `Authorization: Bearer <token>` header for subsequent requests.
Middleware functions `verifyToken` and `requireRole(['admin'])` intercept requests, verify the signature using `JWT_SECRET`, verify account active status, and grant or deny access.

---

### Q9: What happens when an Admin waives or adjusts a fine?
**Answer:**
The system adheres to an audit-friendly policy: the original calculated fine is **never deleted or overwritten**. Instead:
- `calculated_fine` preserves the original calculated fine.
- `adjusted_fine` stores the new amount approved by the admin.
- `waiver_reason` stores the mandatory justification (e.g., medical leave certificate).
- `adjusted_by` logs the admin's user ID.

---

### Q10: How did the 5 team members divide the project?
**Answer:**
1. **Student 1 (Lead & Backend)**: Express server setup, JWT auth, role middleware, REST routing.
2. **Student 2 (Database Architect)**: Normalized schema design (1NF to 3NF), foreign keys, dual MySQL/SQLite adapter.
3. **Student 3 (Business Logic Specialist)**: 15-day period, ₹1/day fine calculator, ₹300 lost fee, reservation queue promoter.
4. **Student 4 (Frontend & UI/UX)**: React components, JNTUA institutional color palette, responsive design.
5. **Student 5 (Reports & Testing)**: SQL aggregations for overdue and most borrowed reports, API testing.

---

### Q11: What is the normal form of the database?
**Answer:**
The database is in **Third Normal Form (3NF)**:
- **1NF**: All attributes contain atomic values; each table has a primary key.
- **2NF**: All non-key attributes are fully functionally dependent on the primary key (no partial dependencies).
- **3NF**: No transitive dependencies exist (e.g., book category name is in `categories`, not duplicated in `books`).

---

### Q12: Why is the library timings field configurable rather than hardcoded?
**Answer:**
Official college library timings are subject to change based on semester exams, summer vacations, or university notifications. To avoid fabricating hours, the initial placeholder notice states *"Library timings will be updated soon..."*, and an admin can update the timings directly from the Settings console without requiring code changes or redeployment.

---

### Q13: How does the search function handle forgiving queries?
**Answer:**
The `getBooks` API uses SQL `LIKE` pattern matching with parameterized wildcards (`%query%`) across multiple fields (`title`, `author`, `isbn`). For example, searching "data" retrieves both *Database System Concepts* and *Data Structures Using C*.

---

### Q14: What prevents a user from borrowing more books than permitted?
**Answer:**
Before issuing a book, the backend executes an active loan count:
`SELECT COUNT(*) FROM transactions WHERE user_id = ? AND status = 'issued'`.
If the count equals or exceeds `user.max_books_allowed` (3 for students, 6 for faculty), the API returns a 400 Bad Request error.

---

### Q15: How does the dual-engine database adapter work?
**Answer:**
In `backend/config/db.js`, the application checks `process.env.DB_CLIENT`:
- If set to `sqlite` (default), it loads Node v24's built-in `node:sqlite` engine, which executes queries synchronously and safely with zero configuration.
- If set to `mysql`, it establishes a connection pool using `mysql2/promise` pointing to a local MySQL server or XAMPP.
Both engines expose an identical promise-based API (`query`, `get`, `run`, `transaction`).
