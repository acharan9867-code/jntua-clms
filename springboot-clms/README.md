# JNTUA Central Library Management System (CLMS)
### Spring Boot Edition

> **B.Tech CSE Capstone Project — JNTUA CEA**
> Designed & Developed by **Charan Apilagunta**

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17 + Spring Boot 3.2.3 + Spring MVC |
| Frontend | Thymeleaf + HTML5 + CSS3 + Bootstrap 5.3 |
| Database | MySQL 8.x + Spring Data JPA + Hibernate |
| Security | Spring Security 6 (Role-Based Access Control) |
| Build | Maven 3.9+ |
| Testing | Postman |
| Version Control | Git + GitHub |

---

## ⚙️ Prerequisites

- Java 17 (JDK)
- Maven 3.9+
- MySQL 8.x
- Git

---

## 🗄️ Database Setup

```sql
CREATE DATABASE jntua_clms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'clmsuser'@'localhost' IDENTIFIED BY 'clmspass123';
GRANT ALL PRIVILEGES ON jntua_clms.* TO 'clmsuser'@'localhost';
FLUSH PRIVILEGES;
```

> Tables are **auto-created** by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).
> The app **seeds** admin, faculty, students and sample books on first startup.

---

## ▶️ Running the Application

```bash
# Clone the repository
git clone https://github.com/acharan9867-code/jntua-clms.git
cd jntua-clms/springboot-clms

# Build and run
mvn clean spring-boot:run
```

Access at: **http://localhost:8080**

---

## 🔑 Default Login Credentials

| Role | Email / ID | Password |
|------|-----------|----------|
| **Librarian / Admin** | `acharan9867@gmail.com` | `charan@143232` |
| **Faculty** | `fac.kavitha@jntua.ac.in` | `jntua@123` |
| **Student** | `student.charan@gmail.com` | `jntua@123` |

> ⚠️ Change all passwords immediately in production.

---

## 📁 Project Structure

```
springboot-clms/
├── pom.xml
├── src/main/
│   ├── java/com/jntua/clms/
│   │   ├── ClmsApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   └── DataInitializer.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── CatalogController.java
│   │   │   ├── StudentController.java
│   │   │   ├── LibrarianController.java
│   │   │   └── ApiRestController.java
│   │   ├── entity/
│   │   │   ├── Role.java (enum)
│   │   │   ├── User.java
│   │   │   ├── Book.java
│   │   │   ├── Category.java
│   │   │   ├── Transaction.java
│   │   │   ├── Reservation.java
│   │   │   ├── BookRequest.java
│   │   │   └── LibrarySetting.java
│   │   ├── repository/   (JPA Repositories)
│   │   └── service/      (Business Logic)
│   └── resources/
│       ├── application.properties
│       ├── templates/    (Thymeleaf HTML)
│       └── static/       (CSS, JS)
└── postman/
    └── JNTUA_CLMS_Postman_Collection.json
```

---

## 📋 Business Rules

- **Lending Period:** 15 days
- **Fine:** ₹1 per overdue day
- **Lost/Damaged Penalty:** ₹300 + overdue fine
- **Max Books:** Student = 3, Faculty = 6, Admin = 10
- **Reservation:** Only when `availableCopies = 0`
- **Two-step workflow:** Student Request → Librarian Confirmation

---

## 🌐 Library Timings

| Day | Timing |
|-----|--------|
| Monday – Saturday | 8:30 AM – 6:30 PM |
| Sundays & Public Holidays | Closed |

---

## 📮 Postman Testing

Import `postman/JNTUA_CLMS_Postman_Collection.json` into Postman.

Base URL: `http://localhost:8080`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List all books |
| GET | `/api/books?keyword=java` | Search books |
| POST | `/api/transactions/request-borrow` | Request to borrow |
| POST | `/api/transactions/confirm-issue/{id}` | Admin confirms issue |
| POST | `/api/transactions/request-return/{id}` | Student requests return |
| POST | `/api/transactions/confirm-return/{id}` | Admin confirms return |
| GET | `/api/transactions/overdue` | All overdue books |
| POST | `/api/reservations/reserve` | Reserve a book |
| GET | `/api/users/me` | Current user info |

---

## 👨‍💻 Author

**Charan Apilagunta**
B.Tech CSE — Jawaharlal Nehru Technological University Anantapur
GitHub: [@acharan9867-code](https://github.com/acharan9867-code)
