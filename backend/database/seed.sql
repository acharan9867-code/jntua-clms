-- =====================================================================
-- JNTUA CENTRAL LIBRARY MANAGEMENT SYSTEM (CLMS)
-- Pure MySQL 8.0+ Seed Data
-- =====================================================================

USE jntua_clms;

-- 1. Categories
INSERT INTO categories (name, code, description) VALUES
('Computer Science & Engineering', 'CSE', 'Core and advanced computer science curriculum books covering algorithms, systems, and software.'),
('Artificial Intelligence & Machine Learning', 'AI-ML', 'Deep learning, neural networks, natural language processing, and robotics.'),
('Data Science & Analytics', 'DS', 'Big data analytics, statistics, predictive modeling, and data visualization.'),
('Electronics & Communication', 'ECE', 'Digital signal processing, VLSI design, communication systems, and microcontrollers.'),
('Electrical & Electronics', 'EEE', 'Power systems, control systems, electrical machines, and energy engineering.'),
('Mechanical Engineering', 'MECH', 'Thermodynamics, fluid mechanics, CAD/CAM, and automotive engineering.'),
('Civil Engineering', 'CIVIL', 'Structural engineering, surveying, concrete technology, and geotechnical engineering.'),
('Basic Sciences & Humanities', 'BSH', 'Engineering mathematics, engineering physics, professional communication.');

-- 2. Users (Password: jntua@123 for all demo accounts)
-- bcrypt hash: $2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy
INSERT INTO users (member_id, name, email, password_hash, role, department, phone, max_books_allowed, status) VALUES
('LIBRARIAN-01', 'Dr. M. Sreenivasulu', 'admin@jntua.ac.in', '$2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy', 'admin', 'Central Library', '+91 8554 272433', 10, 'active'),
('JNTUA-FAC-101', 'Dr. K. Kavitha', 'fac.kavitha@jntua.ac.in', '$2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy', 'faculty', 'Computer Science & Engineering', '+91 94401 23456', 6, 'active'),
('JNTUA-FAC-102', 'Dr. P. Ramesh', 'fac.ramesh@jntua.ac.in', '$2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy', 'faculty', 'Artificial Intelligence & Machine Learning', '+91 94402 34567', 6, 'active'),
('21001A0501', 'S. Charan Reddy', 'student.charan@jntua.ac.in', '$2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy', 'student', 'Computer Science & Engineering', '+91 98765 43210', 3, 'active'),
('21001A0515', 'M. Deepika Rani', 'student.deepika@jntua.ac.in', '$2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy', 'student', 'Computer Science & Engineering', '+91 98765 43211', 3, 'active'),
('22001A0542', 'B. Pavan Kumar', 'student.pavan@jntua.ac.in', '$2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy', 'student', 'Computer Science & Engineering', '+91 98765 43212', 3, 'active'),
('22001A0588', 'G. Ananya', 'student.ananya@jntua.ac.in', '$2a$10$7Zrq0s0c.L9PZ0YQ4jO5beQdFkWQf0Z8zS1M5Z.M.tN7sEa2vH4Wy', 'student', 'Data Science', '+91 98765 43213', 3, 'active');

-- 3. Books
INSERT INTO books (title, author, isbn, category_id, price, description, total_copies, available_copies, shelf_location, cover_image, status) VALUES
('Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', '9780262046305', 1, 1250.00, 'The standard definitive guide to modern algorithms in computer science education worldwide. Covers foundations of computational complexity, divide-and-conquer, dynamic programming, greedy algorithms, amortized analysis, graph algorithms including Dijkstra and Bellman-Ford, maximum flow networks, and NP-completeness.', 5, 4, 'CSE-RACK-01-A', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80', 'active'),
('Database System Concepts (7th Edition)', 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', '9780078022159', 1, 850.00, 'Comprehensive core reference for database management systems. Presents fundamental concepts of relational database models, relational algebra, SQL querying, normalization (1NF, 2NF, 3NF, BCNF), indexing (B+ trees, hashing), ACID transactions, and concurrency control.', 4, 3, 'CSE-RACK-02-B', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', 'active'),
('Operating System Concepts (10th Edition)', 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', '9781119456338', 1, 920.00, 'Known universally as the "Dinosaur Book", this authoritative text covers operating system structures, process synchronization, CPU scheduling algorithms, threads, deadlock handling techniques, virtual memory management, and file systems.', 6, 4, 'CSE-RACK-03-A', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', 'active'),
('Computer Networks (5th Edition)', 'Andrew S. Tanenbaum, David J. Wetherall', '9780132126953', 1, 780.00, 'Definitive textbook explaining networking from physical to application layer. Topics include fiber optics, wireless transmission, data link framing, sliding window protocols, routing algorithms (OSPF, BGP), and TCP/IP.', 5, 3, 'CSE-RACK-04-C', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', 'active'),
('Artificial Intelligence: A Modern Approach (4th Edition)', 'Stuart Russell, Peter Norvig', '9780134610993', 2, 1400.00, 'The leading textbook in Artificial Intelligence worldwide. Explores rational intelligent agents, informed and uninformed search strategies, A* search, constraint satisfaction, game playing, probabilistic reasoning, and reinforcement learning.', 3, 0, 'AI-RACK-01-A', 'https://images.unsplash.com/photo-1507842229451-79b1be88688a?auto=format&fit=crop&w=400&q=80', 'active'),
('Software Engineering: A Practitioner''s Approach (9th Edition)', 'Roger S. Pressman, Bruce R. Maxim', '9781259872976', 1, 890.00, 'Comprehensive guide to software engineering methodologies, Agile frameworks (Scrum, Kanban), DevOps, requirements elicitation, UML design patterns, architectural modeling, and automated testing.', 4, 3, 'CSE-RACK-05-B', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80', 'active');

-- 4. Settings
INSERT INTO library_settings (key_name, value, description) VALUES
('library_timings', 'Library timings will be updated soon. Notice will be published on the university portal as per academic schedule.', 'Official JNTUA Central Library operating hours'),
('borrowing_period_days', '15', 'Standard borrowing duration in days'),
('fine_rate_per_day', '1', 'Overdue penalty in INR (₹) per day'),
('lost_damaged_charge', '300', 'Fixed replacement/damage administrative penalty in INR (₹)'),
('university_name', 'Jawaharlal Nehru Technological University Anantapur', 'Parent University name'),
('college_name', 'JNTUA College of Engineering Anantapur (Autonomous)', 'Engineering College campus name'),
('library_name', 'Dr. A.P.J. Abdul Kalam Central Library', 'Central Library official title');
