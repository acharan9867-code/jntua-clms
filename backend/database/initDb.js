import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { calculateDueDate, formatDbDate } from '../utils/fineCalculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  console.log('🔄 Initializing JNTUA CLMS Database schema...');
  
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  // Execute schema DDL
  await db.exec(schemaSql);

  // Check if categories already seeded
  const existingCategories = await db.query('SELECT COUNT(*) as count FROM categories');
  const count = existingCategories[0]?.count || 0;
  if (count > 0) {
    console.log('ℹ️ Database already contains data. Skipping initial seeding.');
    return;
  }

  console.log('🌱 Seeding initial JNTUA catalog, users, and transactions...');

  // 1. Seed Categories
  const categories = [
    { name: 'Computer Science & Engineering', code: 'CSE', description: 'Core and advanced computer science curriculum books covering algorithms, systems, and software.' },
    { name: 'Artificial Intelligence & Machine Learning', code: 'AI-ML', description: 'Deep learning, neural networks, natural language processing, and robotics.' },
    { name: 'Data Science & Analytics', code: 'DS', description: 'Big data analytics, statistics, predictive modeling, and data visualization.' },
    { name: 'Electronics & Communication', code: 'ECE', description: 'Digital signal processing, VLSI design, communication systems, and microcontrollers.' },
    { name: 'Electrical & Electronics', code: 'EEE', description: 'Power systems, control systems, electrical machines, and energy engineering.' },
    { name: 'Mechanical Engineering', code: 'MECH', description: 'Thermodynamics, fluid mechanics, CAD/CAM, and automotive engineering.' },
    { name: 'Civil Engineering', code: 'CIVIL', description: 'Structural engineering, surveying, concrete technology, and geotechnical engineering.' },
    { name: 'Basic Sciences & Humanities', code: 'BSH', description: 'Engineering mathematics, engineering physics, professional communication.' }
  ];

  for (const cat of categories) {
    await db.run(
      'INSERT INTO categories (name, code, description) VALUES (?, ?, ?)',
      [cat.name, cat.code, cat.description]
    );
  }

  // 2. Seed Users
  const defaultPasswordHash = await bcrypt.hash('jntua@123', 10);

  const users = [
    {
      member_id: 'LIBRARIAN-01',
      name: 'Dr. M. Sreenivasulu',
      email: 'admin@jntua.ac.in',
      role: 'admin',
      department: 'Central Library',
      phone: '+91 8554 272433',
      max_books_allowed: 10
    },
    {
      member_id: 'JNTUA-FAC-101',
      name: 'Dr. K. Kavitha',
      email: 'fac.kavitha@jntua.ac.in',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      phone: '+91 94401 23456',
      max_books_allowed: 6
    },
    {
      member_id: 'JNTUA-FAC-102',
      name: 'Dr. P. Ramesh',
      email: 'fac.ramesh@jntua.ac.in',
      role: 'faculty',
      department: 'Artificial Intelligence & Machine Learning',
      phone: '+91 94402 34567',
      max_books_allowed: 6
    },
    {
      member_id: '21001A0501',
      name: 'S. Charan Reddy',
      email: 'student.charan@jntua.ac.in',
      role: 'student',
      department: 'Computer Science & Engineering',
      phone: '+91 98765 43210',
      max_books_allowed: 3
    },
    {
      member_id: '21001A0515',
      name: 'M. Deepika Rani',
      email: 'student.deepika@jntua.ac.in',
      role: 'student',
      department: 'Computer Science & Engineering',
      phone: '+91 98765 43211',
      max_books_allowed: 3
    },
    {
      member_id: '22001A0542',
      name: 'B. Pavan Kumar',
      email: 'student.pavan@jntua.ac.in',
      role: 'student',
      department: 'Computer Science & Engineering',
      phone: '+91 98765 43212',
      max_books_allowed: 3
    },
    {
      member_id: '22001A0588',
      name: 'G. Ananya',
      email: 'student.ananya@jntua.ac.in',
      role: 'student',
      department: 'Data Science',
      phone: '+91 98765 43213',
      max_books_allowed: 3
    }
  ];

  for (const u of users) {
    await db.run(
      'INSERT INTO users (member_id, name, email, password_hash, role, department, phone, max_books_allowed, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [u.member_id, u.name, u.email, defaultPasswordHash, u.role, u.department, u.phone, u.max_books_allowed, 'active']
    );
  }

  // 3. Seed Books (Standard CSE textbooks with rich syllabus descriptions)
  const books = [
    {
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      isbn: '9780262046305',
      category_id: 1, // CSE
      price: 1250.00,
      description: 'The standard definitive guide to modern algorithms in computer science education worldwide. Covers foundations of computational complexity, divide-and-conquer, dynamic programming, greedy algorithms, amortized analysis, graph algorithms including Dijkstra and Bellman-Ford, maximum flow networks, and NP-completeness. Prescribed textbook for JNTUA B.Tech CSE Data Structures and Advanced Algorithms courses.',
      total_copies: 5,
      available_copies: 4,
      shelf_location: 'CSE-RACK-01-A',
      cover_image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Database System Concepts (7th Edition)',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      isbn: '9780078022159',
      category_id: 1, // CSE
      price: 850.00,
      description: 'Comprehensive core reference for database management systems. Presents fundamental concepts of relational database models, relational algebra, SQL querying, normalization (1NF, 2NF, 3NF, BCNF), indexing (B+ trees, hashing), ACID transactions, concurrency control protocols, and distributed databases. Essential syllabus reference for JNTUA DBMS laboratory and theory examinations.',
      total_copies: 4,
      available_copies: 3,
      shelf_location: 'CSE-RACK-02-B',
      cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Operating System Concepts (10th Edition)',
      author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
      isbn: '9781119456338',
      category_id: 1, // CSE
      price: 920.00,
      description: 'Known universally as the "Dinosaur Book", this authoritative text covers operating system structures, process synchronization, CPU scheduling algorithms, threads, deadlock handling techniques, virtual memory management, page replacement algorithms, and file system architectures with real-world case studies of Linux, Windows, and POSIX standards.',
      total_copies: 6,
      available_copies: 4,
      shelf_location: 'CSE-RACK-03-A',
      cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Computer Networks (5th Edition)',
      author: 'Andrew S. Tanenbaum, David J. Wetherall',
      isbn: '9780132126953',
      category_id: 1, // CSE
      price: 780.00,
      description: 'The definitive textbook explaining networking from the physical layer to the application layer. Topics include fiber optics, wireless transmission, data link framing and error correction, sliding window protocols, routing algorithms (OSPF, BGP), congestion control, TCP/IP protocol suite, DNS, HTTP/HTTPS, and modern network security protocols.',
      total_copies: 5,
      available_copies: 3,
      shelf_location: 'CSE-RACK-04-C',
      cover_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '9780134610993',
      category_id: 2, // AI-ML
      price: 1400.00,
      description: 'The leading textbook in Artificial Intelligence worldwide. Explores rational intelligent agents, informed and uninformed search strategies, A* search, constraint satisfaction, game playing (alpha-beta pruning), probabilistic reasoning, Bayesian networks, reinforcement learning, and ethical considerations in autonomous AI systems. High demand in JNTUA CSE AI & ML department.',
      total_copies: 3,
      available_copies: 0, // Set to 0 to demonstrate the reservation queue mechanism!
      shelf_location: 'AI-RACK-01-A',
      cover_image: 'https://images.unsplash.com/photo-1507842229451-79b1be88688a?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Software Engineering: A Practitioner\'s Approach (9th Edition)',
      author: 'Roger S. Pressman, Bruce R. Maxim',
      isbn: '9781259872976',
      category_id: 1, // CSE
      price: 890.00,
      description: 'Comprehensive guide to software engineering methodologies, Agile frameworks (Scrum, Kanban), DevOps, requirements elicitation, UML design patterns, architectural modeling, automated testing (unit, integration, regression), software quality assurance, and project estimation metrics (COCOMO, Function Points). Essential for B.Tech CSE capstone projects.',
      total_copies: 4,
      available_copies: 3,
      shelf_location: 'CSE-RACK-05-B',
      cover_image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Computer Organization and Architecture (11th Edition)',
      author: 'William Stallings',
      isbn: '9780134997193',
      category_id: 1, // CSE
      price: 740.00,
      description: 'In-depth exploration of computer system components, instruction set architecture (ISA), RISC vs CISC principles, pipelining hazards, cache memory mapping techniques, virtual memory, superscalar execution, multiprocessor architectures, and parallel computing paradigms. Aligned with JNTUA B.Tech II-Year CSE curriculum.',
      total_copies: 4,
      available_copies: 4,
      shelf_location: 'CSE-RACK-06-A',
      cover_image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Machine Learning',
      author: 'Tom M. Mitchell',
      isbn: '9780070428072',
      category_id: 2, // AI-ML
      price: 680.00,
      description: 'Foundational textbook providing a rigorous theoretical and mathematical basis for machine learning algorithms. Covers concept learning, decision trees (ID3, C4.5), artificial neural networks, Bayesian learning, instance-based methods (k-NN), genetic algorithms, computational learning theory (PAC learning), and reinforcement learning.',
      total_copies: 3,
      available_copies: 2,
      shelf_location: 'AI-RACK-02-B',
      cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Design and Analysis of Algorithms',
      author: 'Ellis Horowitz, Sartaj Sahni, Sanguthevar Rajasekaran',
      isbn: '9788173716126',
      category_id: 1, // CSE
      price: 650.00,
      description: 'A classic Indian university reference for algorithmic problem solving. Detailed step-by-step mathematical proofs and pseudo-code implementations for asymptotic analysis, divide and conquer, greedy method (Knapsack, MST), dynamic programming (0/1 Knapsack, TSP), backtracking (N-Queens, Graph Coloring), branch and bound, and approximation algorithms.',
      total_copies: 5,
      available_copies: 4,
      shelf_location: 'CSE-RACK-01-C',
      cover_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Compiler Design: Principles, Techniques, and Tools (Dragon Book)',
      author: 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman',
      isbn: '9780321486813',
      category_id: 1, // CSE
      price: 1100.00,
      description: 'The globally renowned Dragon Book covering lexical analysis (lex, regular expressions, DFA minimization), syntax analysis (LL, LR, LALR parsers), syntax-directed translation, type checking, intermediate code generation (three-address code), runtime environments, code optimization techniques, and instruction scheduling.',
      total_copies: 3,
      available_copies: 2,
      shelf_location: 'CSE-RACK-07-A',
      cover_image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Web Technologies: HTML, CSS, JavaScript, PHP & MySQL',
      author: 'Uttam K. Roy',
      isbn: '9780198066224',
      category_id: 1, // CSE
      price: 550.00,
      description: 'A comprehensive, practical guide tailored for undergraduate students. Covers responsive frontend development using semantic HTML5, modern CSS3 layout systems, client-side JavaScript DOM manipulation, asynchronous AJAX requests, server-side scripting with PHP, relational database integration with MySQL, session management, and web application security fundamentals.',
      total_copies: 4,
      available_copies: 3,
      shelf_location: 'CSE-RACK-08-B',
      cover_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Data Structures Using C (2nd Edition)',
      author: 'Reema Thareja',
      isbn: '9780198099307',
      category_id: 1, // CSE
      price: 495.00,
      description: 'Ideal introductory textbook for first and second year B.Tech engineering students. Thoroughly explains abstract data types, pointers, dynamic memory allocation in C, singly and doubly linked lists, stacks, queues, binary search trees, AVL trees, B-trees, hashing techniques, and comprehensive internal sorting algorithms with visual diagrams.',
      total_copies: 6,
      available_copies: 5,
      shelf_location: 'CSE-RACK-02-A',
      cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'
    }
  ];

  for (const b of books) {
    await db.run(
      'INSERT INTO books (title, author, isbn, category_id, price, description, total_copies, available_copies, shelf_location, cover_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [b.title, b.author, b.isbn, b.category_id, b.price, b.description, b.total_copies, b.available_copies, b.shelf_location, b.cover_image, 'active']
    );
  }

  // 4. Seed Realistic Sample Transactions
  const now = new Date();

  // Transaction 1: Active safe borrow by student S. Charan Reddy (issued 5 days ago, due in 10 days)
  const issueDate1 = new Date(now);
  issueDate1.setDate(now.getDate() - 5);
  const dueDate1 = calculateDueDate(issueDate1);
  await db.run(
    'INSERT INTO transactions (user_id, book_id, issue_date, due_date, status, calculated_fine, lost_damaged_charge, total_paid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [4, 1, formatDbDate(issueDate1), formatDbDate(dueDate1), 'issued', 0.0, 0.0, 0.0, 'Issued for B.Tech Semester IV study']
  );

  // Transaction 2: OVERDUE borrow by student S. Charan Reddy (issued 22 days ago, 7 days overdue => ₹7 fine!)
  const issueDate2 = new Date(now);
  issueDate2.setDate(now.getDate() - 22);
  const dueDate2 = calculateDueDate(issueDate2);
  // Overdue by 7 days => ₹7
  await db.run(
    'INSERT INTO transactions (user_id, book_id, issue_date, due_date, status, calculated_fine, lost_damaged_charge, total_paid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [4, 2, formatDbDate(issueDate2), formatDbDate(dueDate2), 'issued', 7.0, 0.0, 0.0, 'Overdue book notice sent via email']
  );

  // Transaction 3: Faculty Dr. K. Kavitha active borrow (issued 7 days ago)
  const issueDate3 = new Date(now);
  issueDate3.setDate(now.getDate() - 7);
  const dueDate3 = calculateDueDate(issueDate3);
  await db.run(
    'INSERT INTO transactions (user_id, book_id, issue_date, due_date, status, calculated_fine, lost_damaged_charge, total_paid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [2, 3, formatDbDate(issueDate3), formatDbDate(dueDate3), 'issued', 0.0, 0.0, 0.0, 'Issued for CSE 3rd Year Course Preparation']
  );

  // Transaction 4: Past successfully returned book with ₹0 fine
  const issueDate4 = new Date(now);
  issueDate4.setDate(now.getDate() - 30);
  const dueDate4 = calculateDueDate(issueDate4);
  const returnDate4 = new Date(issueDate4);
  returnDate4.setDate(issueDate4.getDate() + 12); // returned in 12 days (on time)
  await db.run(
    'INSERT INTO transactions (user_id, book_id, issue_date, due_date, return_date, status, calculated_fine, lost_damaged_charge, total_paid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [4, 4, formatDbDate(issueDate4), formatDbDate(dueDate4), formatDbDate(returnDate4), 'returned', 0.0, 0.0, 0.0, 'Returned in good condition on time']
  );

  // Transaction 5: Past returned book with ₹4 overdue fine paid
  const issueDate5 = new Date(now);
  issueDate5.setDate(now.getDate() - 40);
  const dueDate5 = calculateDueDate(issueDate5);
  const returnDate5 = new Date(dueDate5);
  returnDate5.setDate(dueDate5.getDate() + 4); // 4 days late
  await db.run(
    'INSERT INTO transactions (user_id, book_id, issue_date, due_date, return_date, status, calculated_fine, lost_damaged_charge, total_paid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [5, 6, formatDbDate(issueDate5), formatDbDate(dueDate5), formatDbDate(returnDate5), 'returned', 4.0, 0.0, 4.0, 'Returned 4 days late, fine collected at counter']
  );

  // 5. Seed Reservations for AI Book (Book ID 5, available copies = 0)
  // Queue Position #1: Deepika Rani
  await db.run(
    'INSERT INTO reservations (user_id, book_id, queue_position, status, reservation_date) VALUES (?, ?, ?, ?, ?)',
    [5, 5, 1, 'pending', formatDbDate(now)]
  );
  // Queue Position #2: Pavan Kumar
  await db.run(
    'INSERT INTO reservations (user_id, book_id, queue_position, status, reservation_date) VALUES (?, ?, ?, ?, ?)',
    [6, 5, 2, 'pending', formatDbDate(now)]
  );

  // 6. Seed Library Settings (Configurable Timings placeholder - DO NOT INVENT TIMINGS)
  const settings = [
    {
      key_name: 'library_timings',
      value: 'Monday to Saturday: 8:30 AM – 6:30 PM | Sundays & Public Holidays: Closed',
      description: 'Official JNTUA Central Library operating hours'
    },
    {
      key_name: 'borrowing_period_days',
      value: '15',
      description: 'Standard borrowing duration in days'
    },
    {
      key_name: 'fine_rate_per_day',
      value: '1',
      description: 'Overdue penalty in INR (₹) per day'
    },
    {
      key_name: 'lost_damaged_charge',
      value: '300',
      description: 'Fixed replacement/damage administrative penalty in INR (₹)'
    },
    {
      key_name: 'student_borrow_limit',
      value: '3',
      description: 'Maximum books a student can hold simultaneously'
    },
    {
      key_name: 'faculty_borrow_limit',
      value: '6',
      description: 'Maximum books faculty can hold simultaneously'
    },
    {
      key_name: 'university_name',
      value: 'Jawaharlal Nehru Technological University Anantapur',
      description: 'Parent University name'
    },
    {
      key_name: 'college_name',
      value: 'JNTUA College of Engineering Anantapur (Autonomous)',
      description: 'Engineering College campus name'
    },
    {
      key_name: 'library_name',
      value: 'Dr. A.P.J. Abdul Kalam Central Library',
      description: 'Central Library official title'
    }
  ];

  for (const s of settings) {
    await db.run(
      'INSERT INTO library_settings (key_name, value, description) VALUES (?, ?, ?)',
      [s.key_name, s.value, s.description]
    );
  }

  console.log('✅ JNTUA CLMS Database seeding completed successfully!');
}

// Run directly if invoked as script
if (process.argv[1] && process.argv[1].endsWith('initDb.js')) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database initialization error:', err);
      process.exit(1);
    });
}
