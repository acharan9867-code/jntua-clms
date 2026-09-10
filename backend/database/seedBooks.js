// Book seeder - generates 1500+ books across all departments for JNTUA CLMS
// Run: node backend/database/seedBooks.js

import db from '../config/db.js';
import { initializeDatabase } from './initDb.js';

const COVERS = [
  'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
];

function cover(i) { return COVERS[i % COVERS.length]; }
function shelf(prefix, n) { return `${prefix}-RACK-${String(Math.ceil(n/10)).padStart(2,'0')}-${String.fromCharCode(65 + (n%4))}`; }
function isbn(seed) { return String(9780000000000 + seed).slice(0,13); }

async function seedBooks() {
  await initializeDatabase();

  // Get category IDs
  const cats = await db.query('SELECT id, code FROM categories ORDER BY id');
  const catMap = {};
  for (const c of cats) catMap[c.code] = c.id;

  const existing = await db.query('SELECT COUNT(*) as count FROM books');
  console.log(`Existing books: ${existing[0].count}`);

  // --- CSE books (cat 1) ---
  const cseBooks = [
    ['Introduction to Algorithms (CLRS)', 'Cormen, Leiserson, Rivest, Stein', 1, 1250],
    ['Database System Concepts', 'Silberschatz, Korth, Sudarshan', 1, 850],
    ['Operating System Concepts', 'Silberschatz, Galvin, Gagne', 1, 920],
    ['Computer Networks', 'Andrew S. Tanenbaum', 1, 780],
    ['The C Programming Language', 'Kernighan, Ritchie', 1, 450],
    ['Data Structures and Algorithms in C++', 'Michael T. Goodrich', 1, 680],
    ['Software Engineering', 'Ian Sommerville', 1, 720],
    ['Compilers: Principles, Techniques, and Tools', 'Aho, Lam, Sethi, Ullman', 1, 890],
    ['Computer Organization and Architecture', 'William Stallings', 1, 760],
    ['Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', 1, 650],
    ['Object-Oriented Programming in Java', 'Robert Lafore', 1, 580],
    ['Design Patterns: Elements of Reusable OO Software', 'Gang of Four', 1, 820],
    ['Clean Code', 'Robert C. Martin', 1, 480],
    ['The Pragmatic Programmer', 'Hunt & Thomas', 1, 520],
    ['Code Complete', 'Steve McConnell', 1, 670],
    ['Head First Design Patterns', 'Freeman & Robson', 1, 560],
    ['Python Crash Course', 'Eric Matthes', 1, 420],
    ['Automate the Boring Stuff with Python', 'Al Sweigart', 1, 390],
    ['Introduction to the Theory of Computation', 'Michael Sipser', 1, 740],
    ['Artificial Intelligence: A Modern Approach', 'Russell & Norvig', 2, 1100],
    ['Computer Graphics: Principles and Practice', 'Foley, van Dam, Feiner, Hughes', 1, 830],
    ['Network Security Essentials', 'William Stallings', 1, 670],
    ['Cryptography and Network Security', 'William Stallings', 1, 720],
    ['Web Technologies: HTML, CSS, JavaScript', 'Raj Kamal', 1, 490],
    ['Java: The Complete Reference', 'Herbert Schildt', 1, 780],
    ['C++ Programming: From Problem Analysis to Program Design', 'D.S. Malik', 1, 620],
    ['Introduction to Computer Science Using Python', 'Charles Dierbach', 1, 540],
    ['Data Communications and Networking', 'Behrouz Forouzan', 1, 810],
    ['Cloud Computing: Concepts, Technology & Architecture', 'Erl, Puttini, Mahmood', 1, 690],
    ['Mobile Computing', 'Raj Kamal', 1, 540],
    ['Embedded Systems Design', 'Frank Vahid & Tony Givargis', 1, 650],
    ['Information Retrieval', 'Manning, Raghavan, Schutze', 1, 730],
    ['Digital Image Processing', 'Gonzalez & Woods', 1, 890],
    ['Pattern Recognition and Machine Learning', 'Christopher Bishop', 2, 1050],
    ['Game Programming Patterns', 'Robert Nystrom', 1, 480],
    ['Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 1, 560],
    ['The Art of Computer Programming (Vol 1)', 'Donald Knuth', 1, 1200],
    ['The Art of Computer Programming (Vol 2)', 'Donald Knuth', 1, 1200],
    ['The Art of Computer Programming (Vol 3)', 'Donald Knuth', 1, 1200],
    ['Introduction to Parallel Programming', 'Peter Pacheco', 1, 680],
    ['Distributed Systems: Principles and Paradigms', 'Tanenbaum & Van Steen', 1, 810],
    ['Big Data Analytics', 'Bart Baesens', 3, 750],
    ['Hadoop: The Definitive Guide', 'Tom White', 3, 680],
    ['Learning Apache Spark', 'Muhammad Asif Abbasi', 3, 590],
    ['NoSQL Distilled', 'Fowler & Sadalage', 1, 490],
    ['MongoDB: The Definitive Guide', 'Kristina Chodorow', 1, 540],
    ['Microservices Patterns', 'Chris Richardson', 1, 610],
    ['Docker Deep Dive', 'Nigel Poulton', 1, 420],
    ['Kubernetes in Action', 'Marko Luksa', 1, 680],
    ['DevOps Handbook', 'Kim, Humble, Debois, Willis', 1, 560],
    ['Site Reliability Engineering', 'Beyer, Jones, Petoff, Murphy', 1, 720],
    ['Linux Command Line and Shell Scripting Bible', 'Richard Blum', 1, 490],
    ['UNIX and Linux System Administration Handbook', 'Nemeth, Snyder, Hein', 1, 780],
    ['TCP/IP Illustrated Vol 1', 'W. Richard Stevens', 1, 840],
    ['Advanced Programming in the UNIX Environment', 'W. Richard Stevens', 1, 790],
    ['Computer Architecture: A Quantitative Approach', 'Hennessy & Patterson', 1, 970],
    ['Digital Design', 'M. Morris Mano', 4, 680],
    ['Algorithms Design Manual', 'Steven Skiena', 1, 750],
    ['Graph Theory with Applications', 'Bondy & Murty', 8, 540],
    ['Programming Language Pragmatics', 'Michael Scott', 1, 720],
    ['Essentials of Computer Organization', 'Linda Null & Julia Lobur', 1, 640],
    ['Fundamentals of Software Testing', 'Burnstein', 1, 580],
    ['Software Project Management', 'Bob Hughes', 1, 620],
    ['Agile Software Development', 'Alistair Cockburn', 1, 530],
    ['The Mythical Man-Month', 'Frederick Brooks', 1, 460],
    ['Version Control with Git', 'Jon Loeliger', 1, 440],
    ['REST API Design Rulebook', 'Mark Masse', 1, 400],
    ['RESTful Web Services', 'Leonard Richardson', 1, 480],
    ['High Performance MySQL', 'Schwartz, Zaitsev, Tkachenko', 1, 760],
    ['PostgreSQL: Up and Running', 'Regina Obe & Leo Hsu', 1, 520],
    ['Redis in Action', 'Josiah Carlson', 1, 480],
    ['Elasticsearch: The Definitive Guide', 'Clinton Gormley', 1, 550],
    ['React: Up and Running', 'Stoyan Stefanov', 1, 460],
    ['Node.js Design Patterns', 'Mario Casciaro', 1, 580],
    ['Angular: Up and Running', 'Shyam Seshadri', 1, 490],
    ['Vue.js 3 Design Patterns', 'Pablo D. Gara', 1, 470],
    ['Express.js Guide', 'Azat Mardan', 1, 410],
    ['TypeScript Deep Dive', 'Basarat Ali Syed', 1, 450],
    ['Mastering Regular Expressions', 'Jeffrey Friedl', 1, 480],
    ['Programming Pearls', 'Jon Bentley', 1, 430],
    ['Mythical Man-Month Essays', 'Fred Brooks', 1, 450],
    ['Code: The Hidden Language of Computer Hardware', 'Charles Petzold', 1, 520],
    ['Introduction to Cybersecurity', 'Chuck Easttom', 1, 590],
    ['Ethical Hacking and Penetration Testing Guide', 'Rafay Baloch', 1, 620],
    ['Blockchain Basics', 'Daniel Drescher', 1, 480],
    ['Quantum Computing: An Applied Approach', 'Jack Hidary', 1, 720],
    ['Introduction to Robotics', 'John J. Craig', 1, 680],
    ['Computer Vision: Algorithms and Applications', 'Richard Szeliski', 2, 890],
    ['Speech and Language Processing', 'Jurafsky & Martin', 2, 850],
    ['Reinforcement Learning', 'Sutton & Barto', 2, 780],
    ['Probabilistic Graphical Models', 'Daphne Koller', 2, 920],
    ['The Elements of Statistical Learning', 'Hastie, Tibshirani, Friedman', 2, 860],
    ['Data Science from Scratch', 'Joel Grus', 3, 540],
    ['R for Data Science', 'Hadley Wickham', 3, 490],
    ['Python for Data Analysis', 'Wes McKinney', 3, 580],
    ['Introduction to Statistical Learning', 'James, Witten, Hastie, Tibshirani', 3, 720],
    ['Applied Predictive Modeling', 'Kuhn & Johnson', 3, 760],
    ['Practical Statistics for Data Scientists', 'Bruce & Bruce', 3, 540],
    ['Data Warehousing in the Age of Big Data', 'Krish Krishnan', 3, 620],
    ['Business Intelligence Guidebook', 'Rick Sherman', 3, 680],
    ['Storytelling with Data', 'Cole Knaflic', 3, 450],
    ['Visualize This', 'Nathan Yau', 3, 510],
    ['The Data Warehouse Toolkit', 'Kimball & Ross', 3, 740],
    ['Agile Data Science', 'Russell Jurney', 3, 490],
    ['Mining the Social Web', 'Matthew Russell', 3, 560],
    ['Web Scraping with Python', 'Ryan Mitchell', 3, 480],
    ['Natural Language Processing with Python', 'Bird, Klein, Loper', 2, 680],
    ['Deep Learning', 'Goodfellow, Bengio, Courville', 2, 980],
    ['Hands-On Machine Learning with Scikit-Learn', 'Aurelien Geron', 2, 760],
    ['Python Machine Learning', 'Sebastian Raschka', 2, 640],
    ['Programming PyTorch for Deep Learning', 'Ian Pointer', 2, 580],
    ['TensorFlow 2.0 in Action', 'Thushan Ganegedara', 2, 550],
    ['Machine Learning Yearning', 'Andrew Ng', 2, 450],
    ['Interpretable Machine Learning', 'Christoph Molnar', 2, 520],
    ['Feature Engineering for Machine Learning', 'Alice Zheng', 2, 490],
    ['Building Machine Learning Powered Applications', 'Emmanuel Ameisen', 2, 560],
    ['Practical Deep Learning for Cloud', 'Anirudh Koul', 2, 620],
    ['Applied Deep Learning', 'Valentino Zocca', 2, 590],
    ['Generative Deep Learning', 'David Foster', 2, 640],
    ['Computer Vision with Python and OpenCV', 'Joseph Howse', 2, 580],
    ['YOLO Object Detection with OpenCV', 'Mark Lewis', 2, 490],
    ['Recommender Systems Handbook', 'Ricci, Rokach, Shapira', 2, 820],
    ['Practical Reinforcement Learning', 'Maxim Lapan', 2, 580],
    ['Autonomous Mobile Robots', 'Siegwart, Nourbakhsh', 2, 730],
    ['Probabilistic Robotics', 'Thrun, Burgard, Fox', 2, 790],
    ['Introduction to Embedded Systems', 'Lee & Seshia', 1, 680],
    ['Real-Time Systems', 'Jane Liu', 1, 640],
    ['Formal Verification of Hardware Design', 'Warren A. Hunt', 1, 720],
    ['Wireless Communications', 'Rappaport', 4, 850],
    ['Digital Signal Processing', 'Proakis & Manolakis', 4, 880],
    ['VLSI Design', 'M. Morris Mano & Charles Kime', 4, 760],
    ['CMOS VLSI Design', 'Weste & Harris', 4, 840],
    ['Microprocessor Architecture', 'Jean-Luc Gaudiot', 4, 720],
    ['8085 Microprocessor', 'Ramesh Gaonkar', 4, 490],
    ['The 8051 Microcontroller and Embedded Systems', 'Mazidi, Mazidi, McKinlay', 4, 560],
    ['PIC Microcontrollers: An Introduction', 'Martin P. Bates', 4, 540],
    ['ARM Cortex-M Embedded Programming', 'Yifeng Zhu', 4, 620],
    ['Embedded C Programming', 'Richard Barnett', 4, 480],
    ['Real-Time Embedded Systems', 'Xiaocong Fan', 4, 660],
    ['Signal Processing First', 'McClellan, Schafer, Yoder', 4, 720],
    ['Modern Control Engineering', 'Ogata', 5, 780],
    ['Power Electronics', 'Daniel Hart', 5, 760],
    ['Electric Machinery Fundamentals', 'Stephen Chapman', 5, 820],
    ['Electrical Machines', 'I.J. Nagrath & D.P. Kothari', 5, 690],
    ['Power System Analysis', 'Stevenson & Grainger', 5, 810],
    ['Power Systems Engineering', 'Nagrath & Kothari', 5, 780],
    ['Microelectronics Circuit', 'Sedra & Smith', 4, 890],
    ['Electronic Devices and Circuit Theory', 'Boylestad & Nashelsky', 4, 750],
    ['Fundamentals of Electric Circuits', 'Alexander & Sadiku', 5, 820],
    ['Engineering Electromagnetics', 'William Hayt', 4, 740],
    ['Antenna Theory: Analysis and Design', 'Balanis', 4, 870],
    ['Optical Fiber Communications', 'Gerd Keiser', 4, 810],
    ['Digital Communications', 'John G. Proakis', 4, 850],
    ['Analog and Digital Communications', 'Haykin', 4, 820],
    ['Communication Systems', 'Haykin & Moher', 4, 790],
    ['Thermodynamics: An Engineering Approach', 'Cengel & Boles', 6, 870],
    ['Fluid Mechanics', 'Frank White', 6, 820],
    ['Engineering Mechanics: Statics', 'Meriam & Kraige', 6, 760],
    ['Engineering Mechanics: Dynamics', 'Meriam & Kraige', 6, 760],
    ['Strength of Materials', 'R.K. Bansal', 6, 620],
    ['Machine Design', 'Shigley & Mischke', 6, 780],
    ['Manufacturing Engineering and Technology', 'Kalpakjian & Schmid', 6, 840],
    ['Heat Transfer', 'Cengel & Ghajar', 6, 810],
    ['Internal Combustion Engines', 'V. Ganesan', 6, 680],
    ['Theory of Machines', 'S.S. Rattan', 6, 590],
    ['Finite Element Method', 'Logan', 6, 740],
    ['Mechanical Vibrations', 'Singiresu Rao', 6, 720],
    ['Applied Mechanics', 'S.S. Bhavikatti', 6, 540],
    ['Fluid Machinery', 'B.K. Venkanna', 6, 560],
    ['Gas Dynamics', 'E. Rathakrishnan', 6, 580],
    ['Refrigeration and Air Conditioning', 'Rajput', 6, 620],
    ['Engineering Drawing', 'K.L. Narayana & P. Kannaiah', 6, 480],
    ['AutoCAD 2024 for Engineers', 'Sham Tickoo', 6, 540],
    ['SolidWorks 2023 Bible', 'Matt Lombard', 6, 590],
    ['Industrial Engineering and Management', 'O.P. Khanna', 6, 650],
    ['Operations Research', 'H.A. Taha', 8, 680],
    ['Metrology and Quality Control', 'R.K. Rajput', 6, 480],
    ['Engineering Materials', 'William Smith', 6, 620],
    ['Material Science and Engineering', 'Callister', 6, 720],
    ['Advanced Manufacturing Processes', 'Pandey & Shan', 6, 580],
    ['Structural Analysis', 'R.C. Hibbeler', 7, 780],
    ['Reinforced Concrete Design', 'Chu-Kia Wang', 7, 720],
    ['Soil Mechanics and Foundation Engineering', 'Arora', 7, 680],
    ['Hydraulics and Fluid Mechanics', 'Modi & Seth', 7, 640],
    ['Surveying Vol. 1', 'B.C. Punmia', 7, 580],
    ['Surveying Vol. 2', 'B.C. Punmia', 7, 580],
    ['Highway Engineering', 'Khanna & Justo', 7, 560],
    ['Environmental Engineering', 'Metcalf & Eddy', 7, 720],
    ['Geotechnical Engineering', 'Braja Das', 7, 740],
    ['Water Supply Engineering', 'S.K. Garg', 7, 580],
    ['Wastewater Engineering', 'Metcalf & Eddy', 7, 720],
    ['Irrigation Engineering', 'S.K. Garg', 7, 560],
    ['Transportation Engineering', 'Chakraborty', 7, 580],
    ['Concrete Technology', 'M.S. Shetty', 7, 560],
    ['Steel Structures: Design and Behavior', 'Salmon & Johnson', 7, 720],
    ['Advanced Structural Analysis', 'Bhavikatti', 7, 640],
    ['Bridge Engineering', 'Dhanpat Rai & Sons', 7, 680],
    ['Remote Sensing and GIS', 'Basudeb Bhatta', 7, 620],
    ['Construction Project Management', 'Chitkara', 7, 560],
    ['Engineering Mathematics Vol. 1', 'B.S. Grewal', 8, 590],
    ['Engineering Mathematics Vol. 2', 'B.S. Grewal', 8, 590],
    ['Higher Engineering Mathematics', 'B.V. Ramana', 8, 580],
    ['Advanced Engineering Mathematics', 'Erwin Kreyszig', 8, 840],
    ['Engineering Physics', 'B.K. Pandey & S. Chaturvedi', 8, 480],
    ['Engineering Chemistry', 'Jain & Jain', 8, 450],
    ['Technical English Communication', 'L.A. Hill', 8, 380],
    ['English for Technical Communication', 'Chand & Rao', 8, 360],
    ['Engineering Graphics', 'K. Venugopal', 8, 440],
    ['Environmental Studies', 'R. Rajagopalan', 8, 420],
    ['Linear Algebra and Its Applications', 'Gilbert Strang', 8, 680],
    ['Probability and Statistics for Engineers', 'Miller & Freund', 8, 620],
    ['Numerical Methods for Engineers', 'Chapra & Canale', 8, 720],
    ['Complex Variables and Applications', 'Churchill & Brown', 8, 640],
    ['Differential Equations with Boundary Value Problems', 'Zill', 8, 680],
    ['Abstract Algebra', 'Herstein', 8, 540],
    ['Real Analysis', 'Walter Rudin', 8, 680],
    ['Functional Analysis', 'Kreyszig', 8, 720],
    ['Topology', 'James Munkres', 8, 620],
    ['Combinatorics', 'Richard Brualdi', 8, 580],
    ['Number Theory', 'Hardy & Wright', 8, 540],
    ['Mathematical Methods for Physics', 'Arfken & Weber', 8, 760],
    ['Quantum Physics', 'Eisberg & Resnick', 8, 720],
    ['Optics', 'Hecht', 8, 680],
    ['University Physics', 'Young & Freedman', 8, 820],
    ['Physical Chemistry', 'Atkins', 8, 780],
    ['Organic Chemistry', 'Morrison & Boyd', 8, 740],
    ['Analytical Chemistry', 'Skoog, West, Holler', 8, 720],
    ['Inorganic Chemistry', 'Shriver & Atkins', 8, 690],
    ['Polymer Science and Technology', 'Gowariker', 8, 540],
    ['Biochemistry', 'Lehninger', 8, 780],
    ['Biotechnology: Principles and Applications', 'Ratledge & Kristiansen', 8, 720],
    ['Genetic Engineering', 'S.B. Primrose', 8, 640],
    ['Microbiology', 'Prescott, Harley, Klein', 8, 680],
  ];

  let inserted = 0;
  for (let i = 0; i < cseBooks.length; i++) {
    const [title, author, catId, price] = cseBooks[i];
    const copies = 3 + (i % 5);
    try {
      await db.run(
        'INSERT OR IGNORE INTO books (title, author, isbn, category_id, price, description, total_copies, available_copies, shelf_location, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, author, isbn(1000 + i), catId, price, `Standard ${title} textbook used in JNTUA curriculum. Essential reading for all students.`, copies, copies, shelf(['CSE','ECE','EEE','MECH','CIVIL','IT','ME','BSH'][catId-1]+'-DEPT', i), cover(i)]
      );
      inserted++;
    } catch(e) { /* skip duplicate */ }
  }

  // Generate additional filler books to reach 1500+
  const deptPrefixes = [
    { prefix: 'CSE', cat: 1, topics: ['Programming', 'Algorithms', 'Database', 'Networks', 'Security', 'Software Engineering', 'Embedded Systems', 'Cloud Computing'] },
    { prefix: 'ECE', cat: 4, topics: ['Signal Processing', 'VLSI Design', 'Communication', 'Microcontrollers', 'Antenna Design', 'Optical Fibers', 'RF Engineering', 'Radar Systems'] },
    { prefix: 'EEE', cat: 5, topics: ['Power Systems', 'Control Systems', 'Electrical Machines', 'Power Electronics', 'Drives', 'Smart Grid', 'Renewable Energy', 'Instrumentation'] },
    { prefix: 'MECH', cat: 6, topics: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing', 'Automobile Engineering', 'Robotics', 'CAD/CAM', 'Vibrations', 'Heat Transfer'] },
    { prefix: 'CIVIL', cat: 7, topics: ['Structural Engineering', 'Geotechnical', 'Water Resources', 'Transportation', 'Environmental Engineering', 'Construction Management', 'Surveying', 'Concrete Technology'] },
    { prefix: 'AI', cat: 2, topics: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Robotics AI', 'Expert Systems', 'Neural Networks', 'AI Ethics'] },
    { prefix: 'DS', cat: 3, topics: ['Data Mining', 'Big Data', 'Statistics', 'Visualization', 'Business Analytics', 'Predictive Modeling', 'Data Engineering', 'BI Tools'] },
    { prefix: 'BSH', cat: 8, topics: ['Engineering Mathematics', 'Physics', 'Chemistry', 'Technical Communication', 'Environmental Science', 'Sociology', 'Economics', 'Management'] },
  ];

  const editions = ['', ' (2nd Edition)', ' (3rd Edition)', ' (4th Edition)', ' (5th Edition)', ' (Revised Edition)', ' (International Edition)'];
  const authorPrefixes = ['Dr. A.K.', 'Prof. R.K.', 'S.K.', 'Dr. P.', 'M.', 'Dr. N.', 'V.K.', 'Dr. S.', 'K.', 'Prof. B.'];
  const authorSuffixes = ['Sharma', 'Verma', 'Gupta', 'Reddy', 'Kumar', 'Singh', 'Naidu', 'Rao', 'Patel', 'Iyer', 'Mehta', 'Das', 'Roy', 'Nair', 'Pillai'];

  let isbnSeed = 5000;

  for (const dept of deptPrefixes) {
    let deptCount = 0;
    for (let topicIdx = 0; topicIdx < dept.topics.length; topicIdx++) {
      const topic = dept.topics[topicIdx];
      for (let bookNum = 1; bookNum <= 24; bookNum++) {
        const editionStr = editions[bookNum % editions.length];
        const title = `${topic} - Principles and Applications Vol.${Math.ceil(bookNum/8)}${editionStr}`;
        const authorFirst = authorPrefixes[(bookNum + topicIdx) % authorPrefixes.length];
        const authorLast = authorSuffixes[(bookNum * 3 + topicIdx) % authorSuffixes.length];
        const author = `${authorFirst} ${authorLast}`;
        const price = 350 + (bookNum * 30) + (topicIdx * 20);
        const copies = 2 + (bookNum % 4);
        isbnSeed++;

        try {
          await db.run(
            'INSERT OR IGNORE INTO books (title, author, isbn, category_id, price, description, total_copies, available_copies, shelf_location, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              title, author, isbn(isbnSeed), dept.cat, price,
              `Comprehensive textbook on ${topic} for ${dept.prefix} department students. Covers theory, applications, and solved problems as per JNTUA syllabus.`,
              copies, copies,
              shelf(dept.prefix, deptCount),
              cover(isbnSeed)
            ]
          );
          inserted++;
          deptCount++;
        } catch(e) { /* skip */ }
      }
    }
  }

  const finalCount = await db.query('SELECT COUNT(*) as count FROM books');
  console.log(`? Total books in database: ${finalCount[0].count} (${inserted} new inserted)`);
}

seedBooks().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
