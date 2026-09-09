# Database Design Document: JNTUA Central Library Management System (CLMS)
**Department of Computer Science and Engineering, JNTUA CEA**

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    CATEGORIES ||--o{ BOOKS : "classifies"
    USERS ||--o{ TRANSACTIONS : "borrows / returns"
    BOOKS ||--o{ TRANSACTIONS : "borrowed in"
    USERS ||--o{ RESERVATIONS : "places waitlist"
    BOOKS ||--o{ RESERVATIONS : "reserved for"
    USERS ||--o{ TRANSACTIONS : "adjusted by admin"

    CATEGORIES {
        int id PK
        string name UK
        string code UK
        string description
        datetime created_at
    }

    USERS {
        int id PK
        string member_id UK "Roll No or Employee ID"
        string name
        string email UK
        string password_hash
        enum role "student, faculty, admin"
        string department
        string phone
        int max_books_allowed
        enum status "active, inactive, suspended"
        datetime created_at
    }

    BOOKS {
        int id PK
        string title
        string author
        string isbn UK
        int category_id FK
        decimal price
        text description "Syllabus topic details"
        int total_copies
        int available_copies
        string shelf_location
        string cover_image
        enum status "active, inactive"
        datetime created_at
    }

    TRANSACTIONS {
        int id PK
        int user_id FK
        int book_id FK
        datetime issue_date
        datetime due_date "issue_date + 15 days"
        datetime return_date
        enum status "issued, returned, lost, damaged"
        decimal calculated_fine "₹1 per day overdue"
        decimal lost_damaged_charge "₹300 fixed penalty"
        decimal adjusted_fine
        text waiver_reason "Mandatory audit reason"
        int adjusted_by FK "Admin user ID"
        decimal total_paid
        text notes
        datetime created_at
    }

    RESERVATIONS {
        int id PK
        int user_id FK
        int book_id FK
        int queue_position "1, 2, 3..."
        enum status "pending, ready_for_pickup, fulfilled, cancelled"
        datetime reservation_date
        datetime notified_at
    }

    LIBRARY_SETTINGS {
        int id PK
        string key_name UK
        text value
        string description
        datetime updated_at
    }
```

---

## 2. Relational Database Normalization

### First Normal Form (1NF)
- **Atomic Values**: Every attribute holds only indivisible, single values. Multiple authors or copies are not stored as comma-separated strings.
- **Unique Primary Keys**: Every table has an explicit, unique surrogate integer primary key (`id`).
- **No Repeating Groups**: Repeating book copies are modeled via integer counts (`total_copies`, `available_copies`) and transaction instances rather than copy-1, copy-2 columns.

### Second Normal Form (2NF)
- Meets 1NF.
- **Full Functional Dependency**: No non-prime attribute is functionally dependent on a part of any candidate key. Because every table uses a single-column primary key (`id`), partial dependencies on composite keys cannot exist.

### Third Normal Form (3NF)
- Meets 2NF.
- **No Transitive Dependencies**: Non-prime attributes depend only on the primary key, not on other non-prime attributes.
  - Category details (`name`, `description`) are factored out into the `categories` table. `books` refers only to `category_id`.
  - User details (`name`, `department`, `role`) are factored out into `users`. `transactions` records only `user_id`.
  - Admin audit adjustments reference `adjusted_by` which foreign-keys back to `users(id)`.

---

## 3. Relational Integrity & Concurrency Control

### Foreign Key Constraints
- `books.category_id` $\rightarrow$ `categories.id` (`ON DELETE RESTRICT`)
  - Prevents accidental deletion of academic categories if books belong to them.
- `transactions.user_id` $\rightarrow$ `users.id` (`ON DELETE RESTRICT`)
  - Ensures borrowing records and audit histories cannot be orphaned.
- `transactions.book_id` $\rightarrow$ `books.id` (`ON DELETE RESTRICT`)
  - Ensures historical transaction logs remain authoritative even if a book is decommissioned.
- `reservations.user_id` $\rightarrow$ `users.id` (`ON DELETE CASCADE`)
  - Cleans up active waitlist entries if an account is removed.

### ACID Concurrency in Issue/Return Operations
All circulation state changes are executed inside atomic database transactions:
1. **Issue Operation**:
   - `SELECT available_copies FROM books WHERE id = ? FOR UPDATE;`
   - Check `available_copies > 0` and borrower quota.
   - `UPDATE books SET available_copies = available_copies - 1;`
   - `INSERT INTO transactions (...);`
   - `COMMIT;` (If any failure occurs, the entire state rolls back).

2. **Return Operation**:
   - Calculate overdue days and fine dynamically.
   - `UPDATE books SET available_copies = available_copies + 1;`
   - `UPDATE transactions SET status = 'returned', ...;`
   - Check `reservations` queue: if a pending reservation exists, update its status to `'ready_for_pickup'`.
   - `COMMIT;`
